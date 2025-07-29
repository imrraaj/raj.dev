/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				accent: '#10b981',  // Single accent color for hovers
			},
			fontFamily: {
				'primary': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				'secondary': ['Geist Sans', 'system-ui', '-apple-system', 'sans-serif'],
				'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
			},
			fontSize: {
				'xs': '0.75rem',
				'sm': '0.875rem',
				'base': '1rem',
				'lg': '1.125rem',
				'xl': '1.25rem',
				'2xl': '1.5rem',
				'3xl': '1.875rem',
				'4xl': '2.25rem',
				'5xl': '3rem',
				'6xl': '3.75rem',
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
