# API Contract: Template Detail, Favorite, View Count

**Feature**: `specs/005-view-template-details`
**Source**: `docs/api/openapi.yaml`
**Date**: 2026-07-27

**Scope**: Read-only template detail page. No prompt generation endpoint (Epic 3 out of scope).

## Endpoints Used

### 1. Get Template Detail

```
GET /api/v1/templates/{slug}
```

**Path Parameters**:

| Name   | Type   | Description                      |
| ------ | ------ | -------------------------------- |
| `slug` | string | URL-friendly template identifier |

**Response 200**:

```json
{
  "id": "uuid",
  "slug": "debug-loi-hieu-qua",
  "title": { "en": "Debug Errors Effectively", "vi": "Debug lỗi hiệu quả" },
  "description": { "en": "...", "vi": "..." },
  "cover_image": null,
  "is_official": true,
  "author": {
    "id": "uuid",
    "full_name": "Admin",
    "username": "admin",
    "avatar_url": null,
    "type": "admin"
  },
  "categories": [Category],
  "supported_models": ["gpt-4o", "claude"],
  "usage_count": 482,
  "favorite_count": 120,
  "is_favorited": false,
  "view_count": 1523,
  "created_at": "2026-07-20T10:00:00Z",
  "current_version": {
    "version": 1,
    "prompt_body": "Với vai trò {{role}}, hãy debug đoạn log sau...",
    "guide": { "en": "...", "vi": "..." },
    "example_output": { "en": "...", "vi": "..." },
    "created_at": "2026-07-20T10:00:00Z"
  }
}
```

**Response 404**:

```json
{
  "error": {
    "code": "TEMPLATE_NOT_FOUND",
    "message": "Template not found",
    "trace_id": "uuid"
  }
}
```

### 2. Toggle Favorite

```
POST /api/v1/templates/{id}/favorite     (add favorite)
DELETE /api/v1/templates/{id}/favorite   (remove favorite)
```

**Headers**: `Authorization: Bearer <token>` (required — authenticated only)

**Response 200**:

```json
{
  "is_favorited": true
}
```

### 3. Increment View Count

```
POST /api/v1/templates/{slug}/view
```

**Path Parameters**:

| Name   | Type   | Description                      |
| ------ | ------ | -------------------------------- |
| `slug` | string | URL-friendly template identifier |

**Headers**:

| Name                  | Type   | Required | Description                    |
| --------------------- | ------ | -------- | ------------------------------ |
| `X-Guest-Fingerprint` | string | No       | Browser fingerprint for guests |

**Response 204**: No content (fire-and-forget)

## Client-Side TypeScript Interfaces

The frontend `TemplateDetailClient` interface:

```typescript
interface TemplateDetailClient {
  getDetail(slug: string): Promise<TemplateDetail>

  toggleFavorite(templateId: string): Promise<{ is_favorited: boolean }>

  incrementViewCount(slug: string): Promise<void>
}
```

## Error Shape

All errors follow the standard envelope:

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human-readable message",
    "details": {},
    "trace_id": "uuid"
  }
}
```

The frontend `ApiError` class (from `shared/utils/httpClient.ts`) parses this
envelope. The detail page handles specific error codes:

| Code                 | HTTP Status | User Action                         |
| -------------------- | ----------- | ----------------------------------- |
| `TEMPLATE_NOT_FOUND` | 404         | Show 404 state with link to catalog |
| `UNAUTHORIZED`       | 401         | Redirect to login                   |

## Notes

- The detail endpoint is Guest-accessible (`security: []`). No `Authorization`
  header needed for viewing.
- The `is_favorited` field is only meaningful for authenticated users. For guests,
  it is always `false`. The frontend hides the favorite toggle for guests.
- The `view_count` increment endpoint is Guest-accessible and identified by
  `X-Guest-Fingerprint` for rate limiting.
- This contract covers read-only viewing only. The generate endpoint
  (`POST /templates/{id}/generate`) is part of Epic 3 and is out of scope.
