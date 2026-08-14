import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "../consts";
import { locales, ui, type Lang } from "../i18n/ui";
import { localeUrl } from "../i18n/urls";
import { getPosts, slugOf } from "./posts";

/** One feed per language: `/rss.xml` and `/ru/rss.xml`. */
export async function feed(lang: Lang, context: APIContext) {
  const posts = await getPosts(lang);

  return rss({
    title: `${SITE.title} (${locales[lang].label})`,
    description: ui[lang]["site.description"],
    site: context.site!,
    customData: `<language>${locales[lang].htmlLang.toLowerCase()}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      link: localeUrl(lang, `blog/${slugOf(post)}`),
    })),
  });
}
