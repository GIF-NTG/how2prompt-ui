---
name: security-review
description: Use before merging nontrivial changes, or when the user asks for a security check/review of pending changes. Trigger phrases include "security review", "check this for vulnerabilities", "is this safe to merge", "review this diff for security issues".
---

## Overview

Review the current diff (not the whole codebase, unless asked) for common
vulnerability classes before it merges. This is a lightweight pre-merge gate, not a
full audit — flag concrete, exploitable issues, not theoretical ones.

## What to check

- **Injection** — SQL/NoSQL built from unsanitized input, shell commands built from
  user input, template injection, unsafe `eval`/`exec`.
- **Auth & access control** — endpoints or actions missing an auth/permission check
  that similar existing endpoints have; broken object-level authorization (user A
  can access user B's resource by changing an ID).
- **Secrets** — API keys, tokens, credentials committed in code or config, even in
  files that look like local/example config.
- **Unsafe deserialization / file handling** — deserializing untrusted input,
  path traversal from user-controlled file paths, unrestricted file upload.
- **XSS / output encoding** — user input rendered without escaping in HTML/JS
  contexts.
- **Dependency risk** — a newly added dependency that's unmaintained, has known CVEs,
  or is unusually broad in scope for what it's used for.

## Process

1. Scope to the diff (`git diff <base>...HEAD`) — full-codebase audits are a
   different, heavier task; don't silently expand scope.
2. For each finding, state the concrete exploit scenario (what input, what an
   attacker could do) — not a vague "this could be a risk."
3. Rank by severity. Don't pad the list with stylistic nitpicks to look thorough.
4. If nothing of substance is found, say so plainly rather than manufacturing
   findings.

## Boundary

This skill is not a substitute for the project's actual security process (SAST/DAST
tooling, dependency scanning, formal audits) — it's a fast pre-merge sanity check.
