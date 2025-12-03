<conversation_summary>

<decisions>

1. Wszystkie encje aplikacyjne (`recipes`, `planner_entries`, `shopping_lists`, sesje/zużycie AI itd.) mają być powiązane z kontem w `auth.users` przez `user_id UUID` jako klucz obcy.
2. Będzie używana jedna tabela `recipes` z polami pozwalającymi odróżnić przepisy globalne (seedowe) od użytkownika (`user_id` nullable dla globalnych, `scope` = `global`/`user`, `is_seed_copy BOOLEAN`).
3. Przepisy seedowe mają być kopiowane do przestrzeni użytkownika przy pierwszym logowaniu, ale model ma pozostawić furtkę na przyszłe użycie ich jako szablonów (bez zmiany głównej tabeli).
4. Globalne przepisy (seedowe) mają być widoczne także dla niezalogowanych użytkowników, prywatne przepisy użytkownika tylko dla niego.
5. Składniki mają być modelowane jako `recipe_ingredients` (składnik w kontekście przepisu) + słownik znormalizowanych produktów (`products`/`normalized_products`) z powiązaniem przez `product_id`.
6. Planer będzie oparty na tabeli `planner_entries` z polami m.in. `user_id`, `recipe_id`, `planning_date` typu `DATE` oraz `sort_order`, z możliwością planowania tygodni do przodu i zachowania historii.
7. W planerze wykorzystywany będzie model „jedna aktywna tablica na użytkownika”, ale projekt `planner_entries` ma wspierać zarówno przyszłe daty, jak i historyczne wpisy bez osobnej tabeli „boardów”.
8. Lista zakupów ma być trwale zapisywana w bazie, z historią oraz jednym „aktywnym” egzemplarzem na użytkownika (np. `shopping_lists` + `shopping_list_items` z unikalnym constraintem na jeden aktywny rekord).
9. Stan „human-in-the-loop” normalizacji składników (sesja AI + edycje przed zapisem) będzie przechowywany tylko po stronie frontendu; do bazy trafiają wyłącznie finalne rekordy `recipe_ingredients`.
10. Mimo braku sesji normalizacji w bazie, ma powstać tabela logów AI z danymi o promptach, liczbie zużytych tokenów i dacie wywołania.
11. Limitowanie zapytań do AI ma być zrealizowane jako prosty dzienny licznik na użytkownika (per dzień).
12. Usuwanie przepisów i powiązanych danych (planer, lista zakupów) będzie twarde (brak soft delete); potwierdzenie i ostrzeżenie o konsekwencjach zostanie zrealizowane po stronie frontendu.
13. Rozwiązywanie konfliktów przy równoczesnej edycji (planer, lista zakupów) w MVP będzie realizowane w modelu „last write wins”, z wykorzystaniem znaczników czasowych (`updated_at`) i ewentualnie `updated_by`.
14. Wyszukiwanie po przepisach zostanie wprowadzone od razu, z użyciem mechanizmu pełnotekstowego Postgresa (kolumna `search_vector TSVECTOR` z indeksem GIN).
15. Nie będzie stosowane partycjonowanie tabel w MVP; projekt opiera się na klasycznych tabelach z dobrze dobranymi indeksami.
16. Strategia indeksowania rekomendowana wcześniej (indeksy złożone m.in. na `recipes`, `recipe_ingredients`, `planner_entries`, `shopping_list_items`) została zaakceptowana jako kierunek dla MVP.
17. RLS ma bazować na prostych warunkach `user_id = auth.uid()` dla danych użytkownika, z wyjątkami dla globalnych przepisów (widocznych szerzej) oraz dla dostępu anonimowego do seedów.

</decisions>

<matched_recommendations>

1. Wykorzystanie jednej tabeli `recipes` z `user_id`, `scope` i `is_seed_copy` jako mechanizmu rozróżnienia przepisów globalnych i prywatnych oraz przygotowania pod przyszłe szablony.
2. Modelowanie składników jako `recipe_ingredients` powiązane z tabelą słownikową `products`, z polami ilości, jednostki i nazwy znormalizowanej dla poprawnej agregacji listy zakupów.
3. Zastosowanie tabeli `planner_entries` z polami `user_id`, `recipe_id`, `planning_date (DATE)` oraz `sort_order` (i potencjalnym `column_key`) do obsługi planera dziennego, planowania w przód oraz historii.
4. Utrzymywanie list zakupów w tabelach `shopping_lists` i `shopping_list_items` z unikalnym constraintem gwarantującym jedną aktywną listę na użytkownika oraz możliwością archiwizacji poprzednich list.
5. Rezygnacja z przechowywania pełnych sesji normalizacji AI w bazie w MVP, przy jednoczesnym wprowadzeniu odchudzonej tabeli logów AI (prompty, tokeny, daty) i trzymaniu stanu „human-in-the-loop” na froncie.
6. Implementacja prostego mechanizmu limitowania AI opartego o dzienny licznik wywołań per użytkownik, zapisany w bazie (np. przez tabelę `ai_usage` lub zintegrowaną z tabelą logów).
7. Przyjęcie twardych usunięć z kaskadowym czyszczeniem powiązanych danych (np. `ON DELETE CASCADE` pomiędzy `recipes` → `recipe_ingredients`, `planner_entries`, `shopping_list_items`) dla spełnienia wymagań związanych z usuwaniem przepisu.
8. Przyjęcie strategii „last write wins” z polami `updated_at`/`updated_by` jako wystarczającej dla MVP w kontekście edycji z wielu urządzeń.
9. Wprowadzenie pełnotekstowego wyszukiwania opartego o `TSVECTOR` i indeks GIN na `recipes` (np. na bazie nazwy, opisu i tagów).
10. Zastosowanie klasycznych indeksów złożonych (np. `recipes(user_id, created_at)`, `recipe_ingredients(recipe_id)`, `planner_entries(user_id, planning_date)`, `shopping_list_items(shopping_list_id, product_id, unit)`) przy braku partycjonowania w MVP.
11. Oparcie RLS o `user_id = auth.uid()` dla danych prywatnych, z dodatkową logiką dla encji globalnych (seedowe przepisy, dostępne również anonimowo).

</matched_recommendations>

<database_planning_summary>

**a. Główne wymagania dotyczące schematu bazy danych**

- **Powiązanie z użytkownikiem**: Wszystkie dane „prywatne” (przepisy użytkownika, planer, listy zakupów, zużycie AI) muszą być jednoznacznie powiązane z `auth.users` poprzez `user_id UUID`. To umożliwia proste i spójne reguły RLS oraz łatwe filtrowanie.
- **Wsparcie dla przepisów globalnych**: Schemat musi wspierać zarówno globalne przepisy seedowe (widoczne dla wszystkich, w tym niezalogowanych), jak i przepisy prywatne użytkownika, bez duplikowania struktury tabel.
- **Normalizacja składników**: Dane o składnikach muszą być znormalizowane tak, by możliwa była automatyczna agregacja na liście zakupów (sumowanie ilości tych samych produktów w tych samych jednostkach).
- **Planer dzienny z historią**: Planer musi wspierać planowanie w przód oraz zachowanie historii (wcześniejsze wybory), przy domyślnym modelu jednej „tablicy” planowania na użytkownika.
- **Trwała lista zakupów**: Lista zakupów musi być zapisywana w bazie (nie tylko liczona na żywo), z możliwością oznaczania pozycji jako kupione oraz z zachowywaniem historii.
- **Prosty limit AI i logowanie**: System musi ograniczać liczbę wywołań AI per użytkownik (dziennie) oraz logować podstawowe informacje o użyciu (prompt, tokeny, data) dla monitoringu i ewentualnego debugowania.
- **Wyszukiwanie przepisów**: Baza ma wspierać pełnotekstowe wyszukiwanie przepisów, tak by skalowało się z rosnącą liczbą zapisanych rekordów.
- **Bezpieczeństwo i RLS**: Dane użytkowników muszą być izolowane, z wykorzystaniem Row Level Security, przy jednoczesnym umożliwieniu dostępu do globalnych przepisów także anonimowym użytkownikom.

**b. Kluczowe encje i ich relacje**

- **`users` (Supabase `auth.users`)**: Źródło `user_id` dla wszystkich danych użytkownika. Wszystkie tabele aplikacyjne wykorzystują `user_id` jako FK.
- **`recipes`**:
  - Pola kluczowe: `id`, `user_id` (nullable), `scope` (`global`/`user`), `is_seed_copy`, metadane przepisu (tytuł, opis, zdjęcie, itp.), `search_vector`.
  - Relacje:
    - `recipes.user_id` → `auth.users.id` (dla przepisów prywatnych).
    - Jedno-wiele z `recipe_ingredients`.
    - Powiązanie z `planner_entries` (przepisy przypisane do dni).
- **`products` (słownik produktów)**:
  - Pola: `id`, nazwa znormalizowana, opcjonalnie kategoria, aliasy, itp.
  - Relacje:
    - Jeden-wiele z `recipe_ingredients`.
    - Jeden-wiele z `shopping_list_items` (jako znormalizowany produkt na liście zakupów).
- **`recipe_ingredients`**:
  - Pola: `id`, `recipe_id`, `product_id`, `raw_text`, `quantity`, `unit` i ewentualne dodatkowe atrybuty.
  - Relacje:
    - `recipe_ingredients.recipe_id` → `recipes.id` (z `ON DELETE CASCADE`).
    - `recipe_ingredients.product_id` → `products.id`.
- **`planner_entries`**:
  - Pola: `id`, `user_id`, `recipe_id`, `planning_date (DATE)`, `sort_order`, potencjalnie `column_key` lub inne pola organizujące widok.
  - Relacje:
    - `planner_entries.user_id` → `auth.users.id`.
    - `planner_entries.recipe_id` → `recipes.id` (z możliwością kaskady przy usuwaniu przepisu).
    - Służą jako źródło danych do generowania/aktualizacji list zakupów.
- **`shopping_lists`**:
  - Pola: `id`, `user_id`, `status` (`active`/`archived`), zakres dat/czas generacji (np. z jakiego okresu planera wygenerowano listę), znaczniki audytowe (`created_at`, `updated_at`).
  - Constraint: unikalność aktywnej listy na użytkownika (logicznie `UNIQUE(user_id, status='active')`).
  - Relacje:
    - `shopping_lists.user_id` → `auth.users.id`.
    - Jeden-wiele z `shopping_list_items`.
- **`shopping_list_items`**:
  - Pola: `id`, `shopping_list_id`, `product_id`, `quantity`, `unit`, `is_checked`, ewentualnie `overridden_quantity`.
  - Relacje:
    - `shopping_list_items.shopping_list_id` → `shopping_lists.id` (z `ON DELETE CASCADE`).
    - `shopping_list_items.product_id` → `products.id`.
    - Pośrednio powiązane z `planner_entries` (przez logikę generowania) i `recipe_ingredients`.
- **Logi AI / zużycie AI** (roboczo `ai_logs` + ewentualnie `ai_usage` lub łączone w jednej tabeli):
  - Pola przykładowe: `id`, `user_id`, `feature` (np. `ingredient_normalization`), `prompt` (lub zanonimizowana wersja), `tokens_used`, `created_at`.
  - Dla limitów dziennych: dodatkowo sposób agregacji po dacie (np. widok lub kolumny `day` / `call_count`).
  - Relacje:
    - `ai_logs.user_id` → `auth.users.id`.

**c. Ważne kwestie dotyczące bezpieczeństwa i skalowalności**

- **Bezpieczeństwo / RLS**:
  - Wszystkie tabele z danymi użytkownika (`recipes` prywatne, `planner_entries`, `shopping_lists`, `shopping_list_items`, logi AI) będą chronione RLS z regułą bazującą na `user_id = auth.uid()`.
  - Dla `recipes` konieczne będą osobne reguły pozwalające:
    - Użytkownikowi widzieć i edytować własne przepisy (`scope='user'` i `user_id = auth.uid()`).
    - Użytkownikom (w tym anonimowym) widzieć przepisy globalne (`scope='global'`), przy braku uprawnień do ich modyfikacji.
  - Dostęp anonimowy do globalnych przepisów wymaga przemyślenia ról w Supabase i odpowiednich reguł RLS lub osobnej warstwy (np. widok lub osobna tabela read-only) – to kluczowy element bezpieczeństwa.
- **Skalowalność i wydajność**:
  - Brak partycjonowania w MVP, ale data (`planning_date`) i `user_id` są naturalnymi kandydatami do przyszłego partycjonowania.
  - Wprowadzenie pełnotekstowego indeksu GIN (`search_vector`) na `recipes` zapewni wydajne wyszukiwanie wraz ze wzrostem liczby rekordów.
  - Indeksy złożone (na `user_id` + daty / statusy) będą kluczowe dla wydajnych zapytań użytkownika:
    - `recipes(user_id, created_at)` lub podobne.
    - `planner_entries(user_id, planning_date)`.
    - `shopping_lists(user_id, status)`.
    - `shopping_list_items(shopping_list_id, product_id, unit)`.
  - Model „last write wins” upraszcza zarówno schemat, jak i logikę przy wielu urządzeniach, co jest korzystne dla MVP; ewentualne rozbudowane mechanizmy współedycji można wprowadzić później, np. przez wersjonowanie.

**d. Obszary funkcjonalne spójne z wymaganiami PRD**

- **Zarządzanie przepisami**: Schemat `recipes` + `recipe_ingredients` + `products` pokrywa dodawanie, edycję, usuwanie przepisów, import z URL (dane mogą być mapowane do tych tabel) oraz ostrzeganie o wpływie usunięcia na listę zakupów (dzięki powiązaniom FK z planerem i listą).
- **Normalizacja danych (AI)**: Trzymanie wyłącznie finalnych wyników w `recipe_ingredients` spełnia wymaganie czystej bazy; logi AI pozwolą monitorować użycie modeli, choć dokładny przebieg sesji pozostanie w MVP po stronie frontu.
- **Planer posiłków**: `planner_entries` umożliwi przypisanie przepisów do dni, przesuwanie ich (Drag & Drop) oraz usuwanie z planera bez kasowania z bazy.
- **Inteligentna lista zakupów**: `shopping_lists` + `shopping_list_items`, powiązane z `planner_entries` i `recipe_ingredients`, umożliwiają generowanie i agregację składników oraz zachowanie stanu odhaczania na wielu sesjach.
- **Limity AI i metryki**: Logi AI oraz dzienny limit wywołań stanowią podstawę do późniejszego rozwinięcia zaawansowanych metryk i ewentualnych planów taryfowych, zgodnie z PRD.

</database_planning_summary>

<unresolved_issues>

1. **Szczegóły modelu `products`**: Nie jest jeszcze ustalone, czy słownik produktów jest globalny (wspólny dla wszystkich), per użytkownik, czy hybrydowy (global + rozszerzenia użytkownika); ma to wpływ na RLS i sposób agregacji.
2. **Struktura kolumn/slotów w planerze**: Wspomniano o `sort_order` i możliwym `column_key`, ale nie ma finalnej decyzji, czy należy modelować osobne kolumny (np. `todo`, `day_N`, posiłki) czy ograniczyć się do prostego sortowania w dniu; będzie to istotne dla UX Drag & Drop.
3. **Dokładny kształt tabeli logów AI**: Trzeba doprecyzować, jakie pola będą przechowywane (pełny prompt vs zanonimizowany, odpowiedź, typ modelu, feature itp.), politykę retencji tych danych oraz ewentualne rozgraniczenie tabeli logów i tabeli do liczenia limitów.
4. **RLS dla dostępu anonimowego do globalnych przepisów**: Wymagany jest precyzyjny projekt reguł RLS / ról w Supabase (lub ewentualny publiczny widok/tabela), aby umożliwić bezpieczny dostęp „read-only” dla niezalogowanych użytkowników.
5. **Zakres danych w pełnotekstowym indeksie**: Należy zdecydować, które pola przepisu wejdą do `search_vector` (tytuł, opis, tagi, nazwy składników) oraz jak będzie obsługiwane językowe dostrajanie (np. konfiguracja polska/angielska).
6. **Generowanie listy zakupów z planera**: Pozostaje do doprecyzowania, czy lista zakupów zawsze odzwierciedla cały aktualny zakres planera (np. najbliższy tydzień), czy użytkownik będzie mógł wskazać zakres dat lub konkretny zestaw wpisów planera do użycia przy generacji.

</unresolved_issues>

</conversation_summary>