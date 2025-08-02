import * as cheerio from 'cheerio';

export interface RecipeContentResult {
  success: boolean;
  url: string;
  content: string;
  contentLength: number;
}

export const recipeService = {
  fetchAndCleanContent: async function (
    url: string
  ): Promise<RecipeContentResult> {
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
    $(
      'script, style, nav, header, footer, aside, .advertisement, .ads, .social-share'
    ).remove();

    // Try to find main content areas (common selectors for recipe sites)
    let content = '';
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.recipe',
      '.entry-content',
      '.post-content',
      '.content',
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
  },
};
