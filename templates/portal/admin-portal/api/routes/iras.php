<?php
require_once __DIR__ . '/../Services/IrasService.php';

use Utils\Response;

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'transactions') {
    try {
        $transactions = \Services\IrasService::getAll();
        Response::json(['data' => $transactions]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'login-url') {
    try {
        $transactions = \Services\IrasService::getLoginUrl();
        Response::json(['data' => $transactions]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'configurations') {
    try {
        $configurations = \Services\IrasService::getConfiguration();
        Response::json(['data' => $configurations]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($parts[0]) && $parts[0] === 'configurations') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!is_array($input)) {
            throw new Exception('Invalid input format');
        }

        \Services\IrasService::updateConfiguration($input);
        Response::json(['message' => 'Configuration updated successfully.']);
    } catch (Exception $e) {
        Response::json([
            'error' => 'Failed to update configuration',
            'details' => $e->getMessage()
        ], 500);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($parts[0]) && $parts[0] === 'generate-report') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $result = \Services\IrasService::generateAndSendReport($input);
        Response::json($result);
    } catch (Exception $e) {
        Response::json(['error' => 'Report generation failed', 'details' => $e->getMessage()], 500);
    }
    exit;
}


// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);
