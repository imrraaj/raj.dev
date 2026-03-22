import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";
import { parseDate } from "../utils/date";

export async function GET(context) {
  const posts = await getCollection("blog");
  const publishedPosts = posts
    .filter((post) => post.data.published)
    .sort(
      (a, b) =>
        parseDate(b.data.date).getTime() - parseDate(a.data.date).getTime()
    );

  return rss({
    stylesheet: "/rss/styles.xsl",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: publishedPosts.map((post) => ({
      link: `/blog/${post.slug}`,
      pubDate: parseDate(post.data.date),
      title: post.data.title,
      description: post.data.description,
      author: "Raj Patel",
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
