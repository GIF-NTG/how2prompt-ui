# TypeScript / React Guidelines

> Extends `.claude/rules/common/`. For `how2prompt-ui` (frontend). Stack and constraints
> per `docs/SRS.md` §2.2 — this file operationalizes them as coding rules, it doesn't
> restate the product requirements.

## Stack

React 18+, TypeScript, TailwindCSS v4, Zustand, React Query (TanStack Query), i18next,
React Router, Framer Motion. Feature-based folder structure (Bulletproof React), not
organized by file type.

## Style

- Strict TypeScript — avoid `any`; prefer `unknown` + narrowing when the type is
  genuinely unknown. Type every API response against the actual backend contract.
- Components: `PascalCase`. Hooks: `camelCase` with a `use` prefix.
- Organize by feature/domain (`features/templates/`, `features/auth/`), not by file
  type split at the top level.

## State (per SRS §2.1)

| Concern | Tooling |
|---|---|
| Server state | React Query — never duplicate server state into Zustand or `useState` |
| Client/UI state | Zustand |
| URL state | search params / route segments for anything shareable (filters, tab, page, search query) |
| Form state | React Hook Form or equivalent |

Prompt-generation form preview (per SRS §2.3 UJ1) is a client-side render for UX only —
the final prompt is always re-rendered and persisted by the backend; never treat the
client-side render as the source of truth.

## i18n (per SRS §5.5)

- Vietnamese (`vi`) and English (`en`) supported from the start via i18next.
- No hardcoded user-facing strings — every label/message goes through the i18n
  resource files. Fallback to English when a key is missing in the active locale.

## Auth

- Access token kept in memory only, never localStorage/sessionStorage. Refresh token
  lives in an httpOnly cookie set by the backend — the frontend never reads or stores
  it directly.
- No AI provider API key is ever present in frontend code or env vars exposed to the
  client — all LLM calls go through the backend.

## Accessibility (per SRS §5.6)

WCAG 2.1 AA target: full keyboard navigation, visible focus indicators, ARIA labels on
interactive elements, contrast ratio >= 4.5:1 for body text.

## Testing

Unit tests for utilities/hooks; component tests for behavior, not implementation
details. E2E (Playwright) for critical user flows (auth, generate prompt). Target:
unit test coverage >= 60% (SRS §5.7). See `.claude/rules/common/testing.md` for the TDD
cycle.

## Hooks (opt-in)

Real scripts live at `.claude/hooks/typescript/format-lint.sh` (prettier + eslint on
save) and `.claude/hooks/common/block-destructive.sh` (blocks destructive Bash
commands before they run). Enable them by copying
`.claude/settings.example.typescript.json` to this project's own
`.claude/settings.json` (not synced — machine-local by design).

`format-lint.sh` assumes `pnpm`; adjust the commands inside it if this project uses
`npm`/`yarn` instead.
