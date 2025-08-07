import { toast } from "sonner";
import { mailReceipts } from "@/services/mail-receipts"; 
import type { Contribution } from "@/types/contribution";

export async function sendMailReceipts(donations: Contribution[]) {
  const completedDonationIds = donations
    .filter((d) => d.contribution_status_id === 1)
    .map((d) => d.id);

  if (completedDonationIds.length === 0) {
    toast.warning("No completed donations selected.");
    return;
  }

  try {
    await mailReceipts(completedDonationIds); 
    toast.success("Receipts sent successfully.");
  } catch (err) {
    console.error("Failed to send receipts:", err);
    toast.error("Failed to send receipts.");
  }
}
