# Java / Spring Boot Guidelines

> Extends `.claude/rules/common/`. For `how2prompt-api` (backend). Stack and constraints
> per `docs/SRS.md` §2.2, §4 — this file operationalizes them as coding rules, it doesn't
> restate the product requirements.

## Stack

Java 21, Spring Boot 3+, Spring Security, Spring Data JPA, Flyway, PostgreSQL 15+,
Redis 7+. REST API with Swagger/OpenAPI docs.

## Style

- Standard Java naming: `PascalCase` classes, `camelCase` methods/fields, `UPPER_SNAKE_CASE` constants.
- Constructor injection only — never field `@Autowired`.
- Layered: `Controller` (request/response mapping + `@Valid` input validation only) ->
  `Service` (business logic, `@Transactional` boundaries) -> `Repository` (Spring Data
  JPA, data access only). Business logic never lives in a controller or an entity.
- Entities are never returned directly from a controller — always map to a DTO.

## Auth (per SRS §2.4, §5.2)

- Stateless JWT: RS256 (asymmetric) signing. Access token 15 min, refresh token 30 days.
- Refresh token stored in an httpOnly cookie on the client side — never in
  localStorage/sessionStorage, and the backend never accepts a refresh token from a
  request body or header on the refresh endpoint.
- Every endpoint requires a valid JWT except `/auth/*`. New endpoints must declare an
  explicit `SecurityFilterChain`/`@PreAuthorize` rule — never rely on a permissive
  default falling through.
- Passwords hashed with BCrypt or Argon2, cost >= 12.
- No API key for any AI provider is ever accepted from or exposed to the client — all
  LLM calls proxy through the backend.

## Data access (per SRS §4.1)

- UUID primary keys (`gen_random_uuid()`).
- Every business table carries `workspace_id` (multi-tenancy) — every repository query
  touching business data filters by it; never trust a `workspace_id` passed from the
  frontend without also checking it against the authenticated user's membership.
- Soft-delete via `deleted_at` — never hard-delete a business-critical row. Add a
  partial index (`WHERE deleted_at IS NULL`) for tables queried by "not deleted"
  frequently.
- Every schema change ships as a new Flyway migration (`db/migration/V__*.sql`) — a
  shipped migration is never edited, only superseded by a new one.
- JSONB for genuinely dynamic data (i18n `{"en": ..., "vi": ...}`, template variable
  options/validation, capabilities) — not for data that's actually relational.

## Resilience (per SRS §5.4)

- Wrap external LLM/provider calls with a circuit breaker (Resilience4j) and a clear
  fallback — never let a provider outage cascade into an unhandled 500.
- Rate limiting via Redis for LLM-calling endpoints.

## Error format (per SRS §4.3)

All error responses use the project's structured envelope:
`{ "error": { "code": "STRING_CODE", "message": "...", "details": {} } }`. Never let a
raw exception/stack trace reach the client.

## Testing

Prefer `@WebMvcTest`/`@DataJpaTest` slices over `@SpringBootTest` for unit-level
coverage — reserve full-context tests for real integration paths. Target: unit test
coverage >= 70% (SRS §5.7). See `.claude/rules/common/testing.md` for the TDD cycle.

## Hooks (opt-in)

Real scripts live at `.claude/hooks/java/format.sh` (format-on-save) and
`.claude/hooks/common/block-destructive.sh` (blocks destructive Bash commands before
they run). Enable them by copying `.claude/settings.example.java.json` to this
project's own `.claude/settings.json` (not synced — machine-local by design).

`format.sh` assumes Maven (`./mvnw`); swap the command inside it for
`./gradlew spotlessApply` if the project uses Gradle instead.
