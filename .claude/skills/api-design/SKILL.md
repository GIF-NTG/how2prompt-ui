---
name: api-design
description: Use when designing or reviewing a new REST endpoint, request/response DTO, or error response for how2prompt-api. Trigger phrases include "design an endpoint for X", "what should this API look like", "add a new route".
---

## Overview

How2Prompt's API conventions are fixed by `docs/SRS.md` §4.3 — don't invent a new
shape per endpoint. Apply these before proposing or reviewing any endpoint.

## Conventions

1. **Base path** — everything under `/api/v1`.
2. **Auth** — `Authorization: Bearer <access_token>` header on every endpoint except
   `/auth/*`.
3. **Payload** — JSON, `snake_case` field names.
4. **Pagination** — cursor-based for long lists: `?cursor=...&limit=20`, never
   offset-based for a list that can grow large.
5. **Error envelope** — always this shape, never a bare message or a raw stack trace:
   ```json
   { "error": { "code": "STRING_CODE", "message": "Human readable", "details": {} } }
   ```
6. **Filtering** — query params for filters (`?category=writing,marketing&model=...`),
   not a POST body for a read operation.

## Process

1. Check `docs/SRS.md` §4.3 for an existing endpoint pattern this new one should match
   (naming, verb choice, response shape) before inventing one.
2. Define the request/response DTO with explicit types (Pydantic-equivalent strictness
   on the Java side: Bean Validation annotations, no raw `Map`/`Object` payloads).
3. Enumerate error cases up front (validation failure, not found, forbidden, conflict,
   rate-limited) and map each to a specific `error.code` — don't leave error handling
   as an afterthought.
4. Cross-check against `.claude/rules/common/security.md` if the endpoint touches auth,
   payment, or user-supplied content.

## Output

A concrete endpoint spec: method + path, request DTO, response DTO (success + each
error case), and the authorization rule that applies.
