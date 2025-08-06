<?php
namespace Services;
class DashboardService
{
    /**
     * Count donors based on recurring donation status:
     * - Recurring donors = recurring donation = "Yes"
     * - One-time donors = recurring donation empty or NULL
     * 
     * @return array ['recurring' => int, 'oneTime' => int]
     */

    public static function countDonorsByRecurringStatus($year = null): array
    {
        // Base query for recurring contributions (Recurring_Donation = 1)
        $recurringQuery = \Civi\Api4\Contribution::get(TRUE)
            ->addSelect(
                'id',
                'contact_id',
                'contact.display_name',
                'financial_type_id',
                'financial_type_id:label',
                'payment_instrument_id',
                'payment_instrument_id:label',
                'receive_date',
                'total_amount',
                'currency:abbr',
                'source',
                'contribution_status_id',
                'contribution_status_id:label'
            )
            ->addWhere('Additional_Contribution_Details.Recurring_Donation', '=', 1)
            ->addWhere('contribution_status_id', '=', 1)
            ->addJoin('Contact AS contact', 'LEFT', ['contact.id', '=', 'contact_id']);

        $oneTimeQuery = \Civi\Api4\Contribution::get(TRUE)
            ->addSelect(
                'id',
                'contact_id',
                'contact.display_name',
                'financial_type_id',
                'financial_type_id:label',
                'payment_instrument_id',
                'payment_instrument_id:label',
                'receive_date',
                'total_amount',
                'currency:abbr',
                'source',
                'contribution_status_id',
                'contribution_status_id:label'
            )
            ->addClause(
                'OR',
                ['Additional_Contribution_Details.Recurring_Donation', 'IS NULL', null],
                ['Additional_Contribution_Details.Recurring_Donation', '=', ''],
                ['Additional_Contribution_Details.Recurring_Donation', '=', 2]
            )
            ->addWhere('contribution_status_id', '=', 1)
            ->addJoin('Contact AS contact', 'LEFT', ['contact.id', '=', 'contact_id']);

        if ($year) {
            $startDate = "$year-01-01 00:00:00";
            $endDate = "$year-12-31 23:59:59";

            $recurringQuery->addWhere('receive_date', '>=', $startDate)
                ->addWhere('receive_date', '<=', $endDate);

            $oneTimeQuery->addWhere('receive_date', '>=', $startDate)
                ->addWhere('receive_date', '<=', $endDate);
        }

        $recurring = $recurringQuery->execute();
        $oneTime = $oneTimeQuery->execute();

        return [
            'recurring' => count($recurring),
            'oneTime' => count($oneTime),
            'recurringData' => $recurring,
            'oneTimeData' => $oneTime,
        ];
    }

    public static function getDonationCountByPaymentMethod($year = null)
    {

        $query = \Civi\Api4\Contribution::get(TRUE)
            ->addSelect(
                'contact_id',
                'contact.display_name',
                'contact_id.contact_type',
                'contact_id.contact_type:label',
                'financial_type_id',
                'financial_type_id:label',
                'total_amount',
                'email.email',
                'receive_date',
                'phone.phone',
                'source',
                'currency:abbr',
                'payment_instrument_id',
                'payment_instrument_id:label',
                'contribution_status_id',
                'contribution_status_id:label',
                'custom.*'
            )
            ->addWhere('contribution_status_id', '=', 1)
            ->addJoin('Contact AS contact', 'LEFT', ['contact.id', '=', 'contact_id'])
            ->addJoin('Phone AS phone', 'LEFT', ['phone.contact_id', '=', 'contact_id'])
            ->addJoin('Email AS email', 'LEFT', [
                'email.contact_id',
                '=',
                'contact.id',
                'email.is_primary',
                '=',
                1,
            ]);

        if ($year) {
            $startDate = "$year-01-01 00:00:00";
            $endDate = "$year-12-31 23:59:59";
            $query->addWhere('receive_date', '>=', $startDate);
            $query->addWhere('receive_date', '<=', $endDate);
        }

        $contributions = $query->execute();

        $methodData = [];

        foreach ($contributions as $contribution) {
            $method = $contribution['payment_instrument_id:label'] ?? 'Unknown';

            if (!isset($methodData[$method])) {
                $methodData[$method] = [
                    'method' => $method,
                    'count' => 0,
                    'donors' => [],
                ];
            }

            $methodData[$method]['count']++;
            $methodData[$method]['donors'][] = $contribution;
        }
        return array_values($methodData);
    }

    public static function getDonationAmtByCampaign($year = null)
    {
        $query = \Civi\Api4\Contribution::get(TRUE)
            ->addSelect(
                'contact_id',
                'contact.display_name',
                'contact_id.contact_type',
                'contact_id.contact_type:label',
                'financial_type_id',
                'financial_type_id:label',
                'total_amount',
                'email.email',
                'receive_date',
                'phone.phone',
                'currency:abbr',
                'source',
                'payment_instrument_id',
                'payment_instrument_id:label',
                'contribution_status_id',
                'contribution_status_id:label',
                'Additional_Contribution_Details.Campaign:label',
                'custom.*'
            )
            ->addWhere('contribution_status_id', '=', 1)
            ->addJoin('Contact AS contact', 'LEFT', ['contact.id', '=', 'contact_id'])
            ->addJoin('Phone AS phone', 'LEFT', ['phone.contact_id', '=', 'contact_id'])
            ->addJoin('Email AS email', 'LEFT', [
                'email.contact_id',
                '=',
                'contact.id',
                'email.is_primary',
                '=',
                1,
            ]);

        if ($year) {
            $startDate = "$year-01-01 00:00:00";
            $endDate = "$year-12-31 23:59:59";
            $query->addWhere('receive_date', '>=', $startDate);
            $query->addWhere('receive_date', '<=', $endDate);
        }

        $contributions = $query->execute();

        $campaignData = [];

        foreach ($contributions as $contribution) {
            $campaign = $contribution['Additional_Contribution_Details.Campaign:label'] ?? 'Unassigned';
            $amount = (float) $contribution['total_amount'];

            if (!isset($campaignData[$campaign])) {
                $campaignData[$campaign] = [
                    'campaign' => $campaign,
                    'total' => 0,
                    'donors' => [],
                ];
            }
            $campaignData[$campaign]['total'] += $amount;
            $campaignData[$campaign]['donors'][] = $contribution;
        }
        return array_values($campaignData);
    }

    public static function countContributionsByTdrNtdr($year = null)
    {

        $financialTypes = \Civi\Api4\FinancialType::get(TRUE)
            ->execute();

        $deductibilityMap = [];
        foreach ($financialTypes['values'] ?? $financialTypes as $ft) {
            $deductibilityMap[$ft['id']] = !empty($ft['is_deductible']);
        }

        $query = \Civi\Api4\Contribution::get(TRUE)
            ->addSelect(
                'id',
                'contact_id.contact_type',
                'contact_id.contact_type:label',
                'financial_type_id',
                'financial_type_id:label',
                'payment_instrument_id',
                'payment_instrument_id:label',
                'contact_id',
                'receive_date',
                'total_amount',
                'contact.display_name',
                'email.email',
                'phone.phone',
                'currency:abbr',
                'contribution_status_id',
                'contribution_status_id:label',
                'source',
                'custom.*'
            )
            ->addWhere('contribution_status_id', '=', 1)
            ->addJoin('Contact AS contact', 'LEFT', ['contact.id', '=', 'contact_id'])
            ->addJoin('Email AS email', 'LEFT', [
                'email.contact_id',
                '=',
                'contact.id',
                'email.is_primary',
                '=',
                1,
            ])
            ->addJoin('Phone AS phone', 'LEFT', ['phone.contact_id', '=', 'contact_id']);

        if ($year) {
            $startDate = "$year-01-01 00:00:00";
            $endDate = "$year-12-31 23:59:59";
            $query->addWhere('receive_date', '>=', $startDate);
            $query->addWhere('receive_date', '<=', $endDate);
        }

        $contributions = $query->execute();

        $counts = [
            'deductible' => 0,
            'non_deductible' => 0,
        ];

        $deductibleData = [];
        $nonDeductibleData = [];

        foreach ($contributions as $contribution) {
            $financialTypeId = $contribution['financial_type_id'];
            $isDeductible = $deductibilityMap[$financialTypeId] ?? false;

            if ($isDeductible) {
                $counts['deductible']++;
                $deductibleData[] = $contribution;
            } else {
                $counts['non_deductible']++;
                $nonDeductibleData[] = $contribution;
            }
        }

        return [
            'deductible' => $counts['deductible'],
            'non_deductible' => $counts['non_deductible'],
            'deductibleData' => $deductibleData,
            'non_deductibleData' => $nonDeductibleData,
        ];
    }

    public static function getTargetAmount()
    {
        $activity = \Civi\Api4\Activity::get(TRUE)
            ->addSelect('Yearly_Target_Donation.Target_Amount')
            ->setLimit(1)
            ->execute();

        $targetAmount = null;
        if (!empty($activity)) {
            $targetAmount = $activity[0]['Yearly_Target_Donation.Target_Amount'] ?? null;
        }
        return $targetAmount;
    }

    public static function saveTargetAmount($amount)
    {
        $results = \Civi\Api4\Activity::update(TRUE)
            ->addValue('Yearly_Target_Donation.Target_Amount', $amount)
            ->addWhere('id', '>=', 0)
            ->execute();
        return $results;
    }

public static function countByContactType(): array
{
    $types = ['Individual', 'Organization'];
    $results = [];

    foreach ($types as $type) {
        $count = \Civi\Api4\Contact::get(TRUE)
            ->addSelect('id')
            ->addWhere('contact_type', '=', $type)
            ->setCheckPermissions(TRUE)
            ->execute()
            ->count();

        $results[$type] = $count;
    }

    return $results;
}

    public static function getTopContributionsByContactType(string $contactType): array
{
    $results = \Civi\Api4\Contribution::get(TRUE)
        ->addSelect('contact_id')
        ->addSelect('contact.display_name')
        ->addSelect('contact.contact_type')
        ->addSelect('source')
        ->addSelect('payment_instrument_id:label')
        ->addSelect('contribution_status_id:label')
        ->addSelect('SUM(total_amount) AS total_donated')
        ->addSelect('MAX(receive_date) AS latest_donation_date')
        ->addJoin('Contact AS contact', 'LEFT', ['contact.id', '=', 'contact_id'])
        ->addWhere('contact.contact_type', '=', $contactType)
        ->addGroupBy('contact_id')
        ->addOrderBy('total_donated', 'DESC')
        ->setLimit(5)
        ->execute();

    return $results->getArrayCopy();
}


public static function getYearlyDonationsByType(): array
{
    // 1. First, get totals grouped by year and contact type
    $sqlTotals = "
        SELECT
            YEAR(c.receive_date) AS year,
            ct.contact_type AS type,
            SUM(c.total_amount) AS total
        FROM civicrm_contribution c
        INNER JOIN civicrm_contact ct ON ct.id = c.contact_id
        WHERE c.receive_date IS NOT NULL
        GROUP BY year, type
        ORDER BY year ASC
    ";

    $daoTotals = \CRM_Core_DAO::executeQuery($sqlTotals);

    $results = [];

    while ($daoTotals->fetch()) {
        $year = $daoTotals->year;
        $type = ($daoTotals->type === 'Organization') ? 'Organization' : 'Individual';

        if (!isset($results[$year])) {
            $results[$year] = [
                'year' => $year,
                'Individual' => 0,
                'Organization' => 0,
                'contributions' => [], // will fill next
            ];
        }

        $results[$year][$type] += (float) $daoTotals->total;
    }

    // 2. Then, get the individual contributions grouped by year
    $sqlDetails = "
        SELECT
            YEAR(c.receive_date) AS year,
            c.id,
            c.contact_id,
            ct.display_name AS contact_display_name,
            ct.contact_type,
            c.receive_date,
            c.total_amount,
            ft.name AS financial_type,
            pi.label AS payment_method,
            cs.label AS status
        FROM civicrm_contribution c
        INNER JOIN civicrm_contact ct ON ct.id = c.contact_id
        LEFT JOIN civicrm_financial_type ft ON ft.id = c.financial_type_id
        LEFT JOIN civicrm_option_value pi ON pi.value = c.payment_instrument_id AND pi.option_group_id = (
            SELECT id FROM civicrm_option_group WHERE name = 'payment_instrument'
        )
        LEFT JOIN civicrm_option_value cs ON cs.value = c.contribution_status_id AND cs.option_group_id = (
            SELECT id FROM civicrm_option_group WHERE name = 'contribution_status'
        )
        WHERE c.receive_date IS NOT NULL
        ORDER BY year ASC, c.receive_date ASC
    ";

    $daoDetails = \CRM_Core_DAO::executeQuery($sqlDetails);

    while ($daoDetails->fetch()) {
        $year = $daoDetails->year;

        if (!isset($results[$year])) {
            // In case there are contributions but no totals (unlikely), initialize
            $results[$year] = [
                'year' => $year,
                'Individual' => 0,
                'Organization' => 0,
                'contributions' => [],
            ];
        }

        $results[$year]['contributions'][] = [
            'id' => $daoDetails->id,
            'contact_id' => $daoDetails->contact_id,
            'contact_display_name' => $daoDetails->contact_display_name,
            'contact_type' => $daoDetails->contact_type,
            'receive_date' => $daoDetails->receive_date,
            'total_amount' => (float) $daoDetails->total_amount,
            'financial_type' => $daoDetails->financial_type,
            'payment_method' => $daoDetails->payment_method,
            'status' => $daoDetails->status,
        ];
    }

    return array_values($results);
}

    public static function getMonthlySummaryFlat(): array
{
    $sql = "
        SELECT
            DATE_FORMAT(c.receive_date, '%Y-%m') AS month,
            COUNT(c.id) AS total_contributions,
            SUM(c.total_amount) AS total_amount,
            GROUP_CONCAT(DISTINCT ft.name) AS financial_types,
            GROUP_CONCAT(DISTINCT pi.label) AS payment_methods,
            GROUP_CONCAT(DISTINCT cs.label) AS statuses
        FROM civicrm_contribution c
        LEFT JOIN civicrm_financial_type ft ON ft.id = c.financial_type_id
        LEFT JOIN civicrm_option_value pi ON pi.value = c.payment_instrument_id AND pi.option_group_id = (
            SELECT id FROM civicrm_option_group WHERE name = 'payment_instrument'
        )
        LEFT JOIN civicrm_option_value cs ON cs.value = c.contribution_status_id AND cs.option_group_id = (
            SELECT id FROM civicrm_option_group WHERE name = 'contribution_status'
        )
        WHERE c.receive_date IS NOT NULL
        GROUP BY month
        ORDER BY month ASC
    ";

    $dao = \CRM_Core_DAO::executeQuery($sql);
    $results = [];

    while ($dao->fetch()) {
        $results[] = [
            'month' => $dao->month,
            'total_contributions' => (int) $dao->total_contributions,
            'total_amount' => (float) $dao->total_amount,
            'financial_types' => $dao->financial_types,
            'payment_methods' => $dao->payment_methods,
            'statuses' => $dao->statuses,
        ];
    }

    return $results;
}



}

