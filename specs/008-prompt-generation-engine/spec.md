# Feature Specification: Prompt Generation Engine

**Feature Branch**: `008-prompt-generation-engine`

**Created**: 2026-07-28

**Status**: Draft

**Input**: User description: "cho Epic 3" (Epic 3 — Prompt Generation Engine, per
`how2prompt-agentic/docs/SRS.md` §3 and `how2prompt-agentic/agent/BA.md`
US-3.1–US-3.6)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Fill in a template's inputs through a guided form (Priority: P1)

A visitor who has decided to use a template (from its detail page) selects the
AI model they're targeting and fills in a form built specifically from that
template's declared inputs — one control per input, with the right control
type, current-language labels/help text, and validation — so they always
provide exactly what that template needs, in a format the template's author
intended.

**Why this priority**: This is the entry point into the entire feature —
nothing else in Epic 3 is reachable without it, and it's the step where a
user's effort investment begins.

**Independent Test**: Open any published template, select a target model, fill
every required input, and confirm the "Generate" action becomes available only
once every required input is valid — independent of preview or generation
actually running.

**Acceptance Scenarios**:

1. **Given** a visitor is on a template's detail page, **When** they choose to
   use that template, **Then** they see one input control per field the
   template declares, matching each field's declared type (short text, long
   text, single choice, multiple choice, number, yes/no, range).
2. **Given** a template supports more than one AI model, **When** the visitor
   selects a different target model, **Then** the form reflects that model's
   specific version of the template if one exists (otherwise the template's
   default).
3. **Given** a template supports only one AI model, **When** the form loads,
   **Then** no model choice is presented — it's selected automatically.
4. **Given** a required input is left empty or fails its declared validation
   (range, pattern, length), **When** the visitor tries to proceed,
   **Then** the "Generate" action stays unavailable until the input is
   corrected.

---

### User Story 2 - See the prompt take shape while filling the form (Priority: P1)

While filling in the form, the visitor sees a live preview of the resulting
prompt update immediately as they type or change any field, so they can judge
whether their inputs produce what they want before committing to generate.

**Why this priority**: This is what makes the form-filling experience
trustworthy — without it, a visitor fills in a black box and only discovers
mistakes after generating. It's independently valuable and testable on top of
User Story 1 alone.

**Independent Test**: Fill in and change form fields one at a time and confirm
the preview text reflects each change immediately, with unfilled required
fields visibly distinguished from filled ones.

**Acceptance Scenarios**:

1. **Given** the visitor changes any form field's value, **When** the change
   is applied, **Then** the preview text updates to reflect it without
   requiring any extra action.
2. **Given** a field the template requires is still empty, **When** the
   preview renders, **Then** that unfilled spot is visually distinguishable
   from the surrounding filled text.
3. **Given** the visitor is composing a long prompt, **When** the preview
   renders, **Then** an approximate length/size indicator is shown alongside
   it.

---

### User Story 3 - Generate the final prompt and copy it (Priority: P1)

Once every required input is valid, the visitor generates the final prompt,
sees the authoritative result, and copies it to use in their AI tool of
choice — with the generation automatically kept for the visitor's own record
if they're signed in.

**Why this priority**: This is the payoff of the whole feature — without it,
Epic 3 produces a form and a preview but never actually delivers the thing the
visitor came for.

**Independent Test**: With a fully valid form, trigger generation and confirm
a final prompt is displayed and can be copied, independent of how the preview
was implemented.

**Acceptance Scenarios**:

1. **Given** every required input is valid, **When** the visitor generates the
   prompt, **Then** the system produces the authoritative final prompt (the
   same rendering logic every other visitor's generation uses, not just
   whatever the live preview showed) and displays it.
2. **Given** a prompt has just been generated, **When** the visitor clicks
   "Copy", **Then** the prompt text is copied and a confirmation is shown.
3. **Given** a signed-in member generates a prompt, **When** generation
   succeeds, **Then** it is automatically kept in that member's own history
   with no extra action from them.
4. **Given** a guest (not signed in) generates a prompt, **When** generation
   succeeds, **Then** the prompt is returned to them but is not tied to any
   account.
5. **Given** a guest has already generated the maximum number of prompts
   allowed per day, **When** they attempt another generation, **Then** they
   see a clear message explaining the limit and how to get more (creating an
   account).

---

### User Story 4 - Add free-form instructions on top of the template (Priority: P2)

Before generating, the visitor can optionally add their own free-form
instructions that get appended to the template's structured output, so they
can customize a result slightly without needing a completely different
template.

**Why this priority**: Valuable but not required for the feature's core value
— a visitor can already get a correctly generated prompt without it (User
Stories 1–3 alone are a complete, shippable slice).

**Independent Test**: Generate a prompt with the free-form field left empty
(unaffected output) and again with text entered (text appears appended to the
result).

**Acceptance Scenarios**:

1. **Given** the visitor types into the optional "additional instructions"
   field, **When** they generate the prompt, **Then** that text appears in
   the final result appended to the template's own content.
2. **Given** the visitor leaves the field empty, **When** they generate,
   **Then** the result is unaffected by it.

---

### Edge Cases

- What happens if the visitor switches the target AI model after already
  filling in some inputs? Already-entered values that still apply to the new
  model's version of the form are preserved; the visitor isn't forced to
  start over unless the new model's template genuinely lacks that field.
- What happens if generation fails on the system's side (an internal
  rendering error)? The visitor sees a clear, generic error message and can
  retry — no partial or corrupted result is shown as if it succeeded.
- What happens if the visitor's session expires or their connection drops
  between filling the form and generating? The attempt fails gracefully with
  a retry path; already-entered form values are not lost from the visitor's
  screen.
- What happens if the visitor pastes or types content into the free-form
  instructions field that resembles a prompt-injection attempt (e.g., trying
  to override the template's own instructions)? The system treats it as
  literal appended text, not as instructions to itself.
- What happens when a guest is close to but under their daily limit? They can
  still generate; the limit is only enforced at the point they'd exceed it.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST render one input control per field a template
  declares, matching each field's declared type (short text, long text,
  single choice, multiple choice, number, yes/no, range), with label and help
  text in the visitor's current language.
- **FR-002**: System MUST apply each field's declared validation (required,
  min/max, pattern) client-side, and MUST keep the "Generate" action
  unavailable until every required field is valid.
- **FR-003**: When a template supports more than one AI model, the system
  MUST let the visitor choose the target model and MUST use that model's
  specific version of the template if one exists, falling back to the
  template's default form otherwise. When a template supports exactly one
  model, the system MUST select it automatically without prompting.
- **FR-004**: System MUST update a live preview of the resulting prompt
  immediately whenever a form value changes, visually distinguishing any
  still-unfilled required spot from filled content, and MUST show an
  approximate size indicator alongside the preview.
- **FR-005**: System MUST let the visitor add optional free-form additional
  instructions that are appended to the template's own content in the final
  result, without affecting the result when left empty.
- **FR-006**: System MUST treat the live preview as advisory only — the final
  prompt the visitor receives after generating MUST come from the same
  authoritative rendering process used for every generation, not from
  whatever the client-side preview happened to compute.
- **FR-007**: System MUST NOT allow generation to be triggered while any
  required field is invalid or empty.
- **FR-008**: System MUST let the visitor copy the generated prompt with a
  single action and MUST confirm the copy succeeded.
- **FR-009**: System MUST automatically retain a signed-in member's generated
  prompt as part of their own history, with no additional action required
  from the member.
- **FR-010**: System MUST allow guests (not signed in) to generate prompts
  without an account, up to a limited number of generations per day, and MUST
  show a clear, actionable message once that limit is reached.
- **FR-011**: System MUST show a clear, generic error and allow retry when
  generation fails on the system's side, without ever presenting a failed or
  partial result as if it had succeeded.
- **FR-012**: System MUST preserve already-entered form values that still
  apply when the visitor switches the target AI model, rather than clearing
  the whole form.

### Key Entities _(include if feature involves data)_

- **Template Variable**: One declared input a template needs (its type,
  label/help text per language, and validation rules) — already defined by
  the template the visitor chose; this feature reads and renders it, it does
  not create or edit template variables.
- **Model Variant**: An optional per-AI-model override of a template's
  content, used when the visitor's chosen model needs different phrasing than
  the template's default.
- **Generated Prompt**: The authoritative output of one generation attempt —
  the final prompt text, which inputs produced it, which model it targeted,
  and (for signed-in members) whose history it belongs to.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A visitor with no prior exposure to a template can go from
  opening its detail page to holding a copied, correctly generated prompt in
  under 2 minutes for a typical (under 6-field) template.
- **SC-002**: 100% of generation attempts with an invalid or incomplete
  required field are blocked before reaching the system — no invalid attempt
  is ever submitted.
- **SC-003**: The live preview reflects a form change with no perceptible
  delay and without any network round trip.
- **SC-004**: 100% of successful generations by signed-in members are saved
  to their history automatically, with zero additional steps required.
- **SC-005**: 100% of guests who exceed their daily generation limit see a
  clear explanation and a path to remove the limit (creating an account),
  rather than a generic failure.

## Assumptions

- This feature builds on top of the already-shipped, read-only template
  detail page (`005-view-template-details`) and the catalog browsing work
  (`004-home-catalog-browse`, `007-catalog-pagination-and-filters`) — it adds
  the "use this template" experience those pages currently stop short of, per
  `docs/design/README.md`'s note that catalog/detail already exist but
  template-generation itself does not yet.
- The backend's rendering/generation endpoint and its request/response
  contract, including the guest daily-limit mechanism, already exist as
  documented in `docs/api/openapi.yaml` — this feature is the frontend
  consumer of that contract, not a redesign of it.
- "Template Variable" field types and validation rules are exactly the set
  already defined by `how2prompt-agentic/agent/BA.md` §2 (US-3.2) and
  Constitution Principle I (Dynamic Form Rendering Integrity): text,
  textarea, select, multiselect, number, boolean, slider — no new field types
  are introduced by this feature.
- Where the visitor entry point into this feature lives exactly (e.g.,
  whether the existing template detail page grows a "Use template" action
  that reveals this form, versus a separate screen) is an implementation
  decision for planning, not a scope question — either satisfies "a visitor
  who has decided to use a template" in User Story 1.
- History review/reload (viewing, filtering, re-running past generations) is
  Epic 4 and out of scope here; this feature's only obligation toward history
  is that a successful generation by a signed-in member gets saved (FR-009),
  not how it's later browsed.
