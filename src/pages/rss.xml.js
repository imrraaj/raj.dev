import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";

const postImportResults = import.meta.glob("./blog/*.md", { eager: true })
const posts = Object.values(postImportResults).filter(post => post.frontmatter.published)
export function get() {

	return rss({
		stylesheet: "rss/styles.xsl",
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: import.meta.env.SITE,
		items: posts.map(post => ({
			link: post.url,
			pubDate: new Date(post.frontmatter.date).toLocaleString({ language: "en-IN" }),
			title: post.frontmatter.title,
			customData: `<author>Raj Patel</author>`,
			description: post.frontmatter.description
		}))

	});
}