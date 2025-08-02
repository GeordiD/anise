import * as cheerio from 'cheerio';

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

  // Fetch the webpage
  const response = await fetch(url);
  
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: `Failed to fetch URL: ${response.statusText}`,
    });
  }
  
  const html = await response.text();
  
  // Parse with cheerio and extract clean content
  const $ = cheerio.load(html);
  
  // Remove unwanted elements
  $('script, style, nav, header, footer, aside, .advertisement, .ads, .social-share').remove();
  
  // Try to find main content areas (common selectors for recipe sites)
  let content = '';
  const contentSelectors = [
    'article',
    'main',
    '[role="main"]',
    '.recipe',
    '.entry-content',
    '.post-content',
    '.content'
  ];
  
  for (const selector of contentSelectors) {
    const element = $(selector).first();
    if (element.length && element.text().trim()) {
      content = element.text().trim();
      break;
    }
  }
  
  // Fallback to body if no main content found
  if (!content) {
    content = $('body').text().trim();
  }
  
  // Clean up whitespace
  content = content.replace(/\s+/g, ' ').trim();
  
  return {
    success: true,
    url: url,
    content: content,
    contentLength: content.length,
  };
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
