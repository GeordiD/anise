import { job } from '~~/server/jobs/helpers/job';
import { llmStep } from '~~/server/jobs/helpers/llmStep';
import { step } from '~~/server/jobs/helpers/step';
import { processIngredients } from '~~/server/jobs/processIngredients';
import { scrapeAndCleanContent } from '~~/server/jobs/scrapeAndCleanContent';
import { extractRecipe } from '~~/server/services/prompts/extractRecipe';

export async function addRecipeByUrl(url: string) {
  await job('add-recipe', async () => {
    const cleanedContent = await step(
      'scrape-data',
      scrapeAndCleanContent,
      url
    );

    const { recipe } = await llmStep(
      'extract-recipe',
      extractRecipe,
      cleanedContent
    );

    await processIngredients(recipe);
  });
}
