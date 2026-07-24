/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string
  /** Base URL of the real backend (e.g. `https://api.how2prompt.app/api/v1`). Leave
   * unset to keep using the local mock `AuthClient` — see authClient.ts. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
