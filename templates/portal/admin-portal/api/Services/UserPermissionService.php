<?php

namespace Services;

class UserPermissionService
{
    /**
     * Get current WordPress user's roles and capabilities
     *
     * @return array|null
     */
    public static function getCurrentUserPermissions(): ?array
    {
        if (!function_exists('wp_get_current_user')) {
            return null;
        }

        $wpUser = wp_get_current_user();

        if (!$wpUser || !$wpUser->exists()) {
            return null;
        }

        return [
            'roles' => $wpUser->roles,
            'capabilities' => $wpUser->allcaps,
        ];
    }

    /**
     * Check if current user has a specific capability
     *
     * @param string $capability
     * @return bool
     */
    public static function hasCapability(string $capability): bool
    {
        return function_exists('current_user_can') && current_user_can($capability);
    }
}
