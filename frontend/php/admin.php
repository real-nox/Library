<?php
/* admin.php : tout ce que la page admin peut faire (connexion obligatoire sauf login/check)
   Appel : POST admin.php?action=login|check|list|add|update|delete|logout  (corps JSON) */
require __DIR__ . '/config.php';

// Seules les requêtes JSON sont acceptées (protection contre les formulaires venus d'autres sites)
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
    out(['error' => 'Requête invalide.'], 400);
}
$b = body();
$action = $_GET['action'] ?? '';

// ----- Connexion -----
if ($action === 'login') {
    $st = db()->prepare('SELECT mot_de_passe FROM admins WHERE identifiant = ?');
    $st->execute([$b['identifiant'] ?? '']);
    $hash = $st->fetchColumn();
    if ($hash && password_verify($b['mot_de_passe'] ?? '', $hash)) {
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        out(['ok' => true]);
    }
    usleep(600000);   // ralentit les essais de mots de passe
    out(['error' => 'Identifiant ou mot de passe incorrect.'], 401);
}
if ($action === 'check') out(['ok' => !empty($_SESSION['admin'])]);

// ----- À partir d'ici : administrateur connecté obligatoire -----
if (empty($_SESSION['admin'])) out(['error' => 'Connexion requise.'], 401);

// Vérifie les champs d'un article et renvoie les valeurs dans l'ordre des requêtes SQL
function clean(array $b): array {
    $type = $b['type'] ?? '';
    $niveau = $type === 'livre' ? (int)($b['niveau'] ?? 0) : null;
    $titre = trim($b['titre'] ?? '');
    $matiere = $b['matiere'] ?? '';
    $prix = is_numeric($b['prix'] ?? '') ? (float)$b['prix'] : -1;
    $qte = is_numeric($b['quantite'] ?? '') ? (int)$b['quantite'] : -1;
    $matieres = ['math', 'ar', 'fr', 'svt', 'ei', 'cahiers', 'stylos', 'crayons', 'fournitures'];
    if ($titre === '' || mb_strlen($titre) > 200 || !in_array($type, ['livre', 'papeterie'], true)
        || !in_array($matiere, $matieres, true) || $prix < 0 || $qte < 0
        || ($type === 'livre' && !in_array($niveau, [1, 2], true))) {
        out(['error' => 'Champs invalides : vérifiez le titre, le prix et la quantité.'], 422);
    }
    return [$type, $niveau, $titre, $matiere, $prix, $qte];
}

switch ($action) {
    case 'list':
        out(db()->query('SELECT id, type, niveau, titre, matiere, prix, quantite FROM produits ORDER BY id')->fetchAll());
    case 'add':
        db()->prepare('INSERT INTO produits (type, niveau, titre, matiere, prix, quantite) VALUES (?,?,?,?,?,?)')->execute(clean($b));
        out(['ok' => true]);
    case 'update':
        $v = clean($b); $v[] = (int)($b['id'] ?? 0);
        db()->prepare('UPDATE produits SET type=?, niveau=?, titre=?, matiere=?, prix=?, quantite=? WHERE id=?')->execute($v);
        out(['ok' => true]);
    case 'delete':
        db()->prepare('DELETE FROM produits WHERE id = ?')->execute([(int)($b['id'] ?? 0)]);
        out(['ok' => true]);
    case 'logout':
        session_destroy();
        out(['ok' => true]);
    default:
        out(['error' => 'Action inconnue.'], 400);
}
