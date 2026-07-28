# Quickstart: Validating the Prompt Generation Engine

Validation guide, not a build guide — proves the spec's success criteria
hold end-to-end. Full implementation steps live in `tasks.md`.

## Prerequisites

- `npm install` (already done).
- No `VITE_API_BASE_URL` set — runs against the mock clients, including the
  new `generateClient.mock.ts`, so no backend is needed.
- Mock template data must include at least one template with ≥3
  `template_variables` spanning at least: one `text`/`textarea`, one
  `select` or `multiselect`, one `number` or `slider`, one `boolean` — enough
  to exercise every FormField branch.

## 1. Automated regression suite

```bash
npm run lint
npm run build
npm run test -- --run
```

Expected: all pass. Confirms Constitution Principle V and that this feature
didn't regress the existing catalog/template-detail suites.

## 2. User Story 1 — form renders and validates (FR-001, FR-002, FR-003)

1. `npm run dev`, open a template's detail page.
2. Confirm one control per declared variable, matching its `inputType`, with
   label/help text in the current locale.
3. Leave a required field empty — confirm "Generate" stays disabled.
4. Enter a value that fails a declared `min`/`max`/`regex` — confirm
   "Generate" stays disabled and an inline error shows.
5. If the template supports 2+ models: switch models, confirm the form
   reflects that model's variant (or the default if none); confirm
   already-entered values for variables still present in the new form are
   preserved (edge case).
6. If the template supports exactly 1 model: confirm no model selector is
   shown at all.

## 3. User Story 2 — live preview (FR-004, SC-003)

1. Type into any field — confirm the preview text updates immediately, no
   loading state, no network tab activity for the preview itself.
2. Confirm an unfilled required placeholder is visually distinct in the
   preview.
3. Confirm a size/length indicator is shown and changes as you type.

## 4. User Story 4 — additional instructions (FR-005)

1. Fill the form validly, generate once with the optional field empty —
   confirm the result is unaffected by it.
2. Add text to "Hướng dẫn bổ sung", generate again — confirm that text
   appears appended in the result.

## 5. User Story 3 — generate, copy, quota (FR-006–FR-011, SC-001, SC-004, SC-005)

1. With a fully valid form, click Generate — confirm the displayed result
   comes from the mock `generateClient`'s response (`finalPrompt`), not
   whatever the live preview happened to show at that instant.
2. Click Copy — confirm a confirmation toast appears.
3. As a signed-in member: confirm the mock records the generation was
   "saved" (per FR-009 — inspect via the mock client's in-memory state or a
   follow-up assertion, since History UI itself is Epic 4).
4. As a guest: drive the mock client to its simulated quota limit — confirm
   the `GUEST_QUOTA_EXCEEDED` message renders clearly with a path to sign up
   (FR-010, SC-005), not a generic error.
5. Drive the mock client's simulated generic-failure path — confirm a
   generic, retry-able error is shown and no fabricated result appears
   (FR-011).

## Pass criteria

Every acceptance scenario in `spec.md`'s four user stories holds, SC-001
through SC-005 are satisfied, and `npm run lint` / `build` / `test -- --run`
are clean.
