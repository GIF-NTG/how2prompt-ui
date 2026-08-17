# Agent-First Workflow

Standard for delivering a feature end-to-end through an agent, from intent to merged PR.
This operationalizes the company's L2C ("Standard Advanced - Agent-First") certification
requirement #1. Not every project needs to track L2C evidence — this is the process to
follow when a project or team member is.

## The 6 steps

1. **Frame intent, not implementation.** Describe the feature as a user story +
   acceptance criteria — what and why, not how. "Parse user input from a form, validate
   it, return a normalized `User` object" is correct; "write a `parseUser` function using
   regex" is not — that's dictating implementation, which defeats the point.

2. **Give the agent context.** Make sure the project's `CLAUDE.md` (stack, architecture,
   conventions) is current, and attach any reference material the agent needs (design
   doc, OpenAPI spec, related file paths).

3. **Require a plan before code, and wait for approval.** "List the files you'll
   create/change and why. Wait for confirmation before editing." This repo already
   provides this step via `.claude/skills/speckit-plan` (and the specify → plan → tasks →
   implement chain) — use it instead of asking for an ad-hoc plan when Spec Kit is
   available. Approve the plan, not each diff.

4. **Let the agent implement and self-test.** Observe through the conversation; don't
   intervene line-by-line. Tests must pass before the agent can claim the task done.

5. **Review via test run + conversation, not line-by-line diff reading.** This is the
   behavior that distinguishes Agent-First from earlier maturity levels: run the tests,
   read the conversation, confirm the behavior is right. Scan the diff only for an
   anomaly check (security, an unexpectedly large or out-of-scope file) — reading it
   line-by-line defeats the effort savings and is a regression to an earlier workflow
   level.

6. **Submit evidence.** Conversation log (full, from framing intent to merge) + link to
   the merged PR + sprint/task card tagged "AI-first" + effort delta ≥40% (see
   `test-coverage-standards.md`'s sibling doc `ai-attribution-log.md` for how to measure
   and record this).

## Common pitfalls

- **Too-prescriptive framing.** "Use async/await, put the file in `src/utils`, use axios
  v1.6" is dictating implementation — you're back to writing code by dictation. Describe
  behavior and constraints; let the agent choose the implementation.
- **Skipping the plan step.** Letting the agent code straight through means
  misalignment surfaces late, when it's expensive to unwind. Always get a plan approved
  first.
- **Reviewing by reading every diff line.** That's the earlier ("Diffs Fade" or "YOLO")
  workflow level, not Agent-First — and it burns the time savings the whole point of
  this workflow is meant to capture.
- **No conversation log.** Some tools/IDEs don't export conversation history — if yours
  doesn't, save it manually. Without it, the evidence doesn't qualify for audit,
  regardless of how good the actual work was.

## Evidence checklist (requirement #1)

- [ ] Full conversation log, intent-framing through merge.
- [ ] Link to the merged PR (reviewed by a manager or senior, not self-merged).
- [ ] Sprint/task card tagged "AI-first".
- [ ] Effort delta ≥40% vs. baseline, with the measurement method stated (see
      `ai-attribution-log.md`).
- [ ] Confirmation that the primary logic was not hand-written by the developer.

## When *not* to go Agent-First

- Performance/correctness-critical code with no rigorous way to test it (concurrency
  primitives, low-level optimization).
- Legacy code with no `CLAUDE.md`/docs — the agent has no context to work from.
- Compliance/regulatory work requiring human-in-the-loop at every step.
- Hard-to-reproduce bug investigation — pairing with the agent is usually more effective
  than handing off the whole investigation.
</content>
