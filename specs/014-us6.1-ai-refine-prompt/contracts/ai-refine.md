# Contract: AI Refine (consumed, not authored, by this feature)

Full authoritative contract: `docs/api/openapi.yaml`, "AI Enhancement" tag. This file
only excerpts what `useRefinePrompt` calls, via `src/features/ai-enhance/api/aiEnhanceClient.ts`
(already implemented — see `aiEnhanceClient.types.ts`/`.real.ts`/`.mock.ts`).

## `POST /generated-prompts/{id}/refine`

Client method: `aiEnhanceClient.refine(generatedPromptId, accessToken)`

Auth required (Bearer). No request body.

```json
// 200
{
  "promptId": "uuid",
  "originalPrompt": "string",
  "refinedPrompt": "string",
  "explanations": ["string"],
  "modelVersion": "string"
}
```

Errors this feature must handle distinctly (FR-009): `EMAIL_NOT_VERIFIED` (403),
`AI_QUOTA_EXCEEDED` (429), `RATE_LIMITED` (429), `AI_TIMEOUT` (504), `AI_UNAVAILABLE`
(503), `AI_CONTENT_FILTERED` (422).

## `POST /generated-prompts/{id}/refine/accept`

Client method: `aiEnhanceClient.acceptRefine(generatedPromptId, acceptedPrompt?, accessToken)`

- Call with no `acceptedPrompt` to accept the AI's suggestion as-is (US2).
- Call with `acceptedPrompt` set to the user's hand-edited text (US3, "Edit manually").

Response: `200`, no body. Error: `NO_PENDING_REFINEMENT` (422) — should not be
reachable from this UI's own flow (the trigger only appears once a `RefinementResult`
exists), but the hook must not assume the request cannot fail for other reasons (network,
session expiry) and should surface FR-009's generic-error fallback if it does.

## `DELETE /generated-prompts/{id}/refine`

Client method: `aiEnhanceClient.discardRefine(generatedPromptId, accessToken)`

Response: `204`, no body (US3 "Reject"). Same `NO_PENDING_REFINEMENT` note as above.

## Not used by this story

`score`, `translate`, `runPlayground`, `share`/`unshare`, `getPublicSharedPrompt`, and
the admin `aiFeatureSettingsClient` are part of the same `ai-enhance`/`admin` API
surface but belong to Epic 6's other stories (US-6.2 through US-6.5) — out of scope
here.
