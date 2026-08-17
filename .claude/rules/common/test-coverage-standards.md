# Test Coverage Standards for AI-generated Modules

Operationalizes L2C certification requirement #4 (test coverage ≥70% on AI-generated
modules, across 2 different sprints).

## Why 70%

70% is the industry sweet spot: enough to catch the bulk of regressions via statement +
branch coverage, without pushing toward "cosmetic" tests written purely to hit a number.
Coverage above 70% should be the natural result of good TDD, not something forced.

## What "≥70%" means here

| Type | Definition | How strict |
|---|---|---|
| Line/statement coverage | % of lines executed by tests | Basic, easy to hit — not sufficient alone |
| Branch coverage | % of conditional branches (if/else) covered | Important — catches logic flaws |
| Function coverage | % of functions called by tests | Basic |
| Mutation coverage | % of mutated code caught by tests | Strictest — reserve for critical code paths |

Unless stated otherwise, "coverage ≥70%" means **line + branch coverage ≥70%**. Mutation
coverage is a bonus, not required.

## Workflow

1. Identify the scope that counts as "AI-generated" (a whole file, or part of one) —
   track this via the AI Attribution Log (`.claude/rules/common/ai-attribution-log.md`), not just a
   comment.
2. Have the agent list branches and edge cases *before* writing any test — see
   `documents/prompt-library/PT-TEST-GEN-001-test-generation.md`.
3. Run the coverage tool for the stack (Jest built-in, `pytest-cov`, JaCoCo, Coverlet,
   etc.) and produce both an HTML report and a machine-readable one (JSON/XML).
4. Evaluate quality, not just the number: open the report, check which branches are
   still uncovered, and confirm the tests assert real behavior rather than mocked
   returns.
5. Iterate with the agent on the specific uncovered branches rather than accepting
   whatever it produces first.

## Anti-patterns (don't let AI-generated tests do this to hit the number)

1. Trivial getter/setter tests that assert nothing meaningful.
2. Tests that assert on a mock's return value instead of the real code path.
3. Testing a trivial branch (e.g. a debug-log conditional) purely because it exists.
4. Assert-less "smoke tests" that only confirm the code didn't throw.

See `documents/prompt-library/PT-TEST-GEN-001-test-generation.md`'s anti-pattern section
for the full detail — this is the same list, applied as a coverage-specific rule.

## Evidence checklist (requirement #4)

- [ ] Coverage report from the stack's tool, showing line + branch ≥70% on the
      AI-generated module.
- [ ] 2 reports from 2 different sprints.
- [ ] The module is clearly identified as AI-generated (tag/comment or cross-referenced
      against the AI Attribution Log).
</content>
