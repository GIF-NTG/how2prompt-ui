# Feature Specification: AI Score a Prompt

**Feature Branch**: `015-us6.2-ai-score-prompt`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "us 6.2" — **US-6.2: AI Score a Prompt** (see
`how2prompt-agentic/docs/user-stories/us-6.2-ai-score-a-prompt.md`), the second of Epic 6
(AI Enhancement)'s five stories. Wire contract already documented in
`docs/api/openapi.yaml` (`POST /generated-prompts/{id}/score`, `ScoreResult`,
`ScoreBreakdown` schemas) and the API client layer
(`src/features/ai-enhance/api/aiEnhanceClient.*`, added alongside US-6.1's refine flow).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Score a generated prompt (Priority: P1)

A logged-in User who has just generated a prompt (or is viewing one from their history)
wants an objective read on its quality before using it, without having to judge it
themselves. They click "Score this prompt" and, after a short wait, see a radar chart
across four quality criteria plus a list of concrete suggestions for improving it.

**Why this priority**: This is the entire value of the story — without it there is
nothing else to build for this feature.

**Independent Test**: Generate (or open from history) a prompt as a logged-in user,
click "Score this prompt", and verify a radar chart renders with exactly four axes
(clarity, specificity, context, format), an overall score, and a non-empty suggestions
list.

**Acceptance Scenarios**:

1. **Given** I am a logged-in User viewing a generated prompt, **When** I click "Score
   this prompt", **Then** the system shows a loading state, then a radar chart with the
   four criteria, an overall score, and a list of improvement suggestions.
2. **Given** the score request is in flight, **When** I look at the "Score this prompt"
   control, **Then** it is disabled/shows a loading state so I cannot fire a second
   score request on the same prompt while one is running.
3. **Given** a score result is displayed, **When** I view it, **Then** a disclaimer
   reading "AI assessment for reference only" (or the localized equivalent) is visible
   directly alongside the score, not just on first load.

---

### User Story 2 - Keep the score visible while reviewing the same prompt (Priority: P2)

Having scored a prompt, the User keeps reviewing it (e.g. switching between the prompt
text and other actions on the same screen) without the score disappearing or needing to
be re-requested, since nothing about the prompt's final text changed in between.

**Why this priority**: Prevents wasted AI calls and a needless loading state for a score
the user already has on screen; the feature is still usable without it (the user could
just re-score), but losing the score on every incidental re-render would be annoying.
See the Assumptions section — full persistence across a page reload / new visit is not
currently achievable with the wired contract and is out of scope for this story.

**Independent Test**: Score a prompt, interact with other controls on the same detail
view (e.g. copy the prompt), and verify the score result stays rendered without a new
loading state or AI call.

**Acceptance Scenarios**:

1. **Given** I have a score result on screen for a prompt, **When** I interact with
   other unrelated controls on the same view, **Then** the radar chart, overall score,
   suggestions, and disclaimer remain visible without re-fetching.
2. **Given** a score result is already on screen, **When** I click "Score this prompt"
   again, **Then** the system requests a fresh score and replaces the displayed result
   with the new one on success.

---

### Edge Cases

- **Malformed or unparseable LLM response**: the backend fails to parse the scoring
  response into valid JSON → the frontend shows a distinct "couldn't score this prompt"
  error message with a retry option, not a raw parse error or a crash.
- **Score request fails for a transient reason** (timeout, provider unavailable, rate
  limited): show a retryable error message consistent with how other AI Enhancement
  actions in this app surface these conditions (see US-6.1's refine error handling),
  rather than a generic failure message.
- **Navigating away or refreshing while a score request is in flight**: on return, the
  prompt shows no score (or its last persisted score, if any) rather than a stuck loading
  state — the in-flight request is not resumed.
- **Prompt has no score yet**: the "Score this prompt" action is available and no radar
  chart/disclaimer is shown until a score exists.
- **Scoring the same prompt twice in a row**: allowed — the newer result replaces the
  older one both on screen and in what gets persisted.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST offer a "Score this prompt" action on any generated prompt
  that belongs to the current logged-in User, on both the post-generation result view and
  the history detail view.
- **FR-002**: When scoring is requested, the system MUST show a first-class loading state
  for the duration of the request, and MUST prevent a second concurrent score request on
  the same prompt while one is in flight.
- **FR-003**: On a successful score response, the system MUST render a radar chart with
  exactly four axes — clarity, specificity, context, format — each on a 0–10 scale.
- **FR-004**: On a successful score response, the system MUST display the overall score
  and the list of improvement suggestions returned alongside the radar chart.
- **FR-005**: The system MUST always display the disclaimer "AI assessment for reference
  only" (localized) directly alongside any rendered score — it MUST NOT be omittable or
  shown only once per session.
- **FR-006**: While a score result is on screen, the system MUST keep it rendered across
  incidental interactions with other controls on the same view (e.g. copying the prompt)
  without re-fetching or losing the result.
- **FR-007**: Re-running "Score this prompt" on an already-scored prompt MUST replace the
  previously displayed score with the new result on success.
- **FR-008**: The system MUST surface a malformed/unparseable scoring response as a
  distinct, actionable error state (message + retry), never as an unhandled crash or a
  silently blank result.
- **FR-009**: The system MUST surface transient score-request failures (timeout,
  provider unavailable, rate limited) with a retryable, actionable message.

### Key Entities

- **Generated Prompt** (existing): the prompt a User previously generated from a
  template; scoring operates on its persisted final text, identified by its id.
- **Score Result** (transient, held only in UI state for the current view session — see
  Assumptions): four 0–10 criterion scores (clarity, specificity, context, format), an
  overall score, and a list of plain-language improvement suggestions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A logged-in User can go from clicking "Score this prompt" to seeing a
  rendered radar chart in under 30 seconds in the overwhelming majority of requests, with
  no more than one visible loading state transition.
- **SC-002**: 100% of rendered score results display all four criteria, an overall score,
  the suggestions list, and the disclaimer together — never a partial render missing one
  of these elements.
- **SC-003**: While a score result is on screen, incidental interaction with other
  controls on the same view never triggers an additional AI call or a loading state for
  the already-displayed score.
- **SC-004**: 100% of malformed-response and transient-failure cases produce a specific,
  actionable error message rather than a generic failure or a crash.

## Assumptions

- **Score is session-only, not persisted-and-refetched by the frontend (contract gap)**:
  the source user story says the backend persists to `generated_prompts.ai_score` and
  expects it "re-displayed when revisiting the prompt from history," but the wired
  contract's read endpoints (`GeneratedPromptListItem`/`GeneratedPromptDetail` in
  `docs/api/openapi.yaml`) do not expose an `aiScore` field, and `POST
  /generated-prompts/{id}/score`'s `ScoreResult` is returned only in direct response to
  a score request. The backend may well persist the score server-side, but the frontend
  has no documented way to read it back on a later visit. Same pattern as this project's
  Epic 5 admin gaps (see `CLAUDE.md`): scoped out and tracked, not silently dropped.
  User Story 2 above is written to match what's actually achievable today (score stays
  visible for the current view session); revisit this once the backend adds the field.
- **No email-verification gate**: unlike US-6.1 (Refine), the source user story for
  scoring does not mention an email-verification requirement, and the wired contract
  (`POST /generated-prompts/{id}/score`) has no such restriction documented. This spec
  makes scoring available to any logged-in owner of the prompt, verified or not.
- **Guest users are out of scope**: scoring requires viewing a persisted generated
  prompt tied to a User account; guests (who generate anonymously, capped at 3/day/IP)
  have no persisted prompt to revisit or score against, so this action is not offered to
  them.
- **Overall score is server-computed**: the frontend treats `overall` from `ScoreResult`
  as authoritative and does not derive it client-side from the four criteria, since the
  contract does not document the aggregation formula.
- **Single persisted score per prompt**: a generated prompt has at most one current
  score at a time (the most recent), matching `ai_score` being a single JSONB column
  rather than a history of scores.
