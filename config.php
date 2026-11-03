<?php
/* config.php : connexion MySQL + outils communs (inclus par tous les fichiers PHP) */

// TODO : adapter à votre serveur MySQL (XAMPP : root et mot de passe vide)
const DB_HOST = 'localhost', DB_NAME = 'librairie', DB_USER = 'root', DB_PASS = '';

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
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    }
    return $pdo;
}

// Erreur inattendue : message simple pour le visiteur (détails non affichés)
set_exception_handler(fn($e) => out(['error' => 'Erreur du serveur.'], 500));
