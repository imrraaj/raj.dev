/** @type {import('tailwindcss').Config} */

const colorScheme = {
	// Accent — refined amber-copper
	accent: {
		light: '#e8a06a',
		main: '#cc7d3a',
		dark: '#a86228',
	},
	// Backgrounds — blue-tinted darks
	bg: {
		base: '#0a0c10',
		surface: '#12151c',
		elevated: '#1a1e28',
		overlay: '#252a36',
	},
	// Borders
	border: {
		default: '#2a3040',
		light: '#3a4258',
	},
	// Text — warm off-whites
	text: {
		primary: '#f0ece8',
		secondary: '#c8c2ba',
		tertiary: '#9a9490',
		muted: '#6b6560',
		disabled: '#4a4540',
	},
	// Code blocks
	code: {
		bg: '#1a1e28',
		text: '#f0ece8',
		border: '#2a3040',
	},
};

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// Accent scale (used as primary-*)
				'primary': {
					50: colorScheme.accent.light,
					100: colorScheme.accent.light,
					200: colorScheme.accent.light,
					300: colorScheme.accent.light,
					400: colorScheme.accent.light,
					500: colorScheme.accent.main,
					600: colorScheme.accent.dark,
					700: colorScheme.accent.dark,
					800: colorScheme.accent.dark,
					900: colorScheme.accent.dark,
					950: colorScheme.accent.dark,
				},
				accent: colorScheme.accent.main,

				// Semantic backgrounds
				'bg-base': colorScheme.bg.base,
				'bg-surface': colorScheme.bg.surface,
				'bg-elevated': colorScheme.bg.elevated,
				'bg-overlay': colorScheme.bg.overlay,

				// Legacy aliases (used in existing code)
				'bg-primary': colorScheme.bg.base,
				'bg-secondary': colorScheme.bg.surface,
				'bg-tertiary': colorScheme.bg.elevated,
				'bg-hover': colorScheme.bg.overlay,
				'bg-border': colorScheme.border.default,
				'bg-border-light': colorScheme.border.light,

				// Semantic text
				'text-primary': colorScheme.text.primary,
				'text-secondary': colorScheme.text.secondary,
				'text-tertiary': colorScheme.text.tertiary,
				'text-muted': colorScheme.text.muted,
				'text-disabled': colorScheme.text.disabled,

				// Border
				'border-default': colorScheme.border.default,
				'border-light': colorScheme.border.light,
			},
			fontFamily: {
				'display': ['"Instrument Serif"', 'Georgia', 'serif'],
				'body': ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
				'mono': ['"Space Grotesk"', 'system-ui', 'sans-serif'],
				'code': ['"Iosevka"', '"JetBrains Mono"', 'Consolas', 'Monaco', 'monospace'],
				// Legacy aliases
				'primary': ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
				'secondary': ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
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
				'7xl': '4.5rem',
			},
			transitionProperty: {
				'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
			},
			transitionDuration: {
				'DEFAULT': '200ms',
			},
			borderRadius: {
				'xl': '0.75rem',
				'2xl': '1rem',
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
};
