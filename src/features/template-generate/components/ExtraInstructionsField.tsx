interface ExtraInstructionsFieldProps {
  value: string
  onChange: (text: string) => void
}

export function ExtraInstructionsField({ value, onChange }: ExtraInstructionsFieldProps) {
  return (
    <div className="flex flex-col gap-[0.35rem]">
      <label
        htmlFor="extra-instructions"
        className="text-[0.82rem] font-medium text-[#4A4F4A] dark:text-[#A8ADA7]"
      >
        Additional instructions
      </label>
      <textarea
        id="extra-instructions"
        name="extra-instructions"
        value={value}
        placeholder="Add any specific instructions if needed (optional)..."
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-xl border border-[#DBDFD3] bg-white px-[0.9rem] py-[0.62rem] text-[0.86rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]"
      />
      <p className="m-0 text-[0.75rem] text-[#8A8F8A] dark:text-[#6B706B]">
        Add context or special requirements — this will be appended to the final result.
      </p>
    </div>
  )
}
