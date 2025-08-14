import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from '@astrojs/mdx';

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://rajpa.tel",
  integrations: [
    mdx(), 
    sitemap({
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date(),
      entryLimit: 100,
    }), 
    tailwind(), 
    react()
  ],
  markdown:{
    shikiConfig:{
      theme: "plastic"
    }
  }
});
