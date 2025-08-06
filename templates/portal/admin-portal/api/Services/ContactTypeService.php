<?php

namespace Services;

class ContactTypeService
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
    public static function getParentsAndSubtypes(): array
    {
        $contactTypes = \Civi\Api4\ContactType::get(TRUE)
            ->addSelect('id', 'name', 'parent_id')
            ->execute();

        if (empty($contactTypes)) {
            return [
                'parents' => [],
                'subtypes' => [],
            ];
        }
        $allTypes = $contactTypes->getArrayCopy();

        // Separate parents and subtypes
        $parents = array_filter($allTypes, fn($ct) => is_null($ct['parent_id']));
        $subtypes = array_filter($allTypes, fn($ct) => !is_null($ct['parent_id']));
        return [
            'parents' => array_values($parents),
            'subtypes' => array_values($subtypes),
        ];
    }
}
