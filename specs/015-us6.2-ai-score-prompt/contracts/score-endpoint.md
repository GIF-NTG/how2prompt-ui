# Contract: Score a Generated Prompt

Reference only — this contract already exists in `docs/api/openapi.yaml` (source of
truth) and is already implemented in `src/features/ai-enhance/api/aiEnhanceClient.real.ts`.
Documented here for this feature's traceability, not as a new contract to build.

## `POST /api/v1/generated-prompts/{id}/score`

**Auth**: `Authorization: Bearer <accessToken>` — required (all endpoints except
`/auth/*` require a valid JWT per Constitution Principle III).

**Path params**: `id` (uuid) — the generated prompt's id.

**Request body**: none.

**Response `200`** — `ScoreResult`:

```json
{
  "promptId": "uuid",
  "score": 8,
  "breakdown": { "clarity": 8, "specificity": 7, "context": 9, "format": 8 },
  "suggestions": ["Be more specific about the target audience.", "..."],
  "modelVersion": "gpt-4o-2026-..."
}
```

**Known error codes** (per `useRefinePrompt.ts`'s established mapping for the same
class of AI-call failures — reused verbatim, see research.md):

| Code | Meaning | Frontend message |
|---|---|---|
| `RATE_LIMITED` | Too many requests in a short window | Retryable, short wait |
| `AI_TIMEOUT` | Provider round-trip exceeded the timeout | Retryable |
| `AI_UNAVAILABLE` | Provider temporarily unavailable | Retryable, longer wait |
| *(anything else, incl. a malformed-response failure)* | Falls through to generic message | Retryable, generic "couldn't score this prompt" |

## Frontend client contract (already implemented, unchanged by this feature)

```ts
interface AiEnhanceClient {
  score(generatedPromptId: string, accessToken?: string): Promise<ScoreResult>
  // ...other existing methods, unrelated to this feature
}
```
