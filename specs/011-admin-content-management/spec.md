# Feature Specification: Admin & Content Management

**Feature Branch**: `011-admin-content-management`

**Created**: 2026-07-31

**Status**: Draft

**Input**: User description: "Admin & Content Management (Epic 5, Phase 1) — as an Admin, I can manage the platform's shared content and see usage analytics, gated behind the existing RequireAdmin guard: manage AI models (create/edit/view), manage taxonomy (categories/tags, nested), create & publish official templates (is_official=true), view an analytics dashboard. Reference: how2prompt-agentic/docs/user-stories/us-5.1 through us-5.4, agent/BA.md §1.2/§2, docs/design/how2prompt-admin-dashboard-mockup.html. Known backend-contract gaps to flag: no delete endpoint for AI models or categories, no admin tag CRUD/merge endpoints, no signup-to-first-generate conversion metric on DashboardStats."

## Clarifications

### Session 2026-07-31

- Q: Since tag merge is out of scope (no backend endpoint), should tag/category names be enforced unique at creation to prevent the duplicate-tag drift the original design worried about? → A: Enforce case-insensitive unique names for tags, and for categories under the same parent, at creation — reject duplicates with a clear error. (Note: during planning, `docs/api/openapi.yaml` turned out to expose no admin tag creation endpoint at all — see FR-007a — so this uniqueness rule ends up applying to categories only.)
- Q: When two Admins edit the same published template concurrently, how should the conflict be handled? → A: Last-write-wins — the later save overwrites, with no conflict warning.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Manage the AI Model Catalog (Priority: P1)

An Admin keeps the list of supported AI models (ChatGPT, Claude, Gemini, Midjourney, etc.) current — adding new models as providers release them and editing details of existing ones — so the rest of the platform (model-selection dropdowns during template use, template authoring) always reflects reality.

**Why this priority**: Every other admin capability (publishing templates, filtering by model) depends on the model catalog existing and being accurate. Without it, Admins can't finish template setup (US-5.3) and Users see stale or wrong model choices. It's also the simplest of the four stories, making it a natural first slice.

**Independent Test**: Log in as Admin, navigate to the AI model management screen, create a new model, verify it appears immediately in the model-selection dropdown used elsewhere in the app, then edit and deactivate it — all without needing any other Epic 5 capability to be built.

**Acceptance Scenarios**:

1. **Given** I am on the AI model management screen, **When** I create a new model with its display name, provider, type, capabilities, icon, and activation status, **Then** it is saved and immediately available for selection everywhere models are chosen.
2. **Given** an existing model, **When** I edit its details, **Then** the changes are saved and reflected wherever that model is referenced.
3. **Given** a model that is no longer supported, **When** I deactivate it, **Then** it is hidden from new selection while existing template references remain intact.
4. **Given** I am not an Admin, **When** I try to reach the AI model management screen or its actions directly, **Then** I am denied access.

---

### User Story 2 - Organize Categories & Tags (Priority: P1)

An Admin maintains the taxonomy that templates are organized under — categories arranged in a nested hierarchy (e.g., "Marketing" > "Social Media") and a flatter set of tags — so templates stay discoverable and browsing/filtering stays useful as the library grows.

**Why this priority**: Template publishing (US-5.3) and template discovery (Epic 2, already shipped) both depend on a clean taxonomy existing. Category sprawl or mis-nesting directly degrades browse/filter quality for every user, so this is core, not a nice-to-have.

**Independent Test**: Log in as Admin, navigate to the taxonomy management screen, create a nested category, view the existing tags available for template association, and confirm the category changes show up in the public browse/filter UI — independent of AI model or template management being built.

**Acceptance Scenarios**:

1. **Given** I am on the taxonomy management screen, **When** I create a new category and optionally assign it a parent category, **Then** it appears correctly nested in the category tree.
2. **Given** an existing category, **When** I rename it or move it under a different parent, **Then** the tree updates and templates already assigned to it remain correctly associated.
3. **Given** I am on the taxonomy management screen, **When** I view the tag list, **Then** I see the existing tags available for association with templates (tag creation/editing is not part of this screen — see FR-007a).
4. **Given** I am not an Admin, **When** I try to reach the taxonomy management screen or its actions directly, **Then** I am denied access.

---

### User Story 3 - Create & Publish Official Templates (Priority: P1)

An Admin authors a new prompt template end-to-end — title/description in both supported languages, a cover image, category/tag/model associations, the prompt body with its fill-in variables, and optionally per-model variants — saves it as a draft, and then publishes it so it appears to every user as an officially verified template.

**Why this priority**: This is the actual content-creation capability the rest of Epic 5 exists to support, and it's what puts high-quality templates in front of users at launch — the core value proposition of the admin epic. It depends on User Story 1 and 2 (models and taxonomy must exist to associate a template with them) but is independently the highest-value deliverable.

**Independent Test**: Log in as Admin (with at least one AI model and one category/tag already available), create a new template with its prompt body and declared variables, save it as a draft, publish it, and verify it becomes visible and usable by a regular User on the public template library.

**Acceptance Scenarios**:

1. **Given** I am creating a new template, **When** I fill in the title/description (both languages), prompt body, and declare a variable for each `{{placeholder}}` used in the body, **Then** I can save it as a draft without it being visible to non-admins.
2. **Given** a draft template whose prompt body contains a placeholder with no corresponding declared variable, **When** I attempt to publish it, **Then** publishing is blocked and I'm shown which placeholder is missing a variable.
3. **Given** a valid, fully-declared draft template, **When** I publish it, **Then** it is marked as an official, published template and becomes visible to Guests and Users on the public template library.
4. **Given** a template that has already been published, **When** I edit and save it, **Then** a new version is created, the previously published version remains intact and traceable, and users using the older version see an indication a newer one exists.
5. **Given** I am not an Admin, **When** I try to reach the template authoring screen or its actions directly, **Then** I am denied access.

---

### User Story 4 - View the Analytics Dashboard (Priority: P2)

An Admin views a dashboard summarizing platform health and usage — active users over different time windows, prompts generated over time, and the most popular templates and most-used AI models — to understand adoption and guide content/product decisions.

**Why this priority**: Valuable for informed decision-making but purely observational — nothing else in the product depends on it, and it doesn't block Users or Guests from anything. It's the natural last slice to build, and can ship independently of the other three stories once there is data to show.

**Independent Test**: Log in as Admin, navigate to the analytics dashboard, confirm the metrics and charts render, then apply a custom date range and confirm the figures update accordingly — independent of any other Epic 5 story.

**Acceptance Scenarios**:

1. **Given** I navigate to the analytics dashboard, **When** it loads, **Then** I see active-user counts (daily/weekly/monthly), prompts generated over time, the most popular templates, and the most-used AI models.
2. **Given** I am viewing the dashboard, **When** I select a custom date range, **Then** the displayed metrics and charts update to reflect only that period.
3. **Given** the dashboard was loaded recently, **When** underlying activity changes moments later, **Then** the dashboard may show slightly stale figures for a short caching window rather than failing or blocking on a live recalculation.
4. **Given** I am not an Admin, **When** I try to reach the analytics dashboard directly, **Then** I am denied access.

---

### Edge Cases

- What happens when a non-Admin (Guest or authenticated User) navigates directly to any Epic 5 URL? They must be denied access and redirected/shown an appropriate "not authorized" outcome, not a broken page or silent no-op.
- What happens when an Admin submits a template for publishing with a `{{placeholder}}` in the prompt body that has no matching declared variable? Publishing is blocked and the specific missing placeholder is surfaced — draft saving is still allowed.
- What happens when an Admin edits a template that's already published? The edit produces a new version rather than silently overwriting the live one; the previous version stays intact for anyone who generated a prompt from it.
- How does the system handle a very large or deeply nested category tree in the management UI? The tree view must remain usable (e.g., collapsible branches) rather than rendering everything flat and unreadable.
- What happens when the Admin dashboard is requested for a date range with no data? It shows an empty/zero state per metric rather than erroring.
- What happens when an Admin wants to remove an AI model or category entirely (not just deactivate/stop using it)? No such deletion capability is exposed in this feature — see FR-004a and the Assumptions section for why.
- What happens when an Admin tries to create a sibling category whose name matches an existing one under the same parent (case-insensitive)? Creation is rejected with a clear error identifying the conflicting name.
- What happens when an Admin wants to add a new tag that doesn't exist yet? Not possible in this feature — see FR-007a; only Admins with backend/database access can add new tags until the contract exposes an admin tag-creation endpoint.
- What happens when two Admins edit the same published template at the same time? The later save wins (creates the new version); the earlier editor's changes are silently overwritten with no conflict warning.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST restrict every Epic 5 admin screen and action (AI model management, taxonomy management, template authoring/publishing, analytics dashboard) to authenticated users with the Admin role; Guests and authenticated Users MUST be denied access to all of them.
- **FR-002**: System MUST let an Admin create, view, and edit AI model catalog entries, including their name, provider, type, capabilities, default configuration, icon, active/inactive status, and display order.
- **FR-003**: System MUST reflect any AI model change (create, edit, activate/deactivate) immediately in every model-selection control across the app.
- **FR-004**: System MUST let an Admin deactivate an AI model so it is hidden from new selection while existing template references remain intact.
- **FR-004a**: System MUST NOT expose a delete action for AI models or categories in this feature, since no such backend endpoint currently exists (see Assumptions); deactivation is the only removal path for models, and categories are managed via create/edit only. Tags have no create/edit/delete/merge action at all in this feature — see FR-007a.
- **FR-006**: System MUST let an Admin create, view, and edit categories, supporting nested parent/child relationships to an arbitrary depth. Category names MUST be unique (case-insensitive) among siblings under the same parent; creation MUST be rejected with a clear error on a duplicate.
- **FR-007**: System MUST let an Admin view the existing list of tags, so they can be associated with a template during authoring (User Story 3).
- **FR-007a**: System MUST NOT expose tag create, edit, delete, or merge actions in this feature, since no such backend endpoint currently exists (see Assumptions); tag association during template authoring is limited to selecting from already-existing tags.
- **FR-008**: System MUST reflect any category change (create/edit) in the public template browse/filter controls.
- **FR-009**: System MUST let an Admin author a new template: title and description in both supported languages, a cover image, category/tag/model associations, the prompt body with `{{placeholder}}` syntax, and a declared variable (key, label per language, input type, options, validation rules, sort order) for each placeholder used.
- **FR-010**: System MUST let an Admin save a template as a draft that is not visible to Guests or Users.
- **FR-011**: System MUST validate, before allowing publish, that every `{{placeholder}}` in the prompt body has a corresponding declared variable, and MUST block publishing and identify the offending placeholder(s) if not.
- **FR-012**: System MUST let an Admin optionally define a per-AI-model variant of a template's prompt body.
- **FR-013**: Upon successful publish, system MUST mark the template as official and published and make it visible to Guests and Users on the public template library.
- **FR-014**: System MUST create a new version when an Admin edits a template that has already been published, preserving the prior version rather than overwriting it. Concurrent edits by different Admins to the same template follow last-write-wins: the later save creates the new version and no conflict warning is shown to the earlier editor.
- **FR-014a**: System MUST show a user viewing a history entry generated from a template version older than that template's current version a visible indication that a newer version now exists (per User Story 3's Acceptance Scenario 4). **Already satisfied**: `src/features/template-detail/components/TemplateDetailPage.tsx`'s "reload a history item" flow (Epic 4, `specs/010-us4-prompt-history-favorites`) already compares `reloadEntry.templateVersionId` against `template.currentVersion.id` and renders `NewerVersionBadge` when they differ — see Assumptions. No new implementation needed; only test coverage was missing.
- **FR-015**: System MUST let an Admin view an analytics dashboard showing: active users (daily/weekly/monthly), prompts generated over time, most popular templates, and most-used AI models.
- **FR-015a**: System MUST NOT display a signup-to-first-generate conversion metric on the dashboard in this feature, since the backend contract does not currently expose that data point (see Assumptions).
- **FR-016**: System MUST let an Admin filter the analytics dashboard by a custom date range, updating all displayed metrics to that period.
- **FR-017**: System MAY serve analytics dashboard data from a short-lived cache rather than recomputing on every view, provided the staleness window is bounded and does not exceed a few minutes.

### Key Entities

- **AI Model**: A supported AI model/provider entry (e.g., ChatGPT, Claude, Gemini). Attributes: display name, provider, model type, capabilities, default configuration, icon, active/inactive status, display order. Referenced by templates for model-specific variants and by users during prompt generation.
- **Category**: A node in a nested taxonomy tree used to classify templates. Attributes: name, optional parent category. Templates are associated with one or more categories.
- **Tag**: A flat label used to classify templates. Attributes: name, usage count. Templates are associated with zero or more tags; in this feature tags are read-only (selectable during template authoring, not creatable/editable here — see FR-007a).
- **Template**: A reusable prompt definition. Attributes: title/description (per language), cover image, prompt body containing placeholders, official/published status, publish timestamp, associated categories/tags/models. Has one or more versions and, per version, declared variables and optional per-model variants.
- **Template Version**: An immutable snapshot of a template's prompt body and variables at a point in time, created whenever a published template is edited.
- **Template Variable**: A declared input for a template's placeholders. Attributes: variable key, label (per language), input type, options (for choice-based types), validation rules, sort order.
- **Dashboard Metric Snapshot**: The aggregated analytics figures (active users, prompts generated, popular templates, popular models) for a given date range, potentially cached for a bounded period.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: An Admin can add a new AI model and see it available for selection elsewhere in the app in under 1 minute, with no manual refresh or redeploy required.
- **SC-002**: An Admin can build and publish a new official template, from starting a draft to it being live for users, within a single session without needing developer assistance.
- **SC-003**: 100% of attempts by a non-Admin to reach any Epic 5 screen or trigger any Epic 5 action are blocked.
- **SC-004**: 100% of publish attempts with an undeclared placeholder are blocked before the template goes live, with zero broken/unfillable placeholders reaching published templates.
- **SC-005**: An Admin can determine platform-level adoption (active users, generation volume, top templates/models) for any custom date range within a few seconds of selecting it.

## Assumptions

- "Admin" refers to the single system-administrator persona defined in `agent/BA.md` §1.2; the Team Workspace Owner/Admin/Editor/Viewer roles are a later phase and out of scope here.
- `docs/api/openapi.yaml` currently has no delete endpoint for AI models or categories and **no admin tag endpoints of any kind** (create, edit, delete, or merge) — this spec scopes AI model management to create/edit/deactivate, category management to create/edit, and tag handling to read-only selection during template authoring. Tag CRUD/merge and hard deletion of models/categories are deferred until the backend contract adds the corresponding endpoints.
- `docs/api/openapi.yaml`'s `DashboardStats` shape has no signup-to-first-generate conversion metric — the analytics dashboard in this feature omits that figure until the backend contract adds it.
- Editing a published template's metadata-only fields (e.g., cover image, category/tag associations) that don't change the prompt body or variables is treated as version-creating per the same rule as any other edit to a published template, deferring finer-grained distinction to planning if needed.
- The analytics dashboard's caching window is "a few minutes" per the source user story (US-5.4 mentions 5 minutes as an example); the exact duration is a planning-level/non-functional detail, not a business requirement fixed here.
- Cover image upload reuses whatever file-storage mechanism the rest of the platform already uses; no new storage requirement is introduced by this feature.
- Admin role assignment/management itself (how a user becomes an Admin) is out of scope — this feature assumes the Admin role already exists and is assignable through some existing or separate mechanism.
- FR-014a's "newer version available" indicator was already built as part of Epic 4 (`specs/010-us4-prompt-history-favorites`) — `TemplateDetailPage.tsx` fetches the history entry named by its `?reload=<id>` query param, compares its `templateVersionId` against `template.currentVersion.id`, and renders `NewerVersionBadge` when they differ. This `/speckit-analyze` remediation only added the missing colocated test for that comparison; it did not add new production code.
