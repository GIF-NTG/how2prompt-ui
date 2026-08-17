---
description: Review the current diff for quality, security, and maintainability per rules/common/code-review.md
---

Review the current diff (staged + unstaged) using the `code-reviewer` agent, and the `security-reviewer` agent if the diff touches auth, payments, secrets, user input, database queries, or external calls.

Run them in parallel when both apply. Report findings grouped by severity (CRITICAL/HIGH/MEDIUM/LOW) per `.claude/rules/common/code-review.md`. Do not report an empty severity tier.
