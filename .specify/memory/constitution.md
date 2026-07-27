<!--
Sync Impact Report
- Version change: 2.0.0 → 3.0.0 → 3.0.1 → 3.0.2
- v3.0.0 — Modified principles:
  - I. Fill-the-Blank Interaction Integrity → REDEFINED as "Dynamic Form Rendering
    Integrity" (backward-incompatible, NON-NEGOTIABLE principle redefinition). The
    how2prompt-agentic submodule replaced docs/epics.md with docs/SRS.md v2.0 +
    docs/use-cases.md + a restructured agent/BA.md. Epic 3 (Prompt Generation Engine)
    now specifies a standard dynamic form rendered from `template_variables` JSONB
    (text/textarea/select/multiselect/number/boolean/slider), not the inline
    fill-in-the-blank pill/Variable Canvas mechanic v2.0.0 treated as the product's
    core, non-negotiable interaction. The existing `InlineBlankForm` pill component
    (already shipped in `src/features/auth`) is downgraded from "the entire product"
    to a pre-existing implementation detail that MUST NOT be extended to new
    template-generation screens.
  - II. Spec-Before-Code — wording only: `docs/epics.md` (removed from the
    submodule) replaced with `docs/SRS.md` §3 + `docs/use-cases.md` +
    `agent/BA.md` §2 as the authoritative requirements source list.
- v3.0.1 — PATCH, found during a cross-check against CLAUDE.md and the actual
  codebase (no MUST-level rule changed, factual corrections only):
  - III. Contract & Error Consistency — rationale referenced "the Axios response
    interceptor's redirect-on-401/refresh-on-TOKEN_EXPIRED behavior", which does not
    exist: the real client is a plain `fetch` wrapper (`httpClient.ts`) with
    `AuthProvider` doing a *proactive* scheduled silent-refresh, not a reactive
    interceptor — CLAUDE.md already documented this correctly. Rationale rewritten
    to match.
  - Technology & Architecture Constraints — the Backend bullet described "Java 17 +
    Spring Boot 3.2.x API Gateway" plus a "Python FastAPI prompt service" using
    LiteLLM/Tenacity. Zero matches for Python/FastAPI/LiteLLM/Tenacity/API Gateway
    in the current submodule docs (SRS.md, BA.md) — this content appears to have
    been copied from `how2prompt-agentic`'s own internal example-service
    constitution, which that submodule's CLAUDE.md explicitly says does not apply to
    consuming projects. Rewritten to match SRS.md §2.2's actual stack (Java 21,
    Spring Boot 3+, Spring Security/Data JPA/Flyway, AI-provider Adapter pattern,
    Redis 7+).
  - Development Workflow — dropped a dangling reference to a `design_style_auth`
    note that doesn't exist in CLAUDE.md; pointed at CLAUDE.md's actual "Visual
    design direction" section instead. Also qualified the bare
    `rules/agent-first-workflow.md` path (doesn't exist at this repo's root) to
    `how2prompt-agentic/rules/agent-first-workflow.md`.
  - Principle I rationale — cited "(Principle III)" for the backend-authoritative
    render claim, but Principle III (Contract & Error Consistency) never states
    that; pointed at `agent/BA.md` US-3.6 instead, the actual source of that rule.
- v3.0.2 — PATCH, found while migrating the frontend to API contract v1.1.0
  (specs/004-auth-contract-migration):
  - III. Contract & Error Consistency — the error-envelope example still quoted
    `trace_id` in snake_case; the v1.1.0 contract (`docs/api/openapi.yaml`) renamed
    every JSON field to camelCase, including this one to `traceId`. Text updated to
    match; no MUST-level rule changed (the envelope's outer shape — `error: { code,
    message, details?, traceId? }` — is unchanged, only that one field's spelling).
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ generic Constitution Check gate, no
    principle-specific text to update
  - .specify/templates/spec-template.md — ✅ no constitution-specific references
  - .specify/templates/tasks-template.md — ✅ no constitution-specific references
  - CLAUDE.md (repo root) — ✅ already updated in a prior change (Product shape /
    Frontend stack / Visual design direction rewritten for the dynamic-form pivot
    and the SRS.md v2.0 epic renumbering); confirmed consistent with this amendment
  - specs/20260724-013957-login-register-ui/* — ⚠ pending manual review: this spec
    predates the pivot and its auth screens still use `InlineBlankForm`; no change
    required unless that spec is reopened, since the redefined Principle I no longer
    mandates extending the pill pattern but does not require removing it either
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): original adoption date is still not recorded anywhere
    in the repo or submodule history; carried over unresolved from v2.0.0.
  - `docs/design/how2prompt-workspace-mockup.html` still shows the old pill/canvas
    catalog and prompt-editor screens and needs to be regenerated against the
    dynamic-form spec before Epic 2/3 UI work starts (tracked in CLAUDE.md, not a
    constitution blocker).
-->

# How2Prompt (how2prompt-ui) Constitution

## Core Principles

### I. Dynamic Form Rendering Integrity (NON-NEGOTIABLE)
Any screen that lets a user fill in a template's inputs (Epic 3 — Prompt Generation
Engine) MUST render its form by reading that template's `template_variables` JSONB
array and emitting one control per declared `input_type` (text, textarea, select,
multiselect, number, boolean, slider), with label/placeholder text sourced from that
variable's i18n JSONB and client-side validation applied from its `validation` config
(min/max/regex/required) per `how2prompt-agentic/agent/BA.md` §2 (US-3.2). The Generate
action MUST stay disabled until every required field is filled. This is the mandatory
pattern for all new template-generation UI; the pre-existing pill/Variable-Canvas
technique (`src/features/auth/components/InlineBlankForm.tsx`) is a legacy
implementation detail confined to the auth screens that already use it and MUST NOT be
extended to template-generation or catalog screens.
Rationale: `how2prompt-agentic/docs/SRS.md` v2.0 §3 (Epic 3) and `agent/BA.md` §2
define the dynamic form as the core MVP mechanic for turning a template into a
rendered prompt — this superseded the earlier fill-in-the-blank pill/canvas design
that v2.0.0 of this constitution mandated. A screen that reinvents its own form
pattern here breaks parity with the backend's authoritative re-render on
`POST /templates/{id}/generate` (per `agent/BA.md` US-3.6) and with every other
template's form.

### II. Spec-Before-Code
No feature implementation proceeds without an approved spec → plan → tasks chain
(`/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`). The
submodule documents — `how2prompt-agentic/docs/SRS.md`, `docs/use-cases.md`,
`agent/BA.md`, and `docs/user-stories/*.md` — are the authoritative requirements
source; `CLAUDE.md` and this constitution summarize them and MUST NOT be treated as
overriding them when they conflict.
Rationale: the BA-authored requirements and the engineering-facing docs are
maintained independently; routing every implementation through the same spec-kit
funnel is what keeps them from silently drifting apart.

### III. Contract & Error Consistency
All backend endpoints live under the `/api/v1/...` namespace. `docs/api/openapi.yaml`
(this repo, provided by Backend) is the authoritative source for the literal wire
contract — request/response shapes, error envelope, endpoint paths — and supersedes
any conflicting shape implied by `agent/BA.md` or an earlier version of this
constitution when they disagree. Every error response MUST serialize as
`{ error: { code, message, details?, traceId? } }` (NOT RFC-7807 `problem+json` —
that was a v1.0.0 assumption the real contract does not follow). Authenticated
requests MUST carry `Authorization: Bearer <access_token>`. `access_token` is
short-lived (15 minutes per the contract); `refresh_token` lives only in an httpOnly
cookie the frontend never reads directly, silently exchanged via `POST /auth/refresh`
token rotation — it is NOT a single long-lived token held in `localStorage`.
Rationale: `AuthProvider`'s proactive silent-refresh (a `setTimeout` scheduled ~60s
before `access_token` expiry, calling `restoreSession()` — see
`src/features/auth/context/AuthProvider.tsx`) and `httpClient.ts`'s `ApiError` parsing
both depend on one predictable error envelope and token lifecycle; an endpoint that
invents its own error shape, or frontend code that assumes a single long-lived token,
silently breaks session restoration for every other screen.

### IV. Security Non-Negotiables
User passwords MUST be hashed with BCrypt before persistence — plaintext or
reversible storage is never acceptable. All traffic carrying JWTs MUST run over
HTTPS. No secrets or credentials are ever committed to the repository.
Rationale: SRS NFR-3 and the org's `security-gate-policy.md` classify credential and
auth handling as Critical severity — a violation here blocks merge with no
exceptions, unlike lower-severity findings that can be scheduled for a later sprint.

### V. Verified Before Done
`oxlint`, the TypeScript build (`tsc -b && vite build`), and `vitest` MUST all pass
before any change is reported complete. UI changes MUST be exercised in a running
browser — a passing type-check is not evidence that a dynamic form's field types,
validation, live preview, or a toast actually behave correctly at runtime.
Rationale: this mirrors the org-wide "before calling something done" rule; for a
form-heavy product driven by per-template JSONB config, the gap between "compiles"
and "renders the right control with the right validation for this template" is
exactly where regressions hide.

## Technology & Architecture Constraints

- **Frontend**: React 19 + TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`),
  React Router 7. Feature-first layout under `src/features/<feature>/pages`; shared
  cross-feature code under `src/shared/{components,hooks,types,utils}`; path alias
  `@` → `src/`.
- **Backend** (per `how2prompt-agentic/docs/SRS.md` §2.2, implemented in a sibling
  service repo — this repo does not own it): Java 21, Spring Boot 3+, Spring
  Security, Spring Data JPA, Flyway migrations; a stateless REST API under
  `/api/v1/...` documented in `docs/api/openapi.yaml`; multi-provider AI calls
  (OpenAI, Anthropic, Google Gemini, Midjourney) go through a backend Adapter
  pattern — the frontend never calls an AI provider directly. PostgreSQL 15+ with
  UUID primary keys (`gen_random_uuid`) throughout; Redis 7+ for
  rate-limiting/session/cache.
- **Session & local state**: `access_token` (15-minute lifetime, per
  `docs/api/openapi.yaml`) held client-side and mirrored into React `AuthContext`;
  `refresh_token` lives only in an httpOnly cookie set by the backend — the frontend
  never reads or stores it directly, and MUST call `POST /auth/refresh` to rotate the
  access token silently rather than treating the session as one long-lived token.

## Development Workflow

- AI-assisted feature work follows the 6-step Agent-First process from
  `how2prompt-agentic/rules/agent-first-workflow.md`: frame intent as user story +
  acceptance criteria (not implementation) → ensure `CLAUDE.md`/context is current →
  get a spec-kit plan approved before code → let the agent implement and self-test →
  review via running tests and the conversation, scanning the diff only for
  anomalies (not line-by-line) → capture evidence (conversation log, PR link,
  attribution) when the project is tracking L2C evidence.
- Design work for any new screen reuses the already-approved visual tokens (cool
  paper neutrals, indigo accent, monospace reserved for placeholder/template motifs)
  rather than introducing a new palette per page — see CLAUDE.md's "Visual design
  direction" section.

## Governance

This constitution supersedes ad hoc conventions for `how2prompt-ui`. Amendments
require: a stated rationale, a version bump under semantic versioning (MAJOR —
backward-incompatible principle removal or redefinition; MINOR — a new principle or
materially expanded guidance; PATCH — wording/clarification only), and a propagation
check against `.specify/templates/*`, the installed `speckit-*` skills, and
`CLAUDE.md` for now-outdated references. Every plan produced via `/speckit.plan` MUST
include a Constitution Check section that verifies the design against the principles
above before task generation proceeds. `CLAUDE.md` remains the place for day-to-day
runtime development guidance; this document governs the non-negotiable constraints
that guidance must not contradict.

**Version**: 3.0.2 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2026-07-27
