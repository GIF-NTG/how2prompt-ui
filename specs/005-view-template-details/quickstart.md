# Quickstart: View Template Details

**Feature**: `specs/005-view-template-details`
**Date**: 2026-07-27

**Scope**: Read-only template detail page. No dynamic form, no prompt generation (Epic 3 out of scope).

## Prerequisites

- Node.js 20+ installed
- Project dependencies installed (`npm install`)
- (Optional) Backend running at `VITE_API_BASE_URL` for real data; otherwise mock data is used

## Validation Scenarios

### Scenario 1: Detail page renders with mock data

**Setup**: No `VITE_API_BASE_URL` set (mock mode).

**Steps**:

1. Run `npm run dev`
2. Open `http://localhost:5173/templates/debug-loi-hieu-qua`
3. Observe the detail page loads with:
   - Back-link: "← Quay lại thư viện"
   - Page head: eyebrow "#debugging", title "Debug lỗi hiệu quả", description
   - Model tag pills: "GPT-4o", "Claude"
   - Usage guide section
   - Example output section
   - Usage count: "482 lượt dùng"

**Expected**: Page matches `docs/design/how2prompt-workspace-mockup.html` read-only detail view.

### Scenario 2: Back link navigates to catalog

**Steps**:

1. On the detail page, click "← Quay lại thư viện"
2. Observe navigation to the catalog page (`/`)

**Expected**: Back link works and navigates to the catalog.

### Scenario 3: Model tag pills display correctly

**Steps**:

1. On the detail page, observe the model tag pills below the page head
2. Verify each supported model is shown as a small pill (e.g., "GPT-4o", "Claude")

**Expected**: Model tags are styled per the mockup's `.model-tag` class.

### Scenario 4: Usage guide section renders

**Steps**:

1. On the detail page, scroll to the usage guide section
2. Observe the guide text is displayed in Vietnamese (or English fallback)

**Expected**: Guide text renders from `current_version.guide` via `getI18nValue`.

### Scenario 5: Example output section renders

**Steps**:

1. On the detail page, scroll to the example output section
2. Observe a sample generated prompt is displayed

**Expected**: Example output renders from `current_version.example_output` via `getI18nValue`.

### Scenario 6: Favorite toggle (authenticated)

**Steps**:

1. Sign in as a user
2. Navigate to a template detail page
3. Click the heart icon (favorite toggle)
4. Observe toast confirmation: "Đã thêm vào Yêu thích"
5. Click again to unfavorite
6. Observe toast: "Đã bỏ Yêu thích"

**Expected**: Favorite toggle works with visual feedback.

### Scenario 7: Favorite toggle hidden for guests

**Steps**:

1. Navigate to a template detail page without signing in
2. Observe no heart/favorite button is displayed

**Expected**: Favorite toggle is hidden for unauthenticated visitors.

### Scenario 8: 404 state

**Steps**:

1. Navigate to `http://localhost:5173/templates/nonexistent-slug`
2. Observe the 404 Not Found state with a message and link back to catalog

**Expected**: Clear 404 message with navigation back to catalog.

### Scenario 9: Loading state

**Steps**:

1. Navigate to a valid template detail URL
2. Observe the loading skeleton/spinner before data appears

**Expected**: Loading indicator shown during data fetch.

### Scenario 10: Dark mode

**Steps**:

1. Toggle system/browser to dark mode (or add `data-theme="dark"` to `<html>`)
2. Observe the detail page renders with dark background, light text, and indigo accent

**Expected**: All text and controls remain legible; matches dark tokens from mockup.

### Scenario 11: Responsive layout

**Steps**:

1. Resize browser to < 860px width
2. Observe all content stacks vertically
3. Verify no horizontal scrolling

**Expected**: Stacked layout on mobile; all sections accessible.

## Running Tests

```bash
npm run test                                    # All tests
npm run test -- --watch                         # Watch mode
npx vitest run src/features/template-detail     # Detail feature tests only
```

## Lint & Build

```bash
npm run lint                    # oxlint
npm run format                  # prettier
npm run build                   # tsc -b && vite build
```

All three must pass before the feature is considered complete (Constitution Principle V).
