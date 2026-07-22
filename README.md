# agentic-fe

React + TypeScript + Vite scaffold with Tailwind CSS, React Router, and a
feature-first folder structure. This is a scaffold only — no domain
CLAUDE.md, SRS, or user stories yet.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (`@tailwindcss/vite`)
- React Router
- Oxlint + Prettier
- Vitest + React Testing Library

## Structure

```
src/
  app/            # routing, root layout, app-wide providers
  features/       # one folder per feature (components, pages, hooks, services)
  shared/         # components, hooks, utils, types used across features
  test/           # test setup
```

## Scripts

- `npm run dev` — start dev server
- `npm run build` — type-check and build
- `npm run lint` — oxlint
- `npm run format` — prettier --write
- `npm run test` — vitest
