
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: string;
    Form: React.ReactNode;
}
export default function EditDialog({
    open,
    onOpenChange,
    type,
    Form,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form>
                <DialogContent className="sm:max-w-[625px] lg:max-w-[1025px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                          {`Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                        </DialogTitle>
                          <DialogDescription>
                            Enter the {type} details, click save when you are done.
                          </DialogDescription>
                    </DialogHeader>
                    {Form}
                </DialogContent>
            </form>
        </Dialog>
    )
}
