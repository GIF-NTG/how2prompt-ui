# Feature Specification: Align Current UI With Approved Design Mockup

**Feature Branch**: `006-align-ui-with-design-mockup`

**Created**: 2026-07-28

**Status**: Draft

**Input**: User description: "sửa lại giao diện hiện tại theo đúng thiết kế trong docs.design"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Catalog page matches the approved design (Priority: P1)

A visitor (guest or signed-in member) opens the template catalog (home page) and
sees search, filter chips, the AI-model selector, the Featured rail, the Trending
rail, and the full template grid rendered with the exact colors, typography, and
spacing approved in the design reference — not an approximation improvised during
implementation.

**Why this priority**: The catalog is the highest-traffic screen (the app's landing
page for both guests and members) and is where the current visual drift from the
design is most visible.

**Independent Test**: Load the catalog page in light and dark themes and compare it
directly against `docs/design/how2prompt-workspace-mockup.html`'s catalog view;
every card, chip, badge, and section header must match the reference's color
tokens, typography, and spacing.

**Acceptance Scenarios**:

1. **Given** the catalog page is open, **When** it renders the "Chính thức"
   official-template badge, **Then** the badge's case, color, background, and
   typography match the design reference exactly (no unapproved transformation
   such as forced uppercase).
2. **Given** the catalog page is open, **When** the user switches between light and
   dark theme, **Then** every element continues to use the design reference's
   color tokens for that theme.

---

### User Story 2 - Template detail page matches the approved design (Priority: P2)

A user opens a template's detail page and sees the hero (title, description,
category badges), supported-model tags, usage guide, example output, and the
meta/actions area (usage count, favorite, generate entry point) styled exactly as
shown in the design reference.

**Why this priority**: The detail page is the second most-visited screen and the
entry point into prompt generation; visual inconsistency here undermines trust in
the product right before the core action.

**Independent Test**: Open a template's detail page in light and dark themes and
compare each section against the design reference's template-detail view.

**Acceptance Scenarios**:

1. **Given** a template detail page is open, **When** it renders the model tags and
   usage guide, **Then** their layout, spacing, and colors match the design
   reference.
2. **Given** the detail page is open for a guest, **When** the page renders the
   meta/actions area, **Then** the visual style matches the reference while the
   existing sign-in-gated behavior (e.g., favorite toggle) is unchanged.

---

### User Story 3 - Shared navigation shell matches the approved design (Priority: P3)

Any user navigating between screens sees a consistent top navigation bar (logo,
"Thư viện" / "Lịch sử" links, guest "Đăng nhập" link or signed-in
avatar/name/"Hồ sơ"/"Đăng xuất") styled per the design reference on every page that
uses it.

**Why this priority**: The nav shell wraps every screen, so any drift here repeats
across the whole app; fixing it once yields the broadest consistency gain, but it's
lower priority than the two content-heavy screens above.

**Independent Test**: Compare the rendered top navigation bar (both guest and
signed-in states, both themes) against the design reference's topbar.

**Acceptance Scenarios**:

1. **Given** a guest is on any page, **When** the top navigation bar renders,
   **Then** its structure and styling match the design reference's guest state.
2. **Given** a signed-in user is on any page, **When** the top navigation bar
   renders, **Then** its structure and styling match the design reference's
   signed-in state.

---

### Edge Cases

- What happens when a template's title, description, or category list is longer
  than the content shown in the design reference's examples? The layout must
  degrade gracefully (wrap/truncate) using the same rules implied by the
  reference's card proportions, without breaking the grid or overlapping text.
- How does the restyled catalog/detail UI behave when the OS or in-app theme
  toggle is set to dark mode? Every restyled element must resolve to the
  reference's dark-theme token values, not the light-theme values.
- How does the restyled UI behave for a guest (no session) versus a signed-in
  user on the same screen? Only presentation changes; existing auth-gated
  behavior (e.g., favorite toggle visibility) must continue to function exactly
  as it does today.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The catalog page (search box, category/tag filter chips, AI-model
  selector, Featured rail, Trending rail, full template grid) MUST match the
  layout, spacing, and visual style shown for the catalog view in
  `docs/design/how2prompt-workspace-mockup.html`.
- **FR-002**: The template detail page (hero, category badges, supported-model
  tags, usage guide, example output, meta/actions area) MUST match the layout and
  visual style shown for the template-detail view in the design reference.
- **FR-003**: The shared top navigation bar MUST match the design reference's
  structure and styling for both the guest state and the signed-in state, and
  MUST render consistently across every screen that includes it.
- **FR-004**: Every badge, pill, and tag (e.g., the "Chính thức" official badge,
  category/tag chips, model tags) MUST use the exact text case, color, background,
  and typography defined by the design reference — the implementation MUST NOT
  apply a transformation (such as forcing uppercase) that the reference does not
  apply.
- **FR-005**: Monospace typography MUST be used only where the design reference
  uses it (placeholder/template-token content, badges, meta labels) and MUST NOT
  be introduced elsewhere in the restyled screens.
- **FR-006**: All restyled screens MUST use the design reference's color tokens
  (ink / ink-soft / ink-faint / accent / accent-soft / surface / line / danger and
  their dark-theme equivalents) for every default, hover, active, and focus state,
  in both light and dark theme.
- **FR-007**: The restyle MUST NOT change existing functional behavior — routing,
  data fetching, search/filter behavior, favorite toggling, auth-gated visibility,
  and guest quotas MUST behave exactly as they do before this change; only visual
  presentation is in scope.
- **FR-008**: Screens not yet implemented in the application (e.g., the History
  screen) and screens already confirmed to match the design (the auth screens:
  Login/Register/Forgot/Reset) are out of scope for this change.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A side-by-side visual comparison of the catalog page against the
  design reference (light and dark theme) shows zero discrepancies in color,
  spacing, or typography for every component the reference covers.
- **SC-002**: A side-by-side visual comparison of the template detail page against
  the design reference (light and dark theme) shows zero discrepancies in color,
  spacing, or typography for every component the reference covers.
- **SC-003**: The shared top navigation bar visually matches the design reference
  in both guest and signed-in states, verified on every screen that renders it.
- **SC-004**: 100% of existing automated tests continue to pass after the restyle,
  confirming no functional regression was introduced while changing presentation.

## Assumptions

- `docs/design/how2prompt-workspace-mockup.html` is the current approved source of
  truth for visual design, per `docs/design/README.md`; that README's note marking
  the catalog/detail screens as "design-only" is stale now that those screens are
  implemented under `src/features/home` and `src/features/template-detail` — this
  feature restyles the existing implementation to match the reference rather than
  building new screens from it.
- The History screen (Epic 4) has not been implemented yet and is therefore out of
  scope; the top navigation bar's "Lịch sử" link styling is still in scope even
  though the page it points to doesn't exist yet.
- The auth screens (Login/Register/Forgot/Reset) already match the design
  reference per the README and are excluded from this change's scope unless a
  reviewer later finds drift.
- Underlying functional/business logic (favorite-toggle gating, guest quotas,
  search/filter behavior, routing) is unchanged — this is a presentation-only
  alignment, not a behavior change.
- Where the design reference is genuinely silent on a state or component the real
  app needs (e.g., a loading skeleton), the nearest existing pattern in the
  reference (its token set and spacing scale) is used rather than introducing a
  new visual language.
