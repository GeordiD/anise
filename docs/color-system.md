# Color System

This project uses **Nuxt UI semantic color classes** that automatically handle light/dark mode transitions. Use these instead of manual `dark:` variants.

## Text Colors (Recommended Usage)

- `text-default` - Primary text (headings, main content)
- `text-muted` - Secondary text (labels, descriptions)
- `text-inverted` - Inverted text for dark backgrounds
- `text-dimmed` - tertiary text

## Semantic State Colors

- `text-primary` - Primary brand color
- `text-secondary` - Secondary brand color
- `text-success` - Success states
- `text-info` - Informational content
- `text-warning` - Warning states
- `text-error` - Error states

## Primary Brand Colors

- `basil-400` - primary brand color
- `basil-300` - secondary brand color
- `basil-200`
- `basil-100`

## Background and Border Colors

### Backgrounds
- `bg-default` - Main background color for the app
- `bg-muted` - Secondary background color (should be used for cards placed on top of the background)
- `bg-accented` - Tertiary background color which used as hover states
- `bg-elevated` - Used as pressed state

### Borders
- `border-default` - border color for all divider lines and borders
- `border-accented` - same border color as default but some components use this instead of the default property

### Other Colors
For non-text elements, use Nuxt UI's semantic classes: `primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral`

These work with component props (e.g., `<UButton color="primary">`) and utility classes (e.g., `bg-primary`)

## Dark Mode Implementation

- **Color Mode Module**: Uses `@nuxtjs/color-mode` configured in `nuxt.config.ts`
- **Default Preference**: System preference with light mode fallback
- **Toggle**: Available in top navigation with sun/moon icons
- **Persistence**: Color mode preference is stored in localStorage

## ❌ Avoid Manual Dark Mode Classes

Don't use manual `dark:` variants for text:

```vue
<!-- ❌ Don't do this -->
<h1 class="text-gray-900 dark:text-gray-100">Title</h1>
<p class="text-gray-600 dark:text-gray-400">Description</p>

<!-- ✅ Do this instead -->
<h1 class="text-default">Title</h1>
<p class="text-muted">Description</p>
```
