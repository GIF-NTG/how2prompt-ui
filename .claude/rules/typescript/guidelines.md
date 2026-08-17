# TypeScript / React Guidelines

> Extends `.claude/rules/common/`. For `frontend/` (React SPA).

## Style

- Strict TypeScript — avoid `any`; prefer `unknown` + narrowing when the type is genuinely unknown.
- Components: `PascalCase`. Hooks: `camelCase` with a `use` prefix. Organize by feature/domain, not by file type (`components/hero/`, not `components/`+`hooks/`+`styles/` split at the top level).

## State

| Concern | Tooling |
|---|---|
| Server state | TanStack Query / SWR — don't duplicate server state into a client store |
| Client state | Zustand / Jotai / Context, as the project already uses |
| URL state | search params / route segments for anything shareable (filters, tab, page) |
| Form state | React Hook Form or equivalent |

## Testing

Unit tests for utilities/hooks; component tests for behavior, not implementation details. E2E (Playwright) for critical user flows. See `.claude/rules/common/testing.md` for the TDD cycle and coverage bar.

## Hooks (opt-in, wire into this project's own `.claude/settings.json`)

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Write|Edit", "command": "pnpm prettier --write \"$FILE_PATH\"" },
      { "matcher": "Write|Edit", "command": "pnpm eslint --fix \"$FILE_PATH\"" }
    ]
  }
}
```

Adjust the package manager (`pnpm`/`npm`/`yarn`) to match this project's actual lockfile.
