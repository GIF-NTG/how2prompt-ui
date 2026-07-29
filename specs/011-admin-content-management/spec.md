# Feature Specification: Admin & Content Management

**Feature Branch**: `011-admin-content-management`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "Implement Epic 5 — Admin & Content Management for the Admin persona, per how2prompt-agentic/docs/user-stories/us-5.1-*.md through us-5.4-*.md and agent/BA.md §2 (US-5.1–5.4): admin CRUD for AI models (us-5.1), admin CRUD for categories and tags with nested taxonomy (us-5.2), create and publish official templates with is_official=true (us-5.3), and an analytics dashboard (us-5.4). Admin-only access per the persona/access matrix in agent/BA.md §1.2 — Guest and User must be blocked from these routes/actions."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Manage the AI Model Catalog (Priority: P1)

An Admin keeps the list of supported AI models (ChatGPT, Claude, Gemini, Midjourney, etc.) current — adding new models as providers release them, editing details of existing ones, and retiring models that are no longer supported — so the rest of the platform (model-selection dropdowns during template use, template authoring) always reflects reality.

**Why this priority**: Every other admin capability (publishing templates, filtering by model) depends on the model catalog existing and being accurate. Without it, Admins can't finish template setup (US-5.3) and Users see stale or wrong model choices. It's also the simplest of the four stories, making it a natural first slice.

**Independent Test**: Log in as Admin, navigate to the AI model management screen, create a new model, verify it appears immediately in the model-selection dropdown used elsewhere in the app, then edit and deactivate it — all without needing any other Epic 5 capability to be built.

**Acceptance Scenarios**:

1. **Given** I am on the AI model management screen, **When** I create a new model with its display name, provider, type, capabilities, icon, and activation status, **Then** it is saved and immediately available for selection everywhere models are chosen.
2. **Given** an existing model, **When** I edit its details, **Then** the changes are saved and reflected wherever that model is referenced.
3. **Given** a model that no templates reference, **When** I attempt to delete it, **Then** it is removed from the catalog.
4. **Given** a model that one or more templates reference, **When** I attempt to delete it, **Then** the deletion is blocked with an explanation, and I am offered deactivation (hiding it from new selection while preserving existing template references) instead.
5. **Given** I am not an Admin, **When** I try to reach the AI model management screen or its actions directly, **Then** I am denied access.

---

### User Story 2 - Organize Categories & Tags (Priority: P1)

An Admin maintains the taxonomy that templates are organized under — categories arranged in a nested hierarchy (e.g., "Marketing" > "Social Media") and a flatter set of tags — so templates stay discoverable and browsing/filtering stays useful as the library grows.

**Why this priority**: Template publishing (US-5.3) and template discovery (Epic 2, already shipped) both depend on a clean taxonomy existing. Tag sprawl (duplicate/near-duplicate tags) directly degrades search and filter quality for every user, so this is core, not a nice-to-have.

**Independent Test**: Log in as Admin, navigate to the taxonomy management screen, create a nested category, create a couple of tags, merge two duplicate-looking tags into one, and confirm the changes show up in the public browse/filter UI — independent of AI model or template management being built.

**Acceptance Scenarios**:

1. **Given** I am on the taxonomy management screen, **When** I create a new category and optionally assign it a parent category, **Then** it appears correctly nested in the category tree.
2. **Given** an existing category, **When** I rename it or move it under a different parent, **Then** the tree updates and templates already assigned to it remain correctly associated.
3. **Given** two tags that represent the same concept (e.g., "email" and "emails"), **When** I merge them, **Then** they become a single tag, its usage count reflects the combined usage, and templates that had either tag now show the merged tag.
4. **Given** a category or tag that is no longer needed and has no templates attached, **When** I delete it, **Then** it is removed from the taxonomy and no longer appears in filter controls.
5. **Given** I am not an Admin, **When** I try to reach the taxonomy management screen or its actions directly, **Then** I am denied access.

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

An Admin views a dashboard summarizing platform health and usage — active users over different time windows, prompts generated over time, the most popular templates and most-used AI models, and how many signups go on to actually generate a prompt — to understand adoption and guide content/product decisions.

**Why this priority**: Valuable for informed decision-making but purely observational — nothing else in the product depends on it, and it doesn't block Users or Guests from anything. It's the natural last slice to build, and can ship independently of the other three stories once there is data to show.

**Independent Test**: Log in as Admin, navigate to the analytics dashboard, confirm the metrics and charts render, then apply a custom date range and confirm the figures update accordingly — independent of any other Epic 5 story.

**Acceptance Scenarios**:

1. **Given** I navigate to the analytics dashboard, **When** it loads, **Then** I see active-user counts (daily/weekly/monthly), prompts generated over time, the most popular templates, the most-used AI models, and the signup-to-first-generate conversion rate.
2. **Given** I am viewing the dashboard, **When** I select a custom date range, **Then** the displayed metrics and charts update to reflect only that period.
3. **Given** the dashboard was loaded recently, **When** underlying activity changes moments later, **Then** the dashboard may show slightly stale figures for a short caching window rather than failing or blocking on a live recalculation.
4. **Given** I am not an Admin, **When** I try to reach the analytics dashboard directly, **Then** I am denied access.

---

### Edge Cases

- What happens when a non-Admin (Guest or authenticated User) navigates directly to any Epic 5 URL? They must be denied access and redirected/shown an appropriate "not authorized" outcome, not a broken page or silent no-op.
- What happens when an Admin tries to delete an AI model, category, or tag that's still referenced by one or more templates? The action is blocked with a clear reason; deactivation (models) or reassignment guidance (taxonomy) is offered as the alternative.
- What happens when an Admin submits a template for publishing with a `{{placeholder}}` in the prompt body that has no matching declared variable? Publishing is blocked and the specific missing placeholder is surfaced — draft saving is still allowed.
- What happens when an Admin edits a template that's already published? The edit produces a new version rather than silently overwriting the live one; the previous version stays intact for anyone who generated a prompt from it.
- What happens when two tags are merged but templates reference both? After merge, those templates show only the single resulting tag (no duplicates), and the merged tag's usage count equals the sum of the two original counts.
- How does the system handle a very large or deeply nested category tree in the management UI? The tree view must remain usable (e.g., collapsible branches) rather than rendering everything flat and unreadable.
- What happens when the Admin dashboard is requested for a date range with no data? It shows an empty/zero state per metric rather than erroring.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST restrict every Epic 5 admin screen and action (AI model management, taxonomy management, template authoring/publishing, analytics dashboard) to authenticated users with the Admin role; Guests and authenticated Users MUST be denied access to all of them.
- **FR-002**: System MUST let an Admin create, view, and edit AI model catalog entries, including their name, provider, type, capabilities, default configuration, icon, active/inactive status, and display order.
- **FR-003**: System MUST reflect any AI model change (create, edit, activate/deactivate) immediately in every model-selection control across the app.
- **FR-004**: System MUST prevent deletion of an AI model that is referenced by any template, and MUST offer deactivation as the alternative in that case.
- **FR-005**: System MUST allow deletion of an AI model that no template references.
- **FR-006**: System MUST let an Admin create, view, edit, and delete categories, supporting nested parent/child relationships to an arbitrary depth.
- **FR-007**: System MUST let an Admin create, view, edit, delete, and merge tags; merging two tags MUST combine their usage counts and reassign all template associations from the removed tag to the surviving one.
- **FR-008**: System MUST reflect any taxonomy change (category or tag create/edit/delete/merge) in the public template browse/filter controls.
- **FR-009**: System MUST let an Admin author a new template: title and description in both supported languages, a cover image, category/tag/model associations, the prompt body with `{{placeholder}}` syntax, and a declared variable (key, label per language, input type, options, validation rules, sort order) for each placeholder used.
- **FR-010**: System MUST let an Admin save a template as a draft that is not visible to Guests or Users.
- **FR-011**: System MUST validate, before allowing publish, that every `{{placeholder}}` in the prompt body has a corresponding declared variable, and MUST block publishing and identify the offending placeholder(s) if not.
- **FR-012**: System MUST let an Admin optionally define a per-AI-model variant of a template's prompt body.
- **FR-013**: Upon successful publish, system MUST mark the template as official and published and make it visible to Guests and Users on the public template library.
- **FR-014**: System MUST create a new version when an Admin edits a template that has already been published, preserving the prior version rather than overwriting it.
- **FR-015**: System MUST let an Admin view an analytics dashboard showing: active users (daily/weekly/monthly), prompts generated over time, most popular templates, most-used AI models, and the signup-to-first-generate conversion rate.
- **FR-016**: System MUST let an Admin filter the analytics dashboard by a custom date range, updating all displayed metrics to that period.
- **FR-017**: System MAY serve analytics dashboard data from a short-lived cache rather than recomputing on every view, provided the staleness window is bounded and does not exceed a few minutes.

### Key Entities

- **AI Model**: A supported AI model/provider entry (e.g., ChatGPT, Claude, Gemini). Attributes: display name, provider, model type, capabilities, default configuration, icon, active/inactive status, display order. Referenced by templates for model-specific variants and by users during prompt generation.
- **Category**: A node in a nested taxonomy tree used to classify templates. Attributes: name, optional parent category. Templates are associated with one or more categories.
- **Tag**: A flat, mergeable label used to classify templates. Attributes: name, usage count. Templates are associated with zero or more tags.
- **Template**: A reusable prompt definition. Attributes: title/description (per language), cover image, prompt body containing placeholders, official/published status, publish timestamp, associated categories/tags/models. Has one or more versions and, per version, declared variables and optional per-model variants.
- **Template Version**: An immutable snapshot of a template's prompt body and variables at a point in time, created whenever a published template is edited.
- **Template Variable**: A declared input for a template's placeholders. Attributes: variable key, label (per language), input type, options (for choice-based types), validation rules, sort order.
- **Dashboard Metric Snapshot**: The aggregated analytics figures (active users, prompts generated, popular templates, popular models, conversion rate) for a given date range, potentially cached for a bounded period.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: An Admin can add a new AI model and see it available for selection elsewhere in the app in under 1 minute, with no manual refresh or redeploy required.
- **SC-002**: An Admin can build and publish a new official template, from starting a draft to it being live for users, within a single session without needing developer assistance.
- **SC-003**: 100% of attempts by a non-Admin to reach any Epic 5 screen or trigger any Epic 5 action are blocked.
- **SC-004**: 100% of publish attempts with an undeclared placeholder are blocked before the template goes live, with zero broken/unfillable placeholders reaching published templates.
- **SC-005**: Duplicate-tag cleanup (merge) reduces the number of distinct tags for a given concept to one, with no loss of template-tag associations, verified on every merge performed.
- **SC-006**: An Admin can determine platform-level adoption (active users, generation volume, top templates/models) for any custom date range within a few seconds of selecting it.

## Assumptions

- "Admin" refers to the single system-administrator persona defined in `agent/BA.md` §1.2; the Team Workspace Owner/Admin/Editor/Viewer roles are a later phase and out of scope here.
- Editing a published template's metadata-only fields (e.g., cover image, category/tag associations) that don't change the prompt body or variables may or may not require a new version; where the source user stories are silent, this spec treats any edit to a published template as version-creating per US-5.3's stated rule, deferring finer-grained distinction to planning if needed.
- Deleting a category or tag that still has templates attached is out of scope for a hard block vs. reassignment-prompt decision here; the edge case above establishes that deletion of an in-use category/tag is guarded, and the exact guard mechanism (block vs. cascade vs. prompt) is a planning-level decision.
- The analytics dashboard's caching window is "a few minutes" per the source user story (US-5.4 mentions 5 minutes as an example); the exact duration is a planning-level/non-functional detail, not a business requirement fixed here.
- Cover image upload reuses whatever file-storage mechanism the rest of the platform already uses; no new storage requirement is introduced by this feature.
- Admin role assignment/management itself (how a user becomes an Admin) is out of scope — this feature assumes the Admin role already exists and is assignable through some existing or separate mechanism.
