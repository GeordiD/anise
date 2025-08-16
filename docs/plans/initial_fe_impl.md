# Recipe Frontend Implementation Plan

## Phase 1: Dependencies & Setup
1. **Install required dependencies**:
   - `@tanstack/vue-query` for data fetching
   - `@tanstack/vue-table` for table functionality
   - TailwindCSS (likely included with @nuxt/ui, but verify)

2. **Configure Nuxt for pages**:
   - Update `nuxt.config.ts` to enable Tailwind if needed
   - Set up app structure with pages directory

## Phase 2: Core Layout & Navigation
3. **Create app layout** (`layouts/default.vue`):
   - Minimal nav bar with back button functionality
   - Creamy white background styling
   - Mobile-first responsive design

4. **Set up router structure**:
   - Home page (`pages/index.vue`)
   - Recipe detail page (`pages/recipes/[id].vue`)

## Phase 3: Data Layer
5. **Configure TanStack Query**:
   - Set up Vue Query plugin and client
   - Create API composables for recipes

6. **Create API composables**:
   - `useRecipes()` for fetching all recipes
   - `useRecipe(id)` for fetching single recipe

## Phase 4: Home Page Implementation
7. **Create recipe list component**:
   - Use TanStack Table for recipe list
   - Display recipe names only (minimal design)
   - Mobile-optimized responsive table
   - Click handlers for navigation to detail

## Phase 5: Recipe Detail Page
8. **Build recipe detail components**:
   - Recipe header with metadata box (time, cuisine, etc)
   - Grouped ingredients section
   - Numbered instructions list
   - Bullet-pointed notes section

9. **Implement navigation**:
   - Back button functionality
   - URL-based routing with recipe IDs

## Phase 6: Styling & Polish
10. **Apply consistent styling**:
    - Minimal design system with creamy white/black
    - Mobile-first responsive breakpoints
    - Loading states and error handling

11. **Final testing & optimization**:
    - Test on mobile and desktop
    - Ensure accessibility
    - Performance optimization

## Tech Requirements
- **Styling**: Tailwind CSS for responsive design
- **Data Management**: TanStack Query for server state
- **Table Component**: TanStack Table for recipe list
- **Design**: Minimal creamy white background with black text
- **Target**: Mobile-first, responsive for desktop
- **Code Organization**: Component-based architecture for maintainability

## API Endpoints to Use
- `GET /api/recipes` - List all recipes (name, id, basic metadata)
- `GET /api/recipes/[id]` - Get full recipe details (ingredients, instructions, notes)