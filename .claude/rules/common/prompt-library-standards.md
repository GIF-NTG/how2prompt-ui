# Prompt Library Standards

Operationalizes L2C certification requirement #3 (a maintained Prompt Library of ≥8
versioned templates, ≥2 with an anti-pattern section). Starter templates live in
`documents/prompt-library/`; this file documents the format they follow so new entries
stay consistent.

## Why maintain a library instead of ad-hoc prompts

- **Consistency** — the whole team gets comparable output for the same task, which
  makes review easier.
- **Reuse** — a template that works doesn't get reinvented per task.
- **Improvement tracking** — versioning shows which revision performed better.
- **Onboarding** — new devs start from a known-good template instead of learning by
  trial.
- **Audit** — proves AI usage follows a process, not ad-hoc freelancing.

## Required entry format

Every entry in `documents/prompt-library/` must have all five sections:

1. **Metadata**
   - `id` — unique, e.g. `PT-API-IMPL-001`
   - `name` — e.g. `api-implementation-rest-crud`
   - `version` — semver, e.g. `v1.0.0`
   - `last_updated`, `author`, `reviewers`
   - `use_case` — one line on what this template is for
   - `applicable_when` / `not_applicable_when` — scope boundaries
2. **Prompt body** — a `System` section (if applicable) and a `User` section with
   `{{placeholder}}` variables.
3. **Examples** — 1-2 realistic input → expected-output pairs.
4. **Anti-pattern** (required in ≥2 templates library-wide) — a similar-looking but wrong
   prompt, why it's wrong, and the real-world consequence it caused or would cause.
5. **Changelog** — one line per version: what changed and why.

## Versioning rule

- **Semver**: MAJOR when role/output format changes in a non-backward-compatible way,
  MINOR when a rule is added, PATCH for typo/clarity fixes.
- Every new version needs a changelog entry with a reason.
- Deprecated versions stay in the library at least 3 months for audit purposes.
- A critical update (e.g. a security issue found in an old template) must be broadcast
  to the team channel, not just quietly bumped.

## Quality checklist before adding a template

- [ ] System prompt defines role + responsibility + scope?
- [ ] Has a chain-of-thought element (asks for step-by-step reasoning) where the task
      needs it?
- [ ] Few-shot examples included if a specific output format is required?
- [ ] Positive constraints (must do) present?
- [ ] Negative constraints (must NOT do) present, each with a reason?
- [ ] Output format specified (markdown structure or JSON schema)?
- [ ] Escalation path defined for when the agent hits missing info or out-of-scope work?
- [ ] Tested against an edge case / adversarial input?
- [ ] Has a version entry in this library?

## Negative constraints need enforcement, not just wording

LLMs tend to drift toward whatever gets mentioned, so a bare "don't do X" is weaker than
it looks:

- List negative constraints in their own section, each with a *why* (e.g. "don't
  hardcode secrets — they leak through git history").
- Reinforce at key steps, not just once at the top.
- Enforce via a validation layer outside the LLM — don't trust the model to self-police.
- Test it: deliberately try to prompt the agent into violating a constraint, and confirm
  it refuses.
</content>
