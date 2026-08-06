import { useCallback, useMemo, useState } from 'react'
import type { TemplateDetail } from '@/features/template-detail/types'
import { useAuth } from '@/features/auth/context/useAuth'
import { useGenerateForm } from '../hooks/useGenerateForm'
import { createGenerateClient } from '../api/generateClient'
import type { GenerateResponse } from '../api/generateClient.types'
import type { GenerateFormOverride } from '../types'
import { ModelVariantSelect } from './ModelVariantSelect'
import { DynamicForm } from './DynamicForm'
import { ExtraInstructionsField } from './ExtraInstructionsField'
import { PreviewPanel } from './PreviewPanel'
import { GenerateActions } from './GenerateActions'

interface TemplateGenerateSectionProps {
  template: TemplateDetail
  reloadOverride?: GenerateFormOverride
}

function getActivePromptBody(template: TemplateDetail, modelCode: string): string {
  const variant = template.currentVersion.variants.find((v) => v.aiModelCode === modelCode)
  return variant?.promptBodyOverride ?? template.currentVersion.promptBody
}

export function TemplateGenerateSection({
  template,
  reloadOverride,
}: TemplateGenerateSectionProps) {
  const { state, setModelCode, setValue, setExtraInstructions, markTouched, activeVariables } =
    useGenerateForm(template, reloadOverride)
  const activePromptBody = getActivePromptBody(template, state.selectedModelCode)

  const { session } = useAuth()
  const generateClient = useMemo(() => createGenerateClient(session?.token), [session?.token])
  const [generateResult, setGenerateResult] = useState<GenerateResponse | null>(null)

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

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <section className="flex flex-col gap-6 rounded-panel border border-[#E2E5DC] bg-white p-6 dark:border-[#2C3130] dark:bg-[#1A1E1D]">
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
        <GenerateActions
          isValid={state.isValid}
          finalPrompt={generateResult?.finalPrompt ?? null}
          onGenerate={handleGenerate}
        />
      </section>

      {/* Developer B: PreviewPanel slot */}
      <aside className="rounded-panel border border-[#E2E5DC] bg-white p-6 dark:border-[#2C3130] dark:bg-[#1A1E1D] lg:sticky lg:top-6">
        <PreviewPanel
          promptBody={activePromptBody}
          inputValues={state.inputValues}
          extraInstructions={state.extraInstructions}
          result={generateResult}
        />
      </aside>
    </div>
  )
}
