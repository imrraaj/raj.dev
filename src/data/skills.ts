export interface SkillCategory {
  category: string;
  items: string[];
}

export const skills: SkillCategory[] = [
  {
    category: "Languages",
    items: [
      "C",
      "JavaScript",
      "TypeScript",
      "Python",
      "Solidity",
      "Go",
      "PHP",
      "C++",
    ],
  },
  {
    category: "Frameworks",
    items: ["React", "Next.js", "Svelte", "Flask", "React Native", "Astro"],
  },
  {
    category: "Blockchain",
    items: ["Ethereum", "Smart Contracts", "Truffle", "Ganache"],
  },
  {
    category: "Databases",
    items: ["MySQL", "MongoDB", "PostgreSQL", "Redis"],
  },
  {
    category: "Tools",
    items: ["Git", "Linux", "Docker", "GraphQL", "REST APIs", "FFMPEG"],
  },
];
