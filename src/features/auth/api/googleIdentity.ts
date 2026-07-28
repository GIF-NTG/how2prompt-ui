export interface GoogleCredential {
  email: string
  name: string
  /** Raw, undecoded Google ID Token (JWT) — the real backend (`POST
   *  /auth/oauth/google`) verifies this server-side; the mock ignores it and
   *  uses the decoded `email`/`name` above instead. */
  idToken: string
}

interface GoogleIdConfiguration {
  client_id: string
  callback: (response: { credential: string }) => void
}

type NotDisplayedReason =
  | 'browser_not_supported'
  | 'invalid_client'
  | 'missing_client_id'
  | 'opt_out_or_no_session'
  | 'secure_http_required'
  | 'suppressed_by_user'
  | 'unregistered_origin'
  | 'unknown_reason'

type SkippedReason = 'auto_cancel' | 'user_cancel' | 'tap_outside' | 'issuing_failed'

interface GooglePromptMoment {
  isNotDisplayed: () => boolean
  getNotDisplayedReason: () => NotDisplayedReason
  isSkippedMoment: () => boolean
  getSkippedReason: () => SkippedReason
  isDismissedMoment: () => boolean
}

interface GoogleAccountsId {
  initialize(config: GoogleIdConfiguration): void
  prompt(momentListener?: (notification: GooglePromptMoment) => void): void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let scriptLoadPromise: Promise<void> | null = null

const NOT_DISPLAYED_HINTS: Record<NotDisplayedReason, string> = {
  unregistered_origin:
    'Origin này (vd http://localhost:5173) chưa được thêm vào "Authorized JavaScript origins" của OAuth Client trên Google Cloud Console.',
  invalid_client: 'VITE_GOOGLE_CLIENT_ID không hợp lệ hoặc không tồn tại.',
  missing_client_id: 'Thiếu client_id khi gọi initialize().',
  secure_http_required: 'Cần chạy trên HTTPS (hoặc localhost) — Google từ chối HTTP thường.',
  opt_out_or_no_session:
    'Trình duyệt không có phiên Google nào đang đăng nhập, hoặc người dùng đã opt-out.',
  browser_not_supported: 'Trình duyệt này không được Google Identity Services hỗ trợ.',
  suppressed_by_user:
    'Người dùng đã từ chối One Tap nhiều lần trước đó nên Google tạm ẩn (cooldown).',
  unknown_reason:
    'Không rõ nguyên nhân — thử kiểm tra console của trình duyệt để biết thêm chi tiết.',
}

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

/**
 * `atob()` only decodes base64 into a raw byte string (one UTF-16 code unit
 * per byte) — it does NOT interpret UTF-8 multi-byte sequences. A JWT payload
 * is UTF-8 JSON, so a name/claim with Vietnamese diacritics (or any non-ASCII
 * text) comes out as mojibake unless those bytes are re-decoded as UTF-8.
 */
function base64UrlDecodeUtf8(base64url: string): string {
  const normalized = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(normalized)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

function decodeCredential(credential: string): GoogleCredential {
  const payload = credential.split('.')[1] ?? ''
  const decoded = JSON.parse(base64UrlDecodeUtf8(payload)) as { email?: string; name?: string }
  return { email: decoded.email ?? '', name: decoded.name ?? '', idToken: credential }
}

/**
 * Opens the real Google account picker (One Tap) and resolves with the
 * signed-in identity, or `null` if the visitor genuinely dismissed/cancelled
 * it. If Google refuses to display the prompt at all (misconfiguration —
 * unregistered origin, blocked third-party cookies, invalid client id, etc.),
 * this THROWS with a specific, actionable reason instead of silently
 * resolving `null` — that distinction is the whole point of this function,
 * since "nothing happened when I clicked the button" is otherwise
 * undiagnosable. The credential is decoded client-side only for display
 * purposes (`email`/`name`) — that decoding does NOT verify its signature;
 * the raw `idToken` is forwarded untouched to the real backend
 * (`POST /auth/oauth/google`), which is the only party that verifies it.
 */
export async function requestGoogleCredential(): Promise<GoogleCredential | null> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID chưa được cấu hình (xem .env.example).')
  }

  await loadGoogleIdentityScript()

  return new Promise((resolve, reject) => {
    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => resolve(decodeCredential(response.credential)),
    })
    window.google!.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        const reason = notification.getNotDisplayedReason()
        reject(
          new Error(`Google không hiện được popup (${reason}). ${NOT_DISPLAYED_HINTS[reason]}`),
        )
        return
      }
      if (notification.isSkippedMoment() && notification.getSkippedReason() !== 'user_cancel') {
        reject(new Error(`Google bỏ qua popup (${notification.getSkippedReason()}).`))
        return
      }
      if (notification.isDismissedMoment() || notification.isSkippedMoment()) {
        resolve(null)
      }
    })
  })
}
