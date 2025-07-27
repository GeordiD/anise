# Initial Plan for Anise Meal Planning App

## Phase 1: Project Foundation & Setup
1. **Create project structure** with separate frontend (Vue + TypeScript) and backend (Node.js + Fastify) directories
2. **Initialize frontend** with Vue 3, TypeScript, Vite, and essential dependencies (Vue Router, Pinia for state management)
3. **Initialize backend** with Fastify, TypeScript, and Drizzle ORM
4. **Set up development environment** following your TS starter preferences:
   - pnpm as package manager
   - Modular config files (eslint.config.mjs, .prettierrc, tsconfig.json)
   - ESLint + Prettier with single quotes
   - Future: husky pre-commit hooks
5. **Database setup** with PGlite for local development (easier PostgreSQL production transition)

## Phase 2: MVP Core Features (Simplified)
1. **Recipe Management**: Basic CRUD operations for recipes with ingredients and instructions
2. **Pantry Tracking**: Add/remove/edit pantry items with quantities

## Future Phases (Not Implemented Yet)
- Meal planning with AI integration
- Shopping list generation
- Advanced features

## Technology Decisions
- **Frontend**: Vue 3 + TypeScript + Vite + Tailwind CSS
- **Backend**: Fastify + TypeScript + Drizzle ORM
- **Database**: PGlite (dev) → PostgreSQL (prod)
- **Package Manager**: pnpm
- **Tooling**: ESLint, Prettier, modular configs

## Implementation Notes
- Start with Phase 1 foundation
- Keep MVP simple and focused
- Build incrementally with proper testing