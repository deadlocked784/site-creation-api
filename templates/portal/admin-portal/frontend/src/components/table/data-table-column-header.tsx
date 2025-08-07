import type { Column } from "@tanstack/react-table"
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div>{title}</div>
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="-ml-2.5 hover:cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {title}
            {column.getIsSorted() === false ? <ChevronsUpDown className="text-gray-500" /> : column.getIsSorted() === "asc" ? <ChevronUp /> : <ChevronDown />}
        </Button>
    )
}
