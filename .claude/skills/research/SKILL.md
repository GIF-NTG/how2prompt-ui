---
name: research
description: This skill should be used when the user wants to research and understand a topic — a GitHub repository, library, framework, tool, API, technology, or general concept — and get a structured, well-sourced summary. Trigger phrases include "research X", "look into this repo", "what should I know about X", "compare X and Y".
---

## Overview

Research any topic systematically, using multiple sources, and present the findings
directly in the conversation — no report file unless the user asks for one. The goal
is a well-sourced, structured answer that helps the user decide or act, not a raw
dump of everything found.

## Process

1. **Clarify scope** — Figure out what the user actually needs to know. If the
   request is ambiguous (e.g. just a repo URL with no stated goal), infer intent from
   context (evaluating it for use? understanding internals? comparing alternatives?)
   or ask one short clarifying question. Don't over-ask if intent is reasonably clear.

2. **Gather** — Pick sources based on what's needed:
   - Use WebSearch/WebFetch for overviews, official docs, release notes, community
     reviews, comparisons.
   - Read or clone local/source code when the question requires understanding actual
     implementation, verifying a claim the docs make, or the info isn't available any
     other way.
   - Prefer official sources (project docs, README, source code) over blog posts or
     forum threads; use secondary sources for context, sentiment, or gotchas official
     docs won't mention.
   - Don't dig deeper than the question warrants — a quick "what is X" doesn't need a
     repo clone.

3. **Synthesize** — Merge findings into a coherent picture. Drop redundant or stale
   information. Flag anything uncertain or unverified rather than presenting it as
   fact.

4. **Present** — Answer directly in the chat. Use short headings only if the answer
   has multiple distinct sections — don't over-structure a two-paragraph answer.

## Checklists by topic type

Starting points, not mandatory templates — use only the parts relevant to the user's
actual question and skip the rest.

**GitHub repo / library**
Primary focus: how to use & set it up — installation, run commands, main API/CLI
surface, usage examples. Only pull in architecture, popularity/activity, or
code-quality signals (tests, CI, maintenance status) if the user's question needs
them to decide whether/how to use it.

**New technology / concept**
What it is, what problem it solves, how it compares to alternatives, when to use it
vs. not.

**Tool / API**
Core capabilities, how to integrate it, limits/pricing if relevant.

## Combining web and local sources

- Web search/fetch is usually enough for: general overviews, comparisons, community
  sentiment, official documentation.
- Reach for local code (clone/read) when: the user needs implementation-level
  understanding, or a claim from docs/marketing needs verification against actual
  source.
