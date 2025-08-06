<?php
require_once __DIR__ . '/../Services/GroupService.php';

use Utils\Response;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $groups = \Services\GroupService::getAll();
        Response::json(['data' => $groups]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);
