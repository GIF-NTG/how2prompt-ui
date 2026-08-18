# Feature Specification: AI Refine a Prompt

**Feature Branch**: `014-us6.1-ai-refine-prompt`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "epic 6" — scoped to **US-6.1: AI Refine a Prompt** (see
`how2prompt-agentic/docs/user-stories/us-6.1-ai-refine-a-prompt.md`), the first of Epic 6
(AI Enhancement)'s five stories. Wire contract already documented in
`docs/api/openapi.yaml` ("AI Enhancement" tag) and the API client layer
(`src/features/ai-enhance/api/aiEnhanceClient.*`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask AI to refine a generated prompt (Priority: P1)

A logged-in, email-verified User who has just generated a prompt (or is viewing one from
their history) wants a clearer, more effective version without manually rewriting it.
They click "Refine with AI" and see a side-by-side comparison of their original prompt
and the AI-refined version, with bullet-point explanations of what changed.

**Why this priority**: This is the core value of the story — without it, nothing else
in this feature has anything to act on. It's independently demonstrable even before
Accept/Reject exist.

**Independent Test**: Generate (or open from history) a prompt as a verified user, click
"Refine with AI", and verify a diff view renders showing the original prompt, the
refined prompt, and a list of explanations.

**Acceptance Scenarios**:

1. **Given** I am a verified, logged-in User viewing a generated prompt, **When** I
   click "Refine with AI", **Then** the system shows a loading state, then a diff view
   with my original prompt and the refined version side by side, plus explanations of
   the changes.
2. **Given** the refine request is in flight, **When** I look at the "Refine with AI"
   control, **Then** it is disabled/shows a loading state so I cannot fire a second
   refine request on the same prompt while one is running.
3. **Given** I am not email-verified, **When** I view the same prompt, **Then** the
   "Refine with AI" action is unavailable and, if attempted, I'm directed to verify my
   email first.

---

### User Story 2 - Accept the refined version (Priority: P2)

Having reviewed the refined result, the User accepts it as their new final prompt so it
replaces the original everywhere the prompt's final text is shown (e.g. copy, history).

**Why this priority**: This is what makes the refine result actually useful — without
Accept, User Story 1 is read-only and delivers no lasting change.

**Independent Test**: With a refine result on screen (from US1), click "Accept" and
verify the prompt's displayed/copyable final text is now the refined version, and the
diff view closes.

**Acceptance Scenarios**:

1. **Given** I am viewing a refined result, **When** I click "Accept", **Then** the
   prompt's final text is replaced with the refined version and the diff view closes.
2. **Given** I have accepted a refinement, **When** I look at the prompt afterward (e.g.
   in history), **Then** it shows the refined text as the final prompt, not the original.

---

### User Story 3 - Edit before accepting, or reject and keep the original (Priority: P3)

Having reviewed the refined result, the User either hand-edits the refined text before
accepting it, or discards it entirely and keeps their original prompt unchanged.

**Why this priority**: Rounds out the control users need over an AI suggestion they
don't want to accept as-is; valuable but the feature is still usable without it (users
can always accept-as-is or just not click Refine).

**Independent Test**: With a refine result on screen, edit the refined text and accept —
verify the final prompt matches the edited text, not the AI's original output. Separately,
click "Reject" — verify the final prompt is unchanged from before refine was requested.

**Acceptance Scenarios**:

1. **Given** I am viewing a refined result, **When** I edit the refined text and then
   click "Accept", **Then** the prompt's final text becomes my edited text, not the
   AI's unedited suggestion.
2. **Given** I am viewing a refined result, **When** I click "Reject", **Then** the
   pending refinement is discarded and the prompt's final text is unchanged from before
   I clicked "Refine with AI".

---

### Edge Cases

- **Daily quota exhausted**: refine request fails with a quota-exceeded error → show a
  message that today's AI Refine allowance is used up (resets the next day), not a retry
  button.
- **Too many requests in a short window**: fails with a rate-limited error → show a
  message and allow retry after a short delay.
- **Provider timeout** (round-trips observed 5–26s in testing): show a retryable timeout
  message rather than failing silently or hanging indefinitely.
- **Provider unavailable**: show a retryable message with a longer suggested wait than
  the timeout case.
- **Provider safety filter rejects the input/output**: show a message asking the user to
  rephrase their prompt; do not offer a bare retry, since retrying the same input will
  fail the same way.
- **Navigating away or refreshing while a refine result is pending (not yet
  accepted/rejected)**: the pending refinement is not persisted client-side across a
  reload — the user sees the original prompt again and must click "Refine with AI" again
  if they still want it. (The backend also has no state to resume: the pending
  refinement only exists in the response the client already received.)
- **Clicking "Refine with AI" again on the same prompt after a previous refinement was
  accepted or rejected**: allowed — starts a fresh refine cycle from the (possibly now
  updated) final prompt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST offer a "Refine with AI" action on any generated prompt
  that belongs to the current logged-in, email-verified User.
- **FR-002**: The system MUST NOT offer (or MUST block) the refine action for
  unauthenticated (guest) users and for logged-in users whose email is not verified,
  directing the latter to the email-verification flow.
- **FR-003**: When refine is requested, the system MUST show a first-class loading state
  (not a brief spinner) for the duration of the request, and MUST prevent a second
  concurrent refine request on the same prompt while one is in flight.
- **FR-004**: On a successful refine response, the system MUST display the original
  prompt and the refined prompt in a side-by-side (or otherwise clearly comparable) diff
  view, along with the list of explanations returned.
- **FR-005**: Users MUST be able to accept the refined version as-is, causing it to
  become the prompt's final text.
- **FR-006**: Users MUST be able to hand-edit the refined text before accepting it, with
  the edited text (not the AI's original suggestion) becoming the prompt's final text.
- **FR-007**: Users MUST be able to reject the refined result, leaving the prompt's
  final text unchanged from before the refine request.
- **FR-008**: After Accept or Reject, the system MUST close the diff view and return to
  showing the prompt in its normal (non-comparison) presentation.
- **FR-009**: The system MUST surface each of the documented refine error conditions
  (quota exceeded, rate limited, timeout, provider unavailable, content filtered) with a
  distinct, actionable message per the Edge Cases above — never a generic failure message
  for these known cases.
- **FR-010**: The refine action MUST be available both immediately after generating a
  prompt and later when revisiting that prompt from history, since both surfaces show
  the same persisted generated prompt.

### Key Entities

- **Generated Prompt** (existing): the prompt a User previously generated from a
  template; refine operates on its persisted final text, identified by its id.
- **Refinement Result** (transient, not persisted client-side beyond the current
  session): the original prompt text, the AI-refined text, and a list of plain-language
  explanations of what changed — held only in UI state until the user accepts or rejects.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A verified, logged-in User can go from clicking "Refine with AI" to seeing
  a reviewable diff result in under 30 seconds in the overwhelming majority of requests
  (matching observed provider latency), with no more than one visible loading state
  transition.
- **SC-002**: 100% of the five documented refine failure conditions (quota, rate limit,
  timeout, unavailable, content-filtered) present the user with a distinct, correctly
  worded message rather than a generic error.
- **SC-003**: Users can accept, edit-then-accept, or reject a refinement in a single
  additional action (one click, or one edit + one click) after the diff view appears —
  no multi-step confirmation flow.
- **SC-004**: Refining, accepting, editing, or rejecting a prompt never produces a
  final prompt text that differs from what the user explicitly chose (the AI's
  suggestion as-is, the user's edited version, or the original) — verified by
  comparing displayed final text to the action taken in each acceptance scenario.

## Assumptions

- **No paid-tier upsell**: the source user story (`us-6.1-ai-refine-a-prompt.md`)
  describes a Free/Pro quota split (5 vs 100 refines/day) with a `402 Payment Required` +
  upgrade prompt on exhaustion. This project has no billing/subscription system yet
  (Team Workspace & Billing is an explicit Phase 4 item, out of scope — see this
  project's `CLAUDE.md`), and the actual wired contract
  (`docs/api/openapi.yaml`, `AI_QUOTA_EXCEEDED` → `429`) already reflects a single quota
  with no upgrade path. This spec follows the real contract: on quota exhaustion, show a
  "used up for today, resets tomorrow" message with no upgrade CTA.
- **No pre-flight quota check**: there is no endpoint exposing the user's remaining
  refine quota, so the "Refine with AI" control is always shown enabled to an eligible
  user; quota exhaustion is only discovered by attempting the action and handling the
  `AI_QUOTA_EXCEEDED` response.
- **Single pending refinement at a time**: a generated prompt can have at most one
  pending (not yet accepted/rejected) refinement in flight or on screen at a time,
  matching the backend's `NO_PENDING_REFINEMENT` error semantics for accept/reject
  called with nothing pending.
- **Refine surfaces**: this story's UI lives wherever a generated prompt's final text is
  already shown to its owner — the post-generation result view and the history detail
  view — reusing one shared refine interaction rather than building two separate ones.
