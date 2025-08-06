<?php

require_once __DIR__ . '/../Services/UserPermissionService.php';

use Utils\Response;

// This route only supports GET (fetch current user's WP roles and capabilities)

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $permissions = \Services\UserPermissionService::getCurrentUserPermissions();

        if ($permissions === null) {
            Response::json(['error' => 'User not logged in or function not available'], 401);
            exit;
        }

        Response::json(['success' => true, 'data' => $permissions]);
        exit;
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
        exit;
    }
}

// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);