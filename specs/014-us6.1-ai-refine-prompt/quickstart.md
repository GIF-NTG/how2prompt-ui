# Quickstart: AI Refine a Prompt

## Prerequisites

- `npm install` already run.
- No `VITE_API_BASE_URL` set → app runs against the mock clients (including
  `aiEnhanceClient.mock.ts`), which is sufficient to validate this feature end-to-end
  without a live backend.

## Run

```bash
npm run dev
```

## Validation scenarios

### 1. Refine → diff view (US1)

1. Log in as a verified mock user (see `authClient.mock.ts` seeded accounts).
2. Open any template, fill the form, click "Generate prompt".
3. Click "Refine with AI".
4. **Expect**: a loading state appears immediately and the trigger becomes disabled;
   within a couple seconds (mock latency) a diff view renders showing the original
   prompt, the refined prompt, and a bulleted list of explanations.
5. Click "Refine with AI" again while the first request would still be in flight (throttle
   the mock or just verify the control is disabled during `loading`) — **expect**: no
   second request fires.

### 2. Accept (US2)

1. From the diff view in scenario 1, click "Accept".
2. **Expect**: the diff view closes; the prompt shown on screen (and its Copy button
   value) now matches the refined text.
3. Navigate to `/history`, expand the same prompt.
4. **Expect**: the history detail also shows the refined text as `finalPrompt`.

### 3. Edit manually, then accept (US3)

1. Repeat scenario 1 to get a fresh diff view.
2. Edit the refined text in place.
3. Click "Accept".
4. **Expect**: the final prompt shown matches the edited text, not the AI's original
   suggestion.

### 4. Reject (US3)

1. Repeat scenario 1 to get a fresh diff view.
2. Note the original prompt text.
3. Click "Reject".
4. **Expect**: the diff view closes; the prompt shown on screen is unchanged from
   before "Refine with AI" was clicked.

### 5. Unverified / guest gating (FR-002)

1. Log in as a mock user with `emailVerified: false` (or view a guest-generated prompt,
   `generatedPromptId: null`).
2. **Expect**: no "Refine with AI" control is rendered (or, if rendered per a chosen
   design, clicking it routes to the email-verification flow rather than calling the API).

### 6. Error surfaces (FR-009, Edge Cases)

Each of these requires forcing the mock client to throw the corresponding `ApiError`
code (quota/rate-limit/timeout/unavailable/content-filtered) — either via a temporary
test hook in `aiEnhanceClient.mock.ts` or by asserting directly against
`useRefinePrompt` in a unit test rather than the full UI. **Expect**: each surfaces a
distinct message per spec.md's Edge Cases, never a generic fallback for these five
cases.

## Automated checks

```bash
npm run lint
npx tsc -b --noEmit
npm run test
```
