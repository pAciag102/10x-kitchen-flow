-- migration: initial_schema
-- description: creates core schema for FoodYee application including recipes, products, planner, shopping lists, and ai tracking
-- tables affected: recipes, products, recipe_ingredients, planner_entries, shopping_lists, shopping_list_items, ai_logs, ai_daily_usage
-- notes: 
--   - rls is disabled on all tables (access control must be handled at application level)
--   - recipes and products support both global (seed) and user-specific data
--   - full-text search enabled on recipes using tsvector
--   - triggers automatically update search_vector and updated_at timestamps

-- =====================================================
-- 1. recipes table
-- =====================================================
-- stores both global seed recipes and user-created recipes
-- scope field determines visibility (global vs user)
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  scope text not null check (scope in ('global', 'user')),
  is_seed_copy boolean not null default false,
  title text not null,
  slug text not null,
  description text,
  image_url text,
  instructions text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings numeric(6,2),
  source_url text,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- index for user's recipes sorted by creation date
create index idx_recipes_user_created_at on public.recipes (user_id, created_at desc);

-- indexes for global/seed recipe filtering
create index idx_recipes_scope on public.recipes (scope);
create index idx_recipes_scope_seed on public.recipes (scope, is_seed_copy);

-- unique slug constraint for user recipes (within user's namespace)
create unique index uq_recipes_user_slug on public.recipes (user_id, slug) where scope = 'user';

-- unique slug constraint for global recipes
create unique index uq_recipes_global_slug on public.recipes (slug) where scope = 'global';

-- full-text search index using gin
create index idx_recipes_search_vector on public.recipes using gin (search_vector);

-- =====================================================
-- 2. products table
-- =====================================================
-- normalized product dictionary (global + user extensions)
-- global products have user_id = null, user products have user_id set
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  slug text,
  category text,
  aliases text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- index for filtering products by owner
create index idx_products_user on public.products (user_id);

-- unique constraint for global product names (case-insensitive)
create unique index uq_products_global_name on public.products (lower(name)) where user_id is null;

-- unique constraint for user product names (case-insensitive, per user)
create unique index uq_products_user_name on public.products (user_id, lower(name)) where user_id is not null;

-- =====================================================
-- 3. recipe_ingredients table
-- =====================================================
-- ingredients for recipes, linked to normalized products after processing
-- raw_text preserves original ingredient line, product_id links to normalized product
create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  raw_text text not null,
  quantity numeric(12,4),
  unit text,
  notes text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- index for fetching ingredients for a recipe in order
create index idx_recipe_ingredients_recipe on public.recipe_ingredients (recipe_id, position);

-- index for finding all recipes using a specific product
create index idx_recipe_ingredients_product on public.recipe_ingredients (product_id);

-- =====================================================
-- 4. planner_entries table
-- =====================================================
-- daily meal planner entries linking recipes to specific dates
-- portion_multiplier allows scaling recipe servings
create table public.planner_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  planning_date date not null,
  portion_multiplier numeric(6,2) not null default 1.0,
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- index for fetching user's planner entries by date range
create index idx_planner_entries_user_date on public.planner_entries (user_id, planning_date);

-- index for sorting entries within a day
create index idx_planner_entries_user_date_sort on public.planner_entries (user_id, planning_date, sort_order);

-- index for finding which planner entries use a specific recipe
create index idx_planner_entries_recipe on public.planner_entries (recipe_id);

-- =====================================================
-- 5. shopping_lists table
-- =====================================================
-- shopping lists per user, only one active list allowed per user
-- stores metadata about list generation from planner
create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('active', 'archived')),
  title text,
  description text,
  generated_from_start date,
  generated_from_end date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- index for fetching user's lists by status
create index idx_shopping_lists_user_status on public.shopping_lists (user_id, status);

-- unique constraint: only one active shopping list per user
create unique index uq_shopping_lists_user_active on public.shopping_lists (user_id) where status = 'active';

-- =====================================================
-- 6. shopping_list_items table
-- =====================================================
-- individual items on shopping lists
-- links to products, recipes, and planner entries for traceability
-- supports manual overrides and aggregation
create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  recipe_id uuid references public.recipes(id) on delete set null,
  planner_entry_id uuid references public.planner_entries(id) on delete set null,
  quantity numeric(12,4),
  unit text,
  is_checked boolean not null default false,
  overridden_quantity numeric(12,4),
  overridden_unit text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- index for fetching items for a list in order
create index idx_shopping_list_items_list on public.shopping_list_items (shopping_list_id, sort_order);

-- index for aggregation queries by product and unit
create index idx_shopping_list_items_agg on public.shopping_list_items (shopping_list_id, product_id, unit);

-- index for filtering checked/unchecked items
create index idx_shopping_list_items_checked on public.shopping_list_items (shopping_list_id, is_checked);

-- unique constraint: one item per product+unit combination per list
-- prevents duplicate entries for the same product
create unique index uq_shopping_list_item_product_unit on public.shopping_list_items (shopping_list_id, product_id, unit) where product_id is not null;

-- index for finding shopping list items by source recipe
create index idx_shopping_list_items_recipe on public.shopping_list_items (recipe_id);

-- index for finding shopping list items by planner entry
create index idx_shopping_list_items_planner_entry on public.shopping_list_items (planner_entry_id);

-- =====================================================
-- 7. ai_logs table
-- =====================================================
-- lightweight logging for ai feature usage
-- tracks token consumption and feature usage for monitoring
create table public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  model text,
  prompt text,
  response_summary text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- index for fetching user's ai logs chronologically
create index idx_ai_logs_user_created_at on public.ai_logs (user_id, created_at desc);

-- index for analyzing feature usage patterns
create index idx_ai_logs_user_feature_day on public.ai_logs (user_id, feature, created_at);

-- =====================================================
-- 8. ai_daily_usage table
-- =====================================================
-- daily usage counters per user and feature for rate limiting
-- aggregates call counts and token usage per day
create table public.ai_daily_usage (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  day date not null,
  call_count integer not null default 0,
  tokens_used integer not null default 0,
  updated_at timestamptz not null default now()
);

-- unique constraint: one record per user/feature/day combination
create unique index uq_ai_daily_usage_user_feature_day on public.ai_daily_usage (user_id, feature, day);

-- index for fetching user's daily usage across features
create index idx_ai_daily_usage_user_day on public.ai_daily_usage (user_id, day);

-- =====================================================
-- triggers
-- =====================================================

-- trigger function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- apply updated_at trigger to all relevant tables
create trigger recipes_updated_at
  before update on public.recipes
  for each row
  execute function public.handle_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row
  execute function public.handle_updated_at();

create trigger recipe_ingredients_updated_at
  before update on public.recipe_ingredients
  for each row
  execute function public.handle_updated_at();

create trigger planner_entries_updated_at
  before update on public.planner_entries
  for each row
  execute function public.handle_updated_at();

create trigger shopping_lists_updated_at
  before update on public.shopping_lists
  for each row
  execute function public.handle_updated_at();

create trigger shopping_list_items_updated_at
  before update on public.shopping_list_items
  for each row
  execute function public.handle_updated_at();

create trigger ai_daily_usage_updated_at
  before update on public.ai_daily_usage
  for each row
  execute function public.handle_updated_at();

-- trigger function to update full-text search vector for recipes
-- combines title, description, and instructions into searchable tsvector
create or replace function public.recipes_search_vector_update()
returns trigger as $$
begin
  new.search_vector := 
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.instructions, '')), 'C');
  return new;
end;
$$ language plpgsql security definer;

-- apply search_vector trigger to recipes
create trigger recipes_search_vector_update
  before insert or update on public.recipes
  for each row
  execute function public.recipes_search_vector_update();

-- =====================================================
-- row level security (rls) policies
-- =====================================================

-- disable rls on all tables (policies disabled for development)
-- warning: without rls policies, access control must be handled at application level
alter table public.recipes disable row level security;
alter table public.products disable row level security;
alter table public.recipe_ingredients disable row level security;
alter table public.planner_entries disable row level security;
alter table public.shopping_lists disable row level security;
alter table public.shopping_list_items disable row level security;
alter table public.ai_logs disable row level security;
alter table public.ai_daily_usage disable row level security;

