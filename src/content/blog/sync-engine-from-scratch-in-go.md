---
title: Writing a File Sync Engine from Scratch in Go
date: 31-01-2026
description: Why? Because I felt like it.
published: true
tags: ["Golang", "Linux", "Sync"]
---


I write in obsidian for my [library](https://library.rajpa.tel) which uses [quartz](https://quartz.jzhao.xyz/). I have two devices, so both have a copy of the repo on them. One problem I had from a longest time is to sync between two devices. Suppose I'm writing some article, a thought or doing some research on one machine and I forgot to push those changes to the git repo, now I do not have that work on my second device. This sucks. Btw I am using git plugin inside Obsidian and higly reccomend it. It is so good, you get all the git features in the vault only. I never had to manually resolve the conflicts. But that is besides the point that I want a true syncing system that works like Google Drive native version and syncs the content of the vault to my other machine. 

Tools like `lsyncd`, `unison`, `mutagen` exist. They work. But I wanted to understand what actually happens under the hood. How does a tool know a file changed? How does it efficiently sync only what changed? And how hard could it really be to build one?

Turns out, it's not that hard, if you're okay with Linux (Both of my machine are UNIX based) and don't mind reading some manpages.

## The Plan

The idea is simple: watch a directory for changes, and when something happens, sync that change to a remote machine. One-way. Local to remote. That's it.

So we need three things:

1. **A watcher** — something that tells us "hey, this file changed"
2. **An indexer** — something that tracks what we've seen, so we don't sync the same thing twice
3. **A syncer** — something that actually transfers the file

Let's start with the hardest part.

## Part 1: Watching Files with inotify

If you've done any file watching in Node.js, you've probably used `fs.watch` or `chokidar`. On Linux, all of these eventually call the same thing: **inotify**.

inotify is a Linux kernel subsystem that lets you subscribe to filesystem events. You tell it "watch this directory" and it tells you when files are created, modified, deleted, or moved. It's been in the kernel since 2.6.13 (2005), it's fast, and it doesn't poll. The kernel notifies _you_.

Here's the catch though — **inotify only watches one directory at a time**. It doesn't recurse. If you want to watch `/home/user/project` and all its subdirectories, you need to add a watch for every single one. And if someone creates a new subdirectory at runtime? You need to catch that event and add a watch for the new directory too.

### Setting It Up

In Go, we use `golang.org/x/sys/unix` for the raw syscalls. No wrapper libraries. We want to understand what's happening.

```go
fd, err := unix.InotifyInit1(0)
if err != nil {
    panic(err)
}
```

This gives us a file descriptor. Think of it as a mailbox, the kernel drops event notifications into it, and we read from it.

To actually watch a directory:

```go
wd, err := unix.InotifyAddWatch(
    fd,
    path,
    unix.IN_CLOSE_WRITE|unix.IN_MOVED_TO|unix.IN_MOVED_FROM|unix.IN_DELETE|unix.IN_CREATE,
)
```

That bitmask tells inotify what we care about. We're watching for:
- `IN_CLOSE_WRITE` — a file was written to and closed (this is better than `IN_MODIFY`, which fires for every write call)
- `IN_CREATE` — something new appeared
- `IN_DELETE` — something was removed
- `IN_MOVED_FROM` / `IN_MOVED_TO` — something was moved (more on this later)

### Going Recursive

Since inotify doesn't recurse, we walk the entire directory tree at startup and add a watch for each subdirectory:

```go
func (w *Watcher) addWatchRecursive(path string) error {
    return filepath.WalkDir(path, func(p string, d fs.DirEntry, err error) error {
        if err != nil {
            return err
        }
        if d.IsDir() {
            return w.addWatch(p)
        }
        return nil
    })
}
```

But there's a subtlety. What happens if someone does `mkdir -p foo/bar/baz` while we're running? We get a `CREATE` event for `foo`. We add a watch for `foo`. But `bar` and `baz` might already exist by the time we add the watch — and we'd miss them entirely.

The fix: after adding a watch for a new directory, immediately scan its contents and emit synthetic events for anything already in there.

```go
func (w *Watcher) handleNewDirectory(path string, callback func(WatchEvent)) {
    if err := w.addWatch(path); err != nil {
        return
    }

    entries, err := os.ReadDir(path)
    if err != nil {
        return
    }

    for _, entry := range entries {
        childPath := filepath.Join(path, entry.Name())
        event := WatchEvent{
            Path:      childPath,
            Name:      entry.Name(),
            EventType: EventCreate,
            IsDir:     entry.IsDir(),
            Timestamp: time.Now(),
        }
        go callback(event)

        if entry.IsDir() {
            w.handleNewDirectory(childPath, callback)
        }
    }
}
```

It's recursive — new directories inside new directories get picked up too.

### Reading Events from the Buffer

Here's something that tripped me up. When you `read()` from the inotify file descriptor, you don't get one event at a time. You get a buffer that might contain _multiple_ events packed together. Each event is a variable-length struct:

```c
struct inotify_event {
    int      wd;       // watch descriptor
    uint32_t mask;     // event mask
    uint32_t cookie;   // for move correlation
    uint32_t len;      // length of name field
    char     name[];   // filename (variable length)
};
```

If you only parse the first event in the buffer, you silently drop the rest. This is exactly the bug I had — moves appeared broken because I was reading the `MOVED_FROM` event and throwing away the `MOVED_TO` that was sitting right next to it in the same buffer.

The fix is an offset-based loop:

```go
offset := 0
for offset < n {
    var e unix.InotifyEvent
    binary.Read(bytes.NewReader(buffer[offset:offset+InotifyEventSize]), endian, &e)

    // ... process event ...

    offset += InotifyEventSize + int(e.Len)
}
```

Each event's total size is `sizeof(inotify_event) + len`. Step through the buffer by that amount until you've consumed everything.

## Part 2: The Indexer

The watcher tells us _what_ happened. The indexer tells us _whether we care_.

inotify can be noisy. You might get multiple events for the same file. A text editor might write to a temp file, delete the original, then rename the temp — that's three events for what's logically one change. We need something that tracks the actual state.

The indexer maintains two maps:

```go
type Indexer struct {
    files map[string]FileMeta
    dirs  map[string]DirMeta
    mu    sync.RWMutex
}

type FileMeta struct {
    Size  int64
    MTime int64
    Hash  uint64
}
```

When an event comes in, we `os.Stat()` the file and compare against what we have:
- File doesn't exist in our map? **Created.**
- File doesn't exist on disk but is in our map? **Deleted.**
- File exists but size changed? **Modified.** (Update hash.)
- File exists, same size, different mtime? Hash it. Same hash? **No change.** (mtime-only change, ignore it.) Different hash? **Modified.**

For hashing, I went with [xxhash](https://github.com/cespare/xxhash) — it's not cryptographic, but it's _fast_. We're not verifying integrity against an adversary. We just need to know if bytes changed.

```go
func hashFile(path string) (uint64, bool) {
    f, err := os.Open(path)
    if err != nil {
        return 0, false
    }
    defer f.Close()

    h := xxhash.New()
    io.Copy(h, f)
    return h.Sum64(), true
}
```

The indexer is protected by a `sync.RWMutex` because events come in concurrently (each event handler runs in its own goroutine).

## Part 3: Move Detection

This is the interesting part.

When you rename a file (`mv foo.txt bar.txt`), inotify doesn't give you a single "renamed" event. It gives you two events:
1. `IN_MOVED_FROM` — `foo.txt` left this directory
2. `IN_MOVED_TO` — `bar.txt` appeared in this directory

The kernel links these two events with a **cookie** — a uint32 that's the same in both events. If you see a `MOVED_FROM` with cookie `42` and then a `MOVED_TO` with cookie `42`, you know it's the same operation.

But what if a file is moved _out_ of your watched tree? You get `MOVED_FROM` but never get `MOVED_TO`. And what if a file is moved _into_ your tree from outside? `MOVED_TO` with no matching `MOVED_FROM`.

The engine handles this with a timeout:

```go
case watcher.EventMovedFrom:
    e.pendingMoves[event.Cookie] = PendingMove{
        FromPath:  event.Path,
        IsDir:     event.IsDir,
    }
    go e.handleMoveTimeout(event.Cookie)

case watcher.EventMovedTo:
    if pending, ok := e.pendingMoves[event.Cookie]; ok {
        delete(e.pendingMoves, event.Cookie)
        e.handleMove(pending.FromPath, event.Path, pending.IsDir)
    } else {
        // No matching MOVED_FROM — treat as create
        e.handleCreate(event.Path, event.IsDir)
    }
```

When we see `MOVED_FROM`, we store it and start a 100ms timer. If the matching `MOVED_TO` arrives before the timer expires, great — it's a move. If the timer expires, the file left our tree — treat it as a delete.

Why do moves matter? Because on the remote side, `ssh mv` is instant. Syncing the entire file again would be wasteful — especially for large files that just got renamed.

## Part 4: Why rsync? (And Why This is Essentially an rsync Wrapper)

Let's be honest about what this project is. It's an **inotify frontend for rsync**.

I considered writing my own file transfer protocol. Then I thought about delta encoding, partial transfers, permission preservation, symlink handling, sparse files, checksumming, bandwidth throttling... and I decided I didn't want to spend the next six months rewriting `rsync`.

rsync already does all of this. It's been battle-tested for decades. The `rsync` algorithm (rolling checksums + hash matching) is genuinely clever and well-documented. There's no point reimplementing it.

So what syngine actually does is:

1. Watch files with inotify (which rsync can't do — rsync only runs on-demand)
2. Figure out what changed (which rsync _can_ do, but only by scanning the entire tree)
3. Tell rsync to sync _just that file_

This is the key insight: **rsync is great at transferring files efficiently, but terrible at knowing _when_ to run**. It has to scan the whole directory tree to figure out what changed. For a project with thousands of files, that scan takes time. inotify gives us the answer instantly — the kernel already knows what changed because it _caused_ the change.

The syncer interface is deliberately simple:

```go
type Syncer interface {
    Sync(ctx context.Context, req SyncRequest) SyncResult
    Close() error
}
```

One method. Here's how the request is routed, the `SyncRequest` tells us what happened and we pick the right tool:

- **File created/modified** → `rsync -avz localfile host:remotefile`
- **File/dir deleted** → `ssh host rm -f remotefile`
- **File/dir moved** → `ssh host mv oldpath newpath`

```go
func (r *RsyncSyncer) syncFile(ctx context.Context, localPath string) error {
    relPath, _ := r.relativePath(localPath)
    remotePath := r.DestHost + ":" + filepath.Join(r.DestRoot, relPath)

    // Ensure remote directory exists
    mkdirCmd := exec.CommandContext(ctx, "ssh", r.DestHost, "mkdir", "-p", remoteDir)
    mkdirCmd.Run()

    args := append(r.Options, localPath, remotePath)
    cmd := exec.CommandContext(ctx, "rsync", args...)
    output, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("rsync failed: %w, output: %s", err, output)
    }
    return nil
}
```

Nothing fancy. Shell out to rsync. Shell out to ssh. It works.

The move case has one edge case worth mentioning: what if the file was moved locally, but the remote doesn't have the source file? (Maybe the remote was set up after the file was already moved, or it got deleted manually.) The `ssh mv` fails. So we fall back to syncing the destination file as if it were newly created:

```go
cmd := exec.CommandContext(ctx, "ssh", r.DestHost, "mv", remoteFrom, remoteTo)
output, err := cmd.CombinedOutput()
if err != nil {
    // Move failed — source probably doesn't exist on remote
    // Fall back to syncing the destination
    fullToPath := filepath.Join(r.SourceRoot, toRel)
    return r.syncFile(ctx, fullToPath)
}
```

### Why Not Just Run rsync on the Whole Directory?

You could. People do. Set up a cron job that runs `rsync -avz ./project host:/project` every 5 seconds. It works for small projects.

But rsync has to build a file list every time it runs. For a project with 10,000 files, that's 10,000 stat calls before it even starts transferring anything. With inotify, we know _exactly_ which file changed, and we sync just that one file immediately. The latency between "save file" and "file appears on remote" drops from seconds to milliseconds.

## Part 5: Wiring It All Together

The engine connects all three components:

```go
func main() {
    idx := indexer.New(*srcDir)
    watch := watcher.New(*srcDir)

    destHost, destPath, _ := parseDestSpec(*destSpec)
    syn := syncer.NewRsyncSyncer(*srcDir, destHost, destPath)

    eng := engine.New(idx, syn, watch)
    eng.Run()
}
```

The flow for a single file edit looks like:

```
[save file] → kernel → inotify fd → watcher → IN_CLOSE_WRITE event
    → engine → indexer.Process() → "FileModified"
    → syncer.Sync() → rsync -avz file host:file → done
```

For a move:

```
[mv a.txt b.txt] → kernel → inotify fd → watcher
    → MOVED_FROM(a.txt, cookie=42)
    → engine stores pending move
    → MOVED_TO(b.txt, cookie=42)
    → engine matches cookie → indexer.ProcessMove()
    → syncer.Sync() → ssh host mv a.txt b.txt → done
```

## What's Missing

This is a "works on my machine" project. There are things it doesn't handle:

- **Initial sync** — it assumes the remote already has a copy. You need to do the first `rsync` yourself.
- **Conflict resolution** — it's one-way. If someone edits a file on the remote, those changes get overwritten.
- **Network failures** — if ssh drops, the sync just fails. No retry, no queue.
- **Ignore patterns** — no `.gitignore`-style filtering. Every file in the tree gets watched and synced.
- **Symlinks** — not handled specially.

Most of these are solvable. But the core is here — and it's surprisingly little code for what it does.

## Takeaways

The biggest thing I learned: **the Linux kernel does most of the heavy lifting**. inotify is doing the hard part (tracking filesystem changes efficiently). rsync is doing the hard part (transferring files efficiently). All we're doing is connecting the two with a bit of event correlation logic in the middle.

The cookie-based move detection is my favorite part. It's a small detail in the inotify API that makes the difference between "delete + create" (slow, wasteful) and "rename" (instant). Most file watching libraries throw this information away. We keep it.

The full source is on [GitHub](https://github.com/imrraaj/syngine). It's ~600 lines of Go across 6 files. No external dependencies beyond `xxhash` and `x/sys`.
