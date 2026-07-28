import { useCallback, useMemo, useState } from 'react'
import type { TemplateDetail } from '@/features/template-detail/types'
import { useAuth } from '@/features/auth/context/useAuth'
import { useGenerateForm } from '../hooks/useGenerateForm'
import { createGenerateClient } from '../api/generateClient'
import type { GenerateResponse } from '../api/generateClient.types'
import { ModelVariantSelect } from './ModelVariantSelect'
import { DynamicForm } from './DynamicForm'
import { ExtraInstructionsField } from './ExtraInstructionsField'
import { PreviewPanel } from './PreviewPanel'
import { GenerateActions } from './GenerateActions'
import { OutputBox } from './OutputBox'

interface TemplateGenerateSectionProps {
  template: TemplateDetail
}

function getActivePromptBody(template: TemplateDetail, modelCode: string): string {
  const variant = template.currentVersion.variants.find((v) => v.aiModelCode === modelCode)
  return variant?.promptBodyOverride ?? template.currentVersion.promptBody
}

export function TemplateGenerateSection({ template }: TemplateGenerateSectionProps) {
  const { state, setModelCode, setValue, setExtraInstructions, activeVariables } =
    useGenerateForm(template)
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
  }, [generateClient, template.id, state.selectedModelCode, state.inputValues, state.extraInstructions])

  return (
    <section className="flex flex-col gap-6 rounded-[10px] border border-[#E2E5DC] bg-white p-6 dark:border-[#2C3130] dark:bg-[#1A1E1D]">
      <h2 className="m-0 text-[1.1rem] font-semibold text-[#14171A] dark:text-[#F3F5F0]">
        Tạo prompt từ template
      </h2>

      {/* Developer A: ModelVariantSelect slot */}
      <ModelVariantSelect
        supportedModels={template.supportedModels}
        selectedModelCode={state.selectedModelCode}
        onChange={setModelCode}
      />

      {/* Developer A: DynamicForm slot */}
      <DynamicForm
        variables={activeVariables}
        inputValues={state.inputValues}
        errors={state.errors}
        onValueChange={setValue}
      />

      {/* Developer A: ExtraInstructionsField slot */}
      <ExtraInstructionsField
        value={state.extraInstructions}
        onChange={setExtraInstructions}
      />

      {/* Developer B: PreviewPanel slot */}
      <PreviewPanel
        promptBody={activePromptBody}
        inputValues={state.inputValues}
        extraInstructions={state.extraInstructions}
      />

      {/* Developer B: GenerateActions + OutputBox slot */}
      <div data-slot="generate-output" className="flex flex-col gap-4">
        <GenerateActions
          isValid={state.isValid}
          finalPrompt={generateResult?.finalPrompt ?? null}
          onGenerate={handleGenerate}
        />
        <OutputBox result={generateResult} />
      </div>
    </section>
  )
}
