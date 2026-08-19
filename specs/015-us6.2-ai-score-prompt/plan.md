# Implementation Plan: AI Score a Prompt

**Branch**: `015-us6.2-ai-score-prompt` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-us6.2-ai-score-prompt/spec.md`

## Summary

Add a "Score this prompt" action to both surfaces that already show a generated
prompt's final text (the post-generation result view and the history detail view),
calling the already-wired `POST /generated-prompts/{id}/score` contract and rendering
the result as a 4-axis radar chart (clarity, specificity, context, format) plus an
overall score, a suggestions list, and a persistent "AI assessment for reference only"
disclaimer. Structurally this follows US-6.1's refine feature almost exactly: one new
hook (`useScorePrompt`) driving a small state machine, consumed by a trigger component
and a result-view component, both wired into the same two host components that already
host `RefineTrigger`/`RefineDiffView`. No new backend contract, DTO, or client method is
needed — `AiEnhanceClient.score()` already exists and matches the OpenAPI contract. The
one real gap found during planning: the backend's read endpoints don't expose a
persisted `aiScore` field, so — per research.md's decision — this feature keeps the
score in session-only UI state rather than the full persisted-redisplay-on-revisit
behavior the source user story describes; `spec.md` was adjusted to match during this
planning pass.

## Technical Context

**Language/Version**: TypeScript (React 19), matching the existing codebase.

**Primary Dependencies**: React 19, Vite 8, Tailwind CSS v4, React Router 7 (existing —
no new dependency added; see research.md's radar-chart decision).

**Storage**: N/A — frontend-only feature; backend persistence to
`generated_prompts.ai_score` is out of this repo's scope and not exposed by the wired
contract for reads (research.md).

**Testing**: Vitest + Testing Library (jsdom), matching `useRefinePrompt.test.ts` /
`RefineTrigger.test.tsx` / `RefineDiffView.test.tsx`'s existing pattern for this same
feature family.

**Target Platform**: Web SPA (existing `how2prompt-ui`).

**Project Type**: Web application — frontend only for this feature (backend already
ships the `/score` endpoint per `docs/api/openapi.yaml`).

**Performance Goals**: Score result renders within one paint after the API response
lands (SC-001: end-to-end under 30s dominated by AI provider latency, not frontend
rendering); radar chart is a static inline SVG, no animation/layout-thrash concerns.

**Constraints**: No new runtime dependency (research.md); must not regress US-6.1's
refine UI sharing the same host components; must follow the existing light/dark theme
tokens (`rules/web/coding-style.md`'s CSS custom properties, matching
`RefineTrigger.tsx`'s existing color classes).

**Scale/Scope**: 2 new components (`ScoreTrigger`, `ScoreResultView` — the latter
including the radar chart), 1 new hook (`useScorePrompt`), 1 new mock-client method
implementation, wiring into 2 existing host components
(`TemplateGenerateSection.tsx`, `HistoryPromptDetail.tsx`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design below.*

- **I. Dynamic Form Rendering Integrity** — N/A. This feature has no
  template-generation form; it's a read-only result display on an already-generated
  prompt. PASS (not applicable).
- **II. Spec-Before-Code** — spec.md → plan.md (this document) → tasks.md →
  implement, per this repo's speckit chain; requirements sourced from
  `how2prompt-agentic/docs/user-stories/us-6.2-ai-score-a-prompt.md`. PASS.
- **III. Contract & Error Consistency** — `POST /generated-prompts/{id}/score` and its
  `ScoreResult`/`ScoreBreakdown` schemas in `docs/api/openapi.yaml` are followed
  exactly by the existing `AiEnhanceClient.score()` implementation (verified in
  research.md); errors follow the `{ error: { code, message, ... } }` envelope via the
  existing `ApiError`/`apiFetch` machinery, same as `useRefinePrompt.ts`. The one
  documented deviation (session-only score, not persisted-redisplay) is because the
  *read* contract doesn't expose the field — not because this feature invents a
  different shape for the *write* (score) contract itself. PASS, with the gap recorded
  in research.md/spec.md per Principle III's "supersedes... when they disagree" clause
  (the contract, not the older BA narrative, wins).
- **IV. Security Non-Negotiables** — no new auth/credential/secret handling; scoring
  requires the existing bearer-token auth already enforced by `apiFetch`. PASS.
- **V. Verified Before Done** — `oxlint`, `tsc -b && vite build`, and `vitest` must
  pass; the radar chart and disclaimer placement must be manually verified in a running
  browser in both light/dark themes before this feature is reported done (quickstart.md).
  PASS (gate to satisfy during implementation, not a design violation).

No violations requiring the Complexity Tracking table.

## Project Structure

### Documentation (this feature)

```text
specs/015-us6.2-ai-score-prompt/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   └── score-endpoint.md # Phase 1 output (reference — contract already exists)
└── tasks.md              # Phase 2 output (/speckit-tasks — not created by this command)
```

### Source Code (repository root)

```text
src/features/ai-enhance/
├── api/
│   ├── aiEnhanceClient.ts          # unchanged — factory already exposes score()
│   ├── aiEnhanceClient.real.ts     # unchanged — score() already implemented
│   ├── aiEnhanceClient.mock.ts     # unchanged — deterministic score() mock already exists
│   └── aiEnhanceClient.types.ts    # unchanged — ScoreResult/ScoreBreakdown already present
├── hooks/
│   ├── useScorePrompt.ts           # NEW — score flow state machine
│   ├── useScorePrompt.types.ts     # NEW — ScoreFlowState type
│   └── useScorePrompt.test.ts      # NEW
└── components/
    ├── ScoreTrigger.tsx            # NEW — "Score this prompt" button + inline error
    ├── ScoreTrigger.test.tsx       # NEW
    ├── ScoreResultView.tsx         # NEW — radar chart + overall score + suggestions + disclaimer
    ├── ScoreResultView.test.tsx    # NEW
    ├── RadarChart.tsx              # NEW — small reusable inline-SVG 4-axis radar chart
    └── RadarChart.test.tsx         # NEW

src/features/template-generate/components/TemplateGenerateSection.tsx  # MODIFIED — wire useScorePrompt + ScoreTrigger + ScoreResultView
src/features/history/components/HistoryPromptDetail.tsx                # MODIFIED — same wiring
```

**Structure Decision**: Single frontend project (`how2prompt-ui`), feature-first under
`src/features/ai-enhance/` — the same feature module US-6.1 (Refine) already lives in,
since both are Epic 6 (AI Enhancement) actions on the same generated-prompt entity and
share host components. No backend changes (the `/score` endpoint is already shipped and
documented). This mirrors `research.md`'s "one shared hook + trigger, reused across both
surfaces" decision and US-6.1's own precedent.

## Complexity Tracking

*No Constitution Check violations — table intentionally omitted.*
