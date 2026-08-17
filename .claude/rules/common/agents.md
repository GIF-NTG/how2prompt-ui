# Agent Orchestration

## Available agents (`.claude/agents/`)

| Agent | Purpose | When to use |
|---|---|---|
| **planner** | Feature decomposition into 2-5 min tasks with file paths + verify steps | Task touching >= 5 files, or an architectural change |
| **tdd-guide** | Enforces RED -> GREEN -> REFACTOR | Any new feature or bug fix |
| **code-reviewer** | General quality/security/maintainability review | Proactively after writing or modifying code |
| **security-reviewer** | OWASP Top 10, secrets, injection | Auth, payment, secrets, user input, DB queries, external calls |

This set is intentionally small — it's a starting skeleton for how2prompt's two actual consuming repos (`how2prompt-ui` — React frontend, `how2prompt-api` — Java/Spring Boot backend). Add per-language reviewers (`typescript-reviewer`, `java-reviewer`, etc.) as the need actually shows up, following the same frontmatter shape (`name`, `description`, `tools`) as the existing agents.

## Immediate/proactive usage

- Feature request touching >= 5 files -> **planner** first.
- Any new feature or bug fix -> **tdd-guide**.
- Code just written or modified -> **code-reviewer**.
- Auth/payment/secrets touched -> **security-reviewer**.

## Parallel execution

Independent review agents (e.g. `code-reviewer` + `security-reviewer` on different modules) should run in parallel — one message, multiple tool calls — rather than sequentially.
