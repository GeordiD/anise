export interface RecipeData {
  name: string;
  description?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: string;
  ingredients: string[];
  instructions: string[];
  notes?: string;
}

export class LLMService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
  }

  async extractRecipe(content: string): Promise<RecipeData> {
    const prompt = `Extract recipe information from the following content and return it as JSON.

Content:
${content}

Return a JSON object with this exact structure:
{
  "name": "Recipe Name",
  "description": "Brief description (optional)",
  "prepTime": "Prep time if available",
  "cookTime": "Cook time if available", 
  "totalTime": "Total time if available",
  "servings": "Number of servings if available",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "notes": "Any additional notes (optional)"
}

Guidelines:
- Extract ingredients as individual items, preserving quantities and descriptions
- Extract instructions as numbered steps in order
- Include timing information if present
- Be precise and don't add information not in the content
- Return only the JSON object, no additional text`;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Recipe Extractor',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `OpenRouter API error: ${response.statusText}`,
      });
    }

    const data = await response.json();
    const content_text = data.choices[0]?.message?.content;

    if (!content_text) {
      throw createError({
        statusCode: 500,
        statusMessage: 'No content received from LLM',
      });
    }

    try {
      return JSON.parse(content_text);
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to parse LLM response as JSON',
      });
    }
  }
}

export const llmService = new LLMService();
