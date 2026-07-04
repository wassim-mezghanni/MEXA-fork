# Dashboard

The dashboard is the user-facing analysis surface for the MEXA project. It is a React 18 + TypeScript app built with Vite, routed with React Router, and populated from static files in `dashboard/public/data/`.

## What the dashboard is for

It presents:

- overall model comparisons
- MEXA score summaries
- ranking-validation views
- dataset-level analysis for FLORES and Bible
- model-specific findings pages for each experiment family
- projection and correlation explorations for embeddings and scores

## Entry points

- `dashboard/src/App.tsx` — route definitions and shell wiring
- `dashboard/src/components/Sidebar.tsx` — navigation structure
- `dashboard/src/pages/Overview.tsx` — synthesis page and canonical summary view
- `dashboard/src/pages/MexaFindings.tsx` — detailed MEXA analysis and derived views
- `dashboard/src/pages/RankingValidation.tsx` — statistical validation and comparison logic

## Data loading pattern

The app uses `fetch()` against files in `dashboard/public/data/`. That means the dashboard is not querying a live backend; it is reading generated artifacts directly from static files.

This is important when changing the repo because the UI will only render correctly when the expected CSV/JSON files are present with the expected names.

## Sidebar and route organization

The sidebar groups routes into:

- overview / analysis pages
- dataset pages
- model-family findings pages
- comparison and validation pages

The route list in `App.tsx` and the sidebar groups in `Sidebar.tsx` must stay in sync. Many pages are thin wrappers around a shared findings component, but the names matter because the dashboard uses them as navigation targets.

## Main UI building blocks

The app relies on several reusable components:

- charts in `dashboard/src/charts/`
- reusable analysis blocks in `dashboard/src/components/`
- form controls in `dashboard/src/form/`
- general UI primitives in `dashboard/src/ui/`

## Change guidance

When editing the dashboard:

- start in `Overview.tsx` if you are changing the main summary logic
- update both the route table and sidebar when adding or renaming a page
- verify that any new data dependency is mirrored in `dashboard/public/data/`
- run `npm run lint` and `npm run build` in `dashboard/` before considering the change done
