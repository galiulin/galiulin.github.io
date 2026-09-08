import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * `en/2019-08-14-docker.md` -> `en/docker`
 * The date lives in frontmatter, so it is stripped from the id (and therefore from the URL).
 * The language folder is kept to keep ids unique across translations.
 */
const idFromEntry = ({ entry }: { entry: string }) =>
  entry.replace(/\.mdx?$/, "").replace(/(^|\/)\d{4}-\d{2}(-\d{2})?-/, "$1");

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog",
    generateId: idFromEntry,
  }),
  // `image()` runs the file through astro:assets, so covers are optimised.
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      lang: z.enum(["en", "ru"]),
      /** Shared by a pair of translations, e.g. "kotlin-coroutines". */
      translationId: z.string(),
      tags: z.array(z.string()).default([]),
      coverImage: image().optional(),
      /** One post per language may set this — the home page pins it above the latest list. */
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

/** Standalone pages (About), one file per language. */
const pages = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/pages",
    generateId: idFromEntry,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(["en", "ru"]),
  }),
});

export const collections = { blog, pages };
