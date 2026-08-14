interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="flex min-w-[220px] flex-1 items-center gap-[0.6rem] rounded-xl border border-[#DBDFD3] bg-white px-4 py-[0.65rem] transition-colors duration-150 focus-within:border-[#3652E0] dark:border-[#2C3130] dark:bg-[#1C2024] dark:focus-within:border-[#8493FF]">
      <span aria-hidden="true" className="font-mono text-[#8B8F86] dark:text-[#6D726A]">
        ⌕
      </span>
      <input
        type="search"
        aria-label="Search templates"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name or description…"
        className="flex-1 border-none bg-none font-[inherit] text-[0.92rem] text-[#1B1D1B] outline-none placeholder:text-[#8B8F86] dark:text-[#ECEEE8] dark:placeholder:text-[#6D726A]"
      />
    </div>
  )
}
