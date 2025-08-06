<?php
require_once __DIR__ . '/../Services/CountryService.php';

use Utils\Response;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $countries = \Services\CountryService::getAll();
        Response::json(['data' => $countries]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);
