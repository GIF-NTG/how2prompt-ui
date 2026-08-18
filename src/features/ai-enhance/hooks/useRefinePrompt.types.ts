export type RefineFlowState = 'idle' | 'loading' | 'result' | 'error'

/** Transient refine result held in `useRefinePrompt`'s local state — never
 *  persisted client-side beyond the current session (spec.md's "Refinement
 *  Result" key entity). `editedPrompt` is UI-only, not part of the API
 *  response: set once the user hand-edits the refined text (US3). */
export interface RefinementResult {
  promptId: string
  originalPrompt: string
  refinedPrompt: string
  explanations: string[]
  editedPrompt: string | null
}
