<?php
namespace Services;

// require_once __DIR__ . '/../../../../wordpress/wp-content/plugins/civicrm/civicrm/civicrm.config.php'; //Production 

require_once __DIR__ . '/../../../wp-content/plugins/civicrm/civicrm/civicrm.config.php'; //localhost


class MailReceiptService
{
    public static function mailReceipt(array $ids): array
    {
        $results = [];

        foreach ($ids as $id) {
            try {
                $result = civicrm_api3('Contribution', 'sendconfirmation', [
                    'id' => $id,
                    'receipt_update' => 1,
                ]);
                $results[] = ['id' => $id, 'status' => 'success'];
            } catch (\Exception $e) {
                error_log("Error sending receipt for ID $id: " . $e->getMessage());
                $results[] = ['id' => $id, 'status' => 'error', 'message' => $e->getMessage()];
            }
        }
        return $results;
    }
}
