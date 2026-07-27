# Quickstart: Home — Template Catalog

**Feature**: `specs/004-home-catalog-browse`
**Date**: 2026-07-27

## Prerequisites

- Node.js 20+ installed
- Project dependencies installed (`npm install`)
- (Optional) Backend running at `VITE_API_BASE_URL` for real data; otherwise mock data is used

## Validation Scenarios

### Scenario 1: Catalog page renders with mock data

**Setup**: No `VITE_API_BASE_URL` set (mock mode).

**Steps**:

1. Run `npm run dev`
2. Open `http://localhost:5173/`
3. Observe the Home page loads with:
   - Top bar: brand mark "{ } How2Prompt", "Thư viện" nav link active
   - Page head: eyebrow "templates · guest & member", greeting, lede
   - Featured rail with horizontal-scrolling template cards
   - Trending rail with horizontal-scrolling template cards
   - Full grid section with count badge (e.g., "4 / 4 mẫu")

**Expected**: Template cards show title, description, official badge (if applicable), model tags, and usage count. Page matches `docs/design/how2prompt-workspace-mockup.html`.

### Scenario 2: Filter by AI model

**Steps**:

1. On the catalog page, open the model dropdown
2. Select "Claude"
3. Observe the grid narrows to only Claude-compatible templates
4. Check the URL updates to `/?model=claude`
5. Select "Tất cả model AI" to reset

**Expected**: Grid updates instantly; count badge reflects filtered total; URL is deep-linkable.

### Scenario 3: Filter by tag chip

**Steps**:

1. Click the "#debugging" tag chip
2. Observe the chip becomes active (indigo background)
3. Grid narrows to debugging templates
4. URL updates to `/?tag=debugging`
5. Click "Tất cả" to reset

**Expected**: Chip toggle works; grid and count badge update; URL syncs.

### Scenario 4: Search with debounce

**Steps**:

1. Type "email" in the search box
2. Observe results appear after ~300ms delay
3. Clear the search box
4. Grid reverts to full results

**Expected**: 300ms debounce before results update; clearing search restores full grid.

### Scenario 5: Combined filters (AND logic)

**Steps**:

1. Select model "Claude" from dropdown
2. Type "marketing" in search
3. Observe only templates matching BOTH criteria appear

**Expected**: Search and model filter compose with AND logic.

### Scenario 6: Empty state

**Steps**:

1. Type "xyznonexistent" in search
2. Observe empty state message appears

**Expected**: Message reads "Không tìm thấy mẫu phù hợp — thử từ khóa hoặc bộ lọc khác."

### Scenario 7: Deep-linking

**Steps**:

1. Apply filters (e.g., model=claude, tag=debugging)
2. Copy the URL
3. Open in a new incognito window
4. Observe the same filters are restored

**Expected**: URL parameters restore the exact filtered view.

### Scenario 8: Dark mode

**Steps**:

1. Toggle system/browser to dark mode (or add `data-theme="dark"` to `<html>`)
2. Observe the catalog page renders with dark background, light text, and indigo accent

**Expected**: All text and controls remain legible; matches dark tokens from mockup.

## Running Tests

```bash
npm run test                    # All tests
npm run test -- --watch         # Watch mode
npx vitest run src/features/home  # Home feature tests only
```

## Lint & Build

```bash
npm run lint                    # oxlint
npm run format                  # prettier
npm run build                   # tsc -b && vite build
```

All three must pass before the feature is considered complete (Constitution Principle V).
