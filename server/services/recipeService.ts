import * as cheerio from 'cheerio';

export interface RecipeContentResult {
  success: boolean;
  url: string;
  content: string;
  contentLength: number;
}

class RecipeService {
  async fetchByUrl(url: string) {
    const content = this.fetchAndCleanContent(url);

    return content;
  }

  private async fetchAndCleanContent(
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
      if (element.length && element.html()?.trim()) {
        content = element.html()?.trim() || '';
        break;
      }
    }

    // Fallback to body if no main content found
    if (!content) {
      content = $('body').html()?.trim() || '';
    }

    // Convert HTML to more readable text while preserving structure
    const cleanedContent = content
      .replace(/<h[1-6][^>]*>/gi, '\n### ') // Convert headings to markdown-style
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n• ') // Convert list items to bullet points
      .replace(/<\/li>/gi, '')
      .replace(/<p[^>]*>/gi, '\n') // Convert paragraphs to single line breaks
      .replace(/<\/p>/gi, '\n')
      .replace(/<br[^>]*>/gi, '\n') // Convert breaks to line breaks
      .replace(/<[^>]+>/g, ' ') // Remove remaining HTML tags
      .replace(/\n{2,}/g, '\n') // Clean up multiple newlines to single
      .replace(/[ \t]+/g, ' ') // Clean up multiple spaces
      .replace(/\n /g, '\n') // Remove spaces after newlines
      .trim();

    content = cleanedContent;

    return {
      success: true,
      url: url,
      content: content,
      contentLength: content.length,
    };
  }
}

export const recipeService = new RecipeService();
