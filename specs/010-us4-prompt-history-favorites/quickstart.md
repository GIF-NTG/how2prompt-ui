# Quickstart: Validate Prompt History & Favorites

## Prerequisites

- Node deps installed (`npm install`).
- No live backend required for most scenarios — the mock client
  (`historyClient.mock.ts`) is sufficient; the mock fixtures must include at
  least one User with 20+ history entries (to exercise pagination), one
  entry whose `templateId` is `null` (deleted template), and one favorited
  template.

```bash
npm run dev
```

Log in as a mock User (existing auth mock flow) before testing — all
scenarios below require an authenticated session.

## 1. View history (US1)

1. Generate a prompt from any template detail page.
2. Navigate to `/history`.
3. Confirm the just-generated entry appears first, showing template name, AI
   model, a prompt snippet, and date.
4. Apply a template filter, then a model filter, then a date range — confirm
   the list narrows correctly and the URL query string reflects the active
   filters (shareable link).
5. Scroll/click to load the next page — confirm older entries load and
   filters are preserved.
6. As a Guest (log out), visit `/history` — confirm redirect to `/login`.
7. As a User with zero history, visit `/history` — confirm the empty state,
   not a blank page.

## 2. Auto-save on generate (US2)

1. As a logged-in User, generate a prompt.
2. Immediately open `/history` (no extra save action taken) — confirm the
   new entry is present.
3. As a Guest, generate a prompt (within quota) — confirm no history UI is
   reachable/implied for Guests (route stays gated per US1 scenario 5).

## 3. Reload from history — "Re-run" (US3)

1. From `/history`, click "Re-run" on an entry for a template that still
   exists.
2. Confirm the template's generate form opens pre-filled with the entry's
   original input values and AI model selected.
3. Change one field and click Generate — confirm a **new** history entry
   appears in `/history` and the original entry's values are unchanged.
4. Using a mock fixture with `templateId: null` (deleted template), click
   "Re-run" — confirm a clear "template no longer available" message and no
   form reload, while the entry's saved prompt text is still viewable/copyable.
5. Using a mock fixture whose `templateVersionId` is older than the
   template's current version, open that entry — confirm a "newer version
   available" indicator.

## 4. Favorite / unfavorite (US4)

1. On the catalog or a template detail page, click the heart icon on an
   unfavorited template — confirm it switches to favorited immediately and
   the count increments.
2. Click it again — confirm it unfavorites and the count decrements (this is
   the behavior the `toggleFavorite` POST/DELETE fix enables — verify it
   does NOT double-POST).
3. As a Guest, click a heart icon — confirm a login prompt, not a silent
   failure.
4. Navigate to `/favorites` — confirm all favorited templates are listed.
5. Unfavorite one from `/favorites` — confirm it disappears from that list
   and its heart icon elsewhere (e.g. catalog) reflects unfavorited too.

## 5. Delete history (US5)

1. From `/history`, click delete on one entry, confirm the dialog, confirm —
   entry disappears immediately.
2. Click delete, then cancel — entry remains.
3. Select multiple entries, "Delete selected", confirm once — all selected
   entries disappear together.
4. Refresh `/history` — confirm none of the deleted entries reappear.

## 6. Regression check

```bash
npm run test
npm run lint
npm run build
```

Expected: all pass. Existing catalog/template-detail/template-generate
behavior (favorite toggle on `TemplateCard`/`TemplateMeta`, generate flow)
must be unchanged apart from the POST/DELETE toggle fix described above.

## 7. Live-backend caveat (if reachable)

If a live v1.1.0 backend is reachable, repeat sections 1-5 against
`historyClient.real.ts` (set `VITE_API_BASE_URL`) to confirm the
`page`/`size` pagination and `GET /generated-prompts/{id}` pre-fill
assumptions (research.md) against real responses; otherwise record in the
PR/notes that this remains unverified against a live backend, consistent
with prior specs' "Not run" caveats (e.g. specs/003, specs/004-auth-contract-migration).
