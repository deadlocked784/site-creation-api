<?php

require_once __DIR__ . '/../Services/ActivityService.php';
use Utils\Response;

// Get ID from URL segment (if any)
$id = null;
if (isset($parts[0]) && is_numeric($parts[0])) {
  $id = (int) $parts[0];
}

// ---------------- GET METHODS ----------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  try {
    // 1. Get by ID: /api/activities/{id}
    if ($id !== null) {
      $activity = \Services\ActivityService::getById($id);
      if ($activity) {
        Response::json(['data' => $activity]);
      } else {
        Response::json(['error' => 'Activity Not Found'], 404);
      }
    }

    // 2. Get by contact_id: ?contact_id=5
    elseif (isset($_GET['contact_id'])) {
      $contactId = intval($_GET['contact_id']);
      $activities = \Services\ActivityService::getAllByContactId($contactId);
      Response::json(['success' => true, 'data' => $activities]);
    }

    // 3. Get by activity type: ?type=pencon_activitytype
    elseif (isset($_GET['type'])) {
      $activities = \Services\ActivityService::getActivitiesByType($_GET['type']);
      Response::json(['success' => true, 'data' => $activities]);
    }

    // 4. Get all activities: /api/activities
    else {
      $activities = \Services\ActivityService::getAll();
      Response::json(['success' => true, 'data' => $activities]);
    }
  } catch (Exception $e) {
    Response::json(['error' => $e->getMessage()], 500);
  }
  exit;
}

// POST Activity (ORIGINAL CODE)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  try {
    $data = json_decode(file_get_contents('php://input'), true);
    $requiredFields = ['activity_date_time', 'status_id:name'];

    foreach ($requiredFields as $field) {
      if (empty($data[$field])) {
        Response::json(['error' => "Missing required field: $field"], 400);
        exit;
      }
    }

    $newActivity = \Services\ActivityService::createActivity($data);
    Response::json(['data' => $newActivity], 201);
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
  }
  exit;
}

// POST Activity — now supports both JSON and multipart/form-data uploads (V1)
// if ($_SERVER['REQUEST_METHOD'] === 'POST') {
//     try {
//         $data = [];
//         $files = $_FILES ?? [];
        
//         // Log incoming request for debugging
//         error_log("POST Request - Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
//         error_log("Files received: " . print_r($files, true));
//         error_log("POST data: " . print_r($_POST, true));
        
//         // Handle multipart/form-data
//         if (!empty($files)) {
//             $data = $_POST;
//             // Ensure we have proper data structure
//             if (empty($data)) {
//                 $data = [];
//             }
//         } else {
//             // Handle JSON payload
//             $rawInput = file_get_contents('php://input');
//             $data = json_decode($rawInput, true) ?? [];
//         }

//         // Validate required fields
//         if (empty($data['activity_date_time'])) {
//             Response::json(['error' => 'Missing required field: activity_date_time'], 400);
//             exit;
//         }
        
//         if (empty($data['status_id:name'])) {
//             Response::json(['error' => 'Missing required field: status_id:name'], 400);
//             exit;
//         }

//         // Create activity with file handling
//         $newActivity = \Services\ActivityService::createActivityWithFile($data, $files);
        
//         if ($newActivity) {
//             Response::json(['success' => true, 'data' => $newActivity], 201);
//         } else {
//             Response::json(['error' => 'Failed to create activity'], 500);
//         }
        
//     } catch (Exception $e) {
//         error_log("Activity creation error: " . $e->getMessage());
//         Response::json(['error' => $e->getMessage()], 500);
//     }
//     exit;
// }

// // POST Activity — supports both JSON and multipart/form-data uploads (V2)
// if ($_SERVER['REQUEST_METHOD'] === 'POST') {
//   try {
//     // If any files were uploaded, we’re in multipart/form-data land:
//     if (!empty($_FILES)) {
//       // Use the form fields from $_POST
//       $data = $_POST;
//     }
//     else {
//       // Otherwise, decode a raw JSON body
//       $data = json_decode(file_get_contents('php://input'), true) ?? [];
//     }

//     // Now create (and upload any file fields inside)
//     $newActivity = \Services\ActivityService::createActivityWithFile($data, $_FILES);

//     Response::json(['data' => $newActivity], 201);
//   }
//   catch (Exception $e) {
//     Response::json(['error' => $e->getMessage()], 500);
//   }

//   exit;
// }

// UPDATE Activity

if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $id !== null) {
  try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !is_array($data)) {
      Response::json(['error' => 'Invalid input'], 400);
      exit;
    }

    $updated = \Services\ActivityService::updateActivity($id, $data);

    if ($updated) {
      Response::json(['data' => $updated]);
    } else {
      Response::json(['error' => 'Activity not found or update failed'], 404);
    }
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
  }
  exit;
}

// ---------------- PUT (Bulk Status Update) ----------------
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $id === null) {
  try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['ids'], $data['status']) || !is_array($data['ids']) || empty($data['ids'])) {
      Response::json(['error' => 'Invalid input: expected { ids: [...], status: ... }'], 400);
      exit;
    }

    $updated = \Services\ActivityService::bulkUpdateActivityStatus($data['ids'], $data['status']);
    Response::json(['data' => $updated]);
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
  }
  exit;
}

// ---------------- DELETE ----------------
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id !== null) {
  try {
    $result = \Services\ActivityService::delete($id);
    if (count($result) === 0) {
      Response::json(['error' => 'Activity not found'], 404);
    } else {
      Response::json(['message' => 'Activity deleted successfully']);
    }
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}

// ---------------- DEFAULT ----------------
Response::json(['success' => false, 'error' => 'Method Not Allowed'], 405);
