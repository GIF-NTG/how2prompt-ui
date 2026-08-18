# Phase 1 Data Model: AI Refine a Prompt

No backend schema changes — this repo does not own the database. The entities below are
frontend UI-state shapes only, built on types the API client layer already exports
(`src/features/ai-enhance/api/aiEnhanceClient.types.ts`).

## Refinement Result (transient)

Held only in `useRefinePrompt`'s local state; discarded on accept, discard, or
navigating away — never persisted client-side.

| Field | Type | Notes |
|---|---|---|
| `promptId` | `string` | Same as the generated prompt's id; echoes back from `RefineResult` |
| `originalPrompt` | `string` | The prompt's final text at the moment refine was requested |
| `refinedPrompt` | `string` | AI's suggested rewrite |
| `explanations` | `string[]` | Bullet points shown next to the diff |
| `editedPrompt` | `string \| null` | Set when the user hand-edits the refined text (US3); `null` means "accept as-is" |

Source type: `RefineResult` (`aiEnhanceClient.types.ts`) plus one local-only field
(`editedPrompt`) added by the hook, not part of the API response.

## Refine Flow State (transient)

The state machine `useRefinePrompt` exposes to its two presentational components.

| State | Meaning | Entered from |
|---|---|---|
| `idle` | No refine in progress; trigger button enabled if eligible (FR-001/FR-002) | initial, or after accept/discard |
| `loading` | Refine request in flight; trigger disabled (FR-003) | user clicks "Refine with AI" |
| `result` | Refine succeeded; diff view shown with Accept/Edit/Reject controls | `loading` on success |
| `error` | Refine (or accept/discard) failed; message shown per FR-009 | `loading` on failure, or `result` if accept/discard fails |

Transitions map directly to spec.md's Acceptance Scenarios (US1 scenarios 1–2 =
`idle → loading → result`; US2 = `result → idle` via accept; US3 = `result → idle` via
edit+accept or reject).

## Existing entities referenced (unchanged)

- **Generated Prompt** (`GenerateResponse` in `template-generate`, `HistoryDetail` in
  `history`) — this feature reads `id`/`generatedPromptId` and `finalPrompt`, and on
  accept, calls each surface's own `onAccepted` callback to update `finalPrompt` in
  that surface's existing local state. It does not introduce a new shared store.
- **Auth Session** (`src/features/auth/api/types.ts`) — `session.token` (passed to
  `createAiEnhanceClient`) and `session.emailVerified` (client-side gate, see
  research.md).
