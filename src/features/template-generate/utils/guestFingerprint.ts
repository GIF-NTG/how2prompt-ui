const STORAGE_KEY = 'h2p_guest_fingerprint:v1'

export function getGuestFingerprint(): string {
  const id = crypto.randomUUID()
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing) {
      return existing
    }
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // storage unavailable (private mode, quota) — fall back to a
    // per-call id rather than breaking guest generation entirely
  }
  return id
}
