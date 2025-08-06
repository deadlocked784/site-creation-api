<?php
require_once __DIR__ . '/../Services/ContactTypesService.php';

use Utils\Response;

// GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $contactTypes = \Services\ContactTypesService::getAll();
        Response::json(['data' => $contactTypes]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);
