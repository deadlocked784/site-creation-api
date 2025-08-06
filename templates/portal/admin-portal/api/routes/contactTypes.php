<?php
require_once __DIR__ . '/../Services/ContactTypeService.php';

use Utils\Response;

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'parentsAndSubtypes') {
    try {
        $contactTypes = \Services\ContactTypeService::getParentsAndSubtypes();
        Response::json(['data' => $contactTypes]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

// GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $contactTypes = \Services\ContactTypeService::getAll();
        Response::json(['data' => $contactTypes]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);
