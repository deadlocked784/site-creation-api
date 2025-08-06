<?php
require_once __DIR__ . '/../Services/EntityService.php';

use Utils\Response;

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0])) {
    try {
        $entityType = $parts[0];
        $filter = $_GET['filter'] ?? null;
        $entities = \Services\EntityService::getByType($entityType, $filter);
        Response::json(['data' => $entities]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);
