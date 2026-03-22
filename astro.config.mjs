import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://rajpa.tel",
  integrations: [
    mdx(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      entryLimit: 100,
    }),
    tailwind(),
  ],
  markdown: {
    shikiConfig: {
      theme: "tokyo-night",
    },
  },
});
