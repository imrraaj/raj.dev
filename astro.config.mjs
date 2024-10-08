import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from '@astrojs/mdx';

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://raj-dev.vercel.app",
  integrations: [mdx(), sitemap(), tailwind(), react()],
});


export function exampleRemarkPlugin() {
  // All remark and rehype plugins return a separate function
  return function (tree, file) {
    file.data.astro.frontmatter.customProperty = 'Generated property';
  }
}