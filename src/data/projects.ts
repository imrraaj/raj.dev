export interface Project {
  title: string;
  description: string;
  features: string[];
  technologies: string[];
  github: string;
  liveUrl?: string;
  image?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    title: "Arc",
    description: "Terminal coding-agent harness with local tools, approvals, memory, and persistent sessions",
    features: [
      "Built an OpenTUI terminal app around the Vercel AI SDK and NVIDIA OpenAI-compatible models",
      "Implemented approval-gated file editing, shell command execution, grep, web search, skills, and subagent tools",
      "Persisted sessions, messages, token usage, and tool-call audit history in SQLite with Drizzle migrations",
      "Added rolling conversation compaction using markdown prompts to preserve useful context within model limits",
      "Constrained filesystem operations to the active workspace with centralized JSON settings for API keys",
    ],
    technologies: ["TypeScript", "Bun", "React", "OpenTUI", "Vercel AI SDK", "SQLite", "Drizzle"],
    github: "https://github.com/imrraaj/arcode",
    featured: true,
  },
  {
    title: "Redixis",
    description: "Prototype multi-tenant Redis gateway with API-key auth, command allow-listing, rate limiting, and Prometheus/Grafana observability",
    features: [
      "Built a Go/Gin HTTP gateway that exposes tenant-scoped Redis commands through a small REST API",
      "Separated auth Redis from tenant data Redis, using Redis ACLs and tenant:{id}: key namespacing for isolation",
      "Implemented demo tenant/API-key minting, SHA-256 key storage, constant-time comparison, and per-tenant rate limiting with Lua-backed Redis counters",
      "Added health/readiness endpoints, OpenAPI/Swagger docs, structured request logging, and Prometheus metrics for HTTP, auth, Redis, tenant operations, and rate-limit decisions",
      "Provisioned Docker Compose, Prometheus, Grafana dashboards, Go benchmarks, and k6 load/crash tests for local performance validation",
    ],
    technologies: ["Golang", "Gin", "Redis", "Prometheus", "Grafana", "Docker", "OpenAPI", "k6"],
    github: "https://github.com/imrraaj/redixis",
    featured: true,
  },
  {
    title: "Byte Stream",
    description: "A no-bullshit video player written in C",
    features: [
      "Built from scratch in C for recreational purposes",
      "Handles video processing and audio playback using ffmpeg",
      "Uses raylib for rendering and user interface",
      "Supports basic video formats like mp4 and avi",
      "Supports custom shaders applied to video frames",
      "Custom shaders for dimming, brightness, contrast, color grading, and more",
    ],
    technologies: ["C", "ffmpeg", "Raylib"],
    github: "https://github.com/imrraaj/byte-stream",
    featured: true,
  },
  {
    title: "syngine",
    description: "Linux one-way file sync engine that watches local changes with inotify and mirrors them to a remote machine over rsync/SSH",
    features: [
      "Built a Go CLI that recursively watches a source directory with Linux inotify",
      "Correlates MOVED_FROM and MOVED_TO cookies to sync renames and moves as single operations instead of delete/create pairs",
      "Maintains a content-aware index with file size, mtime, and xxhash to skip unchanged files and filter noisy filesystem events",
      "Automatically adds watches for new directories and scans pre-existing children to avoid missing race-condition writes",
      "Implements a pluggable syncer interface with rsync/SSH support for creates, modifications, deletes, and remote moves",
    ],
    technologies: ["Golang", "Linux inotify", "rsync", "SSH", "xxhash"],
    github: "https://github.com/imrraaj/syngine",
    featured: true,
  },


  {
    title: "gocached",
    description: "An attempt to build a Redis clone in Go",
    features: [
      "Implements core Redis functionality",
      "Concurrent client handling with goroutines",
      "Network programming with TCP",
      "Supports basic commands like GET, SET, DEL, and more",
      "Write Ahead Log (WAL) for data persistence using a custom binary format",
      "Supports basic data structures like strings, lists, sets, and hashes",
    ],
    technologies: ["Golang", "TCP Networking", "Concurrent Maps"],
    github: "https://github.com/imrraaj/gocached",
    featured: true,
  },
  {
    title: "dexify",
    description: "Modern web application for decentralized exchange",
    features: [
      "Frontend for Uniswap V2 DEX for token buy/sell",
      "Added support for buy/sell at specific price using limit orders",
      "Realtime token price using Uniswap Liquidity pools",
      "Supports multiple blockchains like Arbitrum, Base, and BSC",
    ],
    technologies: ["TypeScript", "React", "Solidity", "Tailwind CSS"],
    github: "https://github.com/imrraaj/dexify",
    featured: true,
  },
  {
    title: "LLMemory",
    description: "Local MCP memory server for storing and searching LLM context",
    features: [
      "Stores scoped memories in SQLite for user, project, and session contexts",
      "Uses sqlite-vec and OpenAI-compatible embeddings for semantic search",
      "Exposes MCP tools for adding, searching, listing, updating, and deleting memories",
      "Supports configurable embedding endpoint, model, vector dimension, and database path",
      "Includes validation and tests with fake embeddings for local development",
    ],
    technologies: ["Golang", "SQLite", "sqlite-vec", "MCP"],
    github: "https://github.com/imrraaj/LLMemory",
  },
  {
    title: "gloom",
    description: "Bloom filter implementation in C++",
    features: [
      "Efficient probabilistic data structure implementation",
      "Hash function optimization and collision handling",
      "Memory-efficient design for large datasets",
    ],
    technologies: ["C++", "Data Structures", "Algorithms"],
    github: "https://github.com/imrraaj/gloom",
  },
];
