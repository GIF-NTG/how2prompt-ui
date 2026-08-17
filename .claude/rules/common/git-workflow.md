# Git Workflow

## Commit message format

```
<type>: <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`. Focus the message on *why*, not what — the diff already shows what.

## Rules

- Only commit when explicitly asked.
- Create new commits rather than amending, unless explicitly asked to amend — and never amend a commit that's already pushed/shared.
- Never force-push, never skip hooks (`--no-verify`), unless explicitly requested.
- Check `git status`/`git diff` before any operation that can discard work (`reset --hard`, `checkout --`, `clean -f`).
- Stage specific files by name — avoid `git add -A`/`git add .` when the repo might contain untracked secrets or generated artifacts.

## Pull requests

1. Look at the full commit history on the branch, not just the latest commit (`git diff [base]...HEAD`).
2. Draft a summary + a test plan checklist.
3. Push with `-u` on a new branch.
4. Ensure CI is passing and the branch is up to date with the target branch before requesting review.
