<?php
require_once __DIR__ . '/../Services/FinancialTypeService.php';

use Utils\Response;

// GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  try {
    $financialTypes = \Services\FinancialTypeService::getAll();
    Response::json(['data' => $financialTypes]);
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}

// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);
