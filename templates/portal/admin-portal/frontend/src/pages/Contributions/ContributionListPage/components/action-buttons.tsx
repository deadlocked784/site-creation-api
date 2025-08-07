import { useState } from "react";
import { sendMailReceipts } from "./mail-receipts";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import type { Contribution } from "@/types/contribution";
import { downloadPdfReceipts } from "./pdf-receipts";
import PrintReceiptDialog from "../../components/pdf-receipts-dialog";
import  MailReceiptDialog from "../../components/mail-receipts-dialog";

export function ActionButtons({ selectedRows }: { selectedRows: Contribution[] }) {
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [showMailDialog, setShowMailDialog] = useState(false);

  const handleDownloadClick = () => {
    setShowPdfDialog(true);
  };

  const handleSendMailClick = () => {
    setShowMailDialog(true);
  };

  const handleConfirmDownload = async () => {
    setShowPdfDialog(false);
    try {
      await downloadPdfReceipts(selectedRows);
    } catch (e) {
      console.error("Download PDF error:", e);
    }
  };

  const handleConfirmSendMail = async () => {
    setShowMailDialog(false);
    try {
      await sendMailReceipts(selectedRows);
    } catch (e) {
      console.error("Send email error:", e);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleSendMailClick}>Mail Receipt</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadClick}>PDF Receipt</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* PDF Confirmation Dialog */}
      <PrintReceiptDialog
        open={showPdfDialog}
        onOpenChange={setShowPdfDialog}
        onConfirm={handleConfirmDownload}
      />

      {/* Mail Confirmation Dialog */}
      <MailReceiptDialog
        open={showMailDialog}
        onOpenChange={setShowMailDialog}
        onConfirm={handleConfirmSendMail}
      />
    </>
  );
}
