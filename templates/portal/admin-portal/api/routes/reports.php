<?php
require_once __DIR__ . '/../Services/ReportService.php';

use Utils\Response;

$id = null;
if (isset($parts[0]) && is_numeric($parts[0])) {
  $id = (int) $parts[0];
}


// GET by ID
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $id !== null) {
  try {
    $report = \Services\ReportService::getById($id);
    if ($report) {
      Response::json(['data' => $report]);
    } else {
      Response::json(['error' => 'Report Not Found'], 404);
    }
  } catch (Exception $e) {
    Response::json(['error' => $e->getMessage()], 500);
  }
  exit;
}

// GET /reports/getRowsByInstanceId/{id}
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'getRowsByInstanceId' && isset($parts[1]) && is_numeric($parts[1])) {
  try {
    $id = (int) $parts[1];
    $contacts = \Services\ReportService::getRowsByInstanceId($id);
    Response::json(['success' => true, 'data' => $contacts]);
  } catch (Exception $e) {
    Response::json(['error' => $e->getMessage()], 500);
  }
  exit;
}

// GET /reports/searchkits
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'searchkits') {
  try {
    $searchKits = \Services\ReportService::getAllSearchKits();
    Response::json(['success' => true, 'data' => $searchKits]);
  } catch (Exception $e) {
    Response::json(['error' => $e->getMessage()], 500);
  }
  exit;
}

// GET all reports
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  try {

    $reports = \Services\ReportService::getAll();
    Response::json(['data' => $reports]);
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}

// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);
