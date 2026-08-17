---
name: debugging
description: Use when investigating a bug, error, crash, unexpected behavior, or failing test where the cause isn't already obvious. Trigger phrases include "why is this failing", "debug this", "this is throwing an error", "investigate this bug", "this test is flaky".
---

## Overview

Find the actual root cause before changing anything. Jumping straight to a fix based
on a guess wastes time and often masks the real problem instead of solving it.

## Process

1. **Reproduce first** — Before theorizing, get the failure to happen reliably (run
   the failing test, hit the failing endpoint, trigger the error path). If it can't
   be reproduced, say so explicitly rather than guessing at a fix for a phantom bug.

2. **Read the actual error** — Stack trace, error message, logs. Identify the exact
   line/function where it originates, not just where it surfaces. A caught-and-
   rethrown exception, a generic 500, or a silent wrong-value bug all need tracing
   back past the symptom to the source.

3. **Form a hypothesis, then verify it** — State what you think is wrong and why,
   then check it against the code (read the relevant function, check recent git
   blame/history if the bug is a regression) before touching anything. Don't jump
   straight to editing code based on a guess.

4. **Isolate the minimal cause** — Narrow to the smallest input/condition that
   triggers it. This usually reveals whether the bug is where it first appeared or
   further upstream (bad data, wrong assumption in a caller, race condition).

5. **Fix the cause, not the symptom** — A fix that only suppresses the visible error
   (e.g. adding a null check instead of asking why the value is null) is a code
   smell unless the null truly is a valid, expected case.

6. **Verify the fix** — Re-run the original reproduction to confirm it's actually
   fixed, and check that the fix doesn't just handle the one case you saw but the
   underlying class of inputs.

## When stuck

If reproduction fails or the hypothesis keeps being wrong after 2-3 attempts, widen
the search: check recent commits touching the area (`git log -p <file>`), check for
similar past issues, or state clearly what's been ruled out so the user can help
redirect instead of continuing to guess.
