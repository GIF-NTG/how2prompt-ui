---
name: springboot-patterns
description: Use when implementing a new Spring Boot feature in how2prompt-api — a new service, a Spring Security rule, an adapter for an external provider. Trigger phrases include "implement this feature in the backend", "add a new service for X", "wire up X in Spring".
---

## Overview

Reusable Spring Boot patterns specific to how2prompt-api's architecture (Java 21,
Spring Boot 3+, Spring Security, Spring Data JPA, Flyway, Redis) — see
`.claude/rules/java/guidelines.md` for the full rule set this skill applies.

## Patterns

### Adapter pattern for AI providers

New AI provider integrations (OpenAI, Anthropic, Gemini, Midjourney) implement a common
adapter interface — never call a provider SDK directly from a service. This keeps
provider swaps and testing (mock the adapter, not the SDK) cheap.

### Layered request flow

`Controller` (DTO in, DTO out, `@Valid`) -> `Service` (`@Transactional`, business
rules) -> `Repository` (Spring Data JPA). A request never skips a layer (controller
calling repository directly) or leaks a layer's concern upward (entity returned from
controller, HTTP status decided in a repository).

### Resilience for external calls

Wrap LLM/provider calls with Resilience4j circuit breaker + retry with backoff. Define
an explicit fallback (cached response, queued retry, or a clear error to the client) —
never let an unhandled provider timeout surface as a bare 500.

### Rate limiting

Redis-backed rate limiting on LLM-calling and auth endpoints, keyed by user/workspace.

## Process

1. Check whether an existing service/adapter already covers most of the need before
   creating a new one.
2. Write the failing test first (see `.claude/agents/tdd-guide.md`).
3. Implement following the layering above.
4. Run `java-reviewer` and, if the change touches auth or an external call,
   `security-reviewer`.

## Output

Implementation following the patterns above, plus tests at the appropriate layer
(`@DataJpaTest` for repository logic, `@WebMvcTest` for controller contract).
