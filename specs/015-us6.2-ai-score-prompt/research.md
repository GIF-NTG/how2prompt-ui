# Research: AI Score a Prompt (US-6.2)

## Decision: wire contract is already fully in place — no new client method needed

`docs/api/openapi.yaml` documents `POST /generated-prompts/{id}/score` (200 →
`ScoreResult { promptId, score, breakdown: ScoreBreakdown, suggestions[], modelVersion }`,
`ScoreBreakdown { clarity, specificity, context, format }`, each 0–10 integer). The
frontend API layer added alongside US-6.1 (`src/features/ai-enhance/api/`) already
declares and implements `score(generatedPromptId, accessToken?): Promise<ScoreResult>`
in `AiEnhanceClient` (`aiEnhanceClient.types.ts`, `.real.ts`), matching the contract
field-for-field. No new endpoint, DTO, or client method is required — this feature is
purely a new hook + UI surface consuming an already-wired call.

**Alternatives considered**: none — the client method predates this feature (built
speculatively during US-6.1's Epic 6 contract wiring) and already matches the contract,
so there is nothing to design here.

## Decision: mock-client score behavior already exists — no change needed

`aiEnhanceClient.mock.ts` already implements a deterministic `score()` (fixed
`score: 8`, a full `breakdown`, two `suggestions`, `modelVersion: 'mock-score-v1'`),
added speculatively alongside `refine`/`translate` during US-6.1's contract wiring. It
already matches this feature's needs (a stable result for hook/component tests and
MSW-less local dev) — nothing to add here.

## Decision: persisted score is a contract gap — score is session-only for this feature

The source user story (`us-6.2-ai-score-a-prompt.md`) says the score is persisted to
`generated_prompts.ai_score` and should be "re-displayed when revisiting the prompt from
history." However, `GeneratedPromptListItem`/`GeneratedPromptDetail` in
`docs/api/openapi.yaml` (the schemas backing `GET /generated-prompts` and
`GET /generated-prompts/{id}`, consumed by `src/features/history/`) do not expose an
`aiScore`/`ai_score` field, and the matching frontend types
(`src/features/history/types.ts`'s `HistoryListItem`/`HistoryDetail`) don't carry one
either. There is no documented way for the frontend to read a previously computed score
back after leaving and re-fetching the prompt from the backend.

**Decision**: treat this the same way this project already treats the Epic 5 admin
contract gaps (see `CLAUDE.md`'s Epic 5 section) — scope the feature to what the wired
contract actually supports, and record the gap rather than inventing an endpoint. The
score result lives in local component/hook state for the current view session only (the
same pattern `useRefinePrompt`/`RefinementResult` already uses for the transient refine
result — see `useRefinePrompt.types.ts`'s comment "never persisted client-side beyond
the current session"). `spec.md`'s User Story 2 and FR-006/FR-007 were adjusted during
this planning pass to match: "stays visible during the current view session," not
"persisted across a fresh page load."

**Alternatives considered**:
- *Add a client-side cache (localStorage) keyed by prompt id* — rejected: diverges from
  the "backend is the source of truth" pattern (Constitution Principle III) and would
  silently go stale if the backend recomputes a score differently later; also out of
  scope for a UI-only feature per YAGNI.
- *Block the feature until the backend adds the field* — rejected: User Story 1 (the
  core "score this prompt and see the result" value) is fully deliverable today; only
  the persisted-redisplay nicety is blocked. Same judgment call as Epic 5's precedent.

## Decision: radar chart — hand-rolled inline SVG, no new chart library dependency

Checked `package.json`: no charting library (`recharts`, `chart.js`/`react-chartjs-2`,
`victory`, `visx`, `d3`) is currently a dependency. The chart need here is narrow and
fixed: exactly 4 axes, fixed 0–10 scale, one data series, no interactivity beyond
optional tooltips. This is well within hand-rolled SVG territory (a `<polygon>` for the
score shape over 4 fixed-angle axis lines) and avoids adding a new runtime dependency +
bundle weight (`rules/web/performance.md`'s bundle budget) for a single, simple chart.

**Alternatives considered**:
- *Add `recharts` (has a `RadarChart` primitive)* — rejected: pulls in a sizeable
  dependency (and its own SVG/D3-adjacent internals) for one 4-axis chart; no other
  chart exists yet in this codebase to amortize the cost against.
- *Add `chart.js` + `react-chartjs-2`* — rejected for the same reason; also canvas-based,
  which is harder to theme (light/dark tokens) than inline SVG matching this app's
  existing Tailwind CSS custom-property approach.

## Decision: error handling — reuse `useRefinePrompt`'s `ApiError`-to-message pattern

`useRefinePrompt.ts` already establishes the pattern for turning known `ApiError.code`
values into specific user-facing messages, with a generic fallback for anything else.
`useScorePrompt` (new hook, this feature) follows the identical shape: a
`Record<string, string>` of known error codes → message, defaulting to a generic
"couldn't score this prompt" message. The specific codes this feature must handle:
- A malformed/unparseable LLM JSON response (edge case explicitly called out in the
  source user story and `spec.md`) — the backend is expected to surface this as a
  distinct error code (not a raw 500), consistent with `agent/BA.md`'s error-catalog
  convention; if/when the real backend ships this endpoint, its actual code should be
  added to the map. Until then, any error not matching a known transient-failure code
  (timeout, unavailable, rate-limited) falls through to the generic retryable message,
  which already satisfies FR-008's "distinct, actionable error state (message + retry)."
- Transient failures (`AI_TIMEOUT`, `AI_UNAVAILABLE`, `RATE_LIMITED`) — same codes
  `useRefinePrompt.ts` already maps, reused verbatim since they're generic AI-call
  failure codes, not refine-specific ones.

**Alternatives considered**: a shared cross-hook error-mapping utility in
`src/features/ai-enhance/` — rejected for now (YAGNI): only two hooks exist
(`useRefinePrompt`, this feature's `useScorePrompt`) and their message copy differs
enough (refine vs score) that a shared table would need per-action overrides anyway;
revisit if a third AI Enhancement hook (translate, playground) needs the same shape.

## Decision: one shared hook + trigger, reused across both surfaces

Following the exact structural precedent of US-6.1 (`useRefinePrompt` + `RefineTrigger`
+ `RefineDiffView`, consumed identically by both
`TemplateGenerateSection.tsx` (post-generation view) and `HistoryPromptDetail.tsx`
(history detail view) — the "Refine surfaces" assumption in `specs/014-.../spec.md`),
this feature adds `useScorePrompt` + `ScoreTrigger` + `ScoreResultView` under
`src/features/ai-enhance/`, wired into the same two host components alongside the
existing refine UI.
