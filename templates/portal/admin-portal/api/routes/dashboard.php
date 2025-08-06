<?php
require_once __DIR__ . '/../Services/DashboardService.php';

use Utils\Response;



// GET One-Time vs Recurring Donations
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'countDonorsByRecurringStatus') {
  try {
    $year = isset($_GET['year']) ? (int) $_GET['year'] : (int) date('Y');
    $contacts = \Services\DashboardService::countDonorsByRecurringStatus($year);
    Response::json(['success' => true, 'data' => $contacts]);
  } catch (Exception $e) {
    Response::json(['error' => $e->getMessage()], 500);
  }
  exit;
}

// GET /getDonationCountByPaymentMethod
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'donationCountByPaymentMethod') {
  try {
    $year = isset($_GET['year']) ? intval($_GET['year']) : null;

    $count = \Services\DashboardService::getDonationCountByPaymentMethod($year);

    Response::json(['data' => $count]);
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'donationAmtByCampaign') {
  try {
    $year = isset($_GET['year']) && is_numeric($_GET['year']) ? (int) $_GET['year'] : null;
    $campaigns = \Services\DashboardService::getDonationAmtByCampaign($year);
    Response::json(['data' => $campaigns]);
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'targetAmount') {
  try {
    $campaigns = \Services\DashboardService::getTargetAmount();
    Response::json(['data' => $campaigns]);
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($parts[0]) && $parts[0] === 'targetAmount') {
  try {
    $input = json_decode(file_get_contents('php://input'), true);
    $amount = $input['amount'] ?? null;

    if (!is_numeric($amount)) {
      Response::json(['error' => 'Invalid amount'], 400);
      exit;
    }
    $result = \Services\DashboardService::saveTargetAmount((float) $amount);

    Response::json(['data' => $result]);
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'countContributionsByTdrNtdr') {
  try {
    $year = isset($_GET['year']) && is_numeric($_GET['year']) ? (int) $_GET['year'] : null;
    $contributions = \Services\DashboardService::countContributionsByTdrNtdr($year);
    Response::json(['data' => $contributions]);
  } catch (Exception $e) {
    Response::json(['error' => 'Internal Server Error'], 500);
  }
  exit;
}

// GET /contacts/summary (Count of Individual and Organisation Respectively)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0]) && $parts[0] === 'summary') {
    try {
        $counts = \Services\DashboardService::countByContactType();
        Response::json(['data' => $counts]);
    } catch (\Civi\API\Exception\NotImplementedException $e) {
        error_log("CiviCRM API4 not implemented: " . $e->getMessage());
        Response::json([
            'error' => 'CiviCRM API version unsupported.',
        ], 400);
    } catch (\Exception $e) {
        error_log("Failed to get contact type counts: " . $e->getMessage());
        Response::json([
            'error' => 'Internal Server Error',
        ], 500);
    }
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($parts[0])) {
  try {
    switch ($parts[0]) {
      case 'top-contributors':
        $type = $_GET['contact_type'] ?? null;
        if (!in_array($type, ['Individual', 'Organization'])) {
          throw new Exception('Invalid contact type');
        }
        $response = \Services\DashboardService::getTopContributionsByContactType($type);
        break;

      case 'yearly-comparison':
        $response = \Services\DashboardService::getYearlyDonationsByType();
        break;

      default:
        throw new Exception('Invalid endpoint');
    }

    Response::json($response);
  } catch (Exception $e) {
    Response::json(['success' => false, 'error' => $e->getMessage()], 500);
  }
  exit;
}


//GET /api/dashboard?=summary=monthly
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  try {
    if (isset($_GET['summary']) && $_GET['summary'] === 'monthly') {
      $monthlySummary = \Services\DashboardService::getMonthlySummaryFlat();
      Response::json(['data' => $monthlySummary]);
    }
  } catch (Exception $e) {
    Response::json(['error' => $e->getMessage()], 500);
  }
  exit;
}




// Unsupported HTTP method
Response::json(['error' => 'Method Not Allowed'], 405);
