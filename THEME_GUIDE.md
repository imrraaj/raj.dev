# Theme Customization Guide

This portfolio site features a centralized color scheme system that makes it easy to customize the entire site's appearance by changing just a few values.

## Quick Start

To change your site's color scheme, edit the `colorScheme` object in `tailwind.config.cjs`:

```javascript
const colorScheme = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    // ... more shades
    500: '#22c55e',  // Main primary color - CHANGE THIS!
    // ... more shades
  },
  // ... other color definitions
}
```

## Color Scheme Structure

### Primary Brand Color

The `primary` color is used for:
- Accent highlights and interactive elements
- Hover states on links and buttons
- Active navigation indicators
- Project card borders on hover
- Code highlighting
- Gradient text effects

**Default:** Green (`#22c55e`)

**To change:** Modify the entire `primary` object with your preferred color shades (you can use a color palette generator like [UI Colors](https://uicolors.app/)).

### Background Colors

```javascript
background: {
  primary: '#09090b',    // Main page background
  secondary: '#18181b',  // Secondary sections
  tertiary: '#27272a',   // Cards and elevated surfaces
  hover: '#3f3f46',      // Hover states
}
```

### Text Colors

```javascript
text: {
  primary: '#fafafa',    // Main headings and content
  secondary: '#e4e4e7',  // Secondary text
  muted: '#a1a1aa',      // Muted text and labels
  disabled: '#71717a',   // Disabled states
}
```

### Border Colors

```javascript
border: {
  primary: '#3f3f46',    // Main borders
  secondary: '#52525b',  // Secondary borders
  accent: '#22c55e',     // Accent borders (links to primary)
}
```

### Code Block Colors

```javascript
code: {
  background: '#27272a', // Code background
  text: '#fafafa',       // Code text
  border: '#3f3f46',     // Code border
}
```

## Popular Color Schemes

### 1. Blue Theme (Professional)

```javascript
primary: {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',  // Main blue
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
}
```

### 2. Purple Theme (Creative)

```javascript
primary: {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',  // Main purple
  600: '#9333ea',
  700: '#7e22ce',
  800: '#6b21a8',
  900: '#581c87',
  950: '#3b0764',
}
```

### 3. Orange Theme (Energetic)

```javascript
primary: {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',  // Main orange
  600: '#ea580c',
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
  950: '#431407',
}
```

### 4. Cyan Theme (Modern)

```javascript
primary: {
  50: '#ecfeff',
  100: '#cffafe',
  200: '#a5f3fc',
  300: '#67e8f9',
  400: '#22d3ee',
  500: '#06b6d4',  // Main cyan
  600: '#0891b2',
  700: '#0e7490',
  800: '#155e75',
  900: '#164e63',
  950: '#083344',
}
```

## CSS Custom Properties

The theme also defines CSS custom properties in `src/styles/global.css`:

```css
:root {
  --color-primary: theme('colors.primary.500');
  --color-primary-hover: theme('colors.primary.600');
  /* ... etc */
}
```

You can use these variables in custom CSS if needed.

## Semantic Color Names

For convenience, the following semantic colors are available:

- `brand` - Quick access to main brand color
- `accent` - Legacy support for accent color
- `bg-primary`, `bg-secondary`, `bg-tertiary`, `bg-hover` - Background variants
- `text-primary`, `text-secondary`, `text-muted` - Text variants
- `border-primary`, `border-secondary` - Border variants

## Testing Your Color Scheme

After changing colors:

1. Run `npm run dev` to start the development server
2. Check all pages: Home, Projects, Blog, individual blog posts
3. Test hover states on links, buttons, and cards
4. Verify text readability (especially on backgrounds)
5. Check dark mode compatibility

## Tips for Choosing Colors

1. **Contrast:** Ensure sufficient contrast between text and backgrounds for accessibility
2. **Consistency:** Use your primary color sparingly for maximum impact
3. **Readability:** Test your color scheme with actual content
4. **Accessibility:** Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
5. **Brand Alignment:** Choose colors that reflect your personal brand

## Advanced Customization

### Adding a Light Mode

To add light mode support, you can use Tailwind's dark mode feature:

```javascript
// tailwind.config.cjs
module.exports = {
  darkMode: 'class',
  // ... rest of config
}
```

Then add light mode variants to your color scheme.

### Custom Gradients

Use the primary color to create gradients:

```html
<div class="bg-gradient-to-r from-primary-500 to-primary-400">
  Gradient text
</div>
```

### Opacity Variants

Tailwind automatically generates opacity variants:

```html
<div class="bg-primary-500/50">  <!-- 50% opacity -->
  Semi-transparent background
</div>
```

## Need Help?

If you need help customizing your theme:

1. Check [Tailwind CSS Color Customization](https://tailwindcss.com/docs/customizing-colors)
2. Use [UI Colors](https://uicolors.app/) to generate color palettes
3. Test accessibility with [WAVE](https://wave.webaim.org/)

---

**Happy theming! 🎨**
