export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  highlights: string[];
  technologies: string[];
  url?: string;
}

export const experience: Experience[] = [
  {
    company: "rtCamp",
    role: "Software Engineer",
    period: "2024 - Present",
    description:
      "Building high-performance web solutions using headless CMS and React-based systems.",
    highlights: [
      "Developed fully decoupled architecture using WordPress as headless CMS with Next.js frontend, implementing dynamic content management without frontend code changes",
      "Built custom React-based Gutenberg blocks for American Eagle project, enhancing user experience and content flexibility",
      "Optimized performance and caching systems for Indian Express news platform, improving site speed and reliability",
    ],
    technologies: [
      "Next.js",
      "React",
      "WordPress",
      "PHP",
      "GraphQL",
      "TypeScript",
    ],
    url: "https://rtcamp.com",
  },
];
