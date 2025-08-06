<?php
require_once __DIR__ . '/bootstrap.php';

use Utils\Response;

// Parse the requested path
$uri = preg_replace('/^.*\/api\//', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$uri = trim($uri, '/');

$parts = explode('/', $uri);
$endpoint = array_shift($parts);

switch ($endpoint) {
  case 'contacts':
    require_once __DIR__ . '/routes/contacts.php';
    break;
  case 'contact-types':
    require_once __DIR__ . '/routes/contactTypes.php';
    break;
  case 'contributions':
    require_once __DIR__ . '/routes/contributions.php';
    break;
  case 'financial-types':
    require_once __DIR__ . '/routes/financial-types.php';
    break;
  case 'option-values':
    require_once __DIR__ . '/routes/option-values.php';
    break;
  case 'activities':
    require_once __DIR__ . '/routes/activities.php';
    break;
  case 'dashboard':
    require_once __DIR__ . '/routes/dashboard.php';
    break;
  case 'custom-fields':
    require_once __DIR__ . '/routes/custom-fields.php';
    break;
  case 'countries':
    require_once __DIR__ . '/routes/countries.php';
    break;
  case 'entities':
    require_once __DIR__ . '/routes/entities.php';
    break;
  case 'custom-groups':
    require_once __DIR__ . '/routes/custom-groups.php';
    break;
  case 'groups':
    require_once __DIR__ . '/routes/groups.php';
    break;
  case 'reports':
    require_once __DIR__ . '/routes/reports.php';
    break;
  case 'mail-receipts':
    require_once __DIR__ . '/routes/mail-receipts.php';
    break;
  case 'pdf-receipts':
    require_once __DIR__ . '/routes/pdf-receipts.php';
    break;
  case 'user-permissions':
    require_once __DIR__ . '/routes/user-permission.php';
    break;
  case 'iras':
    require_once __DIR__ . '/routes/iras.php';
    break;
  default:
    Response::json(['success' => false, 'error' => 'Unknown endpoint.'], 404);
    break;
}
