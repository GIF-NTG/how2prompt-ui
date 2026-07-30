# Contract: `POST /templates/{id}/generate`

Authoritative source: `docs/api/openapi.yaml` lines 599–638
(`GenerateRequest`/`GenerateResponse` schemas at lines 1295–1332). This file
is a feature-scoped summary of what `generateClient` must implement — it does
not redefine the contract.

## Request

`POST /templates/{id}/generate`

Headers:

- `Authorization: Bearer <accessToken>` if signed in.
- `X-Guest-Fingerprint: <uuid>` **required** when unauthenticated (see
  research.md's guest-fingerprint decision).

Body (`GenerateRequest`):

| Field               | Type           | Required | Notes                                               |
| ------------------- | -------------- | -------- | --------------------------------------------------- |
| `templateVersionId` | uuid           | no       | omit → backend uses the template's current version  |
| `aiModelCode`       | string         | **yes**  | the selected model's code, e.g. `claude-opus-4`     |
| `inputValues`       | object         | **yes**  | `{ varKey: value }` map for every declared variable |
| `extraInstructions` | string \| null | no       | User Story 4's free-form field                      |
| `title`             | string \| null | no       | not surfaced in this feature's UI — omit            |

Both signed-in members and guests may call this (`security: [bearerAuth,
{}]`) — guests are allowed but rate-limited (see Errors below).

## Response (`200`) — `GenerateResponse`

| Field               | Type            | Notes                                                                                        |
| ------------------- | --------------- | -------------------------------------------------------------------------------------------- |
| `generatedPromptId` | uuid \| null    | `null` for guests — not persisted server-side (FR-009/FR-010)                                |
| `finalPrompt`       | string          | the authoritative rendered prompt (FR-006) — display and copy this, never the client preview |
| `tokensEstimate`    | integer         | shown alongside the result                                                                   |
| `aiModelCode`       | string          | echoes the model actually used                                                               |
| `remainingQuota`    | integer \| null | guest/Free-plan quota remaining; drives the "X left today" messaging                         |

## Errors

| Status            | Meaning                                                             | FE handling                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `422`             | `ValidationError` — backend re-validated and rejected `inputValues` | Should be rare (FE already validated per FR-002) — show the returned message; this is the backend's own defense-in-depth, not a normal path        |
| `429`             | `GUEST_QUOTA_EXCEEDED`                                              | Show the message from the error envelope directly — it already contains the "register for 50/day" copy per the contract's example (FR-010, SC-005) |
| any other non-2xx | Generic system error                                                | Generic retry-able error message (FR-011) — never render a partial/fabricated result                                                               |

All errors arrive as `{ error: { code, message, details?, traceId? } }` via
the existing `ApiError` class in `httpClient.ts` — branch on `error.code` /
`err.status`, same pattern as every other real client in this repo.

## Client-side (this feature)

- `generateClient.types.ts` / `.real.ts` / `.mock.ts`: see data-model.md.
- The mock client must simulate: a successful generate (echoing
  `inputValues` substituted into the mock template's `prompt_body`), a guest
  quota near/at the limit (to exercise FR-010/SC-005 in dev mode without a
  backend), and a generic failure path (to exercise FR-011).
