import { pgTable, serial, text, timestamp, integer, decimal, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  prepTime: text('prep_time'),
  cookTime: text('cook_time'),
  totalTime: text('total_time'),
  servings: text('servings'),
  cuisine: text('cuisine'),
  sourceUrl: text('source_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const recipeIngredientGroups = pgTable('recipe_ingredient_groups', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').notNull(),
  name: text('name'), // Optional group name
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  recipeReference: foreignKey({
    columns: [table.recipeId],
    foreignColumns: [recipes.id],
  }),
}));

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').notNull(),
  ingredient: text('ingredient').notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  groupReference: foreignKey({
    columns: [table.groupId],
    foreignColumns: [recipeIngredientGroups.id],
  }),
}));

export const recipeInstructions = pgTable('recipe_instructions', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').notNull(),
  instruction: text('instruction').notNull(),
  stepNumber: integer('step_number').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  recipeReference: foreignKey({
    columns: [table.recipeId],
    foreignColumns: [recipes.id],
  }),
}));

export const recipeNotes = pgTable('recipe_notes', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').notNull(),
  note: text('note').notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  recipeReference: foreignKey({
    columns: [table.recipeId],
    foreignColumns: [recipes.id],
  }),
}));

export const tokenUsage = pgTable('token_usage', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  inputCost: decimal('input_cost', { precision: 10, scale: 6 }).notNull(),
  outputCost: decimal('output_cost', { precision: 10, scale: 6 }).notNull(),
  totalCost: decimal('total_cost', { precision: 10, scale: 6 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  recipeReference: foreignKey({
    columns: [table.recipeId],
    foreignColumns: [recipes.id],
  }),
}));

// Relations
export const recipesRelations = relations(recipes, ({ many, one }) => ({
  ingredientGroups: many(recipeIngredientGroups),
  instructions: many(recipeInstructions),
  notes: many(recipeNotes),
  tokenUsage: one(tokenUsage),
}));

export const recipeIngredientGroupsRelations = relations(recipeIngredientGroups, ({ one, many }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredientGroups.recipeId],
    references: [recipes.id],
  }),
  ingredients: many(recipeIngredients),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  group: one(recipeIngredientGroups, {
    fields: [recipeIngredients.groupId],
    references: [recipeIngredientGroups.id],
  }),
}));

export const recipeInstructionsRelations = relations(recipeInstructions, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeInstructions.recipeId],
    references: [recipes.id],
  }),
}));

export const recipeNotesRelations = relations(recipeNotes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeNotes.recipeId],
    references: [recipes.id],
  }),
}));

export const tokenUsageRelations = relations(tokenUsage, ({ one }) => ({
  recipe: one(recipes, {
    fields: [tokenUsage.recipeId],
    references: [recipes.id],
  }),
}));
