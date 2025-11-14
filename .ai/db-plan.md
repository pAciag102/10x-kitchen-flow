## 1. Lista tabel z kolumnami, typami danych i ograniczeniami

### 1.1. `recipes`

Tabela główna przechowująca przepisy (globalne seedowe + użytkownika).

| Kolumna              | Typ                         | Ograniczenia / opis |
| -------------------- | --------------------------- | -------------------- |
| `id`                 | `uuid`                      | PK, `DEFAULT gen_random_uuid()` |
| `user_id`            | `uuid`                      | FK → `auth.users(id)`, `NULL` dla przepisów globalnych |
| `scope`              | `text`                      | `NOT NULL`, `CHECK (scope IN ('global','user'))` |
| `is_seed_copy`       | `boolean`                   | `NOT NULL DEFAULT false` – czy jest to skopiowany seed do przestrzeni użytkownika |
| `title`              | `text`                      | `NOT NULL` |
| `slug`               | `text`                      | `NOT NULL` – unikalny w ramach przestrzeni (patrz indeksy) |
| `description`        | `text`                      | opis dania, nullable |
| `image_url`          | `text`                      | URL zdjęcia, nullable |
| `instructions`       | `text`                      | pełna treść instrukcji, nullable |
| `prep_time_minutes`  | `integer`                   | czas przygotowania, nullable |
| `cook_time_minutes`  | `integer`                   | czas gotowania, nullable |
| `servings`           | `numeric(6,2)`              | liczba porcji, nullable |
| `source_url`         | `text`                      | URL źródła (np. oryginalny blog), nullable |
| `visibility`         | `text`                      | `NOT NULL DEFAULT 'private'`, `CHECK (visibility IN ('private','public'))` – przygotowane pod współdzielenie w przyszłości |
| `search_vector`      | `tsvector`                  | pełnotekstowy indeks (aktualizowany triggerem) |
| `created_at`         | `timestamptz`               | `NOT NULL DEFAULT now()` |
| `updated_at`         | `timestamptz`               | `NOT NULL DEFAULT now()` |

### 1.2. `products`

Słownik znormalizowanych produktów (globalny + rozszerzenia użytkowników).

| Kolumna       | Typ           | Ograniczenia / opis |
| ------------- | ------------- | -------------------- |
| `id`          | `uuid`        | PK, `DEFAULT gen_random_uuid()` |
| `user_id`     | `uuid`        | FK → `auth.users(id)`, `NULL` dla produktów globalnych |
| `name`        | `text`        | `NOT NULL` – nazwa znormalizowana (np. "jajko", "mleko 3,2%") |
| `slug`        | `text`        | nullable, pomocniczy identyfikator |
| `category`    | `text`        | nullable, kategoria (nabiał, warzywa itd.) |
| `aliases`     | `text[]`      | nullable, alternatywne nazwy |
| `is_active`   | `boolean`     | `NOT NULL DEFAULT true` |
| `created_at`  | `timestamptz` | `NOT NULL DEFAULT now()` |
| `updated_at`  | `timestamptz` | `NOT NULL DEFAULT now()` |

### 1.3. `recipe_ingredients`

Składniki przepisu, po normalizacji powiązane z `products`.

| Kolumna        | Typ             | Ograniczenia / opis |
| -------------- | ----------------| -------------------- |
| `id`           | `uuid`          | PK, `DEFAULT gen_random_uuid()` |
| `recipe_id`    | `uuid`          | `NOT NULL`, FK → `recipes(id) ON DELETE CASCADE` |
| `product_id`   | `uuid`          | FK → `products(id)`, nullable (np. gdy brak dopasowania) |
| `raw_text`     | `text`          | `NOT NULL` – oryginalny wiersz tekstu |
| `quantity`     | `numeric(12,4)` | nullable – ilość |
| `unit`         | `text`          | nullable – jednostka (np. "g", "ml", "szt.") |
| `notes`        | `text`          | nullable – dodatkowe uwagi (np. "opcjonalnie") |
| `position`     | `integer`       | `NOT NULL DEFAULT 0` – kolejność w liście składników |
| `created_at`   | `timestamptz`   | `NOT NULL DEFAULT now()` |
| `updated_at`   | `timestamptz`   | `NOT NULL DEFAULT now()` |

### 1.4. `planner_entries`

Planer dzienny – powiązanie przepisu z konkretnym dniem / slotem.

| Kolumna             | Typ             | Ograniczenia / opis |
| ------------------- | ----------------| -------------------- |
| `id`                | `uuid`          | PK, `DEFAULT gen_random_uuid()` |
| `user_id`           | `uuid`          | `NOT NULL`, FK → `auth.users(id) ON DELETE CASCADE` |
| `recipe_id`         | `uuid`          | `NOT NULL`, FK → `recipes(id) ON DELETE CASCADE` |
| `planning_date`     | `date`          | `NOT NULL` – dzień, do którego przypisano przepis |
| `portion_multiplier`| `numeric(6,2)`  | `NOT NULL DEFAULT 1.0` – skala porcji względem domyślnej |
| `sort_order`        | `integer`       | `NOT NULL DEFAULT 0` – pozycja w kolumnie / dniu |
| `notes`             | `text`          | nullable – uwagi użytkownika |
| `created_at`        | `timestamptz`   | `NOT NULL DEFAULT now()` |
| `updated_at`        | `timestamptz`   | `NOT NULL DEFAULT now()` |

### 1.5. `shopping_lists`

Lista zakupów powiązana z użytkownikiem; jedna aktywna na użytkownika.

| Kolumna              | Typ             | Ograniczenia / opis |
| -------------------- | ----------------| -------------------- |
| `id`                 | `uuid`          | PK, `DEFAULT gen_random_uuid()` |
| `user_id`            | `uuid`          | `NOT NULL`, FK → `auth.users(id) ON DELETE CASCADE` |
| `status`             | `text`          | `NOT NULL`, `CHECK (status IN ('active','archived'))` |
| `title`              | `text`          | nullable – np. "Zakupy na tydzień 12" |
| `description`        | `text`          | nullable |
| `generated_from_start` | `date`        | nullable – początek zakresu planera użytego do generacji |
| `generated_from_end` | `date`          | nullable – koniec zakresu planera |
| `created_at`         | `timestamptz`   | `NOT NULL DEFAULT now()` |
| `updated_at`         | `timestamptz`   | `NOT NULL DEFAULT now()` |
| `archived_at`        | `timestamptz`   | nullable – moment archiwizacji |

### 1.6. `shopping_list_items`

Pozycje na liście zakupów, powiązane z produktami oraz opcjonalnie z planerem / przepisem.

| Kolumna              | Typ             | Ograniczenia / opis |
| -------------------- | ----------------| -------------------- |
| `id`                 | `uuid`          | PK, `DEFAULT gen_random_uuid()` |
| `shopping_list_id`   | `uuid`          | `NOT NULL`, FK → `shopping_lists(id) ON DELETE CASCADE` |
| `product_id`         | `uuid`          | FK → `products(id)`, nullable |
| `recipe_id`          | `uuid`          | FK → `recipes(id)`, nullable – oryginalne źródło |
| `planner_entry_id`   | `uuid`          | FK → `planner_entries(id)`, nullable – dokładne powiązanie z planerem |
| `quantity`           | `numeric(12,4)` | nullable – ilość wynikowa po agregacji |
| `unit`               | `text`          | nullable – jednostka wynikowa |
| `is_checked`         | `boolean`       | `NOT NULL DEFAULT false` – czy pozycja została odhaczona |
| `overridden_quantity`| `numeric(12,4)` | nullable – ilość nadpisana ręcznie przez użytkownika |
| `overridden_unit`    | `text`          | nullable – jednostka nadpisana ręcznie |
| `notes`              | `text`          | nullable – np. "w Lidlu", "bio" |
| `sort_order`         | `integer`       | `NOT NULL DEFAULT 0` |
| `created_at`         | `timestamptz`   | `NOT NULL DEFAULT now()` |
| `updated_at`         | `timestamptz`   | `NOT NULL DEFAULT now()` |

### 1.7. `ai_logs`

Lekkie logi użycia AI (do monitoringu, metryk, ewentualnego debugowania).

| Kolumna        | Typ             | Ograniczenia / opis |
| -------------- | ----------------| -------------------- |
| `id`           | `uuid`          | PK, `DEFAULT gen_random_uuid()` |
| `user_id`      | `uuid`          | `NOT NULL`, FK → `auth.users(id) ON DELETE CASCADE` |
| `feature`      | `text`          | `NOT NULL`, np. `ingredient_normalization`, `substitution_suggestions` |
| `model`        | `text`          | nullable – identyfikator/model OpenRouter |
| `prompt`       | `text`          | nullable – opcjonalnie zanonimizowany prompt |
| `response_summary` | `text`       | nullable – skrót odpowiedzi (bez pełnych danych) |
| `input_tokens` | `integer`       | `NOT NULL DEFAULT 0` |
| `output_tokens`| `integer`       | `NOT NULL DEFAULT 0` |
| `meta`         | `jsonb`         | nullable – dodatkowe dane (np. latency) |
| `created_at`   | `timestamptz`   | `NOT NULL DEFAULT now()` |

### 1.8. `ai_daily_usage`

Prosty dzienny licznik wywołań AI per użytkownik i feature, używany do limitowania.

| Kolumna        | Typ             | Ograniczenia / opis |
| -------------- | ----------------| -------------------- |
| `id`           | `bigserial`     | PK |
| `user_id`      | `uuid`          | `NOT NULL`, FK → `auth.users(id) ON DELETE CASCADE` |
| `feature`      | `text`          | `NOT NULL` |
| `day`          | `date`          | `NOT NULL` |
| `call_count`   | `integer`       | `NOT NULL DEFAULT 0` |
| `tokens_used`  | `integer`       | `NOT NULL DEFAULT 0` |
| `updated_at`   | `timestamptz`   | `NOT NULL DEFAULT now()` |

Ograniczenia:

- `UNIQUE (user_id, feature, day)` – jeden rekord na użytkownika/feature/dzień.

---

## 2. Relacje między tabelami

- **`auth.users` → `recipes`**: relacja 1:N
  - `recipes.user_id` FK → `auth.users.id` (nullable dla przepisów globalnych).
- **`recipes` → `recipe_ingredients`**: relacja 1:N
  - `recipe_ingredients.recipe_id` FK → `recipes.id` (`ON DELETE CASCADE`).
- **`products` → `recipe_ingredients`**: relacja 1:N
  - `recipe_ingredients.product_id` FK → `products.id`.
- **`auth.users` → `products`**: relacja 1:N
  - `products.user_id` FK → `auth.users.id` (nullable dla produktów globalnych).
- **`auth.users` → `planner_entries`**: relacja 1:N
  - `planner_entries.user_id` FK → `auth.users.id`.
- **`recipes` → `planner_entries`**: relacja 1:N
  - `planner_entries.recipe_id` FK → `recipes.id`.
- **`auth.users` → `shopping_lists`**: relacja 1:N
  - `shopping_lists.user_id` FK → `auth.users.id`.
- **`shopping_lists` → `shopping_list_items`**: relacja 1:N
  - `shopping_list_items.shopping_list_id` FK → `shopping_lists.id` (`ON DELETE CASCADE`).
- **`products` → `shopping_list_items`**: relacja 1:N
  - `shopping_list_items.product_id` FK → `products.id`.
- **`recipes` → `shopping_list_items`**: relacja 1:N (powiązanie źródła)
  - `shopping_list_items.recipe_id` FK → `recipes.id`.
- **`planner_entries` → `shopping_list_items`**: relacja 1:N (dokładne powiązanie pozycji z wpisem w planerze, opcjonalne)
  - `shopping_list_items.planner_entry_id` FK → `planner_entries.id`.
- **`auth.users` → `ai_logs`**: relacja 1:N
  - `ai_logs.user_id` FK → `auth.users.id`.
- **`auth.users` → `ai_daily_usage`**: relacja 1:N
  - `ai_daily_usage.user_id` FK → `auth.users.id`.

Nie ma klasycznych relacji wiele-do-wielu wymagających tabel łączących – funkcjonalność jest pokryta przez tabele `planner_entries` (przepis w wielu dniach) i `shopping_list_items` (produkt pojawiający się w wielu listach).

---

## 3. Indeksy

### 3.1. `recipes`

- **PK / klucz główny**
  - `PRIMARY KEY (id)`
- **Indeks pod użytkownika i sortowanie**
  - `CREATE INDEX idx_recipes_user_created_at ON public.recipes (user_id, created_at DESC);`
- **Indeksy dla zakresu globalnego / seeda**
  - `CREATE INDEX idx_recipes_scope ON public.recipes (scope);`
  - `CREATE INDEX idx_recipes_scope_seed ON public.recipes (scope, is_seed_copy);`
- **Unikalność slugów**
  - Unikalność slugów dla przepisów użytkownika:
    - `CREATE UNIQUE INDEX uq_recipes_user_slug ON public.recipes (user_id, slug) WHERE scope = 'user';`
  - Unikalność slugów dla przepisów globalnych:
    - `CREATE UNIQUE INDEX uq_recipes_global_slug ON public.recipes (slug) WHERE scope = 'global';`
- **Pełnotekstowe wyszukiwanie**
  - `CREATE INDEX idx_recipes_search_vector ON public.recipes USING GIN (search_vector);`
  - `search_vector` aktualizowany triggerem na podstawie np. `title`, `description`, `instructions`.

### 3.2. `products`

- `PRIMARY KEY (id)`
- Indeks dla własności użytkownika:
  - `CREATE INDEX idx_products_user ON public.products (user_id);`
- Unikalność nazw globalnych:
  - `CREATE UNIQUE INDEX uq_products_global_name ON public.products (lower(name)) WHERE user_id IS NULL;`
- Unikalność nazw per użytkownik:
  - `CREATE UNIQUE INDEX uq_products_user_name ON public.products (user_id, lower(name)) WHERE user_id IS NOT NULL;`

### 3.3. `recipe_ingredients`

- `PRIMARY KEY (id)`
- `CREATE INDEX idx_recipe_ingredients_recipe ON public.recipe_ingredients (recipe_id, position);`
- `CREATE INDEX idx_recipe_ingredients_product ON public.recipe_ingredients (product_id);`

### 3.4. `planner_entries`

- `PRIMARY KEY (id)`
- `CREATE INDEX idx_planner_entries_user_date ON public.planner_entries (user_id, planning_date);`
- `CREATE INDEX idx_planner_entries_user_date_slot ON public.planner_entries (user_id, planning_date, slot, sort_order);`
- `CREATE INDEX idx_planner_entries_recipe ON public.planner_entries (recipe_id);`

### 3.5. `shopping_lists`

- `PRIMARY KEY (id)`
- `CREATE INDEX idx_shopping_lists_user_status ON public.shopping_lists (user_id, status);`
- Zapewnienie jednej aktywnej listy na użytkownika:
  - `CREATE UNIQUE INDEX uq_shopping_lists_user_active ON public.shopping_lists (user_id) WHERE status = 'active';`

### 3.6. `shopping_list_items`

- `PRIMARY KEY (id)`
- `CREATE INDEX idx_shopping_list_items_list ON public.shopping_list_items (shopping_list_id, sort_order);`
- Indeks do agregacji wg produktu / jednostki:
  - `CREATE INDEX idx_shopping_list_items_agg ON public.shopping_list_items (shopping_list_id, product_id, unit);`
- Indeks dla szybkiego filtrowania po statusie odhaczenia:
  - `CREATE INDEX idx_shopping_list_items_checked ON public.shopping_list_items (shopping_list_id, is_checked);`
- (opcjonalnie) unikalność pozycji w ramach listy dla pary produkt + jednostka:
  - `CREATE UNIQUE INDEX uq_shopping_list_item_product_unit ON public.shopping_list_items (shopping_list_id, product_id, unit) WHERE product_id IS NOT NULL;`

### 3.7. `ai_logs`

- `PRIMARY KEY (id)`
- `CREATE INDEX idx_ai_logs_user_created_at ON public.ai_logs (user_id, created_at DESC);`
- `CREATE INDEX idx_ai_logs_user_feature_day ON public.ai_logs (user_id, feature, created_at);`

### 3.8. `ai_daily_usage`

- `PRIMARY KEY (id)`
- `CREATE UNIQUE INDEX uq_ai_daily_usage_user_feature_day ON public.ai_daily_usage (user_id, feature, day);`
- `CREATE INDEX idx_ai_daily_usage_user_day ON public.ai_daily_usage (user_id, day);`

---

## 4. Zasady PostgreSQL (RLS)

Poniższe przykłady zakładają środowisko Supabase, w którym `auth.uid()` zwraca `uuid` zalogowanego użytkownika (lub `NULL` dla użytkownika anonimowego).

### 4.1. `recipes`

```sql
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- SELECT: każdy widzi przepisy globalne, użytkownik dodatkowo swoje
CREATE POLICY "recipes_select_own_and_global"
  ON public.recipes
  FOR SELECT
  USING (
    scope = 'global'
    OR (scope = 'user' AND user_id = auth.uid())
  );

-- INSERT: użytkownik może dodawać tylko swoje przepisy
CREATE POLICY "recipes_insert_own"
  ON public.recipes
  FOR INSERT
  WITH CHECK (
    scope = 'user'
    AND user_id = auth.uid()
  );

-- UPDATE: użytkownik może edytować tylko swoje przepisy użytkownika
CREATE POLICY "recipes_update_own"
  ON public.recipes
  FOR UPDATE
  USING (
    scope = 'user'
    AND user_id = auth.uid()
  )
  WITH CHECK (
    scope = 'user'
    AND user_id = auth.uid()
  );

-- DELETE: użytkownik może usuwać tylko swoje przepisy użytkownika
CREATE POLICY "recipes_delete_own"
  ON public.recipes
  FOR DELETE
  USING (
    scope = 'user'
    AND user_id = auth.uid()
  );
```

### 4.2. `products`

Globalne produkty są widoczne dla wszystkich, produkty użytkownika tylko dla niego.

```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_own_and_global"
  ON public.products
  FOR SELECT
  USING (
    user_id IS NULL
    OR user_id = auth.uid()
  );

CREATE POLICY "products_insert_own"
  ON public.products
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "products_update_own"
  ON public.products
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "products_delete_own"
  ON public.products
  FOR DELETE
  USING (user_id = auth.uid());
```

### 4.3. `planner_entries`

```sql
ALTER TABLE public.planner_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner_entries_owner_all"
  ON public.planner_entries
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### 4.4. `shopping_lists` i `shopping_list_items`

```sql
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shopping_lists_owner_all"
  ON public.shopping_lists
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Zakładamy, że dostęp do items jest filtrowany przez powiązanie z listą
CREATE POLICY "shopping_list_items_owner_all"
  ON public.shopping_list_items
  FOR ALL
  USING (
    shopping_list_id IN (
      SELECT id FROM public.shopping_lists
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    shopping_list_id IN (
      SELECT id FROM public.shopping_lists
      WHERE user_id = auth.uid()
    )
  );
```

### 4.5. `ai_logs` i `ai_daily_usage`

```sql
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_logs_owner_all"
  ON public.ai_logs
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "ai_daily_usage_owner_all"
  ON public.ai_daily_usage
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

> Uwaga: Dostęp anonimowy do globalnych przepisów będzie zależał od konfiguracji ról Supabase (`anon`, `authenticated`). Powyższe polityki `SELECT` dla `recipes` i `products` są kompatybilne z anon, ponieważ `auth.uid()` jest `NULL` – warunek `scope = 'global'` / `user_id IS NULL` pozostaje prawdziwy.

---

## 5. Dodatkowe uwagi i wyjaśnienia

- **Normalizacja / 3NF**:
  - Rozdzielenie `recipes`, `recipe_ingredients` i `products` zapewnia normalizację danych i wspiera agregację składników na liście zakupów.
  - Dane specyficzne dla sesji AI (human-in-the-loop) nie są przechowywane – w bazie zapisujemy tylko finalne składniki (`recipe_ingredients`) oraz lekkie logi (`ai_logs`).
- **Agregacja listy zakupów**:
  - Aplikacja kliencka (lub logika backendowa) może generować / aktualizować `shopping_list_items` na podstawie `planner_entries` i `recipe_ingredients`, sumując ilości dla tych samych `product_id` i `unit`.
  - Pole `overridden_quantity` / `overridden_unit` pozwala zachować historię agregacji przy jednoczesnym umożliwieniu ręcznych korekt.
- **Historia i archiwizacja**:
  - `planner_entries` zachowują historię planowania dzięki `planning_date`; brak potrzeby dodatkowej tabeli "boardów".
  - `shopping_lists` z polem `status` oraz `archived_at` pozwalają przechowywać wiele historycznych list przy jednoczesnym utrzymaniu jednego aktywnego egzemplarza.
- **Wydajność i skalowalność**:
  - Indeksy złożone na `(user_id, planning_date)`, `(user_id, status)` oraz GIN na `search_vector` zapewniają skalowalność w typowych scenariuszach (przeglądanie planera, list zakupów, wyszukiwanie przepisów).
  - Brak partycjonowania w MVP jest zgodny z wymaganiami; w przyszłości naturalnymi kandydatami do partycjonowania są daty (`planning_date`, `day`) i `user_id`.


