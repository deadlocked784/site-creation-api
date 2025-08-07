import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

export default function ActionButtons() {
  return (
    <div className="flex items-center">
      <Button variant="secondary" className="mr-2 w-24">
        <Pencil /> Edit
      </Button>
      <Button variant="destructive" className="ml-2 w-24">
        <Trash /> Delete
      </Button>
    </div>
  )
}