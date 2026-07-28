# Quickstart: Login & Register UI (API-ready)

Validation guide for this feature once implemented. No backend is required — every
scenario below runs against the mock `AuthClient` (see
[contracts/auth-client.md](./contracts/auth-client.md)).

## Prerequisites

- `npm install` has been run at the repo root.
- No backend URL is required for this feature yet.
- For the Google sign-in scenarios (8-10) only: copy `.env.example` to `.env.local`
  and set `VITE_GOOGLE_CLIENT_ID` to a real Google OAuth Client ID (public value,
  never the client secret — see `research.md`'s 2026-07-24 amendment). Without it,
  scenarios 1-7 still work; Google sign-in will show a configuration error instead.

## Run it

```sh
npm run dev
```

Open the printed local URL, then navigate to `/login` and `/register`.

## Validation scenarios

Each scenario references the acceptance scenario it proves in `spec.md`.

### 1. Sign in successfully (US1, scenario 1)

1. Go to `/login`.
2. Type the mock's demo credentials into the two inline blanks:
   `demo@how2prompt.dev` / `demo1234` (defined in `authClient.mock.ts`).
3. Submit.
4. **Expect**: primary navigation shows the signed-in identifier; a sign-out control
   is available.

### 2. Invalid credentials (US1, scenario 2)

1. Go to `/login`.
2. Type any email/password that isn't the mock's known-valid pair.
3. Submit.
4. **Expect**: inline message "Email hoặc mật khẩu không chính xác"; typed values are
   not cleared; still on `/login`.

### 3. Empty required blank blocks submission (US1 scenario 3 / US2 scenario 3)

1. Go to `/login`, leave the password blank empty, submit.
2. **Expect**: submission is blocked, the empty blank is visibly flagged, focus moves
   to it, no loading state appears (no call was made).
3. Repeat on `/register` leaving `displayName` empty, then again with a password
   shorter than 8 characters — same blocked-before-call behavior each time (FR-006,
   FR-008).

### 4. Register then redirect to Login (US2, scenario 1)

1. Go to `/register`.
2. Fill in a display name, a well-formed unique email, and a password ≥ 8 characters.
3. Submit.
4. **Expect**: navigation lands on `/login` with a visible "account created"
   confirmation; the visitor is NOT automatically signed in.

### 5. Duplicate email on register (US2, scenario 2)

1. Go to `/register`.
2. Use an email the mock already treats as registered.
3. Submit.
4. **Expect**: inline message "Email này đã được đăng ký, hãy đăng nhập" with a link
   to `/login`.

### 6. Session survives reload (US3, scenario 2)

1. Complete scenario 1 (signed in).
2. Reload the page (F5).
3. **Expect**: still signed in — nav still shows the identifier.

### 7. Light/dark legibility (US3, scenario 3 / SC-005)

1. Toggle the OS/browser color scheme preference (or the app's own theme toggle, if
   present) while on `/login` and `/register`.
2. **Expect**: all text and controls remain clearly legible in both modes.

### 8. Google sign-in, new visitor (US4, scenario 1)

Requires `VITE_GOOGLE_CLIENT_ID` configured (see Prerequisites). Uses the real
Google Identity Services (One Tap) prompt — the credential is decoded client-side
only, not verified against a backend (documented limitation, see
`src/features/auth/api/googleIdentity.ts`).

1. Go to `/login` or `/register`.
2. Choose "Đăng nhập bằng Google" and pick a real Google account you haven't used
   with this app before.
3. **Expect**: resolves to a signed-in state without any blank being filled in;
   treated as account creation (no separate register step required).

### 9. Google sign-in, linked to existing account (US4, scenario 2)

1. Register a password-based account using the _same_ email address as the Google
   account you'll use in the next step.
2. Sign out.
3. Choose "Đăng nhập bằng Google" and pick that same Google account.
4. **Expect**: signed into the _same_ account (not a second, duplicate one) — confirm
   via the displayed identifier matching the original account's display name.

### 10. Dismiss the Google prompt (US4, scenario 3)

1. Choose "Đăng nhập bằng Google", then close/dismiss the real Google prompt without
   picking an account.
2. **Expect**: returns to signed-out state, no error banner shown. (There is no
   separate "cancel" button in the UI — dismissing the real prompt is the cancel
   path; `authClient.signInWithGoogle({ simulate: 'cancel' })` exercises the same
   outcome programmatically for tests, see `GoogleSignInButton.test.tsx`.)

## Automated checks

```sh
npm run lint
npm run build
npm run test
```

All three must pass (Constitution Principle V) before this feature is considered
done, in addition to manually walking through the scenarios above in a running
browser.
