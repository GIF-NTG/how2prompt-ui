<!--
Sync Impact Report
- Version change: (none) → 1.0.0
- Modified principles: n/a (initial ratification)
- Added sections: Core Principles (I–V), Technology & Architecture Constraints,
  Development Workflow, Governance
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ already generic ("Gates determined based
    on constitution file"), no edit needed
  - .specify/templates/spec-template.md — ✅ no constitution-specific references found
  - .specify/templates/tasks-template.md — ✅ no constitution-specific references found
  - .claude/skills/speckit-*/SKILL.md — ✅ generic, no agent-specific renaming needed
  - CLAUDE.md (repo root) — ✅ consistent with principles below; no contradictions
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): original adoption date is not recorded anywhere in the
    repo or submodule history; using first-documented date as a placeholder until a
    real ratification date is confirmed.
-->

# How2Prompt (how2prompt-ui) Constitution

## Core Principles

### I. Fill-the-Blank Interaction Integrity (NON-NEGOTIABLE)
Every placeholder/variable-pill surface (the Variable Canvas, and any future screen
that reuses the pattern — e.g. the auth forms already prototyped this way) MUST
measure inline input width via the single hidden-span technique described in
`how2prompt-agentic/agent/BA.md` §4.3 (an off-screen `span` mirroring the typed text
in the same font, `clientWidth` plus a padding buffer, applied to the input). Pills
MUST support `Tab` / `Shift+Tab` navigation between fields. On completion
(`Ctrl+Enter` / "Hoàn thành"), any empty required pill MUST block the action, render a
red highlight, and autofocus the first empty pill.
Rationale: the SRS explicitly rules out AI chat integration and AI-generated templates
as non-goals — the inline fill-in-the-blank mechanic is the entire product, not one
feature among many. A regression here breaks the core value proposition, not a corner
case.

### II. Spec-Before-Code
No feature implementation proceeds without an approved spec → plan → tasks chain
(`/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`). The
submodule documents — `how2prompt-agentic/docs/SRS.md`, `docs/epics.md`,
`agent/BA.md`, and `docs/user-stories/*.md` — are the authoritative requirements
source; `CLAUDE.md` and this constitution summarize them and MUST NOT be treated as
overriding them when they conflict.
Rationale: the BA-authored requirements and the engineering-facing docs are
maintained independently; routing every implementation through the same spec-kit
funnel is what keeps them from silently drifting apart.

### III. Contract & Error Consistency
All backend endpoints live under the `/api/v1/...` namespace. Every error response
MUST serialize as RFC-7807 `problem+json`: `{ type, title, status, detail, instance,
error_code }` (see `agent/BA.md` §4.2 for the canonical `UNAUTHORIZED_ACCESS` and
`LLM_PROVIDER_ERROR` examples). Authenticated requests MUST carry
`Authorization: Bearer <token>`, with JWTs issued for a 7-day expiry.
Rationale: the Axios response interceptor's redirect-on-401 behavior and the
Spring Boot Gateway → FastAPI prompt-service routing both depend on one predictable
error envelope; an endpoint that invents its own error shape silently breaks the
interceptor for every other screen.

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
browser — a passing type-check is not evidence that an auto-resizing pill, a
command-palette shortcut, or a toast actually behaves correctly at runtime.
Rationale: this mirrors the org-wide "before calling something done" rule; for a
keyboard-first, interaction-heavy product the gap between "compiles" and "feels
right" is exactly where regressions hide.

## Technology & Architecture Constraints

- **Frontend**: React 19 + TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`),
  React Router 7. Feature-first layout under `src/features/<feature>/pages`; shared
  cross-feature code under `src/shared/{components,hooks,types,utils}`; path alias
  `@` → `src/`.
- **Backend** (per SRS/BA, implemented in sibling service repos): Java 17 + Spring
  Boot 3.2.x acting as the API Gateway, following a strict
  Controller → Service → Repository → Entity dependency direction with
  `@Transactional` on every write-path service method; a Python FastAPI prompt
  service for LLM optimization calls, using LiteLLM plus Tenacity-based exponential
  backoff (max 3 attempts) for transient upstream failures; PostgreSQL 15.x with
  UUID primary keys throughout.
- **Session & local state**: JWT persisted in `localStorage` and mirrored into React
  `AuthContext`; unauthenticated draft progress is also persisted to `localStorage`,
  keyed by template UUID.

## Development Workflow

- AI-assisted feature work follows the 6-step Agent-First process from
  `rules/agent-first-workflow.md`: frame intent as user story + acceptance criteria
  (not implementation) → ensure `CLAUDE.md`/context is current → get a spec-kit plan
  approved before code → let the agent implement and self-test → review via running
  tests and the conversation, scanning the diff only for anomalies (not line-by-line)
  → capture evidence (conversation log, PR link, attribution) when the project is
  tracking L2C evidence.
- Design work for any new screen reuses the already-approved visual tokens (cool
  paper neutrals, indigo accent, monospace reserved for placeholder/template motifs)
  rather than introducing a new palette per page — see the `design_style_auth`
  design-direction note referenced from `CLAUDE.md`.

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

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2026-07-24
