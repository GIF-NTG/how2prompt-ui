# Data Model: AI Score a Prompt (US-6.2)

No new backend entities or migrations — this feature is frontend-only, consuming the
already-wired `POST /generated-prompts/{id}/score` contract. The shapes below are the
frontend-side types involved.

## Existing types (unchanged, already in `aiEnhanceClient.types.ts`)

```ts
interface ScoreBreakdown {
  clarity: number      // 0-10
  specificity: number  // 0-10
  context: number      // 0-10
  format: number        // 0-10
}

interface ScoreResult {
  promptId: string
  score: number         // overall, server-computed — treated as authoritative (research.md)
  breakdown: ScoreBreakdown
  suggestions: string[]
  modelVersion: string
}
```

`AiEnhanceClient.score(generatedPromptId, accessToken?): Promise<ScoreResult>` already
exists and requires no changes.

## New: `ScoreFlowState` (mirrors `RefineFlowState`)

```ts
type ScoreFlowState = 'idle' | 'loading' | 'result' | 'error'
```

- `idle`: no score requested yet, or a prior result was superseded and nothing new has
  landed (only reachable transiently — see `useScorePrompt` below).
- `loading`: a score request is in flight; `ScoreTrigger` disables its button.
- `result`: `ScoreResult` is populated and rendered; stays in this state across
  incidental re-renders of the host view (FR-006) until a fresh score is requested.
- `error`: the last request failed; `errorMessage` is populated with a specific,
  actionable message (FR-008/FR-009).

## New: `useScorePrompt` hook state shape

```ts
interface UseScorePromptOptions {
  client: AiEnhanceClient
  generatedPromptId: string | null
}

interface UseScorePromptResult {
  state: ScoreFlowState
  result: ScoreResult | null
  errorMessage: string | null
  score: () => Promise<void>
}
```

No `onAccepted`/accept-reject callback (unlike `useRefinePrompt`) — scoring is
read-only and has no accept/discard lifecycle; the trigger simply (re-)requests a score,
per FR-007's "re-running replaces the previous result."

## Relationships

- One `useScorePrompt` instance per generated-prompt detail view (one per host
  component instance, same as `useRefinePrompt`) — not global/shared state, so scoring
  one prompt never affects another prompt's displayed score.
- `result.promptId` is not cross-checked against the host's `generatedPromptId` at
  render time beyond what the hook's own request/response pairing already guarantees
  (the hook only ever holds the result from its own last `client.score()` call for its
  fixed `generatedPromptId`).

## Validation rules

- `ScoreBreakdown`'s four fields and `score` are rendered as-is (integers, contract-
  guaranteed 0–10 range per `docs/api/openapi.yaml`); the frontend does not re-validate
  or clamp these values — trusting the backend contract per this project's "don't
  re-validate internal data already guaranteed by a prior check" coding-style rule.
- `suggestions` renders as an empty state ("No suggestions" or the list is simply
  omitted) if the array is empty — the contract does not guarantee a non-empty list.
