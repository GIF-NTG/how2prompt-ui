# Agent Orchestration

## Available agents (`.claude/agents/`)

| Agent | Purpose | When to use |
|---|---|---|
| **planner** | Feature decomposition into 2-5 min tasks with file paths + verify steps | Task touching >= 5 files, or an architectural change |
| **tdd-guide** | Enforces RED -> GREEN -> REFACTOR | Any new feature or bug fix |
| **code-reviewer** | General quality/security/maintainability review | Proactively after writing or modifying code |
| **security-reviewer** | OWASP Top 10, secrets, injection | Auth, payment, secrets, user input, DB queries, external calls |
| **java-reviewer** | Spring Boot layering, JPA, migrations, security config | Backend (`how2prompt-api`) changes |
| **typescript-reviewer** | React/TS types, state placement, hooks, a11y | Frontend (`how2prompt-ui`) changes |
| **database-reviewer** | PostgreSQL schema/migrations/queries | Any migration or non-trivial query change |

Scoped to how2prompt's two actual consuming repos (`how2prompt-ui` — React frontend, `how2prompt-api` — Java/Spring Boot + PostgreSQL backend). Add more agents only as the need actually shows up, following the same frontmatter shape (`name`, `description`, `tools`) as the existing agents.

## Immediate/proactive usage

- Feature request touching >= 5 files -> **planner** first.
- Any new feature or bug fix -> **tdd-guide**.
- Code just written or modified -> **code-reviewer**, plus the stack-specific reviewer for the file touched (**java-reviewer** for `how2prompt-api`, **typescript-reviewer** for `how2prompt-ui`).
- Auth/payment/secrets touched -> **security-reviewer**.
- Migration or non-trivial query added -> **database-reviewer**.

## Parallel execution

Independent review agents (e.g. `code-reviewer` + `java-reviewer` + `security-reviewer` on the same backend change) should run in parallel — one message, multiple tool calls — rather than sequentially.
