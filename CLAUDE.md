# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

## Tech stack

- Nuxt 4 (full-stack Vue 3 + TypeScript)
- Drizzle ORM with Postgres for local development

## Development Commands

- **Start development server**: `pnpm dev` (runs on http://localhost:3000)
- **Build for production**: `pnpm build`
- **Preview production build**: `pnpm preview`
- **Install dependencies**: `pnpm install`
- **Lint code**: `pnpm lint`
- **Type check**: `pnpm typecheck`

## Architecture

### Database Layer

- **ORM**: Drizzle ORM configured in `drizzle.config.ts`
- **Schema**: Located in `server/db/schema.ts` with tables for users, posts, and comments
- **Database setup**: `server/db/index.ts` exports the configured database connection
- **Local database**: PGlite stores data in `./data/db.sqlite`

### API Layer

- **Server API**: Nuxt server routes in `server/api/` directory
- **Example endpoint**: `server/api/users.get.ts` demonstrates basic database queries
- When creating a `defineRouteMeta()` swagger config, don't worry about defining the responses -- that's too much information to manage.

### Frontend

- **Framework**: Nuxt 4 with Vue 3 and TypeScript
- **UI Components**: @nuxt/ui module for design system
- **Main app**: `app/app.vue` serves as the root component

### Configuration

- **Nuxt config**: `nuxt.config.ts` includes modules for ESLint, testing, and UI
- **TypeScript**: Uses Nuxt's built-in TypeScript configuration with project references
- **ESLint**: Configured through `eslint.config.mjs` using Nuxt's ESLint module

## Package Manager

This project uses `pnpm` as the package manager. Always use `pnpm` commands instead of npm or yarn.

## Development Workflow

- When making changes to code, ALWAYS run `pnpm run lint` and `pnpm run typecheck` afterwards to ensure you're code is matching our style and typing systems.
- Don't run the development server yourself. Assume the dev server is already running on localhost:3000
- When needed, use playwright mcp server to check your work to make sure what you've done looks good. Be sure to check both light and dark mode (using the toggle in the nav bar)

## Vue Development

- When writing vue components, always use `<script setup lang="ts">`
- When writing vue components, put the script section above the template section

## Styling and Dark Mode

### Color System

This project uses **Nuxt UI semantic color classes** that automatically handle light/dark mode transitions. Use these instead of manual `dark:` variants:

#### Text Colors (Recommended Usage)

- `text-default` - Primary text (headings, main content)
- `text-toned` - Secondary text (labels, descriptions)
- `text-muted` - Tertiary text (placeholders, loading states)
- `text-dimmed` - Subtle text
- `text-highlighted` - Emphasized text
- `text-inverted` - Inverted text

#### Semantic State Colors

- `text-primary` - Primary brand color
- `text-secondary` - Secondary brand color
- `text-success` - Success states
- `text-info` - Informational content
- `text-warning` - Warning states
- `text-error` - Error states

#### Background and Other Colors

- For non-text elements, use Nuxt UI's semantic classes: `primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral`
- These work with component props (e.g., `<UButton color="primary">`) and utility classes (e.g., `bg-primary-50`)

### Dark Mode Implementation

- **Color Mode Module**: Uses `@nuxtjs/color-mode` configured in `nuxt.config.ts`
- **Default Preference**: System preference with light mode fallback
- **Toggle**: Available in top navigation with sun/moon icons
- **Persistence**: Color mode preference is stored in localStorage

### ❌ Avoid Manual Dark Mode Classes

Don't use manual `dark:` variants for text:

```vue
<!-- ❌ Don't do this -->
<h1 class="text-gray-900 dark:text-gray-100">Title</h1>
<p class="text-gray-600 dark:text-gray-400">Description</p>

<!-- ✅ Do this instead -->
<h1 class="text-default">Title</h1>
<p class="text-muted">Description</p>
```

## Project Structure

- Most frontend folders/files should be put in the `/app/` folder
