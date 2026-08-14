import { getRelativeLocaleUrl } from "astro:i18n";
import { langs, type Lang } from "./ui";

/** Locale-aware URL for a path without a language prefix: `blog/docker` -> `/ru/blog/docker/`. */
export const localeUrl = (lang: Lang, path = ""): string => getRelativeLocaleUrl(lang, path);

/** `getRelativeLocaleUrl` would append a trailing slash, which breaks a file route. */
export const feedUrl = (lang: Lang): string =>
  `${import.meta.env.BASE_URL}${lang === "en" ? "" : `${lang}/`}rss.xml`.replace(/\/{2,}/g, "/");

export type Alternates = Record<Lang, { href: string; translated: boolean }>;

/** The same page in every language — for pages that exist in all of them. */
export function alternatesFor(path = ""): Alternates {
  return Object.fromEntries(
    langs.map((lang) => [lang, { href: localeUrl(lang, path), translated: true }]),
  ) as Alternates;
}
