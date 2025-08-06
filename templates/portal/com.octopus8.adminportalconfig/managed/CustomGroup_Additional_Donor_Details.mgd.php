<?php
use CRM_Adminportalconfig_ExtensionUtil as E;

return [
  [
    'name' => 'CustomGroup_Additional_Donor_Details',
    'entity' => 'CustomGroup',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Additional_Donor_Details',
        'title' => E::ts('Additional Donor Details'),
        'extends' => 'Individual',
        'style' => 'Inline',
        'help_pre' => E::ts(''),
        'help_post' => E::ts(''),
        'weight' => 4,
        'collapse_adv_display' => TRUE,
        'created_date' => '2025-07-16 05:59:49',
        'icon' => '',
      ],
      'match' => ['name'],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Donor_Details_Religion',
    'entity' => 'OptionGroup',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Additional_Donor_Details_Religion',
        'title' => E::ts('Additional Donor Details :: Religion'),
        'data_type' => 'String',
        'is_reserved' => FALSE,
        'option_value_fields' => ['name', 'label', 'description'],
      ],
      'match' => ['name'],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Donor_Details_Religion_OptionValue_Buddhism',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Donor_Details_Religion',
        'label' => E::ts('Buddhism'),
        'value' => '1',
        'name' => 'Buddhism',
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Donor_Details_Religion_OptionValue_Christianity',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Donor_Details_Religion',
        'label' => E::ts('Christianity'),
        'value' => '2',
        'name' => 'Christianity',
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Donor_Details_Religion_OptionValue_Islam',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Donor_Details_Religion',
        'label' => E::ts('Islam'),
        'value' => '3',
        'name' => 'Islam',
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Donor_Details_Religion_OptionValue_Taoism',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Donor_Details_Religion',
        'label' => E::ts('Taoism'),
        'value' => '4',
        'name' => 'Taoism',
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Donor_Details_Religion_OptionValue_Hinduism',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Donor_Details_Religion',
        'label' => E::ts('Hinduism'),
        'value' => '5',
        'name' => 'Hinduism',
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'CustomGroup_Additional_Donor_Details_CustomField_Religion',
    'entity' => 'CustomField',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'custom_group_id.name' => 'Additional_Donor_Details',
        'name' => 'Religion',
        'label' => E::ts('Religion'),
        'html_type' => 'Select',
        'is_searchable' => TRUE,
        'text_length' => 255,
        'note_columns' => 60,
        'note_rows' => 4,
        'column_name' => 'religion_2',
        'option_group_id.name' => 'Additional_Donor_Details_Religion',
      ],
      'match' => [
        'name',
        'custom_group_id',
      ],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Donor_Details_Race',
    'entity' => 'OptionGroup',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Additional_Donor_Details_Race',
        'title' => E::ts('Additional Donor Details :: Race'),
        'data_type' => 'String',
        'is_reserved' => FALSE,
        'option_value_fields' => ['name', 'label', 'description'],
      ],
      'match' => ['name'],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Donor_Details_Race_OptionValue_Chinese',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Donor_Details_Race',
        'label' => E::ts('Chinese'),
        'value' => '1',
        'name' => 'Chinese',
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Donor_Details_Race_OptionValue_Malay',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Donor_Details_Race',
        'label' => E::ts('Malay'),
        'value' => '2',
        'name' => 'Malay',
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Donor_Details_Race_OptionValue_Indian',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Donor_Details_Race',
        'label' => E::ts('Indian'),
        'value' => '3',
        'name' => 'Indian',
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'OptionGroup_Additional_Donor_Details_Race_OptionValue_Eurasian',
    'entity' => 'OptionValue',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'option_group_id.name' => 'Additional_Donor_Details_Race',
        'label' => E::ts('Eurasian'),
        'value' => '4',
        'name' => 'Eurasian',
      ],
      'match' => [
        'option_group_id',
        'name',
        'value',
      ],
    ],
  ],
  [
    'name' => 'CustomGroup_Additional_Donor_Details_CustomField_Race',
    'entity' => 'CustomField',
    'cleanup' => 'always',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'custom_group_id.name' => 'Additional_Donor_Details',
        'name' => 'Race',
        'label' => E::ts('Race'),
        'html_type' => 'Select',
        'is_searchable' => TRUE,
        'text_length' => 255,
        'note_columns' => 60,
        'note_rows' => 4,
        'column_name' => 'race_3',
        'option_group_id.name' => 'Additional_Donor_Details_Race',
      ],
      'match' => [
        'name',
        'custom_group_id',
      ],
    ],
  ],
];
