# Code Review

## When

Mandatory before any commit to a shared branch, and always for security-sensitive changes (auth, payments, user data). Use the `code-reviewer` agent proactively after writing/modifying code, and `security-reviewer` for anything on the OWASP surface.

## Checklist

- [ ] Readable, well-named
- [ ] Functions <50 lines, files <800 lines, nesting <=4 levels
- [ ] Errors handled explicitly
- [ ] No hardcoded secrets
- [ ] No leftover debug statements (`console.log`, `print`, etc.)
- [ ] Tests exist for new behavior; coverage >= 70% (see `test-coverage-standards.md`)

## Severity levels

| Level | Meaning | Action |
|---|---|---|
| CRITICAL | Security vuln or data-loss risk | Block |
| HIGH | Bug or significant quality issue | Fix before merge |
| MEDIUM | Maintainability concern | Consider fixing |
| LOW | Style/minor | Optional |

## Workflow

1. `git diff` to see the actual change.
2. Security checklist first (`security.md`).
3. Quality checklist.
4. Run the relevant tests.
5. Verify coverage.

Approve only when there are no CRITICAL or HIGH findings.
