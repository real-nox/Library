<?php
const DB_HOST = 'aws-1-eu-central-1.pooler.supabase.com', DB_USER = 'postgres.lqkmzmvfythflhejanum', DB_PASS = 'EyaGRZdv6tSbfnxu';

session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict']);
session_start();
header('Content-Type: application/json; charset=utf-8');

// Envoie une réponse JSON et arrête le script
function out($data, int $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Lit le corps JSON envoyé par le JavaScript
function body(): array {
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

// Connexion PDO (créée une seule fois)
function db(): PDO {
    static $pdo;
    if (!$pdo) {
        $pdo = new PDO('pgsql:host=' . DB_HOST . ';dbname=postgres;charset=utf8mb4', DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    }
    return $pdo;
}

// Erreur inattendue : message simple pour le visiteur (détails non affichés)
set_exception_handler(fn($e) => out(['error' => 'Erreur du serveur.'], 500));
