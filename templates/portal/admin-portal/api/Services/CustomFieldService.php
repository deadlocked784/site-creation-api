<?php

namespace Services;

class CustomFieldService
{
    /**
     * Get all custom fields for a given custom group name.
     * 
     * @param string $customGroupName The name of the custom group
     * @param bool $bypassPermission Whether to bypass permission checks (default: false)
     * @return array|null Array of custom fields or null if none found
     */
    public static function getAll(string $customGroupName, bool $bypassPermission = false): ?array
    {
        $customFields = \Civi\Api4\CustomField::get($bypassPermission)
            ->addSelect(
                'id',
                'name',
                'label',
                'data_type',
                'html_type',
                'default_value',
                'is_required',
                'help_pre',
                'help_post',
                'is_view',
                'option_group_id',
                'time_format',
                'fk_entity',
                'filter'
            )
            ->addWhere('is_active', '=', TRUE)
            ->addWhere('custom_group_id:name', '=', $customGroupName)
            ->addOrderBy('weight', 'ASC')
            ->execute();

        if (empty($customFields)) {
            return null;
        }

        return $customFields->getArrayCopy();
    }
}
