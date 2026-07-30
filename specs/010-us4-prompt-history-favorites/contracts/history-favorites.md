# Contracts: Prompt History & Favorites

This feature consumes existing backend endpoints; it does not define new
ones. Full request/response schemas live in `docs/api/openapi.yaml` (the
authoritative wire contract per Constitution Principle III) — this file only
lists which operations the frontend calls and why.

| Operation                               | Endpoint                                                    | Used by                                                                                                                                        |
| --------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| List history                            | `GET /generated-prompts?templateId&model&from&to&page&size` | `historyClient.list()` — `HistoryPage` (US1)                                                                                                   |
| Get one history entry                   | `GET /generated-prompts/{id}`                               | `historyClient.get(id)` — Re-run pre-fill (US3)                                                                                                |
| Delete history entry                    | `DELETE /generated-prompts/{id}`                            | `historyClient.remove(id)` — single + bulk delete (US5)                                                                                        |
| Add favorite                            | `POST /templates/{id}/favorite`                             | `toggleFavorite` when currently unfavorited (US4)                                                                                              |
| Remove favorite                         | `DELETE /templates/{id}/favorite`                           | `toggleFavorite` when currently favorited (US4)                                                                                                |
| List favorited templates                | `GET /favorites?page&size`                                  | `historyClient.listFavorites()` — `FavoritesPage` (US4)                                                                                        |
| Generate a prompt (existing, unchanged) | `POST /templates/{id}/generate`                             | Already implemented (spec 008); this feature does not modify it — auto-save-to-history is entirely backend-side per this feature's Assumptions |

All requests require `Authorization: Bearer <accessToken>` (these are
User-only endpoints per the persona/access matrix); a `401`/`TOKEN_EXPIRED`
is handled by the existing `httpClient.ts` + `AuthProvider` silent-refresh,
unchanged by this feature.

Response envelope, pagination (`PageMeta`), and error shape
(`{ error: { code, message, details?, traceId? } }`) all follow the
project-wide conventions already implemented in `httpClient.ts` — no new
envelope handling needed.
