<?php
/* chat.php : réponses du chatbot
   POST {"message": "..."}  ->  {"reply": "..."} */
require __DIR__ . '/config.php';

$msg = mb_strtolower(trim(body()['message'] ?? ''));
if ($msg === '') out(['reply' => "Écrivez le titre du livre ou de l'article que vous cherchez."]);

// Cherche le premier article dont le titre (ou un mot long du titre) apparaît dans le message
$hit = null;
foreach (db()->query('SELECT titre, prix, quantite FROM produits') as $r) {
    $t = mb_strtolower($r['titre']);
    $match = str_contains($msg, $t);
    foreach (preg_split('/\s+/', $t) as $w) if (mb_strlen($w) > 4 && str_contains($msg, $w)) $match = true;
    if ($match) { $hit = $r; break; }
}

if (!$hit) out(['reply' => "Je n'ai pas trouvé cet article. Essayez avec son titre."]);
$dispo = $hit['quantite'] > 0 ? 'Disponible (' . (int)$hit['quantite'] . ' en stock).' : 'Actuellement épuisé.';
out(['reply' => $hit['titre'] . ' : ' . (float)$hit['prix'] . ' DH. ' . $dispo]);
