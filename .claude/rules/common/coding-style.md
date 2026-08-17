# Coding Style

## Core principles

- **KISS** — prefer the simplest solution that works. Optimize for clarity over cleverness.
- **DRY** — extract repeated logic once repetition is real, not speculative.
- **YAGNI** — don't build abstractions or configurability before they're needed.
- **Immutability** — prefer creating new values over mutating in place; it keeps side effects visible and debugging tractable.

## File organization

Many small, cohesive files beat few large ones: target 200-400 lines, treat 800 as a hard trigger to split. Organize by feature/domain, not by file type.

## Error handling

Handle errors explicitly at the boundary where they occur. Never swallow an error silently. Validate untrusted input (user input, external API responses, file content) at the point it enters the system — don't re-validate internal data that's already guaranteed correct by a type or a prior check.

## Naming

- `camelCase` for variables/functions, `PascalCase` for types/classes/components, `UPPER_SNAKE_CASE` for constants.
- Booleans read as a question: `isValid`, `hasPermission`, `canRetry`.

## Code smells to avoid

- Deep nesting (>4 levels) — use early returns.
- Magic numbers — name the constant.
- Long functions (>50 lines) — split by responsibility.

## Checklist before marking work complete

- [ ] Readable, well-named
- [ ] Functions <50 lines, files <800 lines
- [ ] No nesting >4 levels
- [ ] Errors handled explicitly, not swallowed
- [ ] No hardcoded values that should be constants/config
- [ ] No unnecessary mutation
