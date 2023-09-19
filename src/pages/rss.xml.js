import rss from '@astrojs/rss';

const postImportResults = import.meta.glob("./blog/*.md", { eager: true })
const posts = Object.values(postImportResults).filter(post => post.frontmatter.published)
export function get() {

	return rss({
		stylesheet: "rss/styles.xsl",
		title: 'Enjoygraphy',
		description: 'A blossom in the dessert',
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