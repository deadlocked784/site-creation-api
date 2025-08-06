<?php

/**
 * This file handles all API requests for the /contacts endpoint.
 *
 * It supports GET, POST, PUT, and DELETE operations for contacts,
 * as well as related endpoints for contributions and summaries.
 */

// Services
require_once __DIR__ . '/../Services/ContactService.php';
require_once __DIR__ . '/../Services/ContributionService.php';
require_once __DIR__ . '/../Services/ActivityService.php';

use Utils\Response;

// Check for ID in URL path (e.g., /contacts/123)
$id = null;
if (isset($parts[0]) && is_numeric($parts[0])) {
  $id = (int) $parts[0];
}

// GET /contacts/summary
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'summary') {
  try {
    $counts = \Services\ContactService::countByContactType();
    Response::json(['data' => $counts]);
  } catch (Exception $e) {
    Response::json([
      'error' => 'Internal Server Error',
    ], 500);
  }
  exit;
}

//GET by ID
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $id !== null) {
  try {
    if (isset($parts[1]) && $parts[1] === 'contributions') {
      if (isset($parts[2]) && $parts[2] === 'count') {
        // If the third part of the path is 'count', return the count of contributions for this contact
        $count = \Services\ContributionService::getContactContributionsCount($id);
        Response::json(['count' => $count]);
        exit;
      } else {
        // If the second part of the path is 'contributions', fetch contributions for this contact
        $contributions = \Services\ContributionService::getContactContributions($id);
        Response::json(['data' => $contributions]);
        exit;
      }
    }
    if ($parts[1] === 'activities') {
      if ($parts[2] === 'count') {
        // If the third part of the path is 'count', return the count of activities for this contact
        $count = \Services\ActivityService::getContactActivitiesCount($id);
        Response::json(['count' => $count]);
        exit;
      } else {
        // If the second part of the path is 'activities', fetch activities for this contact
        $activities = \Services\ActivityService::getAllByContactId($id);
        Response::json(['data' => $activities]);
        exit;
      }
    }  

    $result = \Services\ContactService::getById($id);
    if ($result) {
      Response::json(['data' => $result]);
    } else {
      Response::json(['error' => 'Contact Not Found'], 404);
    }
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}

// Route: GET /contacts/groups
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'groups') {
  try {
    $groups = \Services\ContactService::getAllGroups();
    Response::json(['data' => $groups]);
  } catch (Exception $e) {
    Response::json(['error' => 'Failed to fetch groups'], 500);
  }
  exit;
}

// Check if route is /contacts/group/{groupId}
if ($_SERVER['REQUEST_METHOD'] === 'GET' 
    && isset($parts[0], $parts[1]) 
    && $parts[0] === 'group' 
    && is_numeric($parts[1])
) {
    try {
        $groupId = (int) $parts[1];
        $contacts = \Services\ContactService::getContactsByGroupId($groupId);
        Response::json(['data' => $contacts]);
    } catch (Exception $e) {
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}

// Route: GET /contacts/tags
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'tags') {
  try {
    $tags = \Services\ContactService::getAllTags();
    Response::json(['data' => $tags]);
  } catch (Exception $e) {
    Response::json(['error' => 'Failed to fetch tags'], 500);
  }
  exit;
}

// Route: GET /contacts/allowed-types
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'allowed-types') {
    try {
        $allowedTypes = \Services\ContactService::getAllowedContactTypes();
        Response::json(['data' => $allowedTypes]);
    } catch (Exception $e) {
        error_log("Error fetching allowed contact types: " . $e->getMessage());
        Response::json(['error' => 'Internal Server Error'], 500);
    }
    exit;
}



/**
 * Route: GET /contacts
 * Description: Retrieves a list of all contacts.
 * Query Params:
 *  - type (string): Filter contacts by type (e.g., 'Individual').
 *  - searchString (string): Filter contacts by a search term.
 */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  try {
    $contactType = isset($_GET['type']) ? $_GET['type'] : null;
    $searchString = isset($_GET['searchString']) ? $_GET['searchString'] : null;
    $results = \Services\ContactService::getAll($contactType, $searchString);
    Response::json(['data' => $results]);
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}

/**
 * Route: POST /contacts
 * Description: Creates a new contact.
 * Request Body: A JSON object containing the contact's data.
 *  - contact_type (string, required): 'Individual' or 'Organization'.
 *  - first_name, last_name (string, required for Individuals).
 *  - organization_name (string, required for Organizations).
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['contact_type'])) {
      Response::json(['error' => 'Missing contact_type'], 400);
      exit;
    }

    $contactType = $data['contact_type'];
    $requiredFields = [];
    if ($contactType == 'Individual') {
      array_push($requiredFields, 'first_name', 'last_name');
    } else {
      array_push($requiredFields, 'organization_name');
    }

    foreach ($requiredFields as $field) {
      if (empty($data[$field])) {
        Response::json(['error' => 'Missing required fields'], 400);
        exit;
      }
    }

    $result = \Services\ContactService::create($data);
    Response::json(['data' => $result], 201);
  } catch (Exception $e) {
    if (strpos($e->getMessage(), 'already exists') !== false) {
      Response::json(['error' => 'Contact with the same NRIC/UEN already exists'], 409);
    } else {
      echo $e->getMessage();
      Response::json(['error' => 'Internal Server Error'], 500);
    }
  }
  exit;
}

/**
 * Route: PUT /contacts/{id}
 * Description: Updates an existing contact.
 * Request Body: A JSON object with the fields to update.
 */
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $id !== null) {
  try {
    $data = json_decode(file_get_contents('php://input'), true);

    $result = \Services\ContactService::update($id, $data);

    if ($result) {
      Response::json(['data' => $result], 200);
    } else {
      Response::json(['error' => 'Contact not found'], 404);
    }
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}

/**
 * Route: DELETE /contacts/{id}
 * Description: Deletes a contact by their ID.
 */
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id !== null) {
  try {
    $result = \Services\ContactService::delete($id);

    if ($result) {
      Response::json(['message' => 'Contact deleted successfully'], 200);
      exit;
    } else {
      Response::json(['error' => 'Contact not found'], 404);
      exit;
    }
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}





// If no route is matched, return a 405 Method Not Allowed error.
Response::json(['error' => 'Method Not Allowed'], 405);
