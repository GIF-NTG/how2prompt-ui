# Quickstart: AI Score a Prompt (US-6.2)

## Prerequisites

- `npm install` (already-declared dependencies only — no new package for this feature,
  see research.md).
- Mock API mode is the default local dev/test path for this feature (no real backend
  required) — same as US-6.1's refine flow.

## Run

```bash
npm run dev
```

1. Log in (any seeded mock user).
2. Generate a prompt from any template (Epic 3 flow), or open an existing entry from
   `/history`.
3. Click **"Score this prompt"**.

## Expected outcome (User Story 1)

- A loading state appears on the trigger, which becomes disabled.
- On success: a radar chart renders with 4 axes (clarity, specificity, context,
  format), an overall score, a suggestions list, and the disclaimer "AI assessment for
  reference only" directly alongside the score.
- Clicking "Score this prompt" again while a request is in flight has no effect (no
  second request fires) — verify via the mock client's call count in
  `useScorePrompt.test.ts`.

## Expected outcome (User Story 2 — session-only, see spec.md Assumptions)

- With a score result on screen, click **Copy** (unrelated control on the same view) —
  the score result must remain rendered, unchanged, with no new loading state.
- Click "Score this prompt" again — a new request fires and the displayed result is
  replaced on success.
- Reloading the page / navigating away and back does **not** restore the score (this is
  the documented contract gap — the backend read endpoints don't expose a persisted
  `aiScore` field yet); the trigger is available to request a fresh score.

## Expected outcome (error edge cases)

Force each of `RATE_LIMITED`, `AI_TIMEOUT`, `AI_UNAVAILABLE`, and an unmapped/malformed
error code in the mock client (see `aiEnhanceClient.mock.ts`'s pattern for `refine`) and
verify each renders a distinct, non-generic message except the unmapped case, which
renders the generic retryable message — never an unhandled crash or a raw parse error.

## Validation commands

```bash
npm run test -- src/features/ai-enhance
npm run lint
npm run build
```

UI behavior (radar chart layout, disclaimer placement, both light/dark themes) must
also be manually verified in a running browser per Constitution Principle V — a passing
test suite alone does not confirm the chart renders correctly.
