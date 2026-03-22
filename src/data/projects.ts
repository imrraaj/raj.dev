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
