# Phase 0 Research: AI Refine a Prompt

No unresolved `NEEDS CLARIFICATION` markers exist in `plan.md`'s Technical Context — the
API client layer, auth session shape, and both integration points were confirmed
directly in the codebase (below) rather than left open. This file records those
findings so Phase 1 design doesn't have to re-derive them.

## Decision: Reuse the existing `aiEnhanceClient` as-is

**Rationale**: `src/features/ai-enhance/api/aiEnhanceClient.{types,mock,real,ts}` already
implements `refine`, `acceptRefine`, `discardRefine` against the exact contract in
`docs/api/openapi.yaml`'s "AI Enhancement" tag (`POST/DELETE
/generated-prompts/{id}/refine`, `POST /generated-prompts/{id}/refine/accept`), from
prior contract-integration work in this repo. No client changes are needed — this
feature only consumes it.

**Alternatives considered**: Writing a bespoke fetch call inline in the new hook —
rejected, it would duplicate envelope/error handling `aiEnhanceClient.real.ts` already
centralizes and diverge from the mock/real switch every other feature uses.

## Decision: Gate the refine action on `generatedPromptId !== null` and `session.emailVerified`

**Rationale**: `GenerateResponse.generatedPromptId` (`src/features/template-generate/api/generateClient.types.ts`)
is `null` for guest generations (never persisted server-side) — there is nothing to
refine. `useAuth()`'s `session.emailVerified` (`src/features/auth/api/types.ts`) is the
existing source of truth for verification status, already used elsewhere in the auth
feature. Gating on both client-side is defense-in-depth on top of the backend's own
`EMAIL_NOT_VERIFIED` check (FR-002) — it avoids showing an action that will just 403.

**Alternatives considered**: Relying solely on the backend's `403 EMAIL_NOT_VERIFIED`
response and showing the verification prompt reactively — rejected as worse UX (a User
would click a button that's guaranteed to fail) without saving any implementation
complexity, since the check data is already in scope at both call sites.

## Decision: One shared hook (`useRefinePrompt`) + two presentational components, used at both integration points

**Rationale**: Both `TemplateGenerateSection.tsx` (post-generation result) and
`HistoryList.tsx`'s `HistoryPromptDetail` call site (history detail expansion) already
hold the generated prompt's `id` and `finalPrompt` in local state and can supply an
`onAccepted(newFinalPrompt: string)` callback to update it — confirmed by reading both
files. A single hook encapsulating the refine/accept/discard state machine (idle →
loading → result → done), rendered via two small presentational components
(`RefineTrigger`, `RefineDiffView`), avoids duplicating the state machine per surface
per spec.md's FR-010 ("both surfaces show the same persisted generated prompt").

**Alternatives considered**: A single monolithic `<RefineFlow>` component owning its own
button + diff view — rejected in favor of splitting trigger/diff-view so
`TemplateGenerateSection` can place the trigger inline with `GenerateActions` (existing
button row) while the diff view renders full-width below, matching the existing layout
conventions in both files without a one-off wrapper.

## Decision: No new i18n resource files touched in this pass

**Rationale**: Surveying `template-generate`/`history` components (`GenerateActions.tsx`,
`HistoryPromptDetail.tsx`), all user-facing strings are hardcoded English literals, not
routed through an i18n library — despite `how2prompt-agentic`'s `typescript/guidelines.md`
prescribing i18next, no such setup exists yet anywhere in this codebase (confirmed: no
`i18next`/`react-i18next` in `package.json`, no `locales/` directory). This feature
follows the codebase's actual current convention (hardcoded English strings, matching
`GENERIC_ERROR_MESSAGE`/`QUOTA_ERROR_MESSAGE` in `GenerateActions.tsx`) rather than
introducing i18n scaffolding as an out-of-scope side quest.

**Alternatives considered**: Adding i18next now to comply with the guideline — rejected,
out of scope for a single-story feature and would touch far more files than this
story's own surface.
