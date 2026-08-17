# Security Gate Policy (SAST in CI/CD)

Operationalizes L2C certification requirement #2 (security vulnerability scanning on
AI-generated code). This documents the *policy* every project's CI should enforce; the
actual pipeline config is project-specific (GitHub Actions / GitLab CI / Jenkins), so
nothing here is wired into `sync.sh`.

## Why AI-generated code needs this

AI-generated code has a higher-than-baseline rate of certain vulnerability classes:
hardcoded secrets (pattern-matched from training data), SQL injection (quick illustrative
examples get shipped as-is), deprecated/vulnerable dependencies, and missed auth checks.
A SAST tool catches most of these mechanically, before merge — a human reviewer scanning
a diff will miss what "looks fine."

This repo's `.claude/skills/security-review` + `.claude/agents/security-reviewer.md` are the
**pre-merge, human/agent-assisted review layer** — a fast sanity check on the current
diff. They are not a substitute for an actual SAST tool wired into CI; use both.

## Pipeline shape (tool-agnostic)

1. **Trigger** on every PR into the main/develop branch.
2. **`security-scan` job**: checkout → setup runtime → install a SAST tool (Semgrep,
   Snyk Code, GitHub Advanced Security, SonarQube, or equivalent) → run with the chosen
   ruleset → export report (JSON/SARIF).
3. **`evaluate-findings` job**: parse the report, classify by severity, apply the policy
   below.
4. **`post-results` job**: comment the summary on the PR, upload SARIF to the platform's
   security tab if supported, notify on any Critical finding.

## Severity policy

| Severity | Meaning | Action |
|---|---|---|
| Critical | Exploitable now, high impact (RCE, auth bypass, SQL injection, hardcoded secret) | Block merge. No exceptions. |
| High | Serious but needs conditions to exploit (reflected XSS, mitigated SSRF) | Requires security lead/senior approval to defer. |
| Medium | Abusable but limited impact (info disclosure, weak crypto config) | File an issue, fix this sprint or next. |
| Low | Hardening / best practice (missing security header, verbose errors) | File an issue, fix per backlog priority. |
| Info | Not a vulnerability | Acknowledge, no fix required. |

Also enforce alongside SAST: SCA (dependency CVE scanning) and secret scanning
(hardcoded credentials in git history) — these catch classes SAST alone doesn't.

## Evidence checklist (requirement #2)

- [ ] 2 PR scan reports on AI-generated code, from two different sprints.
- [ ] At least one report shows a finding that was fixed *before* merge — a clean report
      alone doesn't qualify; you need to show the detect → analyze → fix cycle actually
      ran, not that you got lucky.
- [ ] Link to the PR and the commit that fixed the finding.

## Common pitfalls

- **A clean report isn't enough.** The requirement explicitly needs ≥1 fixed finding as
  proof the gate does something, not formality.
- **Suppressing instead of fixing.** Only acceptable for a documented false positive or a
  documented compensating control — never just to unblock a merge.
- **Treating SAST as a silver bullet.** It only catches pattern-based issues. Logic
  flaws, race conditions, and business-logic abuse still need manual code review and,
  for production-critical systems, DAST/pentest.
</content>
