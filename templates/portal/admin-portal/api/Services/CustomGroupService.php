<?php
namespace Services;

class CustomGroupService
{
    /**
     * Get all active custom groups, with optional filters.
     * Permissions are enforced by default.
     * 
     * @param ?array $filters Optional filters to apply
     * @return ?array Array of custom groups or null if none found
     */
    public static function getAll(?array $filters = null): ?array
    {
        $query = \Civi\Api4\CustomGroup::get(FALSE) // enforce permissions
            ->addWhere('is_active', '=', TRUE);

        if ($filters) {
            foreach ($filters as $field => $value) {
                $query->addWhere($field, '=', $value);
            }
        }

        $customGroups = $query->execute();

        if (empty($customGroups)) {
            return null;
        }

        return $customGroups->getArrayCopy();
    }
}
