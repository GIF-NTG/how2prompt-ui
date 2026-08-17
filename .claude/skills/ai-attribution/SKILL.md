---
name: ai-attribution
description: Use after a PR with AI involvement has merged, to draft an AI Attribution Log entry and a matching commit trailer. Trigger phrases include "log this for attribution", "draft an AI attribution entry", "add this to the attribution log".
---

## Overview

Draft one AI Attribution Log entry (schema in `.claude/rules/common/ai-attribution-log.md`) and, if the
commit doesn't already have one, an `AI-Attribution` commit trailer — from the merged
PR and the conversation, instead of the developer reconstructing the schema from memory.

Only run this after the PR has actually merged (per the maintenance rule: entries are
created post-merge, not while work is still in flight).

## Process

1. **Gather the facts** — `gh pr view <pr>` (or the platform's equivalent) for the PR
   link and merge commit, `git log` for the commit SHA, and the conversation for which
   tool/model did the work and how (agent-first / pair / autocomplete / review).

2. **Estimate `pct_ai_generated` conservatively** — if the developer hand-edited a
   meaningful portion after the agent's first pass, that portion counts against the
   percentage. Don't default to 100% or 0%; look at what actually happened in the
   conversation.

3. **Ask for what can't be inferred** — the sprint name/number, the task/issue ID, and
   the reviewer (must be someone other than the task's author — flag it and ask if the
   given reviewer is the same as the author, per the self-review pitfall). If effort
   delta hasn't been discussed, ask which of the three methods
   (story-point/baseline/qualitative) applies and the resulting percentage — don't
   invent a number.

4. **Produce two outputs**:
   - The log entry, filled into the schema from `.claude/rules/common/ai-attribution-log.md`, ready to
     append to the project's log file.
   - The `AI-Attribution` commit trailer block, in case the merge commit doesn't already
     carry one (useful for a squash-merge workflow where the trailer needs to be added
     after the fact via `git commit --amend` on a *local, unpushed* commit only — never
     rewrite a commit that's already been pushed/shared).

5. **Flag anything that doesn't qualify** — if the PR merged more than a month ago, say
   so explicitly rather than backfilling silently (the standard prohibits backfill for
   old work).

## Output

Present both the log entry and the commit trailer for the developer to review and paste
in — this skill drafts them, it doesn't write to the project's log file automatically,
since the log's location and format conventions are project-specific.
</content>
