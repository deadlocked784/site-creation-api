<?php
use CRM_Adminportalconfig_ExtensionUtil as E;

return [
  [
    'name' => 'CustomGroup_Additional_Contribution_Details',
    'entity' => 'CustomGroup',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Additional_Contribution_Details',
        'title' => E::ts('Additional Contribution Details'),
        'extends' => 'Contribution',
        'style' => 'Inline',
        'help_pre' => E::ts(''),
        'help_post' => E::ts(''),
        'weight' => 6,
        'collapse_adv_display' => TRUE,
        'created_date' => '2025-08-04 08:01:37',
        'icon' => '',
      ],
      'match' => ['name'],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Contribution_Details_Recurring_Donation',
    'entity' => 'OptionGroup',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Additional_Contribution_Details_Recurring_Donation',
        'title' => E::ts('Additional Contribution Details :: Recurring Donation'),
        'data_type' => 'String',
        'is_reserved' => FALSE,
        'option_value_fields' => ['name', 'label', 'description'],
      ],
      'match' => ['name'],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Contribution_Details_Recurring_Donation_OptionValue_Yes',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Contribution_Details_Recurring_Donation',
        'label' => E::ts('Yes'),
        'value' => '1',
        'name' => 'Yes',
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Contribution_Details_Recurring_Donation_OptionValue_No',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Contribution_Details_Recurring_Donation',
        'label' => E::ts('No'),
        'value' => '2',
        'name' => 'No',
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'CustomGroup_Additional_Contribution_Details_CustomField_Recurring_Donation',
    'entity' => 'CustomField',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'custom_group_id.name' => 'Additional_Contribution_Details',
        'name' => 'Recurring_Donation',
        'label' => E::ts('Recurring Donation'),
        'html_type' => 'Radio',
        'is_searchable' => TRUE,
        'text_length' => 255,
        'note_columns' => 60,
        'note_rows' => 4,
        'column_name' => 'recurring_donation_13',
        'option_group_id.name' => 'Additional_Contribution_Details_Recurring_Donation',
      ],
      'match' => [
        'name',
        'custom_group_id',
      ],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Contribution_Details_Campaign',
    'entity' => 'OptionGroup',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Additional_Contribution_Details_Campaign',
        'title' => E::ts('Additional Contribution Details :: Campaign'),
        'data_type' => 'String',
        'is_reserved' => FALSE,
        'option_value_fields' => ['name', 'label', 'description'],
      ],
      'match' => ['name'],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Contribution_Details_Campaign_OptionValue_N_A',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Contribution_Details_Campaign',
        'label' => E::ts('N/A'),
        'value' => 'NA',
        'name' => 'N_A',
        'description' => E::ts(''),
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'CustomGroup_Additional_Contribution_Details_CustomField_Campaign',
    'entity' => 'CustomField',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'custom_group_id.name' => 'Additional_Contribution_Details',
        'name' => 'Campaign',
        'label' => E::ts('Campaign'),
        'html_type' => 'Select',
        'default_value' => 'NA',
        'is_searchable' => TRUE,
        'text_length' => 255,
        'note_columns' => 60,
        'note_rows' => 4,
        'column_name' => 'campaign_14',
        'option_group_id.name' => 'Additional_Contribution_Details_Campaign',
      ],
      'match' => [
        'name',
        'custom_group_id',
      ],
    ],
  ],
];
