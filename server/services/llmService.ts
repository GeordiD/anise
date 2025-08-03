import {
  extractRecipeTool,
  recipeSchema,
  type RecipeData,
} from '../schemas/recipeSchema';

export interface UsageStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export interface RecipeExtractionResult {
  recipe: RecipeData;
  usage: UsageStats;
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

  async extractRecipe(
    content: string,
    maxRetries: number = 3
  ): Promise<RecipeExtractionResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.attemptRecipeExtraction(content, attempt);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to extract recipe after ${maxRetries} attempts: ${
        lastError?.message || 'Unknown error'
      }`,
    });
  }

  private async attemptRecipeExtraction(
    content: string,
    attempt: number
  ): Promise<RecipeExtractionResult> {
    const prompt = `Extract recipe information from the provided content. Use the extract_recipe tool to return the structured data.

Guidelines:
- Extract ingredients as individual items, preserving quantities and descriptions
- Extract instructions as numbered steps in order
- Include timing information if present
- Be precise and don't add information not in the content
- If information is not available, omit that field
- For difficulty, choose from: easy, medium, hard (or omit if unclear)

Content:
<content>
${content}
</content>`;

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
        tools: [extractRecipeTool],
        tool_choice: {
          type: 'function',
          function: { name: 'extract_recipe' },
        },
        temperature: attempt > 1 ? 0.2 : 0.1, // Slightly increase temperature on retries
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== 'extract_recipe') {
      throw new Error('No tool call received from LLM');
    }

    const rawData = JSON.parse(toolCall.function.arguments);

    // Validate with Zod schema
    const validatedData = recipeSchema.parse(rawData);

    // Calculate usage and costs
    const usage = this.calculateUsage(data.usage);

    return {
      recipe: validatedData,
      usage,
    };
  }

  private calculateUsage(usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  }) {
    // Calculate usage and costs
    const inputTokens = usage?.prompt_tokens || 0;
    const outputTokens = usage?.completion_tokens || 0;
    const totalTokens = usage?.total_tokens || 0;

    // Claude 3.5 Sonnet pricing: $3/M input, $15/M output
    const inputCost = (inputTokens / 1000000) * 3;
    const outputCost = (outputTokens / 1000000) * 15;
    const totalCost = inputCost + outputCost;

    return {
      inputTokens,
      outputTokens,
      totalTokens,
      inputCost: Number(inputCost.toFixed(3)),
      outputCost: Number(outputCost.toFixed(3)),
      totalCost: Number(totalCost.toFixed(3)),
    };
  }
}

export const llmService = new LLMService();
