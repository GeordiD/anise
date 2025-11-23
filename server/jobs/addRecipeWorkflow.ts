import { job } from '~~/server/jobs/helpers/job';
import { scrapeRecipeByUrl } from '~~/server/jobs/scrapeRecipeByUrl';

export async function addRecipeByUrl(url: string) {
  await job('add-recipe', async () => {
    await scrapeRecipeByUrl(url);
  });
}
