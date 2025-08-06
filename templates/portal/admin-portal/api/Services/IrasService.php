<?php

namespace Services;
use CRM_Irasdonation_Utils;
use CRM_Core_Session;
use CRM_Utils_System;
use CRM_Core_DAO_Setting;
require_once 'civicrm.config.php';
require_once 'CRM/Core/Config.php';


class IrasService
{
    // Get All transactions

public static function getAll() 
{
    $settings = \CRM_Irasdonation_Utils::getSettings();
    \Civi::log()->debug('IRAS settings loaded', ['settings' => $settings]);

    $prefix = \CRM_Utils_Array::value(\CRM_Irasdonation_Utils::PREFIX['slug'], $settings, 'PREFIX_');
    $completedStatusId = 1;

    $sql = "
        SELECT 
            contribution.id,
            CONCAT('{$prefix}_', LPAD(RIGHT(contribution.id, 7), 7, '0')) AS receipt_no,
            contribution.receive_date AS issued_on,
            contribution.total_amount AS receipt_amount,
            contact.id AS contact_id,
            contact.sort_name,
            contact.external_identifier AS nricuen,
            donation.created_date,
            IF(response_log.is_api IS NULL, NULL, IF(response_log.is_api = 1, 'API', 'Offline')) AS sent_method,
            IF(response_log.response_code IS NULL, NULL, IF(response_log.response_code = 10, 'Success', 'Fail')) AS sent_response,
            response_log.response_body,
            contact.external_identifier,
            contribution.receive_date,
            fintype.name AS financial_type_name
        FROM civicrm_contribution contribution
        INNER JOIN civicrm_contact contact 
            ON contact.id = contribution.contact_id
        INNER JOIN civicrm_financial_type fintype 
            ON fintype.id = contribution.financial_type_id
        LEFT JOIN civicrm_o8_iras_donation donation 
            ON contribution.id = donation.contribution_id
        LEFT JOIN civicrm_o8_iras_donation_log donation_log 
            ON donation_log.id = donation.last_donation_log_id
        LEFT JOIN civicrm_o8_iras_response_log response_log 
            ON response_log.id = donation_log.iras_response_id
        WHERE contact.external_identifier IS NOT NULL
          AND contribution.contribution_status_id = 1
          AND fintype.is_deductible = 1
        ORDER BY donation.id DESC;
    ";

    \Civi::log()->debug('IRAS SQL to fetch contributions', ['sql' => $sql]);

    try {
        $dao = \CRM_Core_DAO::executeQuery($sql, [
            'prefix' => $prefix,
            'completedStatusId' => $completedStatusId,
        ]);

        $results = [];
        while ($dao->fetch()) {
            $row = [
                'id' => $dao->id,
                'receipt_no' => $dao->receipt_no,
                'receive_date' => $dao->receive_date,
                'total_amount' => $dao->receipt_amount, // Note: we're mapping this correctly
                'contact_id' => $dao->contact_id,
                'sort_name' => $dao->sort_name,
                'nricuen' => $dao->nricuen,
                'donation_created_date' => $dao->created_date,
                'sent_method' => $dao->sent_method,
                'sent_response' => $dao->sent_response,
                'response_body' => $dao->response_body,
                'financial_type_name' => $dao->financial_type_name,
            ];

            \Civi::log()->debug('Fetched row from IRAS contribution query', $row);
            $results[] = $row;
        }

        \Civi::log()->debug('Final IRAS contribution results', ['count' => count($results)]);

        return $results;
    } catch (CRM_Core_DAOException $e) {
        \Civi::log()->error('IrasService::getAll query failed', ['error' => $e->getMessage()]);
        return [];
    }
}

    public static function getLoginURL()
    {

        try {
            $session = CRM_Core_Session::singleton();
        } catch (Exception $e) {
            \Civi::log()->error('Failed to get session', ['error' => $e->getMessage()]);
            throw $e;
        }


        // Check if validate-only mode (skip login if true)
        $validate_only = CRM_Irasdonation_Utils::getValidateOnly();
        \Civi::log()->debug('ValidateOnly', ['value' => $validate_only]);

        if (!$validate_only) {
            $iras_access_token = $session->get(\CRM_Irasdonation_Utils::ACCESSTOKEN);
            $iras_login_time = $session->get(\CRM_Irasdonation_Utils::LOGINTIME);
            $iras_login_time_diff = time() - ($iras_login_time ?: 0);

            \Civi::log()->debug('AccessToken exists', ['exists' => (bool) $iras_access_token]);
            \Civi::log()->debug('LoginTime', ['time' => $iras_login_time, 'diff_seconds' => $iras_login_time_diff]);

            $iras_logged = true;
            if (!$iras_access_token) {
                $iras_logged = false;
                \Civi::log()->debug('No access token found - login required');
            }
            if ($iras_login_time_diff > 300) {
                $iras_logged = false;
                \Civi::log()->debug('Access token expired (older than 5 minutes) - login required');
            }

            if (!$iras_logged) {
                $irasLoginURL = CRM_Irasdonation_Utils::getIrasLoginURL();
                $callbackURL = CRM_Irasdonation_Utils::getCallbackURL();

                \Civi::log()->debug('IRAS Login URL', ['url' => $irasLoginURL]);
                \Civi::log()->debug('Callback URL', ['url' => $callbackURL]);

                $state = uniqid();
                $session->set(CRM_Irasdonation_Utils::STATE, $state);
                \Civi::log()->debug('Generated state', ['state' => $state]);

                $irasLoginFullURL = $irasLoginURL
                    . "?scope=DonationSub&callback_url=" . urlencode($callbackURL)
                    . "&tax_agent=false&state=$state";
                \Civi::log()->debug('Full login URL', ['url' => $irasLoginFullURL]);

                $loginresponse = CRM_Irasdonation_Utils::getLoginResponse($irasLoginFullURL);
                \Civi::log()->debug('Login response', ['response' => $loginresponse]);

                try {
                    $irasLoginRealURL = $loginresponse['data']['url'];
                    \Civi::log()->debug('Extracted real login URL', ['url' => $irasLoginRealURL]);
                } catch (Exception $e) {
                    \Civi::log()->debug('Error parsing login response JSON', ['error' => $e->getMessage()]);
                    throw new CRM_Core_Exception('Error: Not a JSON in Response error: ' . $e->getMessage());
                }

                CRM_Core_Session::setStatus(
                    'You have no CorpPASS access token',
                    ts('IRAS LOG IN'),
                    'warning',
                    ['expires' => 5000]
                );

                CRM_Utils_System::redirect($irasLoginRealURL);
                CRM_Utils_System::civiExit();
                exit;
            } else {
                \Civi::log()->debug('Valid access token found - no login needed');
            }
        } else {
            \Civi::log()->debug('Validate only mode enabled - skipping login flow');
        }
    }

    public static function getConfiguration()
    {
        $dao = new CRM_Core_DAO_Setting();
        $dao->group_name = 'iras_settings';
        $dao->find();

        $settings = [];

        while ($dao->fetch()) {
            $value = $dao->value;

            $unserialized = @unserialize($value);
            if ($unserialized !== false || $value === 'b:0;') {
                $value = $unserialized;
            }


            $settings[$dao->name] = $value;
        }

        // \Civi::log()->debug('Final iras_settings array', $settings['iras_settings']);

        return $settings['iras_settings'];
    }

public static function updateConfiguration($newConfig)
{
    \Civi::log()->debug('Incoming config update payload', ['data' => $newConfig]);

    $dao = new \CRM_Core_DAO_Setting();
    $dao->group_name = 'iras_settings';
    $dao->name = 'iras_settings';
    $dao->domain_id = \CRM_Core_Config::domainID();

    if ($dao->find(true)) {
        $existingValue = @unserialize($dao->value);
        if (!is_array($existingValue)) {
            $existingValue = [];
        }
        \Civi::log()->debug('Existing configuration loaded', ['existing' => $existingValue]);
    } else {
        $existingValue = [];
        \Civi::log()->debug('No existing configuration found, starting fresh');
    }

    $updatedValue = array_merge($existingValue, $newConfig);
    $dao->value = serialize($updatedValue);

    if ($dao->id) {
        $dao->update();
        \Civi::log()->debug('Configuration updated successfully', ['final' => $updatedValue]);
    } else {
        $dao->insert();
        \Civi::log()->debug('Configuration inserted successfully', ['final' => $updatedValue]);
    }

    return true;
}

public static function generateAndSendReport($payload)
{
    try {
        \Civi::log()->info('generateAndSendReport started', ['payload' => $payload]);

        $settings = CRM_Irasdonation_Utils::getSettings();
        $organisation_id = $settings['organisation_id'] ?? null;
        if (!$organisation_id) {
            throw new \CRM_Core_Exception('Extension not configured');
        }

        $selectedIDs = array_filter(array_map('intval', explode(',', $payload['selected_ids'] ?? '')));
        if (empty($selectedIDs)) {
            throw new \CRM_Core_Exception('No valid donations selected');
        }

        \Civi::log()->debug('Selected donation IDs', ['ids' => $selectedIDs]);

        // Validate contribution IDs & deductible status
        $result = civicrm_api3('Contribution', 'get', [
            'id' => ['IN' => $selectedIDs],
            'return' => ['id', 'contact_id', 'total_amount', 'financial_type_id'],
            'api.FinancialType.getsingle' => ['id' => '$value.financial_type_id', 'return' => ['is_deductible']],
        ]);

        $validDeductibleIDs = [];
        foreach ($result['values'] as $contribution) {
            if (!empty($contribution['api.FinancialType.getsingle']['is_deductible']) && $contribution['api.FinancialType.getsingle']['is_deductible'] == 1) {
                $validDeductibleIDs[] = $contribution['id'];
            }
        }

        \Civi::log()->debug('Valid deductible contributions', ['valid_ids' => $validDeductibleIDs]);

        if (empty($validDeductibleIDs)) {
            throw new \CRM_Core_Exception('No tax-deductible contributions found.');
        }

        // Amendment flag from payload, default false
        $ammendment = !empty($payload['ammendment']);
        // Include previously generated receipts flag from payload, default false
        $includePrevious = !empty($payload['include_previous']);
        $startDate = $payload['start_date'] ?? date('Y-01-01');
        $endDate = $payload['end_date'] ?? date('Y-12-31');
        $reportYear = date("Y", strtotime($startDate));

        // Batch indicator: 'A' for amendment, 'O' for original submission
        $batchIndicator = $ammendment ? 'A' : 'O';

        \Civi::log()->info('Preparing donations with parameters', [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'includePrevious' => $includePrevious,
            'validDeductibleIDs' => $validDeductibleIDs,
            'batchIndicator' => $batchIndicator,
        ]);

        // Get donations and prepare data
        list($totalRows, $total, $counter, $generatedDate, $donations, $onlineDonations, $offlineDonations) =
            CRM_Irasdonation_Utils::prepareDonations($startDate, $endDate, $includePrevious, $validDeductibleIDs);

        if (empty($donations)) {
            throw new \CRM_Core_Exception('No donation data found for selected IDs.');
        }

        \Civi::log()->debug('Donations data prepared', ['donations' => $donations]);

        $header = CRM_Irasdonation_Utils::prepareHeader();
        $reportUrl = CRM_Irasdonation_Utils::getIrasReportURL();

        // Chunk donations for batch submission
        $chunks = array_chunk($onlineDonations, 1000);
        $donationChunks = array_chunk($donations, 1000);

        foreach ($chunks as $index => $chunk) {
            $donationChunk = $donationChunks[$index];
            $counter = count($chunk);
            $total = array_sum(array_column($chunk, 'donationAmount'));

            foreach ($chunk as $k => $record) {
                $chunk[$k]['recordID'] = $k + 1;
            }

            list(
                $body, $validateOnly, $basisYear, $orgIDType, $orgIDNo, $orgName, $batchInd, $authName,
                $authDesignation, $phone, $authEmail, $recordCount, $donationTotal
            ) = CRM_Irasdonation_Utils::prepareOnlineReportBody($reportYear, $counter, $total, $chunk, $batchIndicator);

            \Civi::log()->info('Sending batch report', [
                'batchIndex' => $index,
                'recordCount' => $recordCount,
                'donationTotal' => $donationTotal,
                'reportYear' => $reportYear,
                'batchIndicator' => $batchIndicator,
                'donationsInBatch' => $chunk,
            ]);

            $response = CRM_Irasdonation_Utils::guzzlePost($reportUrl, $header, $body);

            \Civi::log()->debug('IRAS response', ['response' => $response]);

            if ($response['returnCode'] != 10) {
                throw new \CRM_Core_Exception('IRAS submission failed: ' . $response['returnCode']);
            }

            CRM_Irasdonation_Utils::saveDonationLogs(
                1, (int) $validateOnly, $basisYear, $orgIDType, $orgIDNo, $orgName, $batchInd,
                $authName, $authDesignation, $phone, $authEmail, $recordCount, $donationTotal,
                json_encode($response), $response['returnCode'], $generatedDate, $donationChunk
            );
        }

        \Civi::log()->info('generateAndSendReport completed successfully', ['totalRows' => $totalRows, 'totalAmount' => $total]);

        return ['message' => 'Report successfully generated and sent to IRAS.'];

    } catch (Exception $e) {
        \Civi::log()->error('generateAndSendReport failed: ' . $e->getMessage());
        throw $e;
    }
}

}