/**
 * DTO and Command Model Types for FoodYee API
 * 
 * This file contains all Data Transfer Object (DTO) types and Command Models
 * used in the API, derived from the database types defined in database.types.ts
 */

import type { Tables, TablesInsert, TablesUpdate } from './db/database.types';

// =============================================================================
// BASE ENTITY TYPES (from database)
// =============================================================================

export type Recipe = Tables<'recipes'>;
export type RecipeIngredient = Tables<'recipe_ingredients'>;
export type Product = Tables<'products'>;
export type PlannerEntry = Tables<'planner_entries'>;
export type ShoppingList = Tables<'shopping_lists'>;
export type ShoppingListItem = Tables<'shopping_list_items'>;
export type AILog = Tables<'ai_logs'>;
export type AIDailyUsage = Tables<'ai_daily_usage'>;

// =============================================================================
// COMMON UTILITY TYPES
// =============================================================================

/**
 * Standard pagination metadata for list responses
 */
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Standard error response structure
 */
export interface ErrorResponseDTO {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponseDTO<T> {
  data: T[];
  pagination: PaginationDTO;
}

/**
 * Generic single item response wrapper
 */
export interface SingleResponseDTO<T> {
  data: T;
}

/**
 * Generic success message response
 */
export interface MessageResponseDTO {
  message: string;
  warnings?: string[];
}

// =============================================================================
// RECIPE DTOs
// =============================================================================

/**
 * Recipe data for list views (GET /api/recipes)
 * Omits search_vector for cleaner API responses
 */
export type RecipeListItemDTO = Omit<Recipe, 'search_vector'>;

/**
 * Detailed recipe view with ingredients (GET /api/recipes/:id)
 */
export interface RecipeDetailDTO extends Omit<Recipe, 'search_vector'> {
  ingredients: RecipeIngredientWithProductDTO[];
}

/**
 * Command model for creating a new recipe (POST /api/recipes)
 */
export interface CreateRecipeDTO {
  title: string;
  description?: string;
  image_url?: string;
  instructions?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  source_url?: string;
  visibility?: 'private' | 'public';
  ingredients?: CreateRecipeIngredientDTO[];
}

/**
 * Command model for updating a recipe (PATCH /api/recipes/:id)
 * All fields optional for partial updates
 */
export type UpdateRecipeDTO = Partial<Omit<CreateRecipeDTO, 'ingredients'>>;

/**
 * Request DTO for importing recipe from URL
 */
export interface ImportRecipeRequestDTO {
  url: string;
}

/**
 * Response DTO for recipe import (POST /api/recipes/import)
 * Returns extracted data that user must review before saving
 */
export interface ImportRecipeResponseDTO {
  data: {
    title: string;
    description?: string;
    image_url?: string;
    instructions?: string;
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    servings?: number;
    source_url: string;
    ingredients_raw: string;
  };
}

/**
 * Response DTO for recipe copy operation
 */
export interface CopyRecipeResponseDTO {
  data: {
    id: string;
    user_id: string;
    scope: string;
    is_seed_copy: boolean;
    title: string;
    created_at: string;
  };
}

// =============================================================================
// RECIPE INGREDIENT DTOs
// =============================================================================

/**
 * Recipe ingredient with product information for display
 */
export interface RecipeIngredientWithProductDTO extends Omit<RecipeIngredient, 'created_at' | 'updated_at'> {
  product_name: string | null;
}

/**
 * Command model for adding ingredient to recipe (POST /api/recipes/:recipe_id/ingredients)
 */
export interface CreateRecipeIngredientDTO {
  product_id?: string;
  raw_text: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  position?: number;
}

/**
 * Command model for updating ingredient (PATCH /api/recipes/:recipe_id/ingredients/:id)
 */
export type UpdateRecipeIngredientDTO = Partial<Omit<CreateRecipeIngredientDTO, 'raw_text'>>;

// =============================================================================
// PRODUCT DTOs
// =============================================================================

/**
 * Product data for responses (GET /api/products, GET /api/products/:id)
 */
export type ProductDTO = Product;

/**
 * Command model for creating product (POST /api/products)
 */
export interface CreateProductDTO {
  name: string;
  category?: string;
  aliases?: string[];
}

/**
 * Command model for updating product (PATCH /api/products/:id)
 */
export type UpdateProductDTO = Partial<CreateProductDTO>;

// =============================================================================
// PLANNER DTOs
// =============================================================================

/**
 * Planner entry with embedded recipe information (GET /api/planner)
 */
export interface PlannerEntryDTO extends Omit<PlannerEntry, 'created_at' | 'updated_at'> {
  recipe: {
    id: string;
    title: string;
    image_url: string | null;
    prep_time_minutes: number | null;
    cook_time_minutes: number | null;
    servings: number | null;
  };
}

/**
 * Command model for adding recipe to planner (POST /api/planner)
 */
export interface CreatePlannerEntryDTO {
  recipe_id: string;
  planning_date: string; // ISO 8601 date format (YYYY-MM-DD)
  portion_multiplier?: number;
  sort_order?: number;
  notes?: string;
}

/**
 * Command model for updating planner entry (PATCH /api/planner/:id)
 */
export type UpdatePlannerEntryDTO = Partial<Omit<CreatePlannerEntryDTO, 'recipe_id'>>;

/**
 * Single update item for bulk planner updates
 */
export interface PlannerEntryBulkUpdateItem {
  id: string;
  planning_date?: string;
  sort_order?: number;
}

/**
 * Command model for bulk updating planner entries (PATCH /api/planner/bulk-update)
 */
export interface BulkUpdatePlannerEntriesDTO {
  updates: PlannerEntryBulkUpdateItem[];
}

/**
 * Response for bulk update operation
 */
export interface BulkUpdateResponseDTO {
  message: string;
  updated_count: number;
}

// =============================================================================
// SHOPPING LIST DTOs
// =============================================================================

/**
 * Shopping list data for list views (GET /api/shopping-lists)
 */
export type ShoppingListDTO = ShoppingList;

/**
 * Detailed shopping list with all items (GET /api/shopping-lists/active)
 */
export interface ShoppingListDetailDTO extends ShoppingList {
  items: ShoppingListItemWithDetailsDTO[];
}

/**
 * Command model for generating shopping list (POST /api/shopping-lists/generate)
 */
export interface GenerateShoppingListDTO {
  start_date: string; // ISO 8601 date format
  end_date: string; // ISO 8601 date format
  title?: string;
  description?: string;
}

/**
 * Response for shopping list generation
 */
export interface GenerateShoppingListResponseDTO {
  data: {
    id: string;
    status: string;
    title: string | null;
    items_count: number;
    created_at: string;
  };
  message: string;
}

/**
 * Command model for updating shopping list metadata (PATCH /api/shopping-lists/:id)
 */
export interface UpdateShoppingListDTO {
  title?: string;
  description?: string;
}

/**
 * Response for archiving shopping list (POST /api/shopping-lists/:id/archive)
 */
export interface ArchiveShoppingListResponseDTO {
  data: {
    id: string;
    status: string;
    archived_at: string;
  };
}

// =============================================================================
// SHOPPING LIST ITEM DTOs
// =============================================================================

/**
 * Shopping list item with product and recipe details for display
 */
export interface ShoppingListItemWithDetailsDTO extends Omit<ShoppingListItem, 'created_at' | 'updated_at'> {
  product_name: string | null;
  recipe_title?: string | null;
}

/**
 * Command model for adding custom item to shopping list (POST /api/shopping-list-items)
 */
export interface CreateShoppingListItemDTO {
  product_id?: string;
  product_name?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}

/**
 * Command model for updating shopping list item (PATCH /api/shopping-list-items/:id)
 */
export interface UpdateShoppingListItemDTO {
  is_checked?: boolean;
  overridden_quantity?: number;
  overridden_unit?: string;
  notes?: string;
}

/**
 * Command model for bulk checking/unchecking items (PATCH /api/shopping-list-items/bulk-check)
 */
export interface BulkCheckItemsDTO {
  item_ids: string[];
  is_checked: boolean;
}

// =============================================================================
// AI FEATURE DTOs
// =============================================================================

/**
 * Request DTO for AI ingredient normalization (POST /api/ai/normalize-ingredients)
 */
export interface NormalizeIngredientsRequestDTO {
  raw_text: string;
  recipe_context?: {
    title?: string;
    description?: string;
  };
}

/**
 * Single normalized ingredient result from AI
 */
export interface NormalizedIngredientDTO {
  raw_text: string;
  suggested_product_id: string | null;
  suggested_product_name: string;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
  confidence: number;
}

/**
 * AI usage information for response
 */
export interface AIUsageInfoDTO {
  input_tokens: number;
  output_tokens: number;
  model: string;
}

/**
 * Response DTO for AI ingredient normalization
 */
export interface NormalizeIngredientsResponseDTO {
  data: {
    normalized_ingredients: NormalizedIngredientDTO[];
    usage: AIUsageInfoDTO;
  };
}

/**
 * Request DTO for AI ingredient substitution (POST /api/ai/substitute-ingredient)
 */
export interface SubstituteIngredientRequestDTO {
  ingredient_id: string;
  recipe_id: string;
  reason?: 'missing' | 'allergy' | 'preference' | 'dietary';
}

/**
 * Single substitution suggestion from AI
 */
export interface IngredientSubstitutionDTO {
  product_name: string;
  quantity: number | null;
  unit: string | null;
  explanation: string;
  impact: string;
  confidence: number;
}

/**
 * Response DTO for AI ingredient substitution
 */
export interface SubstituteIngredientResponseDTO {
  data: {
    original_ingredient: {
      name: string;
      quantity: number | null;
      unit: string | null;
    };
    substitutions: IngredientSubstitutionDTO[];
    recipe_context: {
      title: string;
      cuisine?: string;
    };
    usage: AIUsageInfoDTO;
  };
}

/**
 * Feature usage statistics
 */
export interface FeatureUsageDTO {
  feature: string;
  call_count: number;
  tokens_used: number;
  limit: number;
  remaining: number;
}

/**
 * Response DTO for AI usage statistics (GET /api/ai/usage)
 */
export interface AIUsageStatsResponseDTO {
  data: {
    date: string;
    features: FeatureUsageDTO[];
    total_tokens_today: number;
  };
}

// =============================================================================
// USER INITIALIZATION DTOs
// =============================================================================

/**
 * Response DTO for user initialization (POST /api/user/initialize)
 */
export interface InitializeUserResponseDTO {
  message: string;
  data: {
    recipes_added: number;
    products_added: number;
  };
}

// =============================================================================
// QUERY PARAMETER DTOs
// =============================================================================

/**
 * Query parameters for recipe list endpoint
 */
export interface RecipeListQueryDTO {
  page?: number;
  limit?: number;
  scope?: 'global' | 'user';
  search?: string;
  sort?: 'created_at' | 'updated_at' | 'title';
  order?: 'asc' | 'desc';
}

/**
 * Query parameters for product list endpoint
 */
export interface ProductListQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  is_active?: boolean;
}

/**
 * Query parameters for planner entries
 */
export interface PlannerQueryDTO {
  start_date: string; // ISO 8601 date format (YYYY-MM-DD)
  end_date: string; // ISO 8601 date format (YYYY-MM-DD)
}

/**
 * Query parameters for shopping list endpoint
 */
export interface ShoppingListQueryDTO {
  status?: 'active' | 'archived';
  page?: number;
  limit?: number;
}

/**
 * Query parameters for AI usage endpoint
 */
export interface AIUsageQueryDTO {
  date?: string; // ISO 8601 date format (YYYY-MM-DD)
}

// =============================================================================
// TYPE GUARDS AND VALIDATORS
// =============================================================================

/**
 * Type guard to check if a value is a valid recipe visibility
 */
export function isValidVisibility(value: unknown): value is 'private' | 'public' {
  return value === 'private' || value === 'public';
}

/**
 * Type guard to check if a value is a valid recipe scope
 */
export function isValidScope(value: unknown): value is 'global' | 'user' {
  return value === 'global' || value === 'user';
}

/**
 * Type guard to check if a value is a valid shopping list status
 */
export function isValidShoppingListStatus(value: unknown): value is 'active' | 'archived' {
  return value === 'active' || value === 'archived';
}

/**
 * Type guard to check if a value is a valid substitution reason
 */
export function isValidSubstitutionReason(
  value: unknown
): value is 'missing' | 'allergy' | 'preference' | 'dietary' {
  return (
    value === 'missing' ||
    value === 'allergy' ||
    value === 'preference' ||
    value === 'dietary'
  );
}

