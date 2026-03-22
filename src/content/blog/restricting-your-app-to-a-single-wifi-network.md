---
title: Restricting a Next.js App to a Single WiFi Network Using DDNS
date: 22-03-2026
description: Locking down a Next.js app to a single WiFi network using free DDNS and 40 lines of middleware.
published: true
tags: ["Next.js", "Networking", "DDNS"]
image: "/blog-cover.png"
---


I'm building an attendance management system for an aviation academy. Students check in when they arrive, and the system logs how many hours of lectures and flight training they've attended. Aviation academies have strict policies around this — regulatory bodies need accurate records. The problem? Students can be lazy. If the attendance portal is accessible from anywhere, nothing stops a student from checking in from their couch at home and pretending they're at the academy.

We needed a way to ensure the site is only accessible from the academy's WiFi network. No VPNs, no workarounds — if you're not on the academy's router, you don't get in.

## The Problem

This sounds simple until you think about it. The academy doesn't have a static IP. Most ISPs in India give you a dynamic IP that changes every few hours or whenever the router restarts. So we can't just hardcode an IP address in our server config and call it a day.

We also can't use MAC address filtering or device-level restrictions because the system needs to work on any device — students bring their own phones and laptops. The restriction has to be at the network level: are you on this specific router's network or not?

## The Approach: DDNS + Middleware

The solution has two parts: 

1. **DDNS (Dynamic DNS)** on the router to give the academy's changing IP a stable hostname

2. **Middleware in the application** that resolves the hostname, gets the current IP, and blocks requests from anywhere else
### Setting Up DDNS
I used [No-IP](https://www.noip.com/), which has a free tier. Most consumer routers have built-in DDNS support — you just go to the router's admin panel, find the DDNS section, and enter your No-IP credentials. The router then periodically pings No-IP with its current public IP, keeping the hostname up to date.
After setup, we have a hostname like `academy.serveblog.net` that always resolves to the academy's current public IP, even when the ISP changes it.
### Resolving the Hostname in Edge Runtime
Here's where it gets interesting. Our app runs on Vercel, which uses Edge Runtime for middleware. Edge Runtime doesn't have access to Node.js modules like `dns/promises`. No `dns.resolve4()`. No `net` module. Nothing.
But we can make HTTP requests. And Cloudflare provides a public DNS-over-HTTPS API that returns DNS records as JSON. So we just ask Cloudflare to resolve our hostname:


```typescript
async function getAllowedIp(): Promise<string | null> {

    const host = process.env.ALLOWED_DDNS_HOST;
    if (!host) return null;

    // Cache to avoid hitting DNS on every single request
    if (cachedAllowedIp && Date.now() < cacheExpiry) return cachedAllowedIp;
    const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${host}&type=A`,
        { headers: { Accept: "application/dns-json" } },
    );

    const data = await res.json();
    const ip = data?.Answer?.[0]?.data;
    if (ip) 
        cachedAllowedIp = ip;
        cacheExpiry = Date.now() + 60_000; // cache for 60 seconds
        return ip;
    }
    return null;
}
```

We cache the resolved IP for 60 seconds. Dynamic IPs don't change every second — they change every few hours at most. Hitting DNS on every request would be wasteful and slow.
  
### The Middleware

With the IP in hand, the middleware is straightforward. Get the client's IP from request headers, compare it to the allowed IP, and return a 403 page if they don't match:

```typescript

export async function middleware(request: NextRequest) {

    // Let static assets through — you don't want your CSS getting blocked
    if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
        return NextResponse.next();
    }

    const allowedIp = await getAllowedIp();
    if (allowedIp) {
        const clientIp =
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            request.headers.get("x-real-ip");

        const isLocal = clientIp === "127.0.0.1" || clientIp === "::1";
        if (!isLocal && clientIp !== allowedIp) {
            return new NextResponse(blockedHtml, {
                status: 403,
                headers: { "Content-Type": "text/html" },
            });
        }
    }
    return NextResponse.next();

}

```

One gotcha that bit me hard: I forgot to exclude `/_next` routes from the middleware. Next.js serves CSS, JavaScript, and other static assets from `/_next/static/`. My middleware was redirecting those requests to the signin page, and suddenly the entire site had no styles. Took me embarrassingly long to figure out why everything looked like a 1995 webpage.
  
## This Isn't Next.js Specific

The core logic here is framework-agnostic. You're resolving a hostname and comparing IPs. Here's what it looks like as pseudocode:  

```c

function handle_request(request):
    allowed_ip = dns_resolve(DDNS_HOSTNAME)
    client_ip = request.headers["x-forwarded-for"] or request.remote_addr  

    if client_ip != allowed_ip:
        return Response(403, "Access denied")

    else:
        return proceed_with_request()

```

You could implement this in Express, Flask, Go's `net/http`, a Cloudflare Worker, or literally anything that sits in front of your routes. The DNS resolution method changes (raw UDP, DoH, system resolver), but the logic doesn't.

In a traditional Node.js server, you'd use `dns.resolve4()` directly. In Python, `socket.getaddrinfo()`. In Go, `net.LookupHost()`. The Cloudflare DNS-over-HTTPS approach is only necessary when you're in a restricted runtime like Vercel's Edge.

## Implications and Tradeoffs
This isn't bulletproof, and I want to be honest about that.
**What it prevents:** Casual abuse. A student sitting at home can't just open their phone and check in. They have to physically be at the academy, connected to the WiFi. For an attendance system, this is good enough.
**What it doesn't prevent:** A determined person could find the academy's public IP and route their traffic through it (VPN to the academy network, for instance). But at that point, you're dealing with someone who's going to significant effort to fake attendance, and that's a disciplinary problem, not a technical one.

**NAT and shared IPs:** This works because everyone behind the academy's router shares the same public IP. That's exactly what we want — it's like a geofence, but for a specific network rather than a GPS coordinate. GPS can be spoofed with mock location apps. Your public IP is much harder to fake.  

**Dynamic IP lag:** There's a window of up to 60 seconds (our cache TTL) where the DDNS hostname might point to a stale IP. In practice, IP changes happen during off-hours when the ISP recycles addresses, and the router re-registers with No-IP within minutes. I haven't seen this cause a real issue.

**The `/_next` lesson:** If you're adding middleware that blocks requests, always whitelist your static asset paths first. Test by hard-refreshing. Your middleware runs on _every_ request, including the ones you forget about.

## Wrapping Up

The full flow looks like this:

```

[Student opens site]

→ Vercel Edge Middleware

→ Resolve academy.serveblog.net via Cloudflare DoH

→ Compare client IP with resolved IP

→ Match? → Proceed to app

→ No match? → 403 "Connect to academy WiFi"

```

It's maybe 40 lines of actual logic. The router's DDNS client does the hard part of keeping the hostname updated. Cloudflare's DoH API does the DNS resolution. All we do is glue them together in a middleware and say "are you here or not?"
For an attendance system where the goal is to prevent casual check-in fraud, this is exactly the right level of security. Not every problem needs a complex solution — sometimes a DNS query and an if statement is all you need.