# Java / Spring Boot Guidelines

> Extends `.claude/rules/common/`. For `backend/` (Spring Boot API).

## Style

- Standard Java naming: `PascalCase` classes, `camelCase` methods/fields, `UPPER_SNAKE_CASE` constants.
- Constructor injection over field injection (`@Autowired` on fields) — makes dependencies explicit and testable.
- Keep controllers thin: request/response mapping and validation only; business logic belongs in a service layer.

## Data access

- Parameterized queries / JPA repository methods only — never string-concatenated JPQL/SQL.
- Migrations (Flyway/Liquibase) for every schema change; never hand-edit a deployed schema.

## Testing

`@SpringBootTest` sparingly (slow, full context) — prefer `@WebMvcTest`/`@DataJpaTest` slices for unit-level coverage, reserve full-context tests for real integration paths. See `.claude/rules/common/testing.md` for the TDD cycle and coverage bar.

## Hooks (opt-in, wire into this project's own `.claude/settings.json`)

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Write|Edit", "command": "mvn -q com.spotify.fmt:fmt-maven-plugin:format" }
    ]
  }
}
```

Swap for `./gradlew spotlessApply` if the project uses Gradle instead of Maven.
