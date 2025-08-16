import { recipeScraper } from '../../services/recipeScraper';

interface RecipeFetchRequest {
  url: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RecipeFetchRequest>(event);

  // Basic URL validation
  const { url } = body;

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL is required',
    });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid URL format',
    });
  }

  // Use recipe service to fetch and clean content
  const result = await recipeScraper.fetchByUrl(url);

  return result;
});

defineRouteMeta({
  openAPI: {
    tags: ['Recipes'],
    summary: 'Fetch recipe from URL',
    description: 'Fetches and processes a recipe from the provided URL',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                format: 'uri',
                description: 'The URL of the recipe to fetch',
                example: 'https://example.com/recipe',
              },
            },
            required: ['url'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Success response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                url: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
});
