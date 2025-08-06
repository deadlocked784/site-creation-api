<?php

namespace Services;

class ActivityService
{
    /**
     * Get all activities for a specific contact.
     *
     * @param int $contactId
     * @return array
     */
    
    public static function getAllByContactId(int $contactId): array
    {
        try {
            // First get all activity IDs where this contact is involved
            $activityIds = \Civi\Api4\ActivityContact::get(FALSE)
                ->addSelect('activity_id')
                ->addWhere('contact_id', '=', $contactId)
                ->execute()
                ->column('activity_id');

            if (empty($activityIds)) {
                return [];
            }

            // Then get full activity details with all contact relationships
            $activities = \Civi\Api4\Activity::get(FALSE)
                ->addSelect(
                    'id',
                    'activity_type_id',
                    'activity_type_id:name',
                    'subject',
                    'location',
                    'activity_date_time',
                    'duration',
                    'status_id:name',
                    'details',
                    'source_contact_id',
                    'target_contact_id',
                    'assignee_contact_id',
                    'custom.*'
                )
                ->addWhere('id', 'IN', $activityIds)
                ->addOrderBy('activity_date_time', 'DESC')
                ->execute();

            // Now enrich with contact display names
            $result = [];
            foreach ($activities as $activity) {
                $enrichedActivity = $activity;

                // Get source contact name
                if (!empty($activity['source_contact_id'])) {
                    $enrichedActivity['source.display_name'] = \Civi\Api4\Contact::get(FALSE)
                        ->addSelect('display_name')
                        ->addWhere('id', '=', $activity['source_contact_id'])
                        ->execute()
                        ->first()['display_name'] ?? '';
                } else {
                    $enrichedActivity['source.display_name'] = '';
                }

                // Get target contact names
                $enrichedActivity['target.display_name'] = '';
                if (!empty($activity['target_contact_id'])) {
                    $targets = \Civi\Api4\ActivityContact::get(FALSE)
                        ->addSelect('contact_id.display_name')
                        ->addWhere('activity_id', '=', $activity['id'])
                        ->addWhere('record_type_id:name', '=', 'Activity Targets')
                        ->execute();
                    $enrichedActivity['target.display_name'] = implode(', ', $targets->column('contact_id.display_name'));
                }

                // Get assignee contact names
                $enrichedActivity['assignee.display_name'] = '';
                if (!empty($activity['assignee_contact_id'])) {
                    $assignees = \Civi\Api4\ActivityContact::get(FALSE)
                        ->addSelect('contact_id.display_name')
                        ->addWhere('activity_id', '=', $activity['id'])
                        ->addWhere('record_type_id:name', '=', 'Activity Assignees')
                        ->execute();
                    $enrichedActivity['assignee.display_name'] = implode(', ', $assignees->column('contact_id.display_name'));
                }

                $result[] = $enrichedActivity;
            }

            return $result;
        } catch (\Exception $e) {
            \Civi::log()->error("Error fetching activities for contact {$contactId}: " . $e->getMessage());
            return [];
        }
    }




    /**
     * Get all activities by type.
     *
     * @return array
     */
    public static function getActivitiesByType($type): array
    {
        $activities = \Civi\Api4\Activity::get(TRUE)
            ->addSelect(
                'id',
                'activity_type_id',
                'activity_type_id:name',
                'source_contact_id',
                'target_contact_id',
                'assignee_contact_id',
                'source.display_name',
                'target.display_name',
                'assignee.display_name',
                'subject',
                'location',
                'activity_date_time',
                'duration',
                'status_id:name',
                'details',
                'Pending_Contribution.Total_Amount',
                'custom.*'

            )
            ->addWhere('activity_type_id:name', '=', $type)
            ->addOrderBy('activity_date_time', 'DESC')
            ->addJoin('Contact AS source', 'LEFT', ['source_contact_id', '=', 'source.id'])
            ->addJoin('Contact AS target', 'LEFT', ['target_contact_id', '=', 'target.id'])
            ->addJoin('Contact AS assignee', 'LEFT', ['assignee_contact_id', '=', 'assignee.id'])
            ->execute();

        return $activities->getArrayCopy();
    }

    /**
     * Return the total number of activities for a specific contact.
     *
     * @param int $contactId
     * @return int
     */

    public static function getContactActivitiesCount(int $contactId): int
    {
        $activityIds = \Civi\Api4\ActivityContact::get(TRUE)
            ->addSelect('activity_id')
            ->addWhere('contact_id', '=', $contactId)
            ->execute()
            ->column('activity_id');

        // Remove duplicates
        return count(array_unique($activityIds));
    }

    /**
     * Return an activity by ID.
     *
     * @param int $id
     * @return array
     */
    public static function getById(int $id): ?array
    {
        $activity = \Civi\Api4\Activity::get(TRUE)
            ->addSelect(
                'source_contact_id',
                'target_contact_id',
                'assignee_contact_id',
                'activity_type_id',
                'activity_type_id:name',
                'subject',
                'source.display_name',
                'target.display_name',
                'assignee.display_name',
                'location',
                'activity_date_time',
                'duration',
                'status_id:name',
                'details',
                'custom.*'
            )
            ->addWhere('id', '=', $id)
            ->addJoin('Contact AS source', 'LEFT', ['source_contact_id', '=', 'source.id'])
            ->addJoin('Contact AS target', 'LEFT', ['target_contact_id', '=', 'target.id'])
            ->addJoin('Contact AS assignee', 'LEFT', ['assignee_contact_id', '=', 'assignee.id'])
            ->setLimit(1)
            ->execute()
            ->first();

        return $activity;
    }

    /**
     * Create an activity, uploading files for any custom fields if provided.
     *
     * @param array  $data     The activity fields (e.g. activity_date_time, subject, etc.)
     * @param array  $files    The $_FILES superglobal
     * @return array|null      The created activity
     * @throws \Exception      On CiviCRM or PHP error
     */
    // public static function createActivityWithFile(array $data, array $files): ?array
    // {
    //     // Process files first and replace with file IDs
    //     foreach ($files as $fieldName => $fileInfo) {
    //         if (!empty($fileInfo['tmp_name']) && is_uploaded_file($fileInfo['tmp_name'])) {
    //             try {
    //                 $binary = file_get_contents($fileInfo['tmp_name']);
    //                 $mime   = $fileInfo['type'];
    //                 $originalName = $fileInfo['name'];

    //                 // Create file record in CiviCRM
    //                 $fileRecord = \Civi\Api4\File::create(TRUE)
    //                     ->addValue('data', $binary)
    //                     ->addValue('mime_type', $mime)
    //                     ->addValue('upload_date', date('Y-m-d H:i:s'))
    //                     ->addValue('name', $originalName)
    //                     ->execute()
    //                     ->first();

    //                 if (!empty($fileRecord['id'])) {
    //                     // Store the file ID in the activity data
    //                     $data[$fieldName] = $fileRecord['id'];
                        
    //                     // Log for debugging
    //                     error_log("File uploaded successfully: Field={$fieldName}, FileID={$fileRecord['id']}, Name={$originalName}");
    //                 } else {
    //                     error_log("Failed to create file record for field: {$fieldName}");
    //                 }
    //             } catch (\Exception $e) {
    //                 error_log("Error uploading file for field {$fieldName}: " . $e->getMessage());
    //                 throw $e;
    //             }
    //         }
    //     }
        
    //     // Log the data being sent to createActivity
    //     error_log("Creating activity with data: " . print_r($data, true));
        
    //     // Delegate to normal createActivity for the rest
    //     return self::createActivity($data);
    // }

    /**
     * Create a new activity
     *
     * @param array $data The fields and values to create
     * @return array|null The created activity record or null if not found 
     */
  public static function createActivity(array $data): ?array
    {
        \Civi::log()->debug('[createActivity] Incoming data', ['data' => $data]);

        if (isset($data['activity_date_time'])) {
            $dateStr = $data['activity_date_time'];

            // Inline date parsing helper logic
            $formattedDate = null;
            if (empty($dateStr)) {
                $formattedDate = date('Y-m-d H:i:s');
            } else {
                try {
                    // Try default DateTime constructor first
                    $formattedDate = (new \DateTime($dateStr))->format('Y-m-d H:i:s');
                } catch (\Exception $e) {
                    try {
                        // Try parsing your specific custom format: day/month/year, h:i:s am/pm
                        $date = \DateTime::createFromFormat('d/m/Y, g:i:s a', $dateStr);
                        if ($date === false) {
                            throw new \Exception('Date parse returned false');
                        }
                        $formattedDate = $date->format('Y-m-d H:i:s');
                    } catch (\Exception $e2) {
                        \Civi::log()->debug('[createActivity] Invalid date format fallback', [
                            'input' => $dateStr,
                            'error' => $e2->getMessage(),
                        ]);
                        $formattedDate = date('Y-m-d H:i:s');
                    }
                }
            }

            $data['activity_date_time'] = $formattedDate;
        }

        try {
            $query = \Civi\Api4\Activity::create(TRUE);

            foreach ($data as $key => $value) {
                if ($value !== null) {
                    $query->addValue($key, $value);
                }
            }

            $activities = $query->execute();

            \Civi::log()->debug('[createActivity] Activity created successfully', ['result' => $activities]);

            return $activities[0] ?? null;

        } catch (\Exception $e) {
            \Civi::log()->error('[createActivity] Failed to create activity', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }


    /**
     * Update an existing activity by ID.
     *
     * @param int $id The activity ID to update
     * @param array $data The fields and values to update
     * @return array|null The updated activity record or null if not found
     */
    public static function updateActivity(int $id, array $data): ?array
    {
        $query = \Civi\Api4\Activity::update(TRUE)
            ->addWhere('id', '=', $id);

        foreach ($data as $key => $value) {
            if ($value !== null) {
                $query->addValue($key, $value);
            }
        }

        $activities = $query->execute();

        return $activities[0] ?? null;
    }

    /**
     * Bulk update the status of multiple activities.
     *
     * @param int[]             $ids         An array of activity IDs to update.
     * @param int|string        $newStatus   The new status_id (or status label) to apply.
     * @return array                        The list of updated activity records.
     */

   
    // public static function bulkUpdateActivityStatus(array $ids, $newStatus): array
    // {


    //     $updatedActivities = [];

        
    //         // If the status is a string (e.g. "Completed"), look up its ID
    //         if (!is_numeric($newStatus)) {
    //             $statusLookup = \Civi\Api4\OptionValue::get(FALSE)
    //                 ->addSelect('value')
    //                 ->addWhere('option_group_id:name', '=', 'activity_status')
    //                 ->addWhere('name', '=', $newStatus)
    //                 ->setLimit(1)
    //                 ->execute()
    //                 ->first();

    //             if (!$statusLookup || !isset($statusLookup['value'])) {
    //                 throw new \Exception("Status label '{$newStatus}' not found in activity_status option group.");
    //             }

    //             $newStatus = (int) $statusLookup['value'];
    //             error_log("Mapped status label to ID: {$newStatus}");
    //         }

    //         // Update activities
    //         $result = \Civi\Api4\Activity::update(TRUE)
    //             ->addWhere('id', 'IN', $ids)
    //             ->addValue('status_id', $newStatus)
    //             ->execute();

    //         $updatedActivities = iterator_to_array($result, false);
    //         error_log("✅ Updated Activities: " . json_encode($updatedActivities));
   

    //     error_log("========== END bulkUpdateActivityStatus ==========");
    //     return $updatedActivities;
    // }

//     public static function bulkUpdateActivityStatus(array $ids, $newStatus): array
// {
//     $updatedActivities = [];

//     error_log("⚙️ bulkUpdateActivityStatus() called with IDs: " . json_encode($ids) . " and newStatus: " . $newStatus);

//     // If the status is a string (e.g. "Completed"), look up its ID
//     if (!is_numeric($newStatus)) {
//         $statusLookup = \Civi\Api4\OptionValue::get(FALSE)
//             ->addSelect('value')
//             ->addWhere('option_group_id:name', '=', 'activity_status')
//             ->addWhere('name', '=', $newStatus)
//             ->setLimit(1)
//             ->execute()
//             ->first();

//         if (!$statusLookup || !isset($statusLookup['value'])) {
//             error_log("❌ Status label '{$newStatus}' not found.");
//             throw new \Exception("Status label '{$newStatus}' not found in activity_status option group.");
//         }

//         $newStatus = (int) $statusLookup['value'];
//         error_log("🔄 Mapped status label to ID: {$newStatus}");
//     }

//     // Update activities
//     $result = \Civi\Api4\Activity::update(TRUE)
//         ->addWhere('id', 'IN', $ids)
//         ->addValue('status_id', $newStatus)
//         ->execute();

//     $updatedActivities = iterator_to_array($result, false);
//     error_log("✅ Updated Activities: " . json_encode($updatedActivities));

//     error_log("========== END bulkUpdateActivityStatus ==========");

//     return $updatedActivities;
// }
public static function bulkUpdateActivityStatus(array $ids, $newStatus): array
{
    \Civi::log()->debug("========== START bulkUpdateActivityStatus ==========");
    \Civi::log()->debug("Input IDs: " . json_encode($ids));
    \Civi::log()->debug("Input New Status (label or id): " . json_encode($newStatus));

    try {
        // Resolve if $newStatus is label
        if (!is_numeric($newStatus)) {
            $statusOption = civicrm_api4('OptionValue', 'get', [
                'where' => [
                    ['option_group_id.name', '=', 'activity_status'],
                    ['label', '=', $newStatus],
                ],
                'limit' => 1,
            ], 0);

            \Civi::log()->debug("Resolved status label '{$newStatus}' to: " . json_encode($statusOption));

            if (empty($statusOption['value'])) {
                \Civi::log()->debug("⚠️ Could not resolve status label '{$newStatus}' to an ID, aborting update.");
                return [];
            }
            $newStatus = $statusOption['value'];
        }

        \Civi::log()->debug("Using numeric status ID for update: " . $newStatus);

        $result = \Civi\Api4\Activity::update(TRUE)
            ->addWhere('id', 'IN', $ids)
            ->addValue('status_id', $newStatus)
            ->execute();

        $updatedActivities = iterator_to_array($result, false);
        \Civi::log()->debug("Updated Activities: " . json_encode($updatedActivities));
    } catch (\Exception $e) {
        \Civi::log()->debug("❌ Error updating activities: " . $e->getMessage());
        $updatedActivities = [];
    }

    \Civi::log()->debug("========== END bulkUpdateActivityStatus ==========");
    return $updatedActivities;
}


    /**
     * Delete an activity by its ID.
     *
     * @param int $id The ID of the activity to delete
     * @return array The result of the deletion operation
     */
    public static function delete(int $id): array
    {
        $result = \Civi\Api4\Activity::delete(TRUE)
            ->addWhere('id', '=', $id)
            ->execute();

        return $result->getArrayCopy();
    }

    public static function getAll(): array
    {
        $activities = \Civi\Api4\Activity::get(TRUE)
            ->addSelect(
                'id',
                'activity_type_id',
                'activity_type_id:name',
                'source_contact_id',
                'target_contact_id',
                'assignee_contact_id',
                'source.display_name',
                'target.display_name',
                'assignee.display_name',
                'subject',
                'location',
                'activity_date_time',
                'duration',
                'status_id',
                'status_id:name',
                'details',
                'custom.*'
            )
            ->addOrderBy('activity_date_time', 'DESC')
            ->addJoin('Contact AS source', 'LEFT', ['source_contact_id', '=', 'source.id'])
            ->addJoin('Contact AS target', 'LEFT', ['target_contact_id', '=', 'target.id'])
            ->addJoin('Contact AS assignee', 'LEFT', ['assignee_contact_id', '=', 'assignee.id'])
            ->execute();

        return $activities->getArrayCopy();
    }



}