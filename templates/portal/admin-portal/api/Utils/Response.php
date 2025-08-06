<?php

namespace Utils;

class Response
{
    public static function json(array $payload, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode($payload);
        exit;
    }
}
