<?php
require_once __DIR__ . '/../Services/OptionValueService.php';

use Utils\Response;

// GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  try {
    $optionGroupName = isset($_GET['option_group_name']) ? $_GET['option_group_name'] : null;
    $optionGroupId = isset($_GET['option_group_id']) ? $_GET['option_group_id'] : null;
    $optionValues = \Services\OptionValueService::getAll($optionGroupName, $optionGroupId);
    Response::json(['data' => $optionValues]);
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}

// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);
