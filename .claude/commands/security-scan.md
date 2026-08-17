---
description: Run a focused security review of the current diff against the OWASP Top 10 checklist
---

Run the `security-reviewer` agent against the current diff. Use `.claude/rules/common/security.md` and `.claude/rules/common/security-gate-policy.md` as the checklist and severity policy.

Report each finding with a concrete exploit scenario (input -> impact), not a hypothetical. Apply the block/defer/track policy from `security-gate-policy.md` — CRITICAL blocks, no exceptions.
