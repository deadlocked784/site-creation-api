# API Folder Guide

This document explains how the `api/` directory works in the admin-portal and provides instructions for adding new API routes.

---

## Overview

The `api/` directory implements a simple PHP-based REST API. It is structured as follows:

- **index.php**: Main entry point for all API requests. It parses the request URI and dispatches to the appropriate route handler.
- **bootstrap.php**: Loads dependencies and sets up the environment.
- **routes/**: Contains route handler files (e.g., `contacts.php`).
- **Services/**: Contains business logic classes (e.g., `ContactService.php`).
- **Utils/**: Contains utility classes for response formatting, authentication, and validation.

---

## How Routing Works

1. **Request Handling**  
   All requests to `/api/*` are routed to `api/index.php`.

2. **Endpoint Parsing**  
   `index.php` extracts the endpoint from the URL (e.g., `/api/contacts` → `contacts`).

3. **Route Dispatch**  
   Based on the endpoint, `index.php` includes the corresponding file from `routes/` (e.g., `routes/contacts.php`).

4. **Route File**  
   Each route file handles HTTP methods (GET, POST, etc.) and uses services/utilities as needed.

---

## Example: The Contacts Route

- **Request:** `GET /api/contacts`
- **Dispatch:** `index.php` includes `routes/contacts.php`
- **Handler:** `contacts.php` calls `ContactService::getAll()` and returns a JSON response.

---

## Adding a New Route

Suppose you want to add a new endpoint `/api/events`.

### 1. Create a Route Handler

Create a new file in `api/routes/` named `events.php`:

```php
<?php
// filepath: api/routes/events.php
require_once __DIR__ . '/../Services/EventService.php';

use Utils\Response;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $events = \Services\EventService::getAll();
        Response::json(['success' => true, 'data' => $events]);
    } catch (Exception $e) {
        Response::json(['success' => false, 'error' => $e->getMessage()], 500);
    }
    exit;
}

Response::json(['success' => false, 'error' => 'Method Not Allowed'], 405);
```

### 2. Add Service Logic

Implement your business logic in `api/Services/EventService.php`.

### 3. Register the Route

Edit `api/index.php` and add your new endpoint to the switch statement:

```php
switch ($endpoint) {
    case 'contacts':
        require_once __DIR__ . '/routes/contacts.php';
        break;
    case 'events':
        require_once __DIR__ . '/routes/events.php';
        break;
    default:
        Response::json(['success' => false, 'error' => 'Unknown endpoint.'], 404);
        break;
}
```

### 4. Test Your Endpoint

Send a request to `/api/events` and verify the response.

---

## Notes

- Always return JSON responses using `Utils\Response::json`.
- Handle unsupported HTTP methods with a 405 response.
- Catch exceptions and return error messages with appropriate HTTP status codes.
- Keep business logic in the `Services/` folder, not in the route files.

---

## Example Directory Structure

```
api/
  index.php
  bootstrap.php
  routes/
    contacts.php
    events.php
  Services/
    ContactService.php
    EventService.php
  Utils/
    Response.php
    Auth.php
    Validation.php
```

---

For questions or issues, see the existing route files for examples.