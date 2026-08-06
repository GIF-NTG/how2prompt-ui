# Feature Specification: Translate App Text to English

**Feature Branch**: `012-translate-app-to-english`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "Chuyển toàn bộ text của ứng dụng sang tiếng anh" (Translate all of the application's text to English)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Browse and generate prompts in English (Priority: P1)

As a user (guest or registered) browsing the template catalog, viewing a template's
detail page, and filling out the dynamic generate form, I see all labels, buttons,
badges, placeholders, and messages in English, so the product experience is
consistent regardless of the visitor's language.

**Why this priority**: This is the highest-traffic, guest-accessible core flow
(Epic 2 Discovery + Epic 3 Generation) — any leftover Vietnamese text here is the
most visible and most frequently encountered.

**Independent Test**: Load the home/catalog page, open a template detail page, and
run through the generate form; every visible string (including badges like
"Official", usage counts, favorite toggle labels, filters, empty/loading states)
reads in English.

**Acceptance Scenarios**:

1. **Given** the home/catalog page is loaded, **When** a user views a template
   card, **Then** all card text (official badge, usage count, favorite
   button label/aria-label) is in English.
2. **Given** a template detail page is open, **When** the user reads the page,
   **Then** all headings, metadata labels, and banners (e.g. reload-unavailable,
   newer-version) are in English.
3. **Given** the generate form is rendered for a template, **When** the user
   interacts with fields, previews, and actions, **Then** all field labels,
   validation messages, preview text, and action buttons are in English.

---

### User Story 2 - Manage account in English (Priority: P2)

As a user going through authentication (login, register, forgot/reset password,
verify email) and profile settings, I see all instructions, field labels, and
error/success messages in English.

**Why this priority**: Auth is required for every registered-user journey but is
lower traffic than browsing/generation, and mistakes here are less visible to
guests.

**Independent Test**: Walk through login, register, forgot/reset password, email
verification, and profile settings screens; confirm no Vietnamese text appears in
any state (including validation and error messages).

**Acceptance Scenarios**:

1. **Given** the login or register page, **When** a user submits invalid input,
   **Then** validation and error messages are shown in English.
2. **Given** the email verification banner or page, **When** it is displayed in
   any of its states, **Then** all text is in English.
3. **Given** the profile settings page, **When** the user views or edits their
   profile, **Then** all labels and confirmation/error messages are in English.

---

### User Story 3 - Manage history, favorites, and admin content in English (Priority: P3)

As a registered user reviewing prompt history/favorites, and as an admin managing
AI models, taxonomy, templates, and the analytics dashboard, I see all UI text in
English.

**Why this priority**: History/favorites and admin screens are used less
frequently (history by regular users only, admin by a small internal audience),
so they are addressed last.

**Independent Test**: Open the history and favorites pages, and each admin page
(AI models, taxonomy, templates, dashboard); confirm no Vietnamese text remains,
including dialog/confirmation text and chart labels.

**Acceptance Scenarios**:

1. **Given** the history page, **When** a user filters, reloads, or deletes a
   history record, **Then** all filter labels, empty states, and confirmation
   dialogs are in English.
2. **Given** an admin page (AI models, taxonomy, templates, dashboard), **When**
   an admin performs CRUD actions or views analytics, **Then** all form labels,
   table headers, dialogs, and chart labels are in English.

---

### Edge Cases

- Text that originates from the real backend API (e.g. actual template titles/
  descriptions stored in the database) is out of scope — this feature only covers
  static UI copy and local mock data owned by the frontend, not live content.
- Automated tests that currently assert on the literal Vietnamese strings must be
  updated so they keep passing against the new English strings; a test still
  passing while checking for the old Vietnamese text would hide a missed
  translation.
- Strings assembled from concatenation or pluralization logic must read grammatically
  correct in English (not a word-for-word translation of Vietnamese sentence
  structure).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: All static, user-facing UI text currently in Vietnamese (labels,
  headings, buttons, placeholders, tooltips, `aria-label`s, badges, empty/loading
  states, and success/error/validation messages) MUST be replaced with English
  text that preserves the original meaning.
- **FR-002**: Local mock API client data (e.g. mock templates, categories, tags,
  dashboard content) used for local/dev builds MUST also be in English wherever it
  represents content shown directly in the UI.
- **FR-003**: Existing automated tests that assert on Vietnamese text MUST be
  updated to assert on the corresponding new English text so the test suite keeps
  passing and still verifies the same behavior.
- **FR-004**: The translation MUST NOT change any application behavior, layout,
  or logic — only text content changes.
- **FR-005**: English replacement text MUST be consistent in tone and terminology
  with the English strings already present in the app (e.g. existing button/label
  wording patterns), so the UI does not read as mixed-style after translation.
- **FR-006**: Code comments, identifiers, and non-user-facing content are out of
  scope for this feature (per project convention they are already written in
  English); only user-facing copy is in scope.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A full scan of the frontend source finds zero remaining Vietnamese
  text in user-facing UI strings.
- **SC-002**: 100% of existing automated tests pass after the translation, with no
  test left asserting on Vietnamese text.
- **SC-003**: Manually walking every screen in the app (home/catalog, template
  detail, generate, history, favorites, auth, admin) shows only English text in
  every state (default, loading, empty, error, success).

## Assumptions

- Dynamic content returned by the real backend API at runtime is outside this
  feature's scope; only frontend-owned static strings and local mock data are
  translated.
- No new localization/i18n framework (e.g. react-i18next) is being introduced by
  this feature. The app already has a minimal existing `I18nString { en, vi }` +
  `getI18nValue` mechanism for template/category names and descriptions; this
  feature fixes that mechanism to resolve to English rather than replacing it,
  and does a one-time in-place replacement of all other hardcoded Vietnamese
  strings with hardcoded English strings.
- Target language variant is standard English matching the tone of the app's
  existing English copy (concise, product-appropriate).
- The `how2prompt-agentic` submodule's documentation (SRS, use cases, BA spec) is
  out of scope — this feature covers this repo's application UI only.
