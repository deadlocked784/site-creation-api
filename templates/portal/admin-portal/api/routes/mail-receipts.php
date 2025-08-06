<?php
require_once __DIR__ . '/../Services/MailReceiptService.php';

use Utils\Response;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $ids = $input['ids'] ?? [];
        if (empty($ids)) {
            Response::json(['error' => 'No IDs provided'], 400);
            exit;
        }
        $result = \Services\MailReceiptService::mailReceipt($ids);
        Response::json(['success' => true, 'result' => $result]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

Response::json(['error' => 'Method Not Allowed'], 405);
