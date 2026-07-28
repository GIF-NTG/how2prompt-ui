interface ModelVariantSelectProps {
  supportedModels: string[]
  selectedModelCode: string
  onChange: (code: string) => void
}

export function ModelVariantSelect({
  supportedModels,
  selectedModelCode,
  onChange,
}: ModelVariantSelectProps) {
  if (supportedModels.length <= 1) {
    return null
  }

  return (
    <div className="flex flex-col gap-[0.35rem]">
      <label
        htmlFor="model-variant-select"
        className="text-[0.82rem] font-medium text-[#4A4F4A] dark:text-[#A8ADA7]"
      >
        Mô hình AI
      </label>
      <select
        id="model-variant-select"
        value={selectedModelCode}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-xl border border-[#DBDFD3] bg-white px-[0.9rem] py-[0.62rem] text-[0.86rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]"
      >
        {supportedModels.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </div>
  )
}
