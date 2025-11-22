#!/usr/bin/env tsx

/**
 * CLI tool for testing AI prompts in isolation
 * Usage: pnpm test-prompt <type> <input>
 *
 * Examples:
 *   pnpm test-prompt ingredient "2 cups green bell peppers, diced"
 *   pnpm test-prompt ingredient "1/2 tsp salt"
 */

import { parseIngredient } from '../server/services/prompts/parseIngredient.js';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function printUsage() {
  console.log(`
${colors.bright}Usage:${colors.reset}
  pnpm test-prompt <type> <input>

${colors.bright}Available prompt types:${colors.reset}
  ${colors.cyan}ingredient${colors.reset}  - Parse ingredient text into structured components

${colors.bright}Examples:${colors.reset}
  pnpm test-prompt ingredient "2 cups green bell peppers, diced"
  pnpm test-prompt ingredient "1/2 tsp salt"
  pnpm test-prompt ingredient "3 garlic cloves, minced"
`);
}

async function testIngredientPrompt(input: string) {
  console.log(`\n${colors.bright}${colors.cyan}Testing Ingredient Parser${colors.reset}`);
  console.log(`${colors.yellow}Input:${colors.reset} "${input}"\n`);

  try {
    const startTime = Date.now();
    const result = await parseIngredient(input);
    const duration = Date.now() - startTime;

    console.log(`${colors.bright}${colors.green}✓ Parsed successfully${colors.reset} (${duration}ms)\n`);

    console.log(`${colors.bright}Result:${colors.reset}`);
    console.log(`  ${colors.blue}quantity:${colors.reset} ${result.parsed.quantity ?? 'null'}`);
    console.log(`  ${colors.blue}unit:${colors.reset}     ${result.parsed.unit ?? 'null'}`);
    console.log(`  ${colors.blue}name:${colors.reset}     ${result.parsed.name}`);
    console.log(`  ${colors.blue}note:${colors.reset}     ${result.parsed.note ?? 'null'}`);

    console.log(`\n${colors.bright}Usage Statistics:${colors.reset}`);
    console.log(`  ${colors.magenta}Input tokens:${colors.reset}         ${result.usage.inputTokens.toLocaleString()}`);
    console.log(`  ${colors.magenta}Output tokens:${colors.reset}        ${result.usage.outputTokens.toLocaleString()}`);
    console.log(`  ${colors.magenta}Cache creation:${colors.reset}       ${result.usage.cacheCreationInputTokens?.toLocaleString() ?? '0'}`);
    console.log(`  ${colors.magenta}Cache read:${colors.reset}           ${result.usage.cacheReadInputTokens?.toLocaleString() ?? '0'}`);
    if (result.usage.estimatedCost !== undefined) {
      console.log(`  ${colors.magenta}Estimated cost:${colors.reset}       $${result.usage.estimatedCost.toFixed(6)}`);
    }
    console.log();
  } catch (error) {
    console.error(`\n${colors.bright}${colors.yellow}✗ Error:${colors.reset}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Main execution
async function main() {
  const [promptType, ...inputArgs] = process.argv.slice(2);
  const input = inputArgs.join(' ');

  if (!promptType || !input) {
    printUsage();
    process.exit(1);
  }

  switch (promptType.toLowerCase()) {
    case 'ingredient':
      await testIngredientPrompt(input);
      break;

    // Future prompt types can be added here:
    // case 'recipe':
    //   await testRecipePrompt(input);
    //   break;

    default:
      console.error(`${colors.yellow}Unknown prompt type:${colors.reset} ${promptType}\n`);
      printUsage();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
