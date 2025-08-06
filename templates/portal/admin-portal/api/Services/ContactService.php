<?php

namespace Services;
require_once __DIR__ . '/CustomFieldService.php';
require_once __DIR__ . '/CustomGroupService.php';

class ContactService
{
  /**
   * Splits the contact payload into separate entity payloads.
   *
   * This method takes an associative array of data payload and categorizes it
   * into four distinct arrays: contact data, email data, phone data, and address data.
   * Keys with specific prefixes are used to determine the category, and the prefix
   * is removed from the key in the process.
   * - Keys starting with 'email_primary.' are categorized as email data.
   * - Keys starting with 'phone_primary.' are categorized as phone data.
   * - Keys starting with 'address_primary.' are categorized as address data.
   * - All other keys are categorized as contact data.
   *
   * @param array $data The associative array containing general payload data.
   * @return array An associative array containing the categorized data:
   *               - 'contact': Contact data.
   *               - 'email': Email-related data with prefixes removed.
   *               - 'phone': Phone-related data with prefixes removed.
   *               - 'address': Address-related data with prefixes removed.
   */
  private static function splitContactPayload(array $data): array
  {
    $contactData = [];
    $emailData = [];
    $phoneData = [];
    $addressData = [];

    foreach ($data as $key => $value) {
      if (strpos($key, 'email_primary.') === 0 && $value !== null) { // Comparing to zero means it starts with this prefix, not contains
        $key = str_replace('email_primary.', '', $key);
        $emailData[$key] = $value;
      } elseif (strpos($key, 'phone_primary.') === 0 && $value !== null) {
        $key = str_replace('phone_primary.', '', $key);
        $phoneData[$key] = $value;
      } elseif (strpos($key, 'address_primary.') === 0 && $value !== null) {
        $key = str_replace('address_primary.', '', $key);
        $addressData[$key] = $value;
      } else {
        $contactData[$key] = $value;
      }
    }
    return [
      'contact' => $contactData,
      'email' => $emailData,
      'phone' => $phoneData,
      'address' => $addressData,
    ];
  }

  /**
   * Retrieves a list of contacts.
   *
   * This method can filter contacts by type and a search string. The search is performed
   * across multiple fields including name, organization, email, ID, and external identifier.
   *
   * @param string|null $contactType  Optional. The type of contact to retrieve (e.g., 'Individual', 'Organization').
   * @param string|null $searchString Optional. A string to search for in various contact fields.
   * @return array An array of contacts matching the criteria, or an empty array if no contacts are found.
   */

  public static function getAll(?string $contactType = null, ?string $searchString = null): array
  {
    // Fetch all custom groups (no filter at API level to avoid TypeError)
    $customGroups = \Services\CustomGroupService::getAll();
    $customSelects = [];

    // Allowed 'extends' values
    $validExtends = ['Contact', 'Individual', 'Organization', 'Household'];

    // Loop through valid custom groups
    if (is_array($customGroups)) {
      foreach ($customGroups as $group) {
        if (!in_array($group['extends'], $validExtends)) {
          continue;
        }

        $groupName = $group['name'];
        $customFields = \Services\CustomFieldService::getAll($groupName);

        if (is_array($customFields)) {
          foreach ($customFields as $field) {
            if (!empty($field['name'])) {
              $fieldBase = "{$groupName}.{$field['name']}";
              $customSelects[] = $fieldBase;
              if (!empty($field['option_group_id'])) {
                $customSelects[] = $fieldBase . ':label';
              }
            }
          }
        }
      }
    }

    $baseFields = [
      'id',
      'contact_type',
      'display_name',
      'email_primary.email',
      'phone_primary.phone',
      'external_identifier',
      'address_primary.postal_code',
      'address_primary.supplemental_address_1',
      'address_primary.street_address',
      'prefix_id',
      'first_name',
      'last_name',
      'birth_date',
      'organization_name',
    ];

    $selectFields = array_merge($baseFields, $customSelects);

    // Build the query using CiviCRM APIv4
    $query = \Civi\Api4\Contact::get(TRUE)
      ->addSelect(...$selectFields);
    // Removed addJoin for group_contact

    // Add contact type filter if provided
    if ($contactType !== null) {
      $query->addWhere('contact_type', '=', $contactType);
    }

    // Add search filter if provided
    if ($searchString !== null) {
      $orConditions = [
        ['first_name', 'LIKE', "%{$searchString}%"],
        ['last_name', 'LIKE', "%{$searchString}%"],
        ['organization_name', 'LIKE', "%{$searchString}%"],
        ['email_primary.email', 'LIKE', "%{$searchString}%"],
        ['external_identifier', 'LIKE', "%{$searchString}%"],
      ];

      // Add numeric search for ID
      if (is_numeric($searchString)) {
        $orConditions[] = ['id', '=', (int) $searchString];
      }

      $query->addClause('OR', ...$orConditions);
    }

    // Sort by ID by default
    $query->addOrderBy('id', 'ASC');

    // Execute and return result as array
    $contacts = $query->execute();
    return $contacts->getArrayCopy();
  }


  /**
   * Retrieves a single contact by its unique ID.
   *
   * @param int $id The unique identifier of the contact.
   * @return array|null The contact data as an associative array, or null if not found.
   */

  public static function getById(int $id): ?array
  {
    $contactTypeResult = \Civi\Api4\Contact::get(TRUE)
      ->addSelect('contact_type')
      ->addWhere('id', '=', $id)
      ->setLimit(1)
      ->execute()
      ->first();

    if (!$contactTypeResult) {
      return null;
    }

    $contactType = $contactTypeResult['contact_type'];

    $customGroups = \Services\CustomGroupService::getAll();
    $customSelects = [];

    $validExtends = ['Contact', $contactType];

    foreach ($customGroups as $group) {
      if (!in_array($group['extends'], $validExtends, true)) {
        continue;
      }
      $groupName = $group['name'];
      $customFields = \Services\CustomFieldService::getAll($groupName);

      if (is_array($customFields)) {
        foreach ($customFields as $field) {
          if (!empty($field['name'])) {
            $fieldBase = "{$groupName}.{$field['name']}";
            $customSelects[] = $fieldBase;
            if (!empty($field['option_group_id'])) {
              $customSelects[] = $fieldBase . ':label';
            }
          }
        }
      }
    }

    $baseFields = [
      'id',
      'contact_type',
      'display_name',
      'email_primary.email',
      'phone_primary.phone',
      'external_identifier',
      'address_primary.postal_code',
      'address_primary.supplemental_address_1',
      'address_primary.street_address',
      'prefix_id',
      'first_name',
      'last_name',
      'birth_date',
      'organization_name',
      'group_contact.group_id:name',
      'group_contact.group_id:label',
      'group_contact.group_id',
      'tag_contact.tag_id:name',
      'tag_contact.tag_id:label',
      'tag_contact.tag_id',
    ];

    $selectFields = array_merge($baseFields, $customSelects);

    try {
      $query = \Civi\Api4\Contact::get(TRUE)
        ->addSelect(...$selectFields)
        ->addJoin('GroupContact AS group_contact', 'LEFT', ['id', '=', 'group_contact.contact_id'])
        ->addJoin('EntityTag AS tag_contact', 'LEFT', ['id', '=', 'tag_contact.entity_id'])
        ->addWhere('id', '=', $id)
        ->setLimit(1);

      $contact = $query->execute()->first();

      return $contact ?: null;

    } catch (\Exception $e) {
      error_log("getById: Exception occurred - " . $e->getMessage());
      return null;
    }
  }

  /**
   * Creates a new contact with associated email, phone, and address.
   *
   * The input data is split into contact, email, phone, and address payloads.
   * It then constructs a CiviCRM API query to create the contact and chain
   * the creation of primary email, phone, and address records if provided.
   *
   * @param array $data The data for the new contact.
   * @return array|null The newly created contact data, or null on failure.
   */

  public static function create(array $data): ?array
  {
    $payloads = self::splitContactPayload($data);

    // Log all incoming keys for debug
    error_log('Available data keys: ' . implode(', ', array_keys($data)));
    error_log('tag_id value: ' . var_export($data['tag_id'] ?? null, true));

    $query = \Civi\Api4\Contact::create(TRUE);

    foreach ($payloads['contact'] as $key => $value) {
      $query->addValue($key, $value);
    }

    // Create primary email if present
    if (!empty($payloads['email'])) {
      $emailQuery = \Civi\Api4\Email::create(TRUE)
        ->addValue('contact_id', '$id')
        ->addValue('is_primary', TRUE);

      foreach ($payloads['email'] as $key => $value) {
        $emailQuery->addValue($key, $value);
      }

      $query->addChain('create_primary_email', $emailQuery);
    }

    // Create primary phone if present
    if (!empty($payloads['phone'])) {
      $phoneQuery = \Civi\Api4\Phone::create(TRUE)
        ->addValue('contact_id', '$id')
        ->addValue('is_primary', TRUE);

      foreach ($payloads['phone'] as $key => $value) {
        $phoneQuery->addValue($key, $value);
      }

      $query->addChain('create_primary_phone', $phoneQuery);
    }

    // Create primary address if present
    if (!empty($payloads['address'])) {
      $addressQuery = \Civi\Api4\Address::create(TRUE)
        ->addValue('contact_id', '$id')
        ->addValue('is_primary', TRUE);

      foreach ($payloads['address'] as $key => $value) {
        $addressQuery->addValue($key, $value);
      }

      $query->addChain('create_primary_address', $addressQuery);
    }

    // Assign to group if group ID is provided
    $groupKey = 'group.contact.group.id';
    if (!empty($data[$groupKey])) {
      $groupId = (int) $data[$groupKey];
      error_log("Assigning contact to group ID: " . $groupId);

      $groupQuery = \Civi\Api4\GroupContact::create(TRUE)
        ->addValue('contact_id', '$id')
        ->addValue('group_id', $groupId)
        ->addValue('status', 'Added');

      $query->addChain('assign_to_group', $groupQuery);
      
    } else {
      error_log("No group ID provided in payload.");
    }

    // Assign tag if tag_id is provided
    if (!empty($data['tag_id'])) {
      $tagId = (int) $data['tag_id'];
      error_log("Assigning tag ID: " . $tagId);

      $tagQuery = \Civi\Api4\EntityTag::create(TRUE)
        ->addValue('entity_id', '$id')
        ->addValue('tag_id', $tagId)
        ->addValue('entity_table', 'civicrm_contact');

      $query->addChain('assign_tag', $tagQuery);
    } else {
      error_log("No tag ID provided in payload.");
    }

    try {
      $results = $query->execute();
      error_log("Contact created with ID: " . ($results[0]['id'] ?? 'unknown'));

      // Log full response for inspection
      error_log("Full create results: " . print_r($results, true));

      return $results[0] ?? null;
    } catch (\Exception $e) {
      error_log("Failed to create contact: " . $e->getMessage());
      return null;
    }
  }





  public static function countByContactType(): array
  {
    $types = ['Individual', 'Organization'];
    $results = [];

    foreach ($types as $type) {
      try {
        $count = \Civi\Api4\Contact::get(TRUE)
          ->addSelect('id')
          ->addWhere('contact_type', '=', $type)
          ->setCheckPermissions(TRUE)
          ->execute()
          ->count();

        $results[$type] = $count;
      } catch (\Exception $e) {
        error_log("Failed to count $type contacts: " . $e->getMessage());
        $results[$type] = 0;
      }
    }
    return $results;
  }

  /**
   * Updates an existing contact and its related entities.
   *
   * This method first retrieves the contact by ID to ensure it exists. It then
   * splits the payload into contact, email, phone, and address data and builds
   * a chained API call to update all entities in a single transaction.
   *
   * @param int $id The ID of the contact to update.
   * @param array $data The data to update the contact with.
   * @return array|null An array containing the updated contact data, or null if the contact was not found or the update failed.
   */

public static function update(int $id, array $data): ?array
{
    $contact = self::getById($id);
    if (!$contact) {
        return null;
    }

    $payloads = self::splitContactPayload($data);

    $query = \Civi\Api4\Contact::update(TRUE)
        ->addWhere('id', '=', $id);

    // Update contact fields
    foreach ($payloads['contact'] as $key => $value) {
        if ($value !== null) {
            $query->addValue($key, $value);
        }
    }

    // Update primary email
    if (!empty($payloads['email'])) {
        $emailQuery = \Civi\Api4\Email::update(TRUE)
            ->addWhere('contact_id', '=', $id)
            ->addWhere('is_primary', '=', 1); // Only update primary email

        foreach ($payloads['email'] as $key => $value) {
            if ($value !== null) {
                $emailQuery->addValue($key, $value);
            }
        }

        // Add the chain once, not inside the loop
        $query->addChain('update_primary_email', $emailQuery);
    }

    // Update primary phone
    if (!empty($payloads['phone'])) {
        $phoneQuery = \Civi\Api4\Phone::update(TRUE)
            ->addWhere('contact_id', '=', $id)
            ->addWhere('is_primary', '=', 1); // Only update primary phone

        foreach ($payloads['phone'] as $key => $value) {
            if ($value !== null) {
                $phoneQuery->addValue($key, $value);
            }
        }

        $query->addChain('update_primary_phone', $phoneQuery);
    }

    // Update primary address
    if (!empty($payloads['address'])) {
        $addressQuery = \Civi\Api4\Address::update(TRUE)
            ->addWhere('contact_id', '=', $id)
            ->addWhere('is_primary', '=', 1); // Only update primary address

        foreach ($payloads['address'] as $key => $value) {
            if ($value !== null) {
                $addressQuery->addValue($key, $value);
            }
        }

        $query->addChain('update_primary_address', $addressQuery);
    }

    $results = $query->execute();

    return $results[0] ?? null;
}

  /**
   * Deletes a contact by its ID.
   *
   * @param int $id The ID of the contact to delete.
   * @return array An array containing information about the deleted contact(s).
   *               Typically contains the ID of the deleted contact. Returns an empty array if no contact was found to delete.
   */
  public static function delete(int $id): ?array
  {
    // if (!function_exists('wp_get_current_user')) {
    //   error_log("WordPress functions not loaded");
    //   return null;
    // }


    // $user = wp_get_current_user();

    // if (
    //   !$user ||
    //   (
    //     !current_user_can('delete_contacts') &&
    //     !current_user_can('edit_all_contacts')
    //   )
    // ) {
    //   error_log("User ID {$user->ID} does not have permission to delete contacts");
    //   return null;
    // }


    $results = \Civi\Api4\Contact::delete(FALSE)
      ->addWhere('id', '=', $id)
      // ->setUseTrash(TRUE) //Permanently Delete
      ->execute();

    if (empty($results)) {
      return null;
    }

    return $results->getArrayCopy();
  }

  /**
   * Retrieves all contact groups.
   *
   * @return array List of groups with id and title.
   */
  public static function getAllGroups(): array
  {
    try {
      $groups = \Civi\Api4\Group::get(TRUE)
        ->addSelect('id', 'title')
        ->addWhere('is_active', '=', 1)
        ->addOrderBy('title', 'ASC')
        ->execute();

      return $groups->getArrayCopy();
    } catch (\Exception $e) {
      error_log('Failed to fetch groups: ' . $e->getMessage());
      return [];
    }
  }


  /**
   * Get all contacts belonging to a specific group by group ID.
   *
   * @param int $groupId The ID of the group.
   * @return array List of contacts in the group.
   */

  public static function getContactsByGroupId(int $groupId): array
  {
    try {
      // Step 1: Fetch contact IDs from GroupContact
      $groupContacts = \Civi\Api4\GroupContact::get(TRUE)
        ->addSelect('contact_id')
        ->addWhere('group_id', '=', $groupId)
        ->addWhere('status', '=', 'Added')
        ->execute()
        ->getArrayCopy();

      $contactIds = array_column($groupContacts, 'contact_id');

      if (empty($contactIds)) {
        return [];
      }

      // Step 2: Fetch contact details by ID
      $results = \Civi\Api4\Contact::get(TRUE)
        ->addSelect(
          'id',
          'contact_type',
          'display_name',
          'first_name',
          'last_name',
          'email_primary.email',
          'phone_primary.phone',
          'organization_name'
        )
        ->addWhere('id', 'IN', $contactIds)
        ->execute();

      return $results->getArrayCopy();

    } catch (\Exception $e) {
      error_log('Failed to fetch contacts by group ID: ' . $e->getMessage());
      return [];
    }
  }

  /**
   * Retrieves all active tags in the system.
   *
   * @return array List of tags with id and name.
   */

  public static function getAllTags(): array
  {
    try {
      $tags = \Civi\Api4\Tag::get(TRUE)
        ->addSelect('id', 'name', 'label', 'description')
        ->addOrderBy('name', 'ASC')
        ->execute();

      return $tags->getArrayCopy();
    } catch (\Exception $e) {
      error_log('Failed to fetch tags: ' . $e->getMessage());
      return [];
    }
  }

public static function getAllowedContactTypes(): array
{
    $contactID = \CRM_Core_Session::getLoggedInContactID();
    if (!$contactID) {
        error_log("No logged in contact ID found.");
        return [];
    }

    $allowedTypes = [];

    try {
        $aclTable = \CRM_Core_DAO::getTableName('civicrm_acl');
        $aclGroupTable = \CRM_Core_DAO::getTableName('civicrm_acl_group');
        $groupContactTable = \CRM_Core_DAO::getTableName('civicrm_group_contact');

        $sql = "
            SELECT acl.where_clause
            FROM {$aclTable} acl
            JOIN {$aclGroupTable} ag ON acl.id = ag.acl_id
            JOIN {$groupContactTable} gc ON ag.group_id = gc.group_id
            WHERE gc.contact_id = %1
              AND acl.is_active = 1
              AND gc.status = 'Added'
        ";

        $dao = \CRM_Core_DAO::executeQuery($sql, [1 => [$contactID, 'Integer']]);

        while ($dao->fetch()) {
            $where = $dao->where_clause;
            error_log("ACL where_clause: " . $where);

            if (preg_match("/contact_type\s*=\s*'Individual'/i", $where)) {
                $allowedTypes[] = 'Individual';
            }
            if (preg_match("/contact_type\s*=\s*'Organization'/i", $where)) {
                $allowedTypes[] = 'Organization';
            }
            if (preg_match("/contact_type\s*=\s*'Household'/i", $where)) {
                $allowedTypes[] = 'Household';
            }
        }
    } catch (\Exception $e) {
        error_log("Exception in getAllowedContactTypesFromAclRules: " . $e->getMessage());
        return [];
    }

    if (empty($allowedTypes)) {
        // No specific restrictions found — assume all contact types allowed
        return ['Individual', 'Organization', 'Household'];
    }

    return array_unique($allowedTypes);
}












}

