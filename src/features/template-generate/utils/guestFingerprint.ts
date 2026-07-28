const STORAGE_KEY = 'h2p_guest_fingerprint'

export function getGuestFingerprint(): string {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) {
    return existing
  }
  const id = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, id)
  return id
}
