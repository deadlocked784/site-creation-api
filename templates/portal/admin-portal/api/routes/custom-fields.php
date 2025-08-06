<?php
require_once __DIR__ . '/../Services/CustomFieldService.php';

use Utils\Response;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $customGroupName = isset($_GET['custom_group_name']) ? $_GET['custom_group_name'] : null;

        if (!$customGroupName) {
            Response::json(['error' => 'Custom group name is required'], 400);
            exit;
        }

        $contacts = \Services\CustomFieldService::getAll($customGroupName);
        Response::json(['data' => $contacts]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);
