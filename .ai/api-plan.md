# REST API Plan for KitchenFlow

## 1. Resources

The API is organized around the following main resources, each corresponding to database tables:

| Resource | Database Table | Description |
|----------|---------------|-------------|
| `/recipes` | `recipes` | User and global recipes with ingredients |
| `/products` | `products` | Normalized product dictionary |
| `/planner` | `planner_entries` | Meal planning entries |
| `/shopping-lists` | `shopping_lists` | Shopping lists for users |
| `/shopping-list-items` | `shopping_list_items` | Items within shopping lists |
| `/ai/normalize` | `ai_logs`, `ai_daily_usage` | AI-powered ingredient normalization |
| `/ai/substitute` | `ai_logs`, `ai_daily_usage` | AI-powered ingredient substitution |

---

## 2. API Endpoints

### 2.1. Authentication

Authentication is handled by Supabase Auth. All protected endpoints require a valid JWT token in the `Authorization` header.

**Header Format:**
```
Authorization: Bearer <supabase_jwt_token>
```

---

### 2.2. Recipes

#### GET /api/recipes

Retrieve a paginated list of recipes (user's own + global).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `scope` (string, optional): Filter by scope (`global`, `user`, or omit for both)
- `search` (string, optional): Full-text search query
- `sort` (string, optional): Sort field (`created_at`, `updated_at`, `title`, default: `created_at`)
- `order` (string, optional): Sort order (`asc`, `desc`, default: `desc`)

**Request Example:**
```
GET /api/recipes?page=1&limit=20&scope=user&search=pasta
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "scope": "user",
      "is_seed_copy": false,
      "title": "Spaghetti Carbonara",
      "slug": "spaghetti-carbonara",
      "description": "Classic Italian pasta dish",
      "image_url": "https://example.com/image.jpg",
      "instructions": "Full cooking instructions...",
      "prep_time_minutes": 10,
      "cook_time_minutes": 20,
      "servings": 4,
      "source_url": "https://example.com/recipe",
      "visibility": "private",
      "created_at": "2025-11-26T10:00:00Z",
      "updated_at": "2025-11-26T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Invalid query parameters

---

#### GET /api/recipes/:id

Retrieve a single recipe by ID, including its ingredients.

**URL Parameters:**
- `id` (uuid, required): Recipe ID

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "scope": "user",
    "is_seed_copy": false,
    "title": "Spaghetti Carbonara",
    "slug": "spaghetti-carbonara",
    "description": "Classic Italian pasta dish",
    "image_url": "https://example.com/image.jpg",
    "instructions": "Full cooking instructions...",
    "prep_time_minutes": 10,
    "cook_time_minutes": 20,
    "servings": 4,
    "source_url": "https://example.com/recipe",
    "visibility": "private",
    "created_at": "2025-11-26T10:00:00Z",
    "updated_at": "2025-11-26T10:00:00Z",
    "ingredients": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Spaghetti",
        "raw_text": "400g spaghetti pasta",
        "quantity": 400,
        "unit": "g",
        "notes": null,
        "position": 0
      },
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Eggs",
        "raw_text": "4 large eggs",
        "quantity": 4,
        "unit": "pcs",
        "notes": "at room temperature",
        "position": 1
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Recipe not found or user lacks permission to view it

---

#### POST /api/recipes

Create a new recipe (user scope only).

**Request Body:**
```json
{
  "title": "Spaghetti Carbonara",
  "description": "Classic Italian pasta dish",
  "image_url": "https://example.com/image.jpg",
  "instructions": "Full cooking instructions...",
  "prep_time_minutes": 10,
  "cook_time_minutes": 20,
  "servings": 4,
  "source_url": "https://example.com/recipe",
  "visibility": "private",
  "ingredients": [
    {
      "raw_text": "400g spaghetti pasta",
      "product_id": "uuid",
      "quantity": 400,
      "unit": "g",
      "notes": null,
      "position": 0
    }
  ]
}
```

**Validation Rules:**
- `title` (string, required): 1-500 characters
- `slug` (string, auto-generated): Derived from title, unique per user
- `description` (string, optional): Max 2000 characters
- `instructions` (text, optional)
- `prep_time_minutes` (integer, optional): Min 0
- `cook_time_minutes` (integer, optional): Min 0
- `servings` (number, optional): Min 0.01
- `visibility` (string, optional): Must be `private` or `public` (default: `private`)
- `ingredients` (array, optional): Array of ingredient objects

**Success Response (201 Created):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "scope": "user",
    "title": "Spaghetti Carbonara",
    "slug": "spaghetti-carbonara",
    "created_at": "2025-11-26T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Validation errors
- `409 Conflict`: Slug already exists for this user

---

#### PATCH /api/recipes/:id

Update an existing recipe (user's own recipes only).

**URL Parameters:**
- `id` (uuid, required): Recipe ID

**Request Body (partial update):**
```json
{
  "title": "Updated Spaghetti Carbonara",
  "description": "Updated description",
  "servings": 6
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Updated Spaghetti Carbonara",
    "updated_at": "2025-11-26T11:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this recipe
- `404 Not Found`: Recipe not found
- `400 Bad Request`: Validation errors

---

#### DELETE /api/recipes/:id

Delete a recipe (user's own recipes only).

**URL Parameters:**
- `id` (uuid, required): Recipe ID

**Success Response (200 OK):**
```json
{
  "message": "Recipe deleted successfully",
  "warnings": [
    "This recipe was used in 2 planner entries which have been removed",
    "3 items have been removed from your active shopping list"
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this recipe
- `404 Not Found`: Recipe not found

---

#### POST /api/recipes/import

Import a recipe from URL using web scraping.

**Request Body:**
```json
{
  "url": "https://example.com/recipe/carbonara"
}
```

**Validation Rules:**
- `url` (string, required): Valid URL format

**Success Response (200 OK):**
```json
{
  "data": {
    "title": "Spaghetti Carbonara",
    "description": "Classic Italian pasta dish",
    "image_url": "https://example.com/image.jpg",
    "instructions": "Full cooking instructions...",
    "prep_time_minutes": 10,
    "cook_time_minutes": 20,
    "servings": 4,
    "source_url": "https://example.com/recipe/carbonara",
    "ingredients_raw": "400g spaghetti\n4 eggs\n200g pancetta\n100g parmesan"
  }
}
```

**Note:** This endpoint only extracts data and returns it. The user must then call `POST /api/recipes` to save it (after AI normalization).

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Invalid URL or unsupported website
- `422 Unprocessable Entity`: Unable to extract recipe data from URL

---

#### POST /api/recipes/:id/copy

Copy a global seed recipe to user's space.

**URL Parameters:**
- `id` (uuid, required): Recipe ID (must be a global recipe)

**Success Response (201 Created):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "scope": "user",
    "is_seed_copy": true,
    "title": "Spaghetti Carbonara",
    "created_at": "2025-11-26T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Recipe not found or not a global recipe
- `409 Conflict`: User already has a copy of this recipe

---

### 2.3. Recipe Ingredients

#### GET /api/recipes/:recipe_id/ingredients

Get all ingredients for a specific recipe.

**URL Parameters:**
- `recipe_id` (uuid, required): Recipe ID

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "recipe_id": "uuid",
      "product_id": "uuid",
      "product_name": "Spaghetti",
      "raw_text": "400g spaghetti pasta",
      "quantity": 400,
      "unit": "g",
      "notes": null,
      "position": 0,
      "created_at": "2025-11-26T10:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Recipe not found or user lacks permission

---

#### POST /api/recipes/:recipe_id/ingredients

Add a new ingredient to a recipe.

**URL Parameters:**
- `recipe_id` (uuid, required): Recipe ID

**Request Body:**
```json
{
  "product_id": "uuid",
  "raw_text": "400g spaghetti pasta",
  "quantity": 400,
  "unit": "g",
  "notes": null,
  "position": 0
}
```

**Success Response (201 Created):**
```json
{
  "data": {
    "id": "uuid",
    "recipe_id": "uuid",
    "product_id": "uuid",
    "quantity": 400,
    "unit": "g",
    "created_at": "2025-11-26T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this recipe
- `404 Not Found`: Recipe not found
- `400 Bad Request`: Validation errors

---

#### PATCH /api/recipes/:recipe_id/ingredients/:id

Update an ingredient.

**URL Parameters:**
- `recipe_id` (uuid, required): Recipe ID
- `id` (uuid, required): Ingredient ID

**Request Body (partial update):**
```json
{
  "quantity": 500,
  "notes": "Use whole wheat pasta"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "quantity": 500,
    "notes": "Use whole wheat pasta",
    "updated_at": "2025-11-26T11:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this recipe
- `404 Not Found`: Recipe or ingredient not found
- `400 Bad Request`: Validation errors

---

#### DELETE /api/recipes/:recipe_id/ingredients/:id

Delete an ingredient from a recipe.

**URL Parameters:**
- `recipe_id` (uuid, required): Recipe ID
- `id` (uuid, required): Ingredient ID

**Success Response (200 OK):**
```json
{
  "message": "Ingredient deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this recipe
- `404 Not Found`: Recipe or ingredient not found

---

### 2.4. Products

#### GET /api/products

Get a list of products (user's own + global products).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50, max: 200)
- `search` (string, optional): Search by name
- `category` (string, optional): Filter by category
- `is_active` (boolean, optional): Filter by active status (default: true)

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": null,
      "name": "Spaghetti",
      "slug": "spaghetti",
      "category": "pasta",
      "aliases": ["pasta", "noodles"],
      "is_active": true,
      "created_at": "2025-11-26T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "total_pages": 3
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Invalid query parameters

---

#### GET /api/products/:id

Get a single product by ID.

**URL Parameters:**
- `id` (uuid, required): Product ID

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": null,
    "name": "Spaghetti",
    "slug": "spaghetti",
    "category": "pasta",
    "aliases": ["pasta", "noodles"],
    "is_active": true,
    "created_at": "2025-11-26T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Product not found

---

#### POST /api/products

Create a new product (user scope only).

**Request Body:**
```json
{
  "name": "Whole Wheat Spaghetti",
  "category": "pasta",
  "aliases": ["wholemeal pasta", "brown pasta"]
}
```

**Validation Rules:**
- `name` (string, required): 1-255 characters, unique per user
- `slug` (string, auto-generated): Derived from name
- `category` (string, optional)
- `aliases` (array of strings, optional)

**Success Response (201 Created):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Whole Wheat Spaghetti",
    "slug": "whole-wheat-spaghetti",
    "created_at": "2025-11-26T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Validation errors
- `409 Conflict`: Product name already exists for this user

---

#### PATCH /api/products/:id

Update a product (user's own products only).

**URL Parameters:**
- `id` (uuid, required): Product ID

**Request Body (partial update):**
```json
{
  "name": "Updated Product Name",
  "category": "new-category"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Updated Product Name",
    "updated_at": "2025-11-26T11:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this product
- `404 Not Found`: Product not found
- `400 Bad Request`: Validation errors

---

#### DELETE /api/products/:id

Delete a product (user's own products only).

**URL Parameters:**
- `id` (uuid, required): Product ID

**Success Response (200 OK):**
```json
{
  "message": "Product deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this product
- `404 Not Found`: Product not found

---

### 2.5. Planner Entries

#### GET /api/planner

Get planner entries for a date range.

**Query Parameters:**
- `start_date` (date, required): Start date (ISO 8601 format: YYYY-MM-DD)
- `end_date` (date, required): End date (ISO 8601 format: YYYY-MM-DD)

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "recipe_id": "uuid",
      "recipe": {
        "id": "uuid",
        "title": "Spaghetti Carbonara",
        "image_url": "https://example.com/image.jpg",
        "prep_time_minutes": 10,
        "cook_time_minutes": 20,
        "servings": 4
      },
      "planning_date": "2025-11-27",
      "portion_multiplier": 1.5,
      "sort_order": 0,
      "notes": "Double batch for meal prep",
      "created_at": "2025-11-26T10:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Invalid date format or date range

---

#### POST /api/planner

Add a recipe to the planner.

**Request Body:**
```json
{
  "recipe_id": "uuid",
  "planning_date": "2025-11-27",
  "portion_multiplier": 1.5,
  "sort_order": 0,
  "notes": "Double batch for meal prep"
}
```

**Validation Rules:**
- `recipe_id` (uuid, required): Must exist and be accessible to user
- `planning_date` (date, required): ISO 8601 format
- `portion_multiplier` (number, optional): Min 0.01, default 1.0
- `sort_order` (integer, optional): Default 0
- `notes` (string, optional): Max 1000 characters

**Success Response (201 Created):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "recipe_id": "uuid",
    "planning_date": "2025-11-27",
    "portion_multiplier": 1.5,
    "created_at": "2025-11-26T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Validation errors
- `404 Not Found`: Recipe not found

---

#### PATCH /api/planner/:id

Update a planner entry.

**URL Parameters:**
- `id` (uuid, required): Planner entry ID

**Request Body (partial update):**
```json
{
  "planning_date": "2025-11-28",
  "portion_multiplier": 2.0,
  "notes": "Cooking for guests"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "planning_date": "2025-11-28",
    "portion_multiplier": 2.0,
    "updated_at": "2025-11-26T11:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this planner entry
- `404 Not Found`: Planner entry not found
- `400 Bad Request`: Validation errors

---

#### PATCH /api/planner/bulk-update

Update multiple planner entries at once (useful for drag & drop reordering).

**Request Body:**
```json
{
  "updates": [
    {
      "id": "uuid",
      "planning_date": "2025-11-27",
      "sort_order": 0
    },
    {
      "id": "uuid",
      "planning_date": "2025-11-27",
      "sort_order": 1
    }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "message": "Planner entries updated successfully",
  "updated_count": 2
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Validation errors
- `403 Forbidden`: User does not own one or more entries

---

#### DELETE /api/planner/:id

Remove a recipe from the planner.

**URL Parameters:**
- `id` (uuid, required): Planner entry ID

**Success Response (200 OK):**
```json
{
  "message": "Planner entry deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this planner entry
- `404 Not Found`: Planner entry not found

---

### 2.6. Shopping Lists

#### GET /api/shopping-lists

Get user's shopping lists.

**Query Parameters:**
- `status` (string, optional): Filter by status (`active`, `archived`, default: all)
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 50)

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "status": "active",
      "title": "Weekly Shopping List",
      "description": "For recipes planned Nov 27 - Dec 3",
      "generated_from_start": "2025-11-27",
      "generated_from_end": "2025-12-03",
      "created_at": "2025-11-26T10:00:00Z",
      "updated_at": "2025-11-26T10:00:00Z",
      "archived_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Invalid query parameters

---

#### GET /api/shopping-lists/active

Get the user's active shopping list with all items.

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "status": "active",
    "title": "Weekly Shopping List",
    "description": "For recipes planned Nov 27 - Dec 3",
    "generated_from_start": "2025-11-27",
    "generated_from_end": "2025-12-03",
    "created_at": "2025-11-26T10:00:00Z",
    "updated_at": "2025-11-26T10:00:00Z",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Eggs",
        "recipe_id": "uuid",
        "recipe_title": "Spaghetti Carbonara",
        "planner_entry_id": "uuid",
        "quantity": 8,
        "unit": "pcs",
        "is_checked": false,
        "overridden_quantity": null,
        "overridden_unit": null,
        "notes": "Free range if possible",
        "sort_order": 0
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: No active shopping list found

---

#### POST /api/shopping-lists/generate

Generate a new shopping list from planner entries.

**Request Body:**
```json
{
  "start_date": "2025-11-27",
  "end_date": "2025-12-03",
  "title": "Weekly Shopping List",
  "description": "For recipes planned Nov 27 - Dec 3"
}
```

**Validation Rules:**
- `start_date` (date, required): ISO 8601 format
- `end_date` (date, required): ISO 8601 format, must be >= start_date
- `title` (string, optional): Max 255 characters
- `description` (string, optional): Max 1000 characters

**Success Response (201 Created):**
```json
{
  "data": {
    "id": "uuid",
    "status": "active",
    "title": "Weekly Shopping List",
    "items_count": 15,
    "created_at": "2025-11-26T10:00:00Z"
  },
  "message": "Shopping list generated successfully. Your previous active list was archived."
}
```

**Logic:**
1. Archive any existing active shopping list
2. Aggregate ingredients from all planner entries in the date range
3. Sum quantities for same product + unit combinations
4. Create new active shopping list with aggregated items

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Validation errors or no planner entries in date range

---

#### PATCH /api/shopping-lists/:id

Update shopping list metadata.

**URL Parameters:**
- `id` (uuid, required): Shopping list ID

**Request Body (partial update):**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "updated_at": "2025-11-26T11:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this shopping list
- `404 Not Found`: Shopping list not found
- `400 Bad Request`: Validation errors

---

#### POST /api/shopping-lists/:id/archive

Archive a shopping list.

**URL Parameters:**
- `id` (uuid, required): Shopping list ID

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "status": "archived",
    "archived_at": "2025-11-26T11:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this shopping list
- `404 Not Found`: Shopping list not found

---

#### DELETE /api/shopping-lists/:id

Delete a shopping list.

**URL Parameters:**
- `id` (uuid, required): Shopping list ID

**Success Response (200 OK):**
```json
{
  "message": "Shopping list deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this shopping list or trying to delete active list
- `404 Not Found`: Shopping list not found

---

### 2.7. Shopping List Items

#### PATCH /api/shopping-list-items/:id

Update a shopping list item.

**URL Parameters:**
- `id` (uuid, required): Shopping list item ID

**Request Body (partial update):**
```json
{
  "is_checked": true,
  "overridden_quantity": 10,
  "overridden_unit": "pcs",
  "notes": "Get organic eggs"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": "uuid",
    "is_checked": true,
    "overridden_quantity": 10,
    "notes": "Get organic eggs",
    "updated_at": "2025-11-26T11:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this shopping list
- `404 Not Found`: Item not found
- `400 Bad Request`: Validation errors

---

#### PATCH /api/shopping-list-items/bulk-check

Check/uncheck multiple items at once.

**Request Body:**
```json
{
  "item_ids": ["uuid1", "uuid2", "uuid3"],
  "is_checked": true
}
```

**Success Response (200 OK):**
```json
{
  "message": "Items updated successfully",
  "updated_count": 3
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own one or more items
- `400 Bad Request`: Validation errors

---

#### POST /api/shopping-list-items

Add a custom item to the active shopping list.

**Request Body:**
```json
{
  "product_id": "uuid",
  "quantity": 2,
  "unit": "kg",
  "notes": "For next week"
}
```

**Validation Rules:**
- `product_id` (uuid, optional): If omitted, a custom product can be created
- `product_name` (string, optional): Required if product_id is omitted
- `quantity` (number, optional)
- `unit` (string, optional)
- `notes` (string, optional): Max 500 characters

**Success Response (201 Created):**
```json
{
  "data": {
    "id": "uuid",
    "shopping_list_id": "uuid",
    "product_id": "uuid",
    "quantity": 2,
    "unit": "kg",
    "created_at": "2025-11-26T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: No active shopping list found
- `400 Bad Request`: Validation errors

---

#### DELETE /api/shopping-list-items/:id

Remove an item from the shopping list.

**URL Parameters:**
- `id` (uuid, required): Shopping list item ID

**Success Response (200 OK):**
```json
{
  "message": "Item deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not own this shopping list
- `404 Not Found`: Item not found

---

### 2.8. AI - Ingredient Normalization

#### POST /api/ai/normalize-ingredients

Normalize raw ingredient text into structured format using AI.

**Request Body:**
```json
{
  "raw_text": "400g spaghetti pasta\n4 large eggs\n200g pancetta\n100g grated parmesan cheese",
  "recipe_context": {
    "title": "Spaghetti Carbonara",
    "description": "Classic Italian pasta dish"
  }
}
```

**Validation Rules:**
- `raw_text` (string, required): Max 10000 characters
- `recipe_context` (object, optional): Additional context to improve AI accuracy

**Success Response (200 OK):**
```json
{
  "data": {
    "normalized_ingredients": [
      {
        "raw_text": "400g spaghetti pasta",
        "suggested_product_id": "uuid",
        "suggested_product_name": "Spaghetti",
        "quantity": 400,
        "unit": "g",
        "notes": null,
        "confidence": 0.95
      },
      {
        "raw_text": "4 large eggs",
        "suggested_product_id": "uuid",
        "suggested_product_name": "Eggs",
        "quantity": 4,
        "unit": "pcs",
        "notes": "large",
        "confidence": 0.98
      },
      {
        "raw_text": "200g pancetta",
        "suggested_product_id": null,
        "suggested_product_name": "Pancetta",
        "quantity": 200,
        "unit": "g",
        "notes": null,
        "confidence": 0.92
      }
    ],
    "usage": {
      "input_tokens": 150,
      "output_tokens": 200,
      "model": "openai/gpt-4o-mini"
    }
  }
}
```

**Rate Limiting:**
- Free users: 20 requests per day
- Authenticated users tracked via `ai_daily_usage` table

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Validation errors or empty raw_text
- `429 Too Many Requests`: Daily AI limit exceeded
- `503 Service Unavailable`: AI service error (fallback to manual entry)

---

### 2.9. AI - Ingredient Substitution

#### POST /api/ai/substitute-ingredient

Get AI-powered ingredient substitution suggestions.

**Request Body:**
```json
{
  "ingredient_id": "uuid",
  "recipe_id": "uuid",
  "reason": "allergy"
}
```

**Validation Rules:**
- `ingredient_id` (uuid, required): ID from recipe_ingredients table
- `recipe_id` (uuid, required): Recipe ID for context
- `reason` (string, optional): Context for substitution (`missing`, `allergy`, `preference`, `dietary`)

**Success Response (200 OK):**
```json
{
  "data": {
    "original_ingredient": {
      "name": "Heavy Cream",
      "quantity": 200,
      "unit": "ml"
    },
    "substitutions": [
      {
        "product_name": "Coconut Cream",
        "quantity": 200,
        "unit": "ml",
        "explanation": "Coconut cream provides similar richness and texture. Use the same amount as heavy cream.",
        "impact": "Will add slight coconut flavor, which works well in this dish.",
        "confidence": 0.89
      },
      {
        "product_name": "Greek Yogurt",
        "quantity": 200,
        "unit": "ml",
        "explanation": "Greek yogurt offers creaminess with lower fat content.",
        "impact": "May be slightly less rich. Add at the end to prevent curdling.",
        "confidence": 0.82
      }
    ],
    "recipe_context": {
      "title": "Creamy Pasta",
      "cuisine": "Italian"
    },
    "usage": {
      "input_tokens": 250,
      "output_tokens": 180,
      "model": "openai/gpt-4o-mini"
    }
  }
}
```

**Rate Limiting:**
- Free users: 30 requests per day
- Authenticated users tracked via `ai_daily_usage` table

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Ingredient or recipe not found
- `403 Forbidden`: User does not have access to this recipe
- `400 Bad Request`: Validation errors
- `429 Too Many Requests`: Daily AI limit exceeded
- `503 Service Unavailable`: AI service error

---

### 2.10. AI Usage and Limits

#### GET /api/ai/usage

Get current user's AI usage statistics.

**Query Parameters:**
- `date` (date, optional): Specific date (ISO 8601 format, default: today)

**Success Response (200 OK):**
```json
{
  "data": {
    "date": "2025-11-26",
    "features": [
      {
        "feature": "ingredient_normalization",
        "call_count": 5,
        "tokens_used": 1250,
        "limit": 20,
        "remaining": 15
      },
      {
        "feature": "substitution_suggestions",
        "call_count": 8,
        "tokens_used": 2100,
        "limit": 30,
        "remaining": 22
      }
    ],
    "total_tokens_today": 3350
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Invalid date format

---

### 2.11. User Seed Data Initialization

#### POST /api/user/initialize

Initialize a new user with seed data (recipes and products).

**Note:** This endpoint is typically called automatically after user registration via Supabase Auth webhook.

**Success Response (200 OK):**
```json
{
  "message": "User initialized successfully",
  "data": {
    "recipes_added": 5,
    "products_added": 25
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `409 Conflict`: User already initialized

---

## 3. Authentication and Authorization

### 3.1. Authentication Method

**Supabase Auth JWT (JSON Web Token)**

All API endpoints (except public resources) require authentication via Supabase Auth. The JWT token must be included in the `Authorization` header:

```
Authorization: Bearer <supabase_jwt_token>
```

### 3.2. Token Acquisition

Tokens are obtained through Supabase Auth client SDK:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// OAuth providers (Google, GitHub, etc.)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

### 3.3. Row Level Security (RLS)

All database operations are protected by PostgreSQL Row Level Security policies:

**User Data Isolation:**
- Users can only access their own recipes (scope='user'), planner entries, shopping lists, and custom products
- Global recipes (scope='global') and products (user_id IS NULL) are readable by all authenticated users
- AI logs and usage data are strictly isolated per user

**Policy Examples:**

```sql
-- Recipes: Users see global + their own
CREATE POLICY "recipes_select_own_and_global"
  ON public.recipes FOR SELECT
  USING (scope = 'global' OR (scope = 'user' AND user_id = auth.uid()));

-- Planner: Full access to own entries only
CREATE POLICY "planner_entries_owner_all"
  ON public.planner_entries FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### 3.4. Authorization Levels

**Authenticated User:**
- Full CRUD access to own resources
- Read access to global resources (recipes, products)
- AI features with rate limits

**Anonymous User:**
- Read-only access to global recipes (if needed for marketing/preview)
- No write operations
- No AI features

### 3.5. Token Validation

API endpoints validate tokens by:
1. Verifying JWT signature using Supabase public key
2. Checking token expiration
3. Extracting `user_id` from token claims
4. Using `user_id` in RLS policies via `auth.uid()` function

---

## 4. Validation and Business Logic

### 4.1. Request Validation

All endpoints validate incoming data against the following rules:

#### Recipes
- `title`: Required, 1-500 characters
- `slug`: Auto-generated from title, unique per user
- `description`: Optional, max 2000 characters
- `instructions`: Optional, text
- `prep_time_minutes`: Optional, integer >= 0
- `cook_time_minutes`: Optional, integer >= 0
- `servings`: Optional, numeric >= 0.01
- `visibility`: Must be 'private' or 'public', default 'private'
- `scope`: Automatically set to 'user' for user-created recipes
- Global recipes (scope='global') cannot be created via API

#### Products
- `name`: Required, 1-255 characters, unique per user (case-insensitive)
- `category`: Optional, string
- `aliases`: Optional, array of strings
- `is_active`: Boolean, default true
- Global products (user_id IS NULL) cannot be created via API

#### Recipe Ingredients
- `recipe_id`: Required, must exist and be accessible
- `product_id`: Optional, must exist if provided
- `raw_text`: Required, 1-1000 characters
- `quantity`: Optional, numeric >= 0
- `unit`: Optional, string, max 50 characters
- `notes`: Optional, max 500 characters
- `position`: Integer >= 0, default 0

#### Planner Entries
- `user_id`: Automatically set from auth token
- `recipe_id`: Required, must exist and be accessible
- `planning_date`: Required, date in ISO 8601 format
- `portion_multiplier`: Numeric >= 0.01, default 1.0
- `sort_order`: Integer >= 0, default 0
- `notes`: Optional, max 1000 characters

#### Shopping Lists
- `user_id`: Automatically set from auth token
- `status`: Must be 'active' or 'archived'
- Only one active list per user (enforced by unique index)
- `title`: Optional, max 255 characters
- `description`: Optional, max 2000 characters
- `generated_from_start`: Optional, date
- `generated_from_end`: Optional, date >= start date

#### Shopping List Items
- `shopping_list_id`: Required, must exist and belong to user
- `product_id`: Optional, must exist if provided
- `recipe_id`: Optional, reference to source recipe
- `planner_entry_id`: Optional, reference to specific planner entry
- `quantity`: Optional, numeric >= 0
- `unit`: Optional, string, max 50 characters
- `is_checked`: Boolean, default false
- `overridden_quantity`: Optional, numeric >= 0
- `overridden_unit`: Optional, string, max 50 characters
- `notes`: Optional, max 500 characters
- `sort_order`: Integer >= 0, default 0

### 4.2. Business Logic Implementation

#### Recipe Import (Scraping)
1. Validate URL format
2. Check if domain is supported (whitelist approach)
3. Fetch page content with timeout (10s)
4. Parse HTML using schema.org Recipe markup or site-specific selectors
5. Extract: title, description, image, instructions, ingredients
6. Return extracted data (not saved yet)
7. User reviews and triggers AI normalization
8. User confirms and saves via POST /api/recipes

#### Ingredient Normalization (AI + Human-in-the-loop)
1. User provides raw ingredient text
2. System checks AI daily limit for user
3. If under limit:
   - Send to OpenRouter API with structured prompt
   - Parse response into structured format
   - Match against existing products (fuzzy matching)
   - Return suggestions with confidence scores
4. User reviews suggestions in UI
5. User can:
   - Accept all
   - Edit individual fields
   - Manually enter if AI failed
6. User saves recipe with finalized ingredients
7. Log AI usage to `ai_logs` and increment `ai_daily_usage`

#### Shopping List Generation
1. User specifies date range
2. System queries planner_entries for that range
3. For each entry:
   - Fetch recipe ingredients
   - Apply portion_multiplier
   - Calculate adjusted quantities
4. Aggregate ingredients:
   - Group by product_id + unit
   - Sum quantities
   - Preserve recipe associations for traceability
5. Archive current active list (if exists)
6. Create new active list with aggregated items
7. Return new list with item count

#### Recipe Deletion with Impact Check
1. User initiates delete on recipe
2. System checks for dependencies:
   - Count planner_entries referencing recipe
   - Count shopping_list_items referencing recipe
3. If dependencies exist:
   - Return warning with counts
   - Wait for user confirmation
4. On confirmation:
   - Delete recipe (CASCADE deletes recipe_ingredients)
   - Delete planner_entries (CASCADE)
   - Delete shopping_list_items referencing recipe
5. Return success with impact summary

#### AI Ingredient Substitution
1. User selects ingredient in recipe view
2. System checks AI daily limit
3. If under limit:
   - Fetch full recipe context (all ingredients, title, instructions)
   - Fetch ingredient details
   - Build structured prompt with context
   - Request substitution suggestions from AI
   - Parse response with explanations
4. Return 2-3 substitution options with:
   - Alternative ingredient
   - Adjusted quantity (if needed)
   - Explanation of why it works
   - Impact on final dish
5. User can:
   - Accept suggestion (adds note to ingredient)
   - Reject and ask again
   - Close modal
6. Log AI usage

#### AI Rate Limiting
1. On each AI endpoint call:
   - Extract user_id from JWT
   - Extract feature name
   - Get current date
2. Query/create ai_daily_usage record:
   ```sql
   INSERT INTO ai_daily_usage (user_id, feature, day, call_count, tokens_used)
   VALUES ($1, $2, CURRENT_DATE, 0, 0)
   ON CONFLICT (user_id, feature, day) DO NOTHING;
   ```
3. Check current call_count against limit
4. If under limit:
   - Proceed with AI call
   - Update call_count and tokens_used
   - Log to ai_logs
5. If over limit:
   - Return 429 Too Many Requests
   - Include reset time in response

#### Bulk Operations
**Planner Bulk Update (Drag & Drop):**
- Validate all entries belong to user
- Update planning_date and sort_order in transaction
- Return success with count

**Shopping List Bulk Check:**
- Validate all items belong to user's active list
- Update is_checked flag in transaction
- Return success with count

### 4.3. Error Handling Standards

All errors follow consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      },
      {
        "field": "servings",
        "message": "Servings must be greater than 0"
      }
    ]
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_REQUIRED`: Missing or invalid token
- `AUTHORIZATION_FAILED`: User lacks permission
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `CONFLICT`: Duplicate resource (e.g., slug collision)
- `RATE_LIMIT_EXCEEDED`: AI usage limit reached
- `AI_SERVICE_ERROR`: OpenRouter API failure
- `INTERNAL_ERROR`: Unexpected server error

### 4.4. Response Formats

**Success Response Format:**
```json
{
  "data": { ... },
  "meta": { ... }  // Optional metadata
}
```

**List Response Format:**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

**Error Response Format:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [ ... ]  // Optional
  }
}
```

---

## 5. Performance Considerations

### 5.1. Pagination

All list endpoints support pagination to prevent large data transfers:

- Default page size: 20-50 items depending on endpoint
- Maximum page size: 50-200 items depending on data complexity
- Use cursor-based pagination for real-time data if needed in future

### 5.2. Database Indexes

The API leverages database indexes defined in the schema:

- `idx_recipes_user_created_at`: Fast recipe listing per user
- `idx_recipes_search_vector`: Full-text search on recipes
- `idx_planner_entries_user_date`: Fast planner queries by date range
- `idx_shopping_list_items_agg`: Efficient aggregation for shopping lists
- `uq_shopping_lists_user_active`: Ensures single active list per user

### 5.3. Caching Strategy

**Client-side:**
- Recipe lists: Cache for 5 minutes
- Active shopping list: Cache with real-time invalidation on updates
- Product dictionary: Cache for 1 hour

**Server-side:**
- Global recipes and products: Cache for 1 hour (rarely change)
- User-specific data: No caching (freshness priority)

### 5.4. Async Operations

Long-running operations should be handled asynchronously:

- Recipe import scraping: 5-10 second timeout, show loading state
- AI normalization: 3-5 second timeout, fallback to manual entry
- Shopping list generation: Run synchronously (typically < 1s with proper indexes)

---

## 6. Future Considerations

### 6.1. API Versioning

Current version: `v1` (implicit)

When breaking changes needed:
- Add version prefix: `/api/v2/recipes`
- Maintain v1 for 6 months minimum
- Document migration path

### 6.2. Webhooks

Potential webhook events for future features:
- `recipe.created`
- `recipe.deleted`
- `shopping_list.generated`
- `planner.updated`

### 6.3. Batch Operations

Future endpoints for efficiency:
- `POST /api/recipes/batch`: Create multiple recipes
- `DELETE /api/planner/batch`: Delete multiple entries
- `POST /api/products/batch`: Bulk product import

### 6.4. Advanced Search

Enhanced search capabilities:
- Filter recipes by ingredients
- Exclude allergens
- Dietary preferences (vegetarian, vegan, etc.)
- Cooking time ranges
- Difficulty levels

### 6.5. Recipe Sharing

When visibility='public' feature is implemented:
- `GET /api/recipes/public`: Browse public recipes
- `GET /api/recipes/:id/share`: Generate shareable link
- `POST /api/recipes/:id/fork`: Clone public recipe to user space

---

## 7. API Documentation and Testing

### 7.1. OpenAPI/Swagger Specification

Generate OpenAPI 3.0 specification from this plan for:
- Interactive API documentation
- Client SDK generation
- API testing tools integration

### 7.2. Example Requests

Each endpoint should have curl examples:

```bash
# Get user's recipes
curl -X GET "https://api.kitchenflow.app/api/recipes?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a recipe
curl -X POST "https://api.kitchenflow.app/api/recipes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Spaghetti Carbonara",
    "description": "Classic Italian pasta",
    "servings": 4
  }'
```

### 7.3. Testing Strategy

**Unit Tests:**
- Validation logic
- Business logic functions
- Error handling

**Integration Tests:**
- Full endpoint flows
- Database operations
- RLS policy verification

**E2E Tests:**
- User registration → recipe creation → planner → shopping list flow
- AI normalization with mock API
- Rate limiting behavior

---

## 8. Security Measures

### 8.1. Input Sanitization

- All string inputs sanitized to prevent XSS
- SQL injection prevented via parameterized queries
- File upload validation (if image upload added)

### 8.2. Rate Limiting

**API Rate Limits (per user):**
- General endpoints: 1000 requests/hour
- AI endpoints: Tracked separately via `ai_daily_usage`

**AI-Specific Limits (per day):**
- Ingredient normalization: 20 requests
- Substitution suggestions: 30 requests

### 8.3. CORS Configuration

Allow requests from:
- Production domain: `https://kitchenflow.app`
- Development: `http://localhost:4321` (Astro default port)

### 8.4. Content Security Policy

Set appropriate CSP headers:
```
Content-Security-Policy: default-src 'self'; 
  img-src 'self' https://*.supabase.co https://example.com;
  script-src 'self';
  style-src 'self' 'unsafe-inline'
```

### 8.5. Sensitive Data Handling

- Never log full AI prompts containing user data
- Hash or anonymize data in `ai_logs` if needed
- Encrypt sensitive configuration (API keys) using environment variables

---

## 9. Monitoring and Logging

### 9.1. Logging Strategy

**Application Logs:**
- Request/response logging (exclude sensitive data)
- Error tracking with stack traces
- Performance metrics (response times)

**AI Usage Logs:**
- Stored in `ai_logs` table
- Track: feature, model, tokens, timestamps
- Aggregate for usage analysis

### 9.2. Metrics to Track

- API response times by endpoint
- Error rates by endpoint and type
- AI API latency and success rate
- User engagement (recipes created, shopping lists generated)
- Rate limit hits

### 9.3. Alerting

Set up alerts for:
- Error rate > 5%
- API response time > 2s (95th percentile)
- AI service unavailability
- Database connection issues

---

## Appendix A: Complete Endpoint Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **Recipes** |
| GET | `/api/recipes` | List recipes | Yes |
| GET | `/api/recipes/:id` | Get recipe by ID | Yes |
| POST | `/api/recipes` | Create recipe | Yes |
| PATCH | `/api/recipes/:id` | Update recipe | Yes |
| DELETE | `/api/recipes/:id` | Delete recipe | Yes |
| POST | `/api/recipes/import` | Import from URL | Yes |
| POST | `/api/recipes/:id/copy` | Copy global recipe | Yes |
| **Recipe Ingredients** |
| GET | `/api/recipes/:recipe_id/ingredients` | List ingredients | Yes |
| POST | `/api/recipes/:recipe_id/ingredients` | Add ingredient | Yes |
| PATCH | `/api/recipes/:recipe_id/ingredients/:id` | Update ingredient | Yes |
| DELETE | `/api/recipes/:recipe_id/ingredients/:id` | Delete ingredient | Yes |
| **Products** |
| GET | `/api/products` | List products | Yes |
| GET | `/api/products/:id` | Get product by ID | Yes |
| POST | `/api/products` | Create product | Yes |
| PATCH | `/api/products/:id` | Update product | Yes |
| DELETE | `/api/products/:id` | Delete product | Yes |
| **Planner** |
| GET | `/api/planner` | Get planner entries | Yes |
| POST | `/api/planner` | Add to planner | Yes |
| PATCH | `/api/planner/:id` | Update planner entry | Yes |
| PATCH | `/api/planner/bulk-update` | Bulk update entries | Yes |
| DELETE | `/api/planner/:id` | Remove from planner | Yes |
| **Shopping Lists** |
| GET | `/api/shopping-lists` | List shopping lists | Yes |
| GET | `/api/shopping-lists/active` | Get active list | Yes |
| POST | `/api/shopping-lists/generate` | Generate new list | Yes |
| PATCH | `/api/shopping-lists/:id` | Update list metadata | Yes |
| POST | `/api/shopping-lists/:id/archive` | Archive list | Yes |
| DELETE | `/api/shopping-lists/:id` | Delete list | Yes |
| **Shopping List Items** |
| PATCH | `/api/shopping-list-items/:id` | Update item | Yes |
| PATCH | `/api/shopping-list-items/bulk-check` | Bulk check items | Yes |
| POST | `/api/shopping-list-items` | Add custom item | Yes |
| DELETE | `/api/shopping-list-items/:id` | Delete item | Yes |
| **AI Features** |
| POST | `/api/ai/normalize-ingredients` | Normalize ingredients | Yes |
| POST | `/api/ai/substitute-ingredient` | Get substitutions | Yes |
| GET | `/api/ai/usage` | Get AI usage stats | Yes |
| **User** |
| POST | `/api/user/initialize` | Initialize with seed data | Yes |

---

## Appendix B: Database-to-API Mapping

| Database Table | Primary API Resource | Related Endpoints |
|----------------|---------------------|-------------------|
| `recipes` | `/api/recipes` | Full CRUD + import, copy |
| `recipe_ingredients` | `/api/recipes/:id/ingredients` | Nested CRUD under recipes |
| `products` | `/api/products` | Full CRUD |
| `planner_entries` | `/api/planner` | CRUD + bulk operations |
| `shopping_lists` | `/api/shopping-lists` | CRUD + generate, archive |
| `shopping_list_items` | `/api/shopping-list-items` | CRUD + bulk operations |
| `ai_logs` | Internal (logging) | Read via `/api/ai/usage` |
| `ai_daily_usage` | Internal (rate limiting) | Read via `/api/ai/usage` |

---

## Appendix C: User Journey API Flows

### Flow 1: New User Onboarding
1. User signs up via Supabase Auth
2. POST `/api/user/initialize` - Seed recipes/products copied
3. GET `/api/recipes` - User sees initial recipes

### Flow 2: Add Custom Recipe
1. POST `/api/recipes/import` - Scrape URL (optional)
2. POST `/api/ai/normalize-ingredients` - AI parses ingredients
3. User reviews and edits in UI
4. POST `/api/recipes` - Save final recipe

### Flow 3: Plan Meals and Shop
1. GET `/api/recipes` - Browse recipes
2. POST `/api/planner` (multiple calls) - Add recipes to days
3. POST `/api/shopping-lists/generate` - Create shopping list
4. GET `/api/shopping-lists/active` - View in mobile
5. PATCH `/api/shopping-list-items/:id` (multiple) - Check off items

### Flow 4: Cooking with AI Assistant
1. GET `/api/recipes/:id` - Open recipe
2. POST `/api/ai/substitute-ingredient` - Get substitution for missing ingredient
3. User sees suggestions, accepts one
4. PATCH `/api/recipes/:id/ingredients/:id` - Update with note (optional)

---

**End of REST API Plan**

