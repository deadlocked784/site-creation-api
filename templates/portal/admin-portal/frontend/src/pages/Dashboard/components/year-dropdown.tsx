import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type YearDropdownProps = {
  selectedYear: number
  onChange: (year: number) => void
  className?: string
}

const getLastTenYears = (): number[] => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => currentYear - i)
}

export default function YearDropdown({
  selectedYear,
  onChange,
  className,
}: YearDropdownProps) {
  return (
    <Select
      value={selectedYear === 0 ? "0" : selectedYear.toString()}
      onValueChange={(value) => onChange(Number(value))}
    >
      <SelectTrigger className={`w-[120px] text-xs ${className ?? ""}`}>
        <SelectValue placeholder="Select Year" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0">All Years</SelectItem>
        {getLastTenYears().map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
