<?php

require_once 'adminportalconfig.civix.php';

use CRM_Adminportalconfig_ExtensionUtil as E;

/**
 * Implements hook_civicrm_config().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_config/
 */
function adminportalconfig_civicrm_config(&$config): void {
  _adminportalconfig_civix_civicrm_config($config);
}

/**
 * Implements hook_civicrm_install().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_install
 */
function adminportalconfig_civicrm_install(): void {
  _adminportalconfig_civix_civicrm_install();
}

/**
 * Implements hook_civicrm_enable().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_enable
 */
function adminportalconfig_civicrm_enable(): void {
  _adminportalconfig_civix_civicrm_enable();
}
