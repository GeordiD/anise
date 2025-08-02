# Recipe Pipeline Plan - Step by Step with Cheerio

## Phase 1: Basic Endpoint
1. **Create endpoint** - `server/api/recipes/fetch.post.ts` that accepts `{ url: string }` in request body
2. **Basic URL validation** - Ensure URL is valid format
3. **Return success response** - Confirm endpoint works with simple JSON response

## Phase 2: Content Fetching & Cleaning
4. **Install cheerio** - Add to dependencies for HTML parsing
5. **Implement fetch + parse** - Use `fetch()` to get webpage, then cheerio to extract clean content
6. **Target content areas** - Extract main content (article tags, content divs) while removing scripts, styles, nav, ads
7. **Return cleaned text** - Send back just the relevant text content as JSON for inspection

## Phase 3: LLM Integration  
8. **Add OpenRouter setup** - Environment variables and API integration
9. **Create LLM extraction** - Send cleaned content to LLM with targeted recipe extraction prompt
10. **Return structured recipe data** - Parse LLM response into JSON with name, ingredients, steps, etc.

## Phase 4: Refinement
11. **Improve content extraction** - Fine-tune cheerio selectors for better content isolation
12. **Enhance error handling** - Handle fetch failures, parsing errors, LLM issues
13. **Eventually add database storage** - Once extraction pipeline works reliably

This keeps each step focused and testable while maximizing LLM efficiency.