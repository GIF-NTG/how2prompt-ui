# Research: Fix API field casing mismatch

No open `NEEDS CLARIFICATION` markers came out of the spec — this is a scoped rename
refactor against an already-documented contract (`docs/api/openapi.yaml`). Research
here is limited to confirming exact field names and surfacing edge cases discovered
while reading the schema.

## Decision: Source of truth for field names

- **Decision**: `docs/api/openapi.yaml` component schemas `TemplateListItem`,
  `TemplateDetail`, `TemplateVersion`, `TemplateVariable`, `AuthorBrief`, `Category`,
  `Tag`, `AiModel` are the exact, case-sensitive field names to rename to.
- **Rationale**: Constitution Principle III (Contract & Error Consistency) already
  designates this file as authoritative for the wire contract; CLAUDE.md repeats this.
- **Alternatives considered**: Adding a runtime camelCase transform in `httpClient.ts`
  (rejected — spec's Assumptions section and the original request explicitly keep
  `apiFetch` untouched; a transform layer is a new abstraction the task didn't ask
  for and would mask future contract drift instead of surfacing it in types).

## Decision: No structural (non-casing) schema fixes in this change

Reading the schemas surfaced two mismatches beyond simple casing:

1. `TemplateVersion.version` (current FE type) vs. the contract's
   `TemplateVersion.versionNumber` — a different word, not a casing variant.
2. `tags` is declared on `TemplateListItem` in the current FE type (and used by the
   mock client's tag filter), but in `docs/api/openapi.yaml` `tags` only exists on
   `TemplateDetail` (via `allOf` extension of `TemplateListItem`) — not on the list
   item itself.

- **Decision**: Leave both as-is in this change; do not rename `version` →
  `versionNumber` and do not move `tags` off `TemplateListItem`.
- **Rationale**: The spec (and the original request) scopes this fix to snake_case →
  camelCase casing corrections and explicitly says not to change any other UI/logic
  behavior. `tags` living on the list item is load-bearing for the mock client's
  existing tag-filter behavior (`templateClient.mock.ts`); moving it would be a
  behavior/shape change, not a casing fix, and risks breaking catalog filtering.
  `version` → `versionNumber` is a real latent bug against the actual backend, but
  it's a rename of substance, not case, so it's called out here as a known follow-up
  rather than silently rolled into a "pure casing" change.
- **Alternatives considered**: Fixing both now since they'll also cause undefined
  values against a real backend (rejected for this change — flagging as a follow-up
  keeps this change reviewable as a pure, mechanical rename; a reviewer scanning the
  diff for "just casing" would otherwise have to separately verify a structural
  change).
- **Follow-up**: File a separate fix for `TemplateVersion.version` →
  `TemplateVersion.versionNumber` and for `TemplateDetail.tags` placement once this
  casing fix lands, ideally verified against a real backend response rather than
  guessed from the schema alone (the mock client's tag-filter behavior needs to be
  re-derived from `TemplateDetail.tags`, not `TemplateListItem.tags`, if changed).

## Decision: Rename mechanically, do not introduce a transform layer or codemod tooling

- **Decision**: Perform the rename by hand across types, real/mock clients,
  consuming components, and tests — no new dependency, no automated codemod script.
- **Rationale**: The affected surface is 13 files (already enumerated), small enough
  for a direct edit; introducing tooling for a one-time rename is disproportionate
  and against the project's "don't add abstractions beyond what's needed" convention.
- **Alternatives considered**: `ts-morph`/jscodeshift codemod (rejected — one-time,
  small surface, adds a dependency for no lasting value).
