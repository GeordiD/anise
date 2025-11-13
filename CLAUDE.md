# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Tech Stack

- **Nuxt 4** - Full-stack Vue 3 + TypeScript framework
- **Drizzle ORM** - Database ORM with Postgres/PGlite
- **Nuxt UI** - Component library and design system
- **Package Manager**: `pnpm` (always use pnpm commands)

## Key Commands

- `pnpm dev` - Start dev server (localhost:3000)
- `pnpm lint` - Lint code
- `pnpm typecheck` - Type check

## Development Workflow

- ALWAYS run `pnpm lint` and `pnpm typecheck` after making code changes
- Don't run the dev server yourself - assume it's already running on localhost:3000
- When needed, ask about using playwright to verify changes in both light and dark mode

## Vue Development

- Always use `<script setup lang="ts">`
- Put `<script>` section above `<template>` section
- Most frontend folders/files should be in the `/app/` folder

## API Development

- Server routes are in `server/api/` directory
- Database schema is in `server/db/schema.ts`
- When creating `defineRouteMeta()` swagger config, don't define responses (too verbose)

## Documentation

- [Color System](./docs/color-system.md) - Semantic color classes and dark mode guidelines

## External Resources

- [Nuxt UI Documentation](https://ui.nuxt.com/llms.txt)
- [Nuxt Documentation](https://nuxt.com/llms.txt)
- [Drizzle ORM Documentation](https://orm.drizzle.team/llms.txt)
