---
name: database-migrations
description: Use when adding or changing a PostgreSQL table/column/index in how2prompt-api via Flyway. Trigger phrases include "add a migration", "add a new table", "add a column to X", "add an index for X".
---

## Overview

How2Prompt's schema conventions are fixed by `docs/SRS.md` §4.1 — every migration
should follow the same shape as the existing ones, not reinvent conventions per table.

## Conventions

- **Primary key** — `UUID DEFAULT gen_random_uuid()`.
- **Multi-tenancy** — every business table gets a `workspace_id UUID NOT NULL`
  referencing `workspaces(id)`, plus an index on it.
- **Soft-delete** — `deleted_at TIMESTAMPTZ` (nullable), plus a partial index
  (`WHERE deleted_at IS NULL`) if the table is queried by "active rows" often.
- **Audit fields** — `created_at`, `updated_at` (with a trigger to auto-update),
  `created_by` where the actor matters.
- **JSONB** — for genuinely dynamic/schemaless data (i18n, options, validation rules,
  capabilities). Add a GIN index if the JSONB column is filtered or searched.
- **Full-text search** — a `tsvector` column + trigger to keep it updated, plus
  `pg_trgm` if fuzzy match is needed. Don't add a `LIKE '%...%'` query where this
  pattern already applies.
- **Polymorphic references** — `target_type` + `target_id` pairs (used for votes,
  comments, reports), not a separate join table per target type.

## Process

1. Never edit an already-shipped `V__*.sql` migration — always add a new one.
2. Name migrations descriptively: `V{n}__{snake_case_description}.sql`.
3. Add the corresponding index for any new foreign key or frequently-filtered column.
4. If the table needs both an English and Vietnamese label/description, use JSONB
   (`{"en": "...", "vi": "..."}`), matching `docs/SRS.md` §5.5's i18n pattern.
5. Cross-check with `database-reviewer` agent before considering the migration done.

## Output

The migration SQL file, plus a one-line note on what index/constraint decisions were
made and why (so `database-reviewer` and future readers don't have to re-derive it).
