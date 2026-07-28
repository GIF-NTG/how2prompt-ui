import type { TemplateDetail } from '@/features/template-detail/types'
import { useGenerateForm } from '../hooks/useGenerateForm'
import { ModelVariantSelect } from './ModelVariantSelect'
import { DynamicForm } from './DynamicForm'
import { ExtraInstructionsField } from './ExtraInstructionsField'

interface TemplateGenerateSectionProps {
  template: TemplateDetail
}

export function TemplateGenerateSection({ template }: TemplateGenerateSectionProps) {
  const { state, setModelCode, setValue, setExtraInstructions, activeVariables } =
    useGenerateForm(template)

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
      <div data-slot="preview-panel" />

      {/* Developer B: GenerateActions + OutputBox slot */}
      <div data-slot="generate-output" />
    </section>
  )
}
