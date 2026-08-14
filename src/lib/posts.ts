import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "../i18n/ui";

export type Post = CollectionEntry<"blog">;

/** `en/docker` -> `docker` (the language lives in the URL prefix, not in the slug). */
export const slugOf = (post: Post): string => post.id.split("/").slice(1).join("/");

/** Posts of one language, newest first. Drafts are kept on the dev server only. */
export async function getPosts(lang: Lang): Promise<Post[]> {
  const posts = await getCollection(
    "blog",
    (post) => post.data.lang === lang && (import.meta.env.DEV || !post.data.draft),
  );
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** The same post in the other language, if it exists. */
export async function getTranslation(post: Post): Promise<Post | undefined> {
  const others = await getCollection(
    "blog",
    (other) =>
      other.data.translationId === post.data.translationId &&
      other.data.lang !== post.data.lang &&
      (import.meta.env.DEV || !other.data.draft),
  );
  return others[0];
}

const WORDS_PER_MINUTE = 200;

export function readingTime(post: Post): number {
  const words = (post.body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export const tagSlug = (tag: string): string => tag.toLowerCase().replace(/\s+/g, "-");

/** All tags of a language with their post counts, most used first. */
export function collectTags(posts: Post[]): { tag: string; slug: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, slug: tagSlug(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Posts sharing the most tags with `post`. */
export function relatedPosts(post: Post, posts: Post[], limit = 3): Post[] {
  const tags = new Set(post.data.tags);
  return posts
    .filter((other) => other.id !== post.id)
    .map((other) => ({
      other,
      shared: other.data.tags.filter((tag) => tags.has(tag)).length,
    }))
    .filter((candidate) => candidate.shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared || b.other.data.pubDate.valueOf() - a.other.data.pubDate.valueOf(),
    )
    .slice(0, limit)
    .map((candidate) => candidate.other);
}
