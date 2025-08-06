<?php

namespace Utils;

class Auth
{
    public static function ensureLoggedIn(): void
    {
        if (!is_user_logged_in()) {
            Response::json(['success' => false, 'error' => 'Unauthorized'], 401);
        }
    }

    public static function ensureRole(string $role): void
    {
        if (!current_user_can($role)) {
            Response::json(['success' => false, 'error' => 'Forbidden'], 403);
        }
    }
}
