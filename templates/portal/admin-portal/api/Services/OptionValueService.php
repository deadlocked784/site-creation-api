<?php

namespace Services;

class OptionValueService
{
  /**
   * Return a list of option groups.
   */
  public static function getAll(?string $optionGroupName, ?string $optionGroupId): ?array
  {
    $query = \Civi\Api4\OptionValue::get(TRUE)
      ->addSelect('id', 'label', 'name', 'value');

    if ($optionGroupName) {
      $query->addWhere('option_group_id:name', '=', $optionGroupName);
    } elseif ($optionGroupId) {
      $query->addWhere('option_group_id', '=', $optionGroupId);
    }

    $optionValues = $query->execute();

    if (empty($optionValues)) {
      return null;
    }

    return $optionValues->getArrayCopy();
  }
}
