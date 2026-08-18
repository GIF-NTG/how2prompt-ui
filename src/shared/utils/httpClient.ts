import type { PageMeta } from '@/shared/types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/** True once a real backend URL is configured — see authClient.ts's mock/real switch. */
export function isApiConfigured(): boolean {
  return Boolean(API_BASE_URL)
}

interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
    details?: Record<string, string>
    traceId?: string
  }
}

/** Wraps every non-204 response body, per docs/api/openapi.yaml's "Response Wrapper chuẩn". */
interface ApiEnvelope<T> {
  data: T
  meta: PageMeta | null
}

/** Mirrors docs/api/openapi.yaml's error envelope: `{ error: { code, message, ... } }`. */
export class ApiError extends Error {
  code: string
  /** The HTTP response status (e.g. 410, 422, 429) — some endpoints (like
   *  /auth/reset-password's expired-token case) document only a status code, not a
   *  specific error.code, so callers that need to distinguish that case read this. */
  status: number
  details?: Record<string, string>

  constructor(code: string, message: string, status: number, details?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

interface ApiFetchOptions {
  method?: string
  body?: unknown
  accessToken?: string
}

/**
 * Thin fetch wrapper for the real backend (docs/api/openapi.yaml). Always sends
 * `credentials: 'include'` so the httpOnly `refresh_token` cookie the backend sets
 * is sent/received automatically — this file is the only place that ever touches
 * that cookie's transport; the value itself is never readable from JS.
 */
async function rawFetch(path: string, options: ApiFetchOptions): Promise<unknown> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 204) {
    return SENTINEL_NO_CONTENT
  }

  // Some endpoints (e.g. /auth/resend-verification's 202) document no response
  // body at all — the real backend sends a genuinely empty body, not `{}`, so
  // response.text() resolves '' and JSON.parse would throw. Treat that as "no
  // data" for a successful response, same as the 204 branch above, rather than
  // crashing trying to unwrap a non-existent envelope.
  const rawBody = await response.text()
  let data: unknown = null
  if (rawBody) {
    try {
      data = JSON.parse(rawBody)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const body = data as ApiErrorBody | null
    throw new ApiError(
      body?.error?.code ?? 'UNKNOWN_ERROR',
      body?.error?.message ?? 'Something went wrong, please try again.',
      response.status,
      body?.error?.details,
    )
  }

  return data
}

const SENTINEL_NO_CONTENT = Symbol('no-content')

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const data = await rawFetch(path, options)

  if (data === SENTINEL_NO_CONTENT || data === null) {
    return undefined as T
  }

  // Per docs/api/openapi.yaml, not every 200 response is wrapped in the
  // `{ data, meta }` envelope — several list endpoints (/ai-models,
  // /categories, /tags, /templates/featured, /templates/trending,
  // /workspaces, /admin/ai-models) document a bare `type: array` response
  // instead. Unwrapping `.data` unconditionally turned every one of those
  // into `undefined` (a JSON array never has a `.data` property), crashing
  // any caller that immediately calls `.map()` on the result.
  if (Array.isArray(data)) {
    return data as T
  }

  return (data as ApiEnvelope<T>).data
}

/**
 * Like `apiFetch`, but for paginated list endpoints (`/templates`,
 * `/generated-prompts`, `/favorites`, ...) whose `{ data, meta }` envelope IS
 * the payload the caller wants — `meta` here is real `PageMeta` (hasNext,
 * totalElements), not disposable envelope metadata. `apiFetch` unwraps `.data`
 * and discards `meta` unconditionally, which silently dropped pagination info
 * and made callers throw trying to read `.meta` off the unwrapped array.
 */
export async function apiFetchPage<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<{ data: T; meta: PageMeta }> {
  const data = await rawFetch(path, options)
  return data as { data: T; meta: PageMeta }
}

/**
 * Like `apiFetch`, but skips the `{data, meta}` envelope unwrap entirely —
 * for `/admin/ai-feature-settings` (GET and PUT), the one Epic 6 exception
 * that returns its raw object/array body directly (docs/api/openapi.yaml).
 * Don't reuse this for any other endpoint without checking the contract.
 */
export async function apiFetchRaw<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const data = await rawFetch(path, options)
  return (data === SENTINEL_NO_CONTENT ? undefined : data) as T
}
