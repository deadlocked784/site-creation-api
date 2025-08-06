<?php
// Services
require_once __DIR__ . '/../Services/ContributionService.php';

use Utils\Response;

// Check for ID in URL path (contributions/123)
$id = null;
if (isset($parts[0]) && is_numeric($parts[0])) {
  $id = (int) $parts[0];
}

$query = array();
if (strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
  $query = json_decode(file_get_contents("php://input"), true);
} else {
  $query = $_POST;
}

// GET by ID
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $id !== null) {
  try {
    $contribution = \Services\ContributionService::getById($id);
    if ($contribution) {
      Response::json(['data' => $contribution]);
    } else {
      Response::json(['error' => 'Contribution Not Found'], 404);
    }
  } catch (Exception $e) {
    Response::json(['error' => $e->getMessage()], 500);
  }
  exit;
}


// POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  try {
    $contributionId = \Services\ContributionService::createContribution($query);
    if ($contributionId) {
      Response::json(['data' => $contributionId], 201);
    } else {
      Response::json(['error' => "Error creating contribution"], 409);
    }
  } catch (Exception $e) {
    Response::json(['error' => $e->getMessage()], 500);
  }
}

// UPDATE
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $id !== null) {
  try {
    $data = json_decode(file_get_contents('php://input'), true);

    $contributionId = \Services\ContributionService::updateContribution($id, $data);

    if ($contributionId) {
      Response::json(['data' => $contributionId], 200);
    } else {
      Response::json(['error' => 'Contribution not found'], 404);
    }
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}

//DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id !== null) {
  try {
    $results = \Services\ContributionService::deleteContribution($id);

    if (count($results) === 0) {
      Response::json(['error' => 'Contribution not found'], 404);
      exit;
    } else {
      Response::json(['message' => 'Contribution deleted successfully'], 200);
      exit;
    }
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}


// GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  try {
    $contacts = \Services\ContributionService::getAll();
    Response::json(['success' => true, 'data' => $contacts]);
  } catch (Exception $e) {
    Response::json(['success' => false, 'error' => $e->getMessage()], 500);
  }
  exit;
}



// Unsupported HTTP method
Response::json(['success' => false, 'error' => 'Method Not Allowed'], 405);

