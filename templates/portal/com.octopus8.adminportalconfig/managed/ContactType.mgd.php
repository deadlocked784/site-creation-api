<?php

return [
  [
    'name' => 'ContactType_individual_donor',
    'entity' => 'ContactType',
    'params' => [
      'version' => 4,
      'values' => [
        'label' => 'Individual Donor',
        'name' => 'Individual_Donor',
        'parent_id' => 1, 
      ],
    ],
    'match' => ['name'], 
    'cleanup' => 'always',
    'update' => 'unmodified',
  ],
  [
    'name' => 'ContactType_organisation_donor',
    'entity' => 'ContactType',
    'params' => [
      'version' => 4,
      'values' => [
        'label' => 'Organisation Donor',
        'name' => 'Organisation_Donor',
        'parent_id' => 3,
      ],
    ],
    'match' => ['name'],
    'cleanup' => 'always',
    'update' => 'unmodified',
  ],
];
