<?php
namespace Services;
class ContributionService
{

 public static function getAll(): array
  {
    $contributions = \Civi\Api4\Contribution::get(TRUE)
      ->addSelect(
        'contact_id',
        'contact.display_name',
        'contact_id.contact_type',
        'contact_id.contact_type:label',
        'financial_type_id',
        'financial_type_id:label',
        'payment_instrument_id',
        'payment_instrument_id:label',
        'receive_date',
        'total_amount',
        'currency:abbr',
        'source',
        'contribution_status_id',
        'contribution_status_id:label',
        'custom.*'
      )
      ->addJoin('Contact AS contact', 'LEFT', ['contact.id', '=', 'contact_id'])
      ->execute();

    if (empty($contributions)) {
      return [];
    }

    return $contributions->getArrayCopy();
  }



  /**
   * Return a contribution by ID.
   */
  public static function getById(int $id): ?array
  {
    $contribution = \Civi\Api4\Contribution::get(TRUE)
      ->addSelect(
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
      ->addJoin('Contact AS contact', 'LEFT', ['contact.id', '=', 'contact_id'])
      ->addWhere('id', '=', $id)
      ->setLimit(1)
      ->execute()
      ->first();

    if (!$contribution) {
      return null;
    }

    return $contribution;
  }

  public static function getContactContributions(int $contactId): array
  {
    $contributions = \Civi\Api4\Contribution::get(TRUE)
      ->addSelect(
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
      ->addJoin('Contact AS contact', 'LEFT', ['contact.id', '=', 'contact_id'])
      ->addWhere('contact_id', '=', $contactId)
      ->setLimit(25)
      ->execute();

    if (empty($contributions)) {
      return [];
    }

    return $contributions->getArrayCopy();
  }

  public static function getContactContributionsCount(int $contactId): int
  {
    $contributions = \Civi\Api4\Contribution::get(TRUE)
      ->addSelect('COUNT(*) AS count')
      ->addWhere('contact_id', '=', $contactId)
      ->setLimit(25)
      ->execute();

    return $contributions[0]['count'] ?? 0;
  }

  public static function createContribution(array $query): int|null
  {
    $data = $query['contributionData'] ?? [];
    // echo print_r($data, TRUE);
    $results = \Civi\Api4\Contribution::create(TRUE)
      ->addValue('contact_id', $data['contact_id'])
      ->addValue('financial_type_id', $data['financial_type_id'])
      ->addValue('payment_instrument_id', $data['payment_instrument_id'])
      ->addValue('receive_date', $data['receive_date'])
      ->addValue('total_amount', $data['total_amount'])
      ->addValue('source', $data['source'])
      ->addValue('contribution_status_id', $data['contribution_status_id'])
      ->execute();

    $contributionId = !empty($results) && isset($results[0]) ? $results[0]['id'] : null;

    return $contributionId;
  }

  public static function updateContribution(int $id, array $query): int|null
  {
    $data = $query['contributionData'] ?? [];
    // echo print_r($data, TRUE);
    $contribution = self::getById($id);
    if (!$contribution) {
      return null;
    }

    $query = \Civi\Api4\Contribution::update(TRUE)
      ->addWhere('id', '=', $id);

    foreach ($data as $key => $value) {
      if ($value !== null) {
        $query->addValue($key, $value);
      }
    }

    $results = $query->execute();

    $contributionId = !empty($results) && isset($results[0]) ? $results[0]['id'] : null;

    return $contributionId;
  }

  public static function deleteContribution(int $id): ?array
  {
    $results = \Civi\Api4\Contribution::delete(TRUE)
      ->addWhere('id', '=', $id)
      ->execute();

    return $results->getArrayCopy();
  }
}
