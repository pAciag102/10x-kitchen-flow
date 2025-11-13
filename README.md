### KitchenFlow

[![Version](https://img.shields.io/badge/version-0.0.1-blue)](#project-status)
[![Node](https://img.shields.io/badge/node-22.14.0-339933)](.nvmrc)
[![Astro](https://img.shields.io/badge/Astro-5-%23FF5D01)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)
[![License](https://img.shields.io/badge/license-TBD-lightgrey)](#license)


#### Table of contents

- [Project name](#project-name)
- [Project description](#project-description)
- [Tech stack](#tech-stack)
- [Getting started locally](#getting-started-locally)
- [Available scripts](#available-scripts)
- [Project scope](#project-scope)
- [Project status](#project-status)
- [License](#license)


### Project name

KitchenFlow


### Project description

KitchenFlow is a web utility app that centralizes home recipe management and automates shopping list planning. The app leverages AI to normalize free‑form ingredient text into structured data, aggregate ingredients across planned recipes, and assist during cooking with context‑aware substitutions. It is designed Mobile‑First for shopping and cooking views, with full desktop functionality for planning.

Key capabilities:
- Add recipes manually or import from a URL (scraping).
- Human‑in‑the‑loop AI ingredient normalization into Name, Quantity, Unit.
- Meal planner with drag & drop to days or a general “To plan” column.
- Intelligent shopping list that aggregates normalized ingredients across planned recipes.
- Cooking assistant for context‑aware substitutions per ingredient.
- Supabase Auth and RLS‑based data isolation.

For full product details and user stories, see the PRD: `.ai/prd.md`.


### Tech stack

- Frontend: Astro 5 + React 19, TypeScript 5
- Styling: Tailwind CSS 4, Shadcn/ui, Lucide Icons
- AI: OpenRouter.ai (model provider abstraction)
- Backend/Platform: Supabase (PostgreSQL, Auth, SDK, RLS)
- Tooling: ESLint, Prettier, Husky + lint-staged
- CI/CD & Hosting: GitHub Actions, DigitalOcean (Docker image)

References: `.ai/stack.md`, `package.json`.


### Getting started locally

Prerequisites:
- Node.js 22.14.0 (see `.nvmrc`)
- npm (project uses `package-lock.json`)

Setup:

```bash
# 1) Use the correct Node version
nvm use

# 2) Install dependencies
npm ci

# 3) Start the dev server
npm run dev

# Astro typically runs at http://localhost:4321
```

Production build and preview:

```bash
npm run build
npm run preview
```

Notes:
- Future features will require environment variables (e.g., Supabase, OpenRouter). They are not yet required for the base UI scaffold.
- If you use a different Node manager, match the version in `.nvmrc` (22.14.0).


### Available scripts

From `package.json`:

- `dev`: Start the Astro dev server.
- `build`: Build the production site.
- `preview`: Preview the production build locally.
- `astro`: Run the Astro CLI directly.
- `lint`: Run ESLint across the project.
- `lint:fix`: Run ESLint with autofix.
- `format`: Run Prettier formatting.


### Project scope

In scope (MVP):
- Recipe management: add manually and via URL import (scraping), edit, delete.
- AI ingredient normalization with human verification and manual fallback.
- Meal planner with drag & drop between days and general pool.
- Intelligent shopping list with aggregation by normalized name and unit.
- Cooking assistant for context‑aware substitutions per ingredient.
- Authentication via Supabase Auth; data isolation via RLS.

Out of scope (MVP boundaries):
- No native mobile apps (Web app/PWA only).
- No advanced home pantry/inventory tracking.
- No social features (e.g., feed/following/likes) in the initial release.
- No integrated payments (free tier with fixed/renewable AI limits).

See full details and acceptance criteria in `.ai/prd.md`.


### Project status

Version: `0.0.1` (early development)

Planned features and user stories (selection):
- US‑001: Registration and login with Supabase Auth and RLS verification.
- US‑002: Seed data on first login to avoid the empty state.
- US‑003: Import recipe from URL (scraping).
- US‑004: AI ingredient normalization with human‑in‑the‑loop verification.
- US‑005: Delete recipe with impact warning for shopping list.
- US‑006: Meal planning with drag & drop.
- US‑007: Aggregated shopping list by normalized ingredient and unit.
- US‑008: Mobile‑friendly shopping list with large tap targets and persisted state.
- US‑009: Context‑aware substitution suggestions via AI.

For the comprehensive roadmap and acceptance criteria, see `.ai/prd.md`.


### License

License: To be determined.

Until a license file is added, all rights are reserved by the repository owner. If you plan to open‑source this project, consider adding a license from `https://choosealicense.com` and updating this section and badge accordingly.


