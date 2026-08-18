import { useCallback, useMemo, useState } from 'react'
import type { TemplateDetail } from '@/features/template-detail/types'
import { useAuth } from '@/features/auth/context/useAuth'
import { createAiEnhanceClient } from '@/features/ai-enhance/api/aiEnhanceClient'
import { useRefinePrompt } from '@/features/ai-enhance/hooks/useRefinePrompt'
import { RefineTrigger } from '@/features/ai-enhance/components/RefineTrigger'
import { RefineDiffView } from '@/features/ai-enhance/components/RefineDiffView'
import { useGenerateForm } from '../hooks/useGenerateForm'
import { createGenerateClient } from '../api/generateClient'
import type { GenerateResponse } from '../api/generateClient.types'
import type { GenerateFormOverride } from '../types'
import { ModelVariantSelect } from './ModelVariantSelect'
import { DynamicForm } from './DynamicForm'
import { ExtraInstructionsField } from './ExtraInstructionsField'
import { PreviewPanel } from './PreviewPanel'
import { GenerateActions } from './GenerateActions'
import { CopyResultButton } from './CopyResultButton'

interface TemplateGenerateSectionProps {
  template: TemplateDetail
  reloadOverride?: GenerateFormOverride
  /** Seeds the "Result" panel from an already-saved generation (e.g.
   *  RegenerateHistoryPage re-opening a history entry) instead of starting
   *  from the template's live client-side "Preview". Without this, reopening
   *  a history entry whose `finalPrompt` was refined/edited after the
   *  original generate would show the un-refined text reconstructed from
   *  `reloadOverride.inputValues` — a mismatch with what the user actually
   *  saw and clicked into from the history list. */
  initialResult?: GenerateResponse
}

function getActivePromptBody(template: TemplateDetail, modelCode: string): string {
  const variant = template.currentVersion.variants.find((v) => v.aiModelCode === modelCode)
  return variant?.promptBodyOverride ?? template.currentVersion.promptBody
}

export function TemplateGenerateSection({
  template,
  reloadOverride,
  initialResult,
}: TemplateGenerateSectionProps) {
  const { state, setModelCode, setValue, setExtraInstructions, markTouched, activeVariables } =
    useGenerateForm(template, reloadOverride)
  const activePromptBody = getActivePromptBody(template, state.selectedModelCode)

  const { session } = useAuth()
  const generateClient = useMemo(() => createGenerateClient(session?.token), [session?.token])
  const [generateResult, setGenerateResult] = useState<GenerateResponse | null>(
    initialResult ?? null,
  )

  const aiEnhanceClient = useMemo(() => createAiEnhanceClient(session?.token), [session?.token])
  const handleRefineAccepted = useCallback((finalPrompt: string) => {
    setGenerateResult((prev) => (prev ? { ...prev, finalPrompt } : prev))
  }, [])
  const refineState = useRefinePrompt({
    client: aiEnhanceClient,
    generatedPromptId: generateResult?.generatedPromptId ?? null,
    onAccepted: handleRefineAccepted,
  })

  const handleGenerate = useCallback(async () => {
    const result = await generateClient.generate(template.id, {
      aiModelCode: state.selectedModelCode,
      inputValues: state.inputValues,
      extraInstructions: state.extraInstructions || null,
    })
    setGenerateResult(result)
    return result
  }, [
    generateClient,
    template.id,
    state.selectedModelCode,
    state.inputValues,
    state.extraInstructions,
  ])

  // Editing the form after a generate invalidates that result — the BE-rendered
  // text no longer matches what's on screen, so drop back to the live client
  // preview until the visitor generates again.
  const handleModelChange = useCallback(
    (code: string) => {
      setGenerateResult(null)
      setModelCode(code)
    },
    [setModelCode],
  )
  const handleValueChange = useCallback(
    (varKey: string, value: string | number | boolean | string[]) => {
      setGenerateResult(null)
      setValue(varKey, value)
    },
    [setValue],
  )
  const handleExtraInstructionsChange = useCallback(
    (text: string) => {
      setGenerateResult(null)
      setExtraInstructions(text)
    },
    [setExtraInstructions],
  )

  // While a refine result is on screen, drop the form-beside-result 2-column
  // split and let the form stack full-width above, so the Result/Refined
  // pair below gets the *entire* container's width to lay out side by side
  // in — half of a 1.1fr/0.9fr split often isn't enough room for two legible
  // panels (this component renders inside containers as narrow as
  // RegenerateHistoryPage's `max-w-[1120px]` shell, not just the wide
  // template detail page).
  const hasRefineResult = Boolean(refineState.result)

  return (
    <div
      className={`grid min-w-0 gap-6 lg:items-start ${hasRefineResult ? '' : 'lg:grid-cols-[1.1fr_0.9fr]'}`}
    >
      <section className="flex min-w-0 flex-col gap-6 rounded-panel border border-[#E2E5DC] bg-white p-6 dark:border-[#2C3130] dark:bg-[#1A1E1D]">
        <h2 className="m-0 text-[1.1rem] font-semibold text-[#14171A] dark:text-[#F3F5F0]">
          Generate a prompt from template
        </h2>

        {/* Developer A: ModelVariantSelect slot */}
        <ModelVariantSelect
          supportedModels={template.supportedModels}
          selectedModelCode={state.selectedModelCode}
          onChange={handleModelChange}
        />

        {/* Developer A: DynamicForm slot */}
        <DynamicForm
          variables={activeVariables}
          inputValues={state.inputValues}
          errors={state.errors}
          onValueChange={handleValueChange}
          onBlur={markTouched}
        />

        {/* Developer A: ExtraInstructionsField slot */}
        <ExtraInstructionsField
          value={state.extraInstructions}
          onChange={handleExtraInstructionsChange}
        />

        {/* Developer B: GenerateActions slot */}
        <GenerateActions isValid={state.isValid} onGenerate={handleGenerate} />
      </section>

      {/* Developer B: PreviewPanel slot — sits next to the refine diff (when
          active) instead of above/below it, so Result and Refined stay easy
          to compare side by side rather than stacked. Uses an auto-fit grid
          (not a viewport breakpoint like `xl:flex-row`) so the two panels
          only go side by side when there's actually >=320px each to give
          them — this component renders inside containers of very different
          widths (the full-width template detail page vs.
          RegenerateHistoryPage's narrower `max-w-[1120px]` shell), and a
          viewport-width breakpoint doesn't know which one it's in. */}
      <aside className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 lg:sticky lg:top-6">
        <div className="flex min-w-0 flex-col gap-3 rounded-panel border border-[#E2E5DC] bg-white p-6 dark:border-[#2C3130] dark:bg-[#1A1E1D]">
          <PreviewPanel
            promptBody={activePromptBody}
            inputValues={state.inputValues}
            extraInstructions={state.extraInstructions}
            result={generateResult}
          />
          {/* Copy and Refine only make sense once a result exists to act on
              — placed right here, next to the result itself, instead of
              under the form (their old home) where they're one scroll away
              from what they act on. */}
          {generateResult && (
            <div className="flex flex-wrap items-start gap-3">
              <CopyResultButton text={generateResult.finalPrompt} />
              <RefineTrigger
                eligible={
                  Boolean(generateResult.generatedPromptId) && Boolean(session?.emailVerified)
                }
                state={refineState.state}
                errorMessage={refineState.errorMessage}
                onRefine={() => void refineState.refine()}
              />
            </div>
          )}
        </div>
        {refineState.result && (
          <div className="min-w-0 rounded-panel border border-[#E2E5DC] bg-white p-6 dark:border-[#2C3130] dark:bg-[#1A1E1D]">
            <RefineDiffView
              result={refineState.result}
              onAccept={(editedText) => void refineState.acceptRefine(editedText)}
              onDiscard={() => void refineState.discardRefine()}
            />
          </div>
        )}
      </aside>
    </div>
  )
}
