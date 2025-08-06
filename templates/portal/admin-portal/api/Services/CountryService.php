<?php

namespace Services;

class CountryService
{
    public static function getAll(): ?array
    {
        $countries = \Civi\Api4\Country::get(TRUE)
            ->addSelect('id', 'name')
            ->addWhere('is_active', '=', TRUE)
            ->execute();

        if (empty($countries)) {
            return null;
        }

        return $countries->getArrayCopy();
    }
}
