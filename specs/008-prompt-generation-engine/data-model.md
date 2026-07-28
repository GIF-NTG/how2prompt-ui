# Phase 1 Data Model: Prompt Generation Engine

## `TemplateVariable` — new, `src/features/template-generate/types.ts`

Matches `docs/api/openapi.yaml`'s `TemplateVariable` schema (lines
1197–1236) in camelCase (see research.md's contract-mismatch finding — this
new type is correct from the start):

```ts
export interface TemplateVariableOption {
  value: string
  label: I18nString
}

export interface TemplateVariable {
  id: string
  varKey: string
  label: I18nString
  description: I18nString
  placeholder: I18nString
  helpText: I18nString
  inputType:
    | 'text' | 'textarea' | 'select' | 'multiselect' | 'number'
    | 'boolean' | 'date' | 'file' | 'url' | 'color' | 'slider'
  isRequired: boolean
  defaultValue: string | null
  options: TemplateVariableOption[]
  validation: { min?: number; max?: number; regex?: string; [k: string]: unknown }
  sortOrder: number
}
```

Per Constitution Principle I (US-3.2) and this feature's FR-001, only
`text | textarea | select | multiselect | number | boolean | slider` need a
rendered `FormField` control in this feature's initial scope — `date | file
| url | color` are in the contract's enum but not in any current mock
template; `FormField` should still not crash on them (render as a plain text
input fallback) rather than assume the enum is closed.

## `TemplateVariant` — new, same file

```ts
export interface TemplateVariant {
  aiModelCode: string
  promptBodyOverride: string | null
  systemPromptOverride: string | null
  modelConfig: Record<string, unknown>
}
```

## `TemplateVersion` extension — `src/features/template-detail/types.ts`

**Before**:
```ts
export interface TemplateVersion {
  version: number
  prompt_body: string
  guide: I18nString
  example_output: I18nString
  created_at: string
}
```

**After** (two fields added, camelCase per research.md's decision; nothing
else in this interface is touched by this feature):
```ts
export interface TemplateVersion {
  version: number
  prompt_body: string
  guide: I18nString
  example_output: I18nString
  created_at: string
  variables: TemplateVariable[]
  variants: TemplateVariant[]
}
```

`templateDetailClient.mock.ts`'s `MOCK_TEMPLATE.current_version` gains a
`variables`/`variants` value so the form has something to render in dev mode.

## `GenerateRequest` / `GenerateResponse` — new, `generateClient.types.ts`

Matches `docs/api/openapi.yaml` lines 1295–1332 exactly:

```ts
export interface GenerateRequest {
  templateVersionId?: string
  aiModelCode: string
  inputValues: Record<string, unknown>
  extraInstructions?: string | null
  title?: string | null
}

export interface GenerateResponse {
  generatedPromptId: string | null // null for guests — not saved server-side
  finalPrompt: string
  tokensEstimate: number
  aiModelCode: string
  remainingQuota: number | null // guests / Free plan only
}
```

## `GenerateFormState` — the shared contract, `useGenerateForm.ts`

The single piece of state both developers' halves read/write (full rationale
in research.md):

```ts
export interface GenerateFormState {
  selectedModelCode: string
  inputValues: Record<string, string | number | boolean | string[]>
  extraInstructions: string
  errors: Record<string, string> // varKey -> message; absent/empty = valid
  isValid: boolean
}

export interface UseGenerateFormResult {
  state: GenerateFormState
  setModelCode: (code: string) => void
  setValue: (varKey: string, value: GenerateFormState['inputValues'][string]) => void
  setExtraInstructions: (text: string) => void
  activeVariables: TemplateVariable[] // from the selected model's variant, or the template default
}
```

**Validation rules** (drives `errors`/`isValid`, per FR-002/FR-007):
- `isRequired: true` and value is empty/undefined → required error.
- `validation.min`/`max` on `number`/`slider` → range error.
- `validation.regex` on `text`/`textarea` → pattern error.
- `isValid` is `true` only when every variable in `activeVariables` currently
  passes its own rule.

**State transitions**:
- Changing `selectedModelCode` recomputes `activeVariables` (variant's
  variables if a `TemplateVariant` exists for that model, else the
  template's own `variables`) and preserves any `inputValues` entries whose
  `varKey` still exists in the new `activeVariables` (edge case in spec.md —
  "already-entered values that still apply are preserved").
- Every `setValue` call re-runs validation for that one `varKey` only
  (cheap, keeps the live preview in User Story 2 responsive per SC-003).

## Error shape reused from existing convention

No new error type — `422` (`ValidationError`) and `429`
(`GUEST_QUOTA_EXCEEDED`) both arrive as the project-wide
`{ error: { code, message, details?, traceId? } }` envelope already handled
by `httpClient.ts`'s `ApiError`. `generateClient`'s callers branch on
`error.code`/`error.status` exactly like every other client in this repo
(e.g. `authClient.real.ts`'s `TOKEN_EXPIRED` handling).
