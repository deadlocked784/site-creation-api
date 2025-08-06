<?php

namespace Services;

class FinancialTypeService
{
  /**
   * Return a list of financial types.
   */
  public static function getAll(): array
  {
    $financialTypes = \Civi\Api4\FinancialType::get(TRUE)
      ->addSelect('name', 'label')
      ->addWhere('is_active', '=', TRUE)
      ->execute();

    if (empty($financialTypes)) {
      return [];
    }

    return $financialTypes->getArrayCopy();
  }
}
