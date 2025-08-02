# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

## Tech stack

- Nuxt 4 (full-stack Vue 3 + TypeScript)
- Drizzle ORM with PGlite for local development
  - designed to eventually support PostgreSQL in production

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
