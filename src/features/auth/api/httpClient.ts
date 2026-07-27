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
  meta: unknown
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
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
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
    return undefined as T
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const body = data as ApiErrorBody | null
    throw new ApiError(
      body?.error?.code ?? 'UNKNOWN_ERROR',
      body?.error?.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.',
      response.status,
      body?.error?.details,
    )
  }

  return (data as ApiEnvelope<T>).data
}
