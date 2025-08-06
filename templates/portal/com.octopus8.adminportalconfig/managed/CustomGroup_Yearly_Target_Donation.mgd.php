<?php
use CRM_Adminportalconfig_ExtensionUtil as E;

return [
  [
    'name' => 'CustomGroup_Yearly_Target_Donation',
    'entity' => 'CustomGroup',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Yearly_Target_Donation',
        'title' => E::ts('Yearly Target Donation'),
        'extends' => 'Activity',
        'style' => 'Inline',
        'help_pre' => E::ts(''),
        'help_post' => E::ts(''),
        'weight' => 3,
        'collapse_adv_display' => TRUE,
        'created_date' => '2025-07-16 05:57:42',
        'icon' => '',
      ],
      'match' => ['name'],
    ],
  ],
  [
    'name' => 'CustomGroup_Yearly_Target_Donation_CustomField_Target_Amount',
    'entity' => 'CustomField',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'custom_group_id.name' => 'Yearly_Target_Donation',
        'name' => 'Target_Amount',
        'label' => E::ts('Target Amount'),
        'data_type' => 'Float',
        'html_type' => 'Text',
        'is_searchable' => TRUE,
        'text_length' => 255,
        'note_columns' => 60,
        'note_rows' => 4,
        'column_name' => 'target_amount_1',
      ],
      'match' => [
        'name',
        'custom_group_id',
      ],
    ],
  ],
];
