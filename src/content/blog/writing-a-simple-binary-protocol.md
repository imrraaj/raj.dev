---
title: Writing a Binary Queue Protocol in Go
date: 16-04-2026
description: A deep dive into designing and implementing a simple binary protocol for a TCP-based queue system in Go. We explore framing, validation, and the challenges of working with raw bytes on the wire. 
published: true
tags: ["Golang", "Client-Server", "Protocols"]
---

Lately I've been thinking a lot about protocols. Not the huge ones with RFCs, committees, and ten years of backwards compatibility baggage. Just small protocols. The kind where you control both sides, you can keep the rules in your head, and you get to answer a fun question: what is the smallest binary format that still feels honest?

That was the idea behind `QWire`.

I wanted a tiny TCP client and server in Go that talk using a binary queue protocol. No JSON. No HTTP. No giant abstraction pile. Just bytes on the wire, a few commands, and enough validation that the whole thing doesn't immediately fall apart the moment malformed input shows up.

## The Goal

The rules for v1 were intentionally small:

1. Create a queue
2. Join a queue
3. Push a message into a queue
4. Broadcast pushed messages to connected subscribers

That's it.

I wasn't trying to build Kafka in a weekend. I wanted a protocol that was small enough to inspect in a hex dump and simple enough that the encoder, decoder, TCP server, and demo client could all agree without hand-wavy "we'll fix it later" logic.

## The Frame Format

Every message in `QWire` starts with a fixed 6-byte header:

```text
+---------+--------------+----------------+---------+
| version | payload_type | payload_length | payload |
| 1 byte  |   1 byte     | 4 bytes, LE    |   ...   |
+---------+--------------+----------------+---------+
```

There are only three important ideas here:

- one byte for protocol version
- one byte for message kind
- a 4-byte little-endian payload length so we know exactly how many bytes to read next

I like this shape because it stays boring. Boring is good in protocol work. The parser does not need to guess. It reads the first 6 bytes, checks the declared payload length, and then either accepts the frame or rejects it.

The supported payload types right now are:

- `EMPTY`
- `CREATE_QUEUE`
- `JOIN_QUEUE`
- `PUSH_QUEUE`

`EMPTY` is the funny one. It acts like a tiny status message:

- zero-length payload means `false`
- one-byte payload `0x01` means `true`

It's not elegant, but it keeps responses stupidly simple while the rest of the protocol settles down.

## Why Binary at All?

Because I wanted to understand the exact boundary between "a message" and "just some bytes on a socket." JSON would have made the demo easier, but it would have hidden the interesting parts:

- framing
- length validation
- payload layout
- exact read/write behavior over TCP

With a binary protocol, you have to decide everything. Is the queue name prefixed or null-terminated? Are integers big-endian or little-endian? What happens if the declared payload length does not match the actual number of bytes? What happens if someone sends an unknown payload type?

These are the parts I wanted to touch directly.

## The Protocol Package

The protocol layer in `QWire` is just typed messages plus `Marshal` and `Unmarshal` functions. Nothing fancy. Each payload type has a Go struct:

```go
type EmptyMessage struct {
    Value bool
}

type CreateQueueMessage struct {
    QueueName []byte
}

type JoinQueueMessage struct {
    QueueName []byte
}

type PushQueueMessage struct {
    QueueName   []byte
    MessageBody []byte
}
```

For `CREATE_QUEUE` and `JOIN_QUEUE`, the payload is just the raw queue name bytes. For `PUSH_QUEUE`, the payload needs one more field because the queue name and message body are both variable-length. So the payload becomes:

```text
+--------------------+------------+--------------+
| queue_name_length  | queue_name | message_body |
| 4 bytes, LE uint32 |  variable  |   variable   |
+--------------------+------------+--------------+
```

That lets the decoder split the payload deterministically.

The nice part about writing this by hand is that validation becomes explicit. The decoder checks things like:

- frame must be at least 6 bytes
- protocol version must match `0x01`
- declared payload length must equal actual payload length
- queue names must not be empty
- `PUSH_QUEUE` must have at least 4 bytes for the queue name length
- unknown payload types are rejected immediately

I also clone byte slices when decoding. It is a small thing, but it keeps the protocol package from accidentally sharing backing arrays with caller-owned buffers. If the whole point is to make the wire format predictable, hidden aliasing is not helping.

## TCP Is a Stream, Not a Message Bus

This is the part that trips people early.

When you write bytes to a TCP socket, the other side does not receive "one message." It receives a stream. That means one `Write` on one side does not imply one `Read` on the other. You might get partial data. You might get multiple frames back to back. TCP does not care.

So `QWire` has a `ReadMessage` helper that first reads exactly 6 bytes for the header, parses the payload length, and then uses `io.ReadFull` again to pull the exact payload size:

```go
func ReadMessage(r io.Reader) (Message, error) {
    header := make([]byte, HeaderSize)
    if _, err := io.ReadFull(r, header); err != nil {
        return nil, err
    }

    payloadLength := binary.LittleEndian.Uint32(header[2:HeaderSize])
    payload := make([]byte, payloadLength)
    if _, err := io.ReadFull(r, payload); err != nil {
        return nil, err
    }

    frame := append(header, payload...)
    return Unmarshal(frame)
}
```

This keeps the stream handling separate from the frame validation logic. `Unmarshal` only worries about "is this byte slice one valid frame?" and `ReadMessage` worries about "how do I pull one full frame out of a TCP stream?"

That split made the rest of the code much easier to reason about.

## The Server

The server is just an in-memory queue map protected by a mutex. Every queue keeps two things:

- pushed message bodies
- connected subscribers

When a client connects, the server creates a session object for that connection. The session tracks which queues that client joined. That matters for cleanup on disconnect.

The command handling path is simple:

- `CREATE_QUEUE` creates a named queue if it does not already exist
- `JOIN_QUEUE` registers the current connection as a subscriber
- `PUSH_QUEUE` appends the message body to the queue and broadcasts it to all subscribers

One small detail I like here is the per-session write mutex. A subscribed client can receive both command status replies and broadcast queue messages. Without serialized writes, two goroutines could interleave bytes on the same `net.Conn`, which is a great way to corrupt your own protocol.

So each session has a `send` method that locks before calling `WriteMessage`. It is a tiny piece of code, but it prevents a whole class of ugly bugs.

## The Demo Client

The client exists mostly to prove the whole thing works end to end.

It connects to the server, tries to create a queue called `demo`, joins it, starts a receive loop, and then pushes an initial message. After that, every line you type into stdin gets sent as a `PUSH_QUEUE` command.

Because the same connection is also subscribed to `demo`, it immediately receives the broadcast back and prints it.

That feedback loop is useful because it tests several things at once:

- frame encoding on the client
- frame decoding on the server
- queue registration
- broadcast delivery
- frame decoding on the client again

For a project this small, that is a pretty good smoke test.

## The Weirdly Useful `EMPTY` Message

I mentioned `EMPTY` earlier, but it deserves its own section because it reflects the kind of compromise I like in early protocol work.

The server currently responds with `EMPTY true` for success and `EMPTY false` for failure. That's obviously not a rich response model. There is no structured error code, no reason string, no request ID, nothing.

But for v1, it does the job. It gives the client a minimal acknowledgement while keeping the protocol surface area small. And more importantly, it exposes where the design starts to feel cramped.

That's useful. Good constraints reveal the next real problem.

I already know that if `QWire` grows, `EMPTY` will probably stop being enough. But I would rather discover that from real pressure than invent five response types too early.

## What's Missing

There are plenty of things this project does not do yet.

- no persistence; queue state lives entirely in memory
- no authentication or authorization
- no unsubscribe flow beyond disconnecting the socket
- no message replay to a late subscriber even though pushed bodies are stored
- response semantics are still intentionally minimal

This is very much a first clean pass. The point was to get the protocol, helpers, client, and server to agree on one small slice of behavior before adding more moving parts.

I've found that protocol work gets messy fast when you expand the command set before the base encoding rules feel solid.

## What I Took Away

The biggest lesson from `QWire` is that binary protocols are not inherently complicated. They only become scary when the format is ambiguous or the implementation lies to itself.

If you keep the rules small, things stay manageable:

- fixed header
- explicit payload lengths
- one clear discriminator byte
- strict validation
- separate stream reading from frame parsing

Most of the complexity is not in "how do I pack bytes?" It is in semantics. What should a join mean? Should queued messages replay to a new subscriber? Is `PUSH_QUEUE` allowed before `JOIN_QUEUE`? Should errors be typed? When should a queue disappear?

Those are the real design questions.

The wire format itself can stay tiny.

And honestly, that is what I like about projects like this. You start with a simple idea, write down the rules, force the client and server to obey them, and by the end you understand the boundary between the protocol and the application a little better than you did before.

That alone made the project worth writing.
