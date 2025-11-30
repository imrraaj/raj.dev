/** @type {import('tailwindcss').Config} */

// CENTRALIZED COLOR SCHEME
// Change these values to instantly update your entire site's color scheme
const colorScheme = {
	// Primary brand color - used for accents, highlights, and interactive elements (cold orange)
	primary: {
		1: '#d4834f',    // Light - for highlights and hover states
		2: '#b86d3d',    // Main - primary brand color (muted warm-cool orange)
		3: '#9a5a2f',    // Dark - for active states and emphasis
		
		// Legacy support for existing code
		50: '#d4834f',
		100: '#d4834f',
		200: '#d4834f',
		300: '#d4834f',
		400: '#d4834f',
		500: '#b86d3d',
		600: '#9a5a2f',
		700: '#9a5a2f',
		800: '#9a5a2f',
		900: '#9a5a2f',
		950: '#9a5a2f',
	},
	// Background colors - dark theme
	background: {
		primary: '#09090b',    // Main background (zinc-950)
		secondary: '#18181b',  // Secondary background (zinc-900)
		tertiary: '#27272a',   // Cards/elevated surfaces (zinc-800)
		hover: '#3f3f46',      // Hover states (zinc-700)
		border: '#3f3f46',     // Border color (zinc-700)
		borderLight: '#52525b', // Light border (zinc-600)
	},
	// Text colors
	text: {
		primary: '#fafafa',    // Main text (zinc-50)
		secondary: '#e4e4e7',  // Secondary text (zinc-200)
		tertiary: '#d4d4d8',   // Tertiary text (zinc-300)
		muted: '#a1a1aa',      // Muted text (zinc-400)
		disabled: '#71717a',   // Disabled text (zinc-500)
	},
	// Code block colors
	code: {
		background: '#27272a', // Code background (zinc-800)
		text: '#fafafa',       // Code text
		border: '#3f3f46',     // Code border
	}
};

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// Simplified color palette using the centralized scheme
				primary: colorScheme.primary,
				brand: colorScheme.primary[500], // Quick access to main brand color
				accent: colorScheme.primary[500], // Legacy support
				
				// Semantic color names for easy theming
				'bg-primary': colorScheme.background.primary,
				'bg-secondary': colorScheme.background.secondary,
				'bg-tertiary': colorScheme.background.tertiary,
				'bg-hover': colorScheme.background.hover,
				'bg-border': colorScheme.background.border,
				'bg-border-light': colorScheme.background.borderLight,
				
				'text-primary': colorScheme.text.primary,
				'text-secondary': colorScheme.text.secondary,
				'text-tertiary': colorScheme.text.tertiary,
				'text-muted': colorScheme.text.muted,
			},
			fontFamily: {
				'primary': ['Schibsted Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
				'secondary': ['Schibsted Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
				'mono': ['Iosevka', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
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
			},
			// Add smooth transitions globally
			transitionProperty: {
				'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
			},
			transitionDuration: {
				'DEFAULT': '200ms',
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
