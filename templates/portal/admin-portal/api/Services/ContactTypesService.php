<?php

namespace Services;

class ContactTypesService
{
    /**
     * Return a list of contact types.
     */
    public static function getAll(): array
    {
        $contactTypes = \Civi\Api4\ContactType::get(TRUE)
            ->addSelect('id', 'name')
            ->addWhere('parent_id', 'IS NOT NULL')
            ->execute();

        if (empty($contactTypes)) {
            return [];
        }

        return $contactTypes->getArrayCopy();
    }
}
