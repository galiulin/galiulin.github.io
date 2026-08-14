// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // User site (galiulin.github.io) — served from the domain root, so no `base` is needed.
  // For a project page it would be: base: "/<repo-name>".
  site: "https://galiulin.github.io",
  trailingSlash: "always",

  i18n: {
    defaultLocale: "en",
    locales: ["en", "ru"],
    routing: {
      // English lives at `/`, Russian at `/ru/...`
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en-US", ru: "ru-RU" },
      },
    }),
  ],

  markdown: {
    // `mermaid` blocks are left as plain <pre><code> and rendered client-side.
    syntaxHighlight: { type: "shiki", excludeLangs: ["mermaid"] },
    shikiConfig: { theme: "vitesse-dark", wrap: false },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
