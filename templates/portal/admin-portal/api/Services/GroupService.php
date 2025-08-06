<?php

namespace Services;

class GroupService
{    public static function getAll(): ?array
    {
        $group = \Civi\Api4\Group::get(TRUE)
          ->addWhere('is_active', '=', TRUE)
          ->execute();

        if (empty($group)) {
            return null;
        }

        return $group->getArrayCopy();
    }
}
