/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'text': '#f1faee',
				'background': '#22223b',
				'primary': '#a8dadc',
				'secondary': '#f2e9e4',
				'accent': '#c9ada7',
			},
			fontFamily: {
				'body': "'Inconsolata', sans- serif",
				'heading': "'Karla', serif"
			}
		},

	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
