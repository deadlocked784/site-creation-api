<?php
namespace Services;

use CRM_Utils_PDF_Utils;
use CRM_Core_BAO_MessageTemplate;

class PdfReceiptService
{
    public static function generatePdf(array $ids): array
    {
        $results = [];
        foreach ($ids as $id) {
            try {
                $contribution = \Civi\Api4\Contribution::get(TRUE)
                    ->addSelect('id', 'contact_id', 'Receipt_Details.Receipt_ID')
                    ->addWhere('id', '=', $id)
                    ->execute()
                    ->first();

                $contactId = $contribution['contact_id'];
                $receiptId = $contribution['Receipt_Details.Receipt_ID'];

                $templateResult = \Civi\Api4\MessageTemplate::get(TRUE)
                    ->addSelect('msg_text', 'msg_html', 'msg_subject')
                    ->addWhere('id', '=', 7) // for Contributions - Receipt (on-line)
                    ->execute()
                    ->first();

                $text = $templateResult['msg_text'] ?? '';
                $html = $templateResult['msg_html'] ?? '';
                $subject = $templateResult['msg_subject'] ?? '';

                // Render template with token replacement
                $rendered = CRM_Core_BAO_MessageTemplate::renderTemplate([
                    'messageTemplate' => [
                        'msg_text' => $text,
                        'msg_html' => $html,
                        'msg_subject' => $subject,
                    ],
                    'tokenContext' => [
                        'contactId' => $contactId,
                        'contributionId' => $id,
                    ],
                    'contactId' => $contactId,
                    'disableSmarty' => false,
                ]);

                $htmlRendered = $rendered['html'] ?? '';
                $pdfContent = CRM_Utils_PDF_Utils::html2pdf($htmlRendered, 'receipt.pdf', true);
                $pdfBase64 = base64_encode($pdfContent);

                $results[] = ['id' => $receiptId, 'status' => 'success', 'pdf' => $pdfBase64];
            } catch (\Exception $e) {
                $results[] = ['id' => $receiptId, 'status' => 'error', 'message' => $e->getMessage()];
            }
        }
        return $results;
    }
}
