<?php

namespace Services;

class ReportService
{
    public static function getRowsByInstanceId(int $id): ?array
    {
        //Retrieve SavedSearch by ID
        $savedSearch = \Civi\Api4\SavedSearch::get(TRUE)
            ->addWhere('id', '=', $id)
            ->execute()
            ->first();

        if (!$savedSearch || empty($savedSearch['api_entity']) || empty($savedSearch['api_params'])) {
            return null;
        }

        $apiEntity = $savedSearch['api_entity'];
        $apiParams = $savedSearch['api_params'];
        $className = "\\Civi\\Api4\\{$apiEntity}";
        if (!class_exists($className)) {
            return null;
        }

        $query = $className::get(TRUE)->setCheckPermissions(FALSE);

        // Step 4: Apply API params dynamically
        foreach ($apiParams as $method => $value) {
            if ($method === 'version')
                continue;

            if ($method === 'select' && is_array($value)) {
                foreach ($value as $field) {
                    $query->addSelect($field);
                }
                continue;
            }

            if ($method === 'where' && is_array($value)) {
                foreach ($value as $condition) {
                    if (!empty($condition)) {
                        $query->addWhere(...$condition);
                    }
                }
                continue;
            }

            if ($method === 'join' && is_array($value)) {
                foreach ($value as $join) {
                    if (!empty($join)) {
                        $query->addJoin(...$join);
                    }
                }
                continue;
            }

            if ($method === 'having' && is_array($value)) {
                foreach ($value as $having) {
                    if (!empty($having)) {
                        $query->addHaving(...$having);
                    }
                }
                continue;
            }

            if ($method === 'groupBy' && is_array($value)) {
                if (!empty($value)) {
                    $query->addGroupBy(...$value);
                }
                continue;
            }

            if ($method === 'orderBy' && is_array($value)) {
                foreach ($value as $order) {
                    if (!empty($order)) {
                        $query->addOrderBy(...$order);
                    }
                }
                continue;
            }

            if ($method === 'limit') {
                $query->setLimit((int) $value);
                continue;
            }
        }

        $rows = iterator_to_array($query->execute());

        if (empty($apiParams['select']) && !empty($rows)) {
            $firstRow = $rows[0];
            if (is_array($firstRow)) {
                $apiParams['select'] = array_keys($firstRow);
            } elseif (is_object($firstRow)) {
                $apiParams['select'] = array_keys(get_object_vars($firstRow));
            }
        }

        //Get label overrides from SearchDisplay
        $display = \Civi\Api4\SearchDisplay::get(TRUE)
            ->addWhere('saved_search_id', '=', $id)
            ->setCheckPermissions(false)
            ->execute()
            ->first();

        $labelOverrides = [];
        if ($display && !empty($display['settings']['columns'])) {
            foreach ($display['settings']['columns'] as $col) {
                if (!empty($col['key']) && !empty($col['label'])) {
                    $labelOverrides[$col['key']] = $col['label'];
                }
            }
        }

        return [
            'name' => $savedSearch['name'] ?? null,
            'label' => $savedSearch['label'] ?? null,
            'api_entity' => $apiEntity,
            'api_params' => $apiParams,
            'columns' => $apiParams['select'] ?? [],
            'rows' => $rows,
            'labelOverrides' => $labelOverrides, // send this to frontend
        ];
    }

    public static function getById(int $id): ?array
    {
        $result = civicrm_api3('ReportTemplate', 'getrows', [
            'instance_id' => $id,
        ]);

        $statsResult = civicrm_api3('ReportTemplate', 'getstatistics', [
            'instance_id' => $id,
        ]);

        $instance = civicrm_api3('ReportInstance', 'get', [
            'id' => $id,
        ]);

        $counts = $statsResult['values']['counts'] ?? [];
        $title = $instance['values'][$id]['title'] ?? null;

        return [
            'title' => $title,
            'rows' => $result['values'],
            'stats' => $counts,
        ];
    }

    public static function getAllSearchKits(): ?array
    {
        $searchKits = \Civi\Api4\SavedSearch::get(TRUE)
            ->addSelect('id', 'label', 'name', 'description', 'api_entity', 'created_date', 'modified_date')
            ->addWhere('created_id', 'IS NOT NULL') // Filter: only custom searches
            ->setCheckPermissions(false)
            ->execute();

        if ($searchKits->count() === 0) {
            return null;
        }

        return $searchKits->getArrayCopy(); // Return as plain array
    }

    /**
     * Get display labels by SavedSearch ID.
     *
     * @param int $savedSearchId The SavedSearch ID.
     * @return array Returns an array of display labels or an empty array if none found.
     */
    public static function getDisplayLabelsBySavedSearchId(int $savedSearchId): array
    {
        $display = \Civi\Api4\SearchDisplay::get(TRUE)
            ->addWhere('saved_search_id', '=', $savedSearchId)
            ->setCheckPermissions(false)
            ->execute()
            ->first();

        if (!$display || empty($display['settings']['columns'])) {
            return [];
        }

        $columns = $display['settings']['columns'];

        $labels = [];
        foreach ($columns as $column) {
            if (!empty($column['key']) && !empty($column['label'])) {
                $labels[$column['key']] = $column['label'];
            }
        }

        return $labels;
    }

    public static function getAll(): ?array
    {
        $reports = \Civi\Api4\ReportInstance::get(TRUE)
            ->addClause('OR', ['report_id', 'LIKE', 'contact%'], ['report_id', 'LIKE', 'contribute%'], ['report_id', 'LIKE', 'activity%'])
            ->addWhere('is_active', '=', TRUE)
            ->execute();

        if (empty($reports)) {
            return null;
        }

        return $reports->getArrayCopy();
    }


}