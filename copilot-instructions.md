# Copilot Instructions

## Stack

Hono SSR with JSX, PostgreSQL (postgres.js), HTMX, TypeScript (NodeNext), custom CSS.

## Architecture

- **Pages** render full HTML documents with `<Layout>`
- **Components** are reusable UI pieces that receive data via props
- **Repository** handles all database access with typed input/output
- **i18n** provides translations via `getTranslations(locale)`

## Patterns

### Imports
Use `.js` extensions in all relative imports (NodeNext resolution):
```ts
import { Layout } from "./pages/Layout.js";
```

### Localization
- Locale stored in browser cookie, read once per route
- Pass `locale` prop through component tree

### Styling
- No global form styling—use opt-in classes (e.g., `.form-card`)
- Prefer utility classes for simple spacing/layout
- Keep components style-agnostic

### Forms
- Regular submissions: POST-Redirect-GET
- Dynamic updates: HTMX `hx-put`/`hx-post` with `hx-swap`

### Database
- Separate input types (no id/timestamps) from output types (full record)
- Use INSERT ON CONFLICT for upserts
- Parameterized queries via tagged templates
