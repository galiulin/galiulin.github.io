import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "../../consts";
import { slugOf } from "../../lib/posts";
import { renderOgImage, type OgCard } from "../../lib/og";

/**
 * Social preview images, generated at build time.
 *   /og/default.png            — the site card, used on every non-post page
 *   /og/<lang>/<slug>.png      — one card per post, with its title and tags
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection(
    "blog",
    (post) => import.meta.env.DEV || !post.data.draft,
  );

  return [
    { params: { path: "default" }, props: { title: SITE.title } satisfies OgCard },
    ...posts.map((post) => ({
      params: { path: `${post.data.lang}/${slugOf(post)}` },
      props: {
        title: post.data.title,
        eyebrow: `blog/${slugOf(post)}.md`,
        tags: post.data.tags,
      } satisfies OgCard,
    })),
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props as OgCard);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
