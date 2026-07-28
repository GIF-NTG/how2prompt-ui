# Feature Specification: View Template Details

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Build the template detail page (route: /templates/:slug) for US-2.4 (View Template Details) from Epic 2. The page must be READ-ONLY — displaying the description, usage guide, example output, supported AI models, and usage count. Strictly follow the design patterns in how2prompt-workspace-mockup.html. Reuse existing Domain Models from src/shared/types/models.ts and UI elements (badges, typography, buttons) established in the Home feature. Must be fully responsive, support Dark Mode, and include error handling (404, loading states). OUT OF SCOPE: Dynamic form rendering, real-time preview, form validation, generate prompt action (Epic 3)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Guest or User views template details (Priority: P1)

A visitor (authenticated or not) clicks a template card on the catalog page and
arrives at the template detail page. The page displays the template's full
information in read-only mode: its title, description, category, usage guide,
example output, supported AI models, and usage count. The page is purely
informational — no form interaction, no prompt generation.

**Why this priority**: The detail page is the bridge between discovering a template
(Epic 2) and understanding what it does. Without it, users cannot view template
information. It is the most-visited page after the catalog.

**Independent Test**: Can be fully tested today by navigating to
`/templates/{slug}` and verifying all sections render correctly — using mocked
template data until the real API is available.

**Acceptance Scenarios**:

1. **Given** a visitor clicks a template card on the catalog, **When** the detail
   page loads, **Then** they see a back-link ("← Quay lại thư viện"), a page
   head with the template's category eyebrow badge, title, and description.
2. **Given** the detail page has loaded, **When** the visitor views the page, **Then**
   they see an AI model selector display showing the template's supported models
   as tag pills (e.g., "GPT-4o", "Claude").
3. **Given** the detail page has loaded, **When** the visitor views the content
   area, **Then** they see a usage guide section explaining how to use the
   template, and an example output section showing a sample generated prompt.
4. **Given** the detail page has loaded, **When** the visitor views the metadata
   area, **Then** they see the template's total usage count (formatted with
   locale-aware number formatting, e.g., "482 lượt dùng").
5. **Given** a guest (not signed in) views the detail page, **When** the page
   renders, **Then** all template information is visible but the favorite toggle
   is hidden.
6. **Given** a signed-in user views the detail page, **When** they view the
   metadata area, **Then** they see a favorite toggle button (heart icon).
7. **Given** a signed-in user clicks the favorite toggle, **When** the click
   registers, **Then** the favorite state updates via the API and a toast
   confirmation is shown ("Đã thêm vào Yêu thích" or "Đã bỏ Yêu thích").
8. **Given** a visitor navigates to `/templates/{slug}` with a slug that does not
   match any template, **When** the page attempts to load, **Then** a 404 Not Found
   state is displayed with a message and a link back to the catalog.
9. **Given** a visitor navigates to `/templates/{slug}` and the data is loading,
   **When** the page is in the loading state, **Then** a skeleton or loading indicator
   is displayed in place of all content sections.
10. **Given** the detail page loads successfully, **When** the page finishes
    rendering, **Then** the template's `view_count` is incremented by one (as a
    background side-effect, not blocking the page render).

---

### Edge Cases

- What happens when a visitor navigates to `/templates/` (no slug) or
  `/templates/undefined`? → The application shows a 404 Not Found page.
- What happens when the API returns an error while loading template data? → A
  generic error state is displayed with a retry option and a link back to the
  catalog.
- What happens when a signed-in user clicks favorite while offline? → The
  favorite toggle shows the previous state; a toast indicates the action failed.
- What happens when a template is soft-deleted while a visitor is viewing it? →
  The next navigation to the page shows a 404 state.
- What happens when the `view_count` increment request fails? → The page renders
  normally; the failed increment is silently ignored (analytics-only, not
  user-facing).
- What happens when a template has only one supported AI model? → The model tag
  display shows a single pill.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The detail page MUST be accessible at the route `/templates/:slug`.
  The slug parameter is used to resolve the template (not the template ID).
- **FR-002**: The page MUST display a back-link ("← Quay lại thư viện") at the
  top of the page that navigates the visitor back to the catalog page.
- **FR-003**: The page MUST display a page head with an eyebrow badge showing the
  template's primary category tag (e.g., "#debugging"), the template title, and
  the template's short description as a lede paragraph.
- **FR-004**: The page MUST display the template's supported AI models as tag
  pills (e.g., "GPT-4o", "Claude") below the page head.
- **FR-005**: The page MUST display a usage guide section explaining how to use
  the template. The guide is rendered from the template's `current_version`
  guide text.
- **FR-006**: The page MUST display an example output section showing a sample
  generated prompt. The example is rendered from the template's
  `current_version` example output field.
- **FR-007**: The page MUST display the template's total usage count (formatted
  with locale-aware number formatting, e.g., "482 lượt dùng").
- **FR-008**: For signed-in users, the page MUST display a favorite toggle button
  (heart icon). Clicking it toggles the favorite state via the API and shows a
  toast confirmation. For guests, the favorite toggle MUST be hidden.
- **FR-009**: The template's `view_count` MUST be incremented as a background
  side-effect when the detail page loads successfully. The increment MUST NOT
  block page rendering or show any visible indicator to the visitor.
- **FR-010**: When a template is not found (invalid slug), the page MUST display a
  404 Not Found state with a message and a link back to the catalog.
- **FR-011**: When the API returns an error during data loading, the page MUST
  display a loading skeleton or spinner during the loading phase, and an error
  state with retry option if the load fails.
- **FR-012**: The page MUST render correctly in both light and dark presentation
  modes, using the project's approved color tokens (cool paper neutrals, indigo
  accent).
- **FR-013**: The page MUST use standard boxed UI elements (badges, tag pills,
  typography) — consistent with the Home feature's established patterns.
- **FR-014**: The detail page MUST be fully responsive. On viewports narrower than
  860px, the layout MUST stack vertically with no horizontal scrolling.

### Key Entities

- **Template**: A public prompt template identified by slug. Contains a title,
  description, category/tag associations, AI model compatibility list, official
  status, usage count, favorite count, and view count. This is the primary
  entity the detail page displays.
- **TemplateVersion**: A specific version of a template's prompt body, guide, and
  example output. The detail page displays `current_version` (the latest
  published version) for the guide and example output sections.
- **AI Model**: A target AI model (e.g., GPT-4o, Claude, Gemini). The detail page
  displays model compatibility as tag pills.
- **Favorite**: A per-user association between a signed-in user and a template.
  Only available to authenticated users. Toggling is a client-side action that
  calls the API.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A visitor can go from clicking a template card on the catalog to
  seeing the fully loaded detail page (title, description, guide, example,
  models, usage count) within 2 seconds under normal network conditions.
- **SC-002**: A visitor using a mobile device (viewport < 860px) sees the detail
  page in a single-column stacked layout with all sections accessible without
  horizontal scrolling.
- **SC-003**: The 404 state appears within 500ms of navigating to an invalid
  template slug, with a clear message and a working link back to the catalog.
- **SC-004**: The loading skeleton appears within 200ms of the page starting to
  load template data, providing immediate visual feedback.
- **SC-005**: Template detail content is readable and interactive in both light
  and dark presentation modes, with no text or control becoming illegible.

## Assumptions

- The route for the detail page is `/templates/:slug` (slug-based, not ID-based).
  The backend resolves the template by slug and returns the full detail object.
- The template's `current_version` is always the latest published version. There
  is no version selector on the detail page — visitors always see the current
  version.
- This feature is strictly read-only. No form rendering, no prompt generation,
  no live preview — those belong to Epic 3 (out of scope).
- The `view_count` increment is a server-side side-effect of viewing the
  template. The frontend fires a single background request; no debouncing or
  deduplication is needed at the page level.
- All displayed copy (labels, section headers, empty states, badges, error
  messages) is in Vietnamese, consistent with the approved mockup and project
  conventions.
- The detail page reuses the existing UI component patterns from the Home
  feature: official badge, model tag pills, favorite toggle, toast notification,
  and the standard typography scale. No new design tokens are introduced.
