<?php

namespace Services;

class EntityService
{
    /**
     * @param string $type  The Api4 entity, e.g. 'Contact', 'Activity'
     * @return array|null   Array of associative arrays, or null if no rows / invalid class
     */
    public static function getByType(string $type, ?string $filter): ?array
    {
        $className = "\\Civi\\Api4\\$type";

        if (! class_exists($className)) {
            return null;
        }

        $result = $className::get(TRUE);

        $result->addSelect('*', 'email_primary.email', 'activity_type_id:name');

        if ($filter) {
            $filterParams = [];
            parse_str($filter, $filterParams);
            foreach ($filterParams as $field => $value) {
                $result->addWhere($field, '=', $value);
            }
        }


        $rows = $result
            ->execute()
            ->getArrayCopy();

        return ! empty($rows) ? $rows : null;
    }
}
