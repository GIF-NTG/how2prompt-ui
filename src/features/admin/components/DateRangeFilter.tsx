interface DateRangeFilterProps {
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
}

const inputBase =
  'rounded-lg border border-[#DBDFD3] bg-white px-3 py-1.5 text-[0.82rem] text-[#1B1D1B] transition-colors duration-150 focus:border-[#3652E0] focus:outline-none dark:border-[#2C3130] dark:bg-[#1C2024] dark:text-[#ECEEE8]'

export function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-[0.82rem] text-[#4A4F4A] dark:text-[#A8ADA7]">
        Từ
        <input
          type="date"
          className={inputBase}
          value={from}
          onChange={(e) => onChange({ from: e.target.value, to })}
        />
      </label>
      <label className="flex items-center gap-2 text-[0.82rem] text-[#4A4F4A] dark:text-[#A8ADA7]">
        Đến
        <input
          type="date"
          className={inputBase}
          value={to}
          onChange={(e) => onChange({ from, to: e.target.value })}
        />
      </label>
    </div>
  )
}
