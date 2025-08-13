import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";

export async function GET(context) {
	const postImportResults = import.meta.glob("./blog/*.md", { eager: true });
	const posts = Object.values(postImportResults)
		.filter(post => post.frontmatter && post.frontmatter.published)
		.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));

	return rss({
		stylesheet: "/rss/styles.xsl",
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map(post => {
			const [day, month, year] = post.frontmatter.date.split("-").map(Number);
			const pubDate = new Date(year, month - 1, day);
			
			return {
				link: post.url || `/blog/${post.file.split('/').pop().replace('.md', '')}`,
				pubDate: pubDate,
				title: post.frontmatter.title,
				description: post.frontmatter.description,
				author: 'rajpatel10953@gmail.com (Raj Patel)',
				categories: post.frontmatter.tags ? post.frontmatter.tags.split(', ') : [],
			};
		}),
		customData: `<language>en-us</language>`,
	});
}