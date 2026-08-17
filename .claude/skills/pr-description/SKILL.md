---
name: pr-description
description: Use when the user wants to write or generate a pull request description/summary, or asks to open a PR. Trigger phrases include "write a PR description", "create a PR for this", "summarize this branch for a PR", "open a pull request".
---

## Overview

Write a PR description that lets a reviewer understand *why* the change was made and
*what to check* without having to read every diff line first.

## Process

1. **Gather the full diff, not just the last commit** — Use
   `git diff <base-branch>...HEAD` and `git log <base-branch>..HEAD` to see every
   commit in the PR, not only the most recent one. A PR is often more than its last
   commit.

2. **Identify the *why*** — Look at commit messages, linked issues/tickets, and
   conversation context for the motivation. If it's not evident from any of those,
   ask rather than inventing a plausible-sounding reason.

3. **Structure the description:**
   - **Summary** — 1-3 bullets on what changed and why, not a restatement of the
     diff.
   - **Test plan** — concrete steps or checklist for how the reviewer/CI can verify
     the change works (commands to run, scenarios to click through). If tests were
     added, name them; if manual verification is required, say what to check.

4. **Keep it scannable** — A reviewer should get the gist in 10 seconds. Push detail
   into the diff itself (which they'll read) rather than narrating every file changed.

5. **Flag risk** — If the change touches shared infrastructure, has a migration, or
   changes a public API/contract, call that out explicitly near the top so it isn't
   missed in review.

## Output

Present the description in the chat for review before creating the actual PR (via
`gh pr create`), unless the user has already approved opening it directly.
