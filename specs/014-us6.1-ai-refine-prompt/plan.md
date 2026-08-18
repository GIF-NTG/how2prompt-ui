# Implementation Plan: AI Refine a Prompt

**Branch**: `014-us6.1-ai-refine-prompt` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-us6.1-ai-refine-prompt/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add a reusable "Refine with AI" flow (diff view + Accept / Edit manually / Reject) for
a logged-in, email-verified User's generated prompt, per US-6.1
(`how2prompt-agentic/docs/user-stories/us-6.1-ai-refine-a-prompt.md`). The wire contract
(`POST/DELETE /generated-prompts/{id}/refine`, `POST /generated-prompts/{id}/refine/accept`)
and the API client (`src/features/ai-enhance/api/aiEnhanceClient.*`) already exist from
prior contract-integration work — this is a frontend-only feature that builds the UI on
top of that client and wires it into the two surfaces that already display a generated
prompt's final text: the post-generation result (`template-generate`) and the history
detail expansion (`history`).

## Technical Context

**Language/Version**: TypeScript ~6.0, React 19

**Primary Dependencies**: existing `aiEnhanceClient` (`src/features/ai-enhance/api/`),
existing `useAuth`/`AuthProvider` (session + `emailVerified`), `lucide-react` icons
(already used by `GenerateActions`/`HistoryPromptDetail`) — no new runtime dependencies

**Storage**: N/A on the frontend — the refined text is held in transient UI state
(`Refinement Result`, per spec.md's Key Entities) until accepted/rejected; the backend
persists `generated_prompts.ai_refined`/`final_prompt` out of scope for this repo

**Testing**: Vitest + Testing Library (jsdom), mirroring `GenerateActions.test.tsx` /
existing `history` component test patterns

**Target Platform**: Web (Vite SPA), same as rest of the project

**Project Type**: Web frontend (single Vite/React app, no separate backend in this repo)

**Performance Goals**: Loading state must cover the documented 5–26s provider
round-trip (SC-001) without appearing frozen; diff view render itself is instant
(client-side only, no extra network round-trip beyond the refine call)

**Constraints**: Refine action must never be reachable for a `null` `generatedPromptId`
(guest generations) or an unverified session (FR-002); only one refine request in
flight per prompt at a time (FR-003); must not alter the existing Epic 3 generate flow
or Epic 4 history flow beyond adding this action and updating displayed `finalPrompt`
on accept

**Scale/Scope**: 1 new component-level module (`src/features/ai-enhance/components/` +
1 hook), 2 integration edits (`TemplateGenerateSection.tsx`, `HistoryPromptDetail.tsx`
call site in `HistoryList.tsx`) — API client layer already exists, not touched here
except for direct consumption

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Dynamic Form Rendering Integrity** — N/A. This feature adds no template-input
  form; it acts on an already-generated prompt's final text. PASS.
- **II. Spec-Before-Code** — this plan follows an approved spec.md sourced from
  `how2prompt-agentic/docs/user-stories/us-6.1-ai-refine-a-prompt.md`. PASS.
- **III. Contract & Error Consistency** — all calls go through the existing
  `aiEnhanceClient`, itself built on `apiFetch`/`httpClient.ts` (shared envelope/error/
  auth handling, untouched); endpoints and error codes sourced from
  `docs/api/openapi.yaml`'s "AI Enhancement" tag (see contracts/ai-refine.md). PASS.
- **IV. Security Non-Negotiables** — no new auth/credential handling; refine requires
  the existing Bearer token flow and is additionally gated client-side on
  `session.emailVerified` (defense-in-depth alongside the backend's own check). PASS.
- **V. Verified Before Done** — `npm run lint`, `tsc -b && vite build`, and
  `npm run test` must pass, and quickstart.md's browser scenarios must be exercised,
  before this feature is reported complete. Tracked for the implement phase.

No violations. Complexity Tracking table not needed.

## Project Structure

### Documentation (this feature)

```text
specs/014-us6.1-ai-refine-prompt/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── ai-refine.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── ai-enhance/                             # EXISTING (API client layer already wired)
│   │   ├── api/aiEnhanceClient.*                # unchanged, consumed as-is
│   │   ├── hooks/
│   │   │   └── useRefinePrompt.ts               # NEW: refine/accept/discard state machine
│   │   └── components/
│   │       ├── RefineTrigger.tsx                # NEW: "Refine with AI" button + inline error message
│   │       └── RefineDiffView.tsx               # NEW: original vs refined diff + explanations + Accept/Edit/Reject
│   ├── template-generate/
│   │   └── components/TemplateGenerateSection.tsx  # MODIFIED: render refine flow below GenerateActions
│   └── history/
│       └── components/HistoryPromptDetail.tsx      # MODIFIED: render refine flow below Copy button
```

**Structure Decision**: Single Vite/React SPA (no separate backend in this repo). New
work is a small self-contained addition to the already-existing `ai-enhance` feature
module (hook + 2 presentational components), following the same
hook-drives-state/component-renders-it split already used by `useGenerateForm` +
`GenerateActions`. Two existing call sites get additive edits, not rewrites.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| --------------------------- | ------------------ | ------------------------------------- |
| N/A                         | N/A                 | N/A                                    |
