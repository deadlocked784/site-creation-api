import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export default function TableSkeleton() {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-14"></TableHead>
                        <TableHead className="w-36"><Skeleton className="h-4 w-14 rounded-sm" /></TableHead>
                        <TableHead className="w-80"><Skeleton className="h-4 w-14 rounded-sm" /></TableHead>
                        <TableHead className="w-44"><Skeleton className="h-4 w-14 rounded-sm" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-36 rounded-sm" /></TableHead>
                    </TableRow>
                </TableHeader>
            </Table>
            <TableBody>
                <TableRow>
                    <TableCell className="w-14"><Skeleton className="h-4 w-4 rounded-sm mx-auto" /></TableCell>
                    <TableCell className="w-36"><Skeleton className="h-4 w-14 rounded-sm" /></TableCell>
                    <TableCell className="w-80"><Skeleton className="h-4 w-40 rounded-sm" /></TableCell>
                    <TableCell className="w-44"><Skeleton className="h-4 w-20 rounded-sm" /></TableCell>
                    <TableCell className="w-48"><Skeleton className="h-4 w-48 rounded-sm" /></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="w-14"><Skeleton className="h-4 w-4 rounded-sm mx-auto" /></TableCell>
                    <TableCell className="w-36"><Skeleton className="h-4 w-20 rounded-sm" /></TableCell>
                    <TableCell className="w-80"><Skeleton className="h-4 w-64 rounded-sm" /></TableCell>
                    <TableCell className="w-44"><Skeleton className="h-4 w-32 rounded-sm" /></TableCell>
                    <TableCell className="w-48"><Skeleton className="h-4 w-64 rounded-sm" /></TableCell>
                </TableRow>
            </TableBody>
        </div>
    )
}