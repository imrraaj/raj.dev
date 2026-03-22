export const SITE_TITLE = "Raj Patel";
export const SITE_DESCRIPTION =
  "Software engineer writing about programming, systems design, and the web.";
export const SITE_URL = "https://rajpa.tel";

export const AUTHOR = {
  name: "Raj Patel",
  email: "rajpatel10953@gmail.com",
  bio: "Software Engineer building high-performance web solutions. Interested in systems programming, distributed systems, and making the web go fast.",
  avatar: "/header.jpg",
  title: "Software Engineer",
  company: "rtCamp",
  location: "India",
  github: "imrraaj",
  twitter: "imrraaj",
};

export const NAVIGATION = [
  { text: "Home", link: "/" },
  { text: "Blog", link: "/blog" },
  { text: "Projects", link: "/projects" },
  { text: "About", link: "/about" },
];

export interface Social {
  name: string;
  link: string;
  icon: "mail" | "github" | "twitter" | "rss";
}

export const SOCIALS: Social[] = [
  { name: "Email", link: "mailto:rajpatel10953@gmail.com", icon: "mail" },
  { name: "GitHub", link: "https://github.com/imrraaj", icon: "github" },
  { name: "Twitter", link: "https://x.com/imrraaj", icon: "twitter" },
];
