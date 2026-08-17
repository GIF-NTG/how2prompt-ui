# Testing

## Minimum coverage

Line + branch coverage >= 70% on any AI-generated module (see `test-coverage-standards.md` for the full policy and rationale). Coverage above that should fall out of good TDD, not be chased for its own sake.

## TDD is mandatory, not a suggestion

```
RED      -> write the test, run it, confirm it fails for the right reason
GREEN    -> minimum code to pass
REFACTOR -> clean up with tests green as the safety net
VERIFY   -> coverage target met, no weakened assertions
```

Never write implementation before the test that should fail against it exists. This is how missing requirements get caught while they're cheap to fix.

## pass@k vs pass^k

- **pass@k** — at least one of k attempts succeeds. Fine for exploratory/prototype work.
- **pass^k** — all k attempts must succeed. Required for anything production-critical, security-sensitive, or where consistency matters (payment flows, auth checks).

A flaky test is a **defect**. Fix it or delete it — never `@skip` and move on.

## Anti-patterns (don't let tests do this to hit a coverage number)

1. Trivial getter/setter tests that assert nothing meaningful.
2. Asserting on a mock's own return value instead of the real code path.
3. Testing a trivial branch purely because it exists.
4. Assert-less "smoke tests" that only confirm the code didn't throw.

## Structure (AAA)

```
test('does X when Y', () => {
  // Arrange
  // Act
  // Assert
})
```

Name tests by behavior (`returns empty array when no matches`), not by number (`test1`).
