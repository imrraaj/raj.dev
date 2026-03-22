export interface Education {
  institution: string;
  degree: string;
  period: string;
  grade?: string;
  highlights?: string[];
}

export const education: Education[] = [
  {
    institution: "Nirma University",
    degree: "Bachelor of Technology in Computer Science Engineering",
    period: "2020 - 2024",
    grade: "CGPA: 8.5",
    highlights: [
      "Published Research Paper on Blockchain Healthcare System",
      "Organizing Committee - Mined Hackathon (2 consecutive years)",
      "Coursework: Cloud Computing, Financial Engineering, Compiler Construction, Theory of Computation",
    ],
  },
];
