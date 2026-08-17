# Security

## Mandatory checks, every commit

- [ ] No hardcoded secrets (keys, passwords, tokens) — including in comments and test fixtures
- [ ] All user input validated at the boundary (schema-based)
- [ ] Parameterized queries — never string-concatenated SQL
- [ ] XSS prevention — escape/sanitize before rendering untrusted content
- [ ] CSRF protection on state-changing endpoints
- [ ] AuthN/AuthZ verified on every state-changing path
- [ ] Rate limiting on auth/payment endpoints
- [ ] Error messages don't leak stack traces, paths, or env values

## Secret management

Never hardcode secrets in source, comments, or test fixtures. Use environment variables or a secret manager. Validate required secrets are present at startup and fail fast. If a secret may have leaked, rotate it — don't wait to confirm exploitation first.

## Prompt injection / untrusted content

Anything an LLM reads is executable context, not inert data — PDFs, HTML, comments, tool output. There is no built-in "data vs instructions" boundary in a context window. When ingesting untrusted content:

1. Extract only the text actually needed; don't feed raw external content into a privileged agent.
2. Strip comments/metadata that could carry hidden instructions.
3. Separate the extraction step (reads untrusted content) from the action-taking step (has write/network access) — the "lethal trifecta" (private data + untrusted content + external communication) is only safe to combine if you break one edge of that triangle.

## Severity policy

| Severity | Action |
|---|---|
| Critical | Block merge. No exceptions. |
| High | Requires a documented sign-off to defer. |
| Medium | File an issue, fix this sprint or next. |
| Low | File an issue, fix per backlog priority. |

See `security-gate-policy.md` for the full SAST/CI gate this maps to.

## Least agency

Grant an agent only the room a task actually needs. Require explicit approval before: unsandboxed shell commands, network egress, reading secret-bearing paths (`.env`, credentials, keys), writes outside the repo, or any deployment/workflow-dispatch action.
