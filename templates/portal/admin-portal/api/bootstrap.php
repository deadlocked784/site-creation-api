<?php
// To Display errors in dev (remove or disable in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Load WordPress
$wpLoad = __DIR__ . '/../../wp-load.php';
if (!file_exists($wpLoad)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Cannot locate wp-load.php']);
    exit;
}
require_once $wpLoad;

// Load CiviCRM
$civiConfig = ABSPATH . 'wp-content/plugins/civicrm/civicrm/civicrm.config.php';
if (!file_exists($civiConfig)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Cannot locate CiviCRM configuration file']);
    exit;
}
require_once $civiConfig;

// Utility functions and classes
require_once __DIR__ . '/Utils/Response.php';
require_once __DIR__ . '/Utils/Auth.php';
require_once __DIR__ . '/Utils/Validation.php';


// Early exit for OPTIONS requests (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Authentication check
Utils\Auth::ensureLoggedIn();
