import { toast } from "sonner";
import { pdfReceipts } from "@/services/pdf-receipts";
import type { Contribution } from "@/types/contribution";

export async function downloadPdfReceipts(donations: Contribution[]) {


  const incompleteDonations = donations.filter((d) => d.contribution_status_id !== 1);
  const completedDonationIds = donations
    .filter((d) => d.contribution_status_id === 1)
    .map((d) => d.id);

  if (donations.length === 0) {
    toast.warning("No donations selected.");
    return;
  }

  if (incompleteDonations.length > 0) {
    toast.error('Please select only contributions with Completed status');
    return;
  }


  if (completedDonationIds.length === 0) {
    toast.warning("No completed donations selected.");
    return;
  }


  try {
    const response = await pdfReceipts(completedDonationIds);
    const results = response.result;

    for (const result of results) {
      if (result.status === "success") {
        const byteCharacters = atob(result.pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `ReceiptNo-${result.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error(`Failed to generate PDF for Receipt ID ${result.id}: ${result.message}`);
      }
    }

    toast.success("PDF receipt(s) downloaded.");
  } catch (err) {
    console.error("Failed to download receipts:", err);
    toast.error("Failed to download receipts.");
  }
}
