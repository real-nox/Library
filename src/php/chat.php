<?php
/* chat.php : POST {"message": "..."} -> {"reply": "..."} */
require __DIR__ . '/config.php';

$msg = trim(body()['message'] ?? '');
if ($msg === '') {
    out(['reply' => "Écrivez un titre, « top 5 » ou un prix (ex: livre à 100 DH)."]);
}

$lower = mb_strtolower($msg);
$toFloat = fn(string $v): float => (float)str_replace(',', '.', $v);

$items = [];
$mode = 'search';
$contextNote = '';

/* 1. PRÉDICTION / RECHERCHE PAR PRIX */
if (preg_match('/entre\s+(\d+(?:[.,]\d+)?)\s*(?:dh|dhs|dirhams?|mad)?\s+et\s+(\d+(?:[.,]\d+)?)/iu', $lower, $m)) {
    // Fourchette : "entre 50 et 120 dh"
    $min = min($toFloat($m[1]), $toFloat($m[2]));
    $max = max($toFloat($m[1]), $toFloat($m[2]));

    $st = db()->prepare("SELECT id, titre, prix, quantite FROM produits
                         WHERE quantite > 0 AND prix BETWEEN ? AND ?
                         ORDER BY prix ASC LIMIT 5");
    $st->execute([$min, $max]);
    $items = $st->fetchAll(PDO::FETCH_ASSOC);
    $mode = 'price';
    $contextNote = "Livres disponibles entre {$min} DH et {$max} DH.";

} elseif (preg_match('/(?:moins\s+de|max(?:imum)?|jusqu[\'’]?[aà]|inf[ée]rieur\s+[aà]|budget(?:\s+de)?|under|<=?)\s*(\d+(?:[.,]\d+)?)/iu', $lower, $m)) {
    // Budget maximum : "moins de 100 dh", "budget 80"
    $max = $toFloat($m[1]);

    $st = db()->prepare("SELECT id, titre, prix, quantite FROM produits
                         WHERE quantite > 0 AND prix <= ?
                         ORDER BY prix DESC LIMIT 5");
    $st->execute([$max]);
    $items = $st->fetchAll(PDO::FETCH_ASSOC);
    $mode = 'price';
    $contextNote = "Meilleurs choix disponibles à {$max} DH ou moins.";

} elseif (preg_match('/(?:plus\s+de|min(?:imum)?|[aà]\s+partir\s+de|sup[ée]rieur\s+[aà]|over|>=?)\s*(\d+(?:[.,]\d+)?)/iu', $lower, $m)) {
    // Prix minimum : "plus de 150 dh"
    $min = $toFloat($m[1]);

    $st = db()->prepare("SELECT id, titre, prix, quantite FROM produits
                         WHERE quantite > 0 AND prix >= ?
                         ORDER BY prix ASC LIMIT 5");
    $st->execute([$min]);
    $items = $st->fetchAll(PDO::FETCH_ASSOC);
    $mode = 'price';
    $contextNote = "Livres disponibles à partir de {$min} DH.";

} elseif (
    preg_match('/(\d+(?:[.,]\d+)?)\s*(?:dh|dhs|dirhams?|mad)\b/iu', $lower, $m) ||
    preg_match('/(?:prix(?:\s+de)?|autour\s+de|environ|vers|pr[ée]diction(?:\s+de)?|[aà])\s*(\d+(?:[.,]\d+)?)\b/iu', $lower, $m) ||
    (preg_match('/^\d+(?:[.,]\d+)?$/', $lower, $m) && $toFloat($m[0]) < 1500)
) {
    // Prédiction par prix cible : "100 dh", "livre à 85", "prédiction prix 120"
    $target = $toFloat($m[1] ?? $m[0]);

    $st = db()->prepare("SELECT id, titre, prix, quantite FROM produits
                         WHERE quantite > 0
                         ORDER BY ABS(prix - ?) ASC LIMIT 5");
    $st->execute([$target]);
    $items = $st->fetchAll(PDO::FETCH_ASSOC);
    $mode = 'price';
    $contextNote = "Prédiction des livres les plus proches du prix cible de {$target} DH.";

} elseif (preg_match('/\b(pas\s+cher|moins\s+cher|petit\s+prix|[ée]conomique|abordable|cheapest)\b/iu', $lower)) {
    // Moins chers
    $st = db()->query("SELECT id, titre, prix, quantite FROM produits
                       WHERE quantite > 0
                       ORDER BY prix ASC LIMIT 5");
    $items = $st->fetchAll(PDO::FETCH_ASSOC);
    $mode = 'price';
    $contextNote = "Les 5 livres les moins chers en stock.";

} elseif (preg_match('/\b(plus\s+cher|haut\s+de\s+gamme|expensive)\b/iu', $lower)) {
    // Plus chers
    $st = db()->query("SELECT id, titre, prix, quantite FROM produits
                       WHERE quantite > 0
                       ORDER BY prix DESC LIMIT 5");
    $items = $st->fetchAll(PDO::FETCH_ASSOC);
    $mode = 'price';
    $contextNote = "Les 5 livres les plus chers en stock.";

/* 2. TOP 5 LIVRES */
} elseif (preg_match('/\b(top\s*5|top\s*cinq|top\s+livres?|meilleurs?\s+livres?|populaires?|best\s*sellers?|recommand\w*|أفضل)\b/iu', $lower)) {
    // Remplacez "quantite DESC, id DESC" par "ventes DESC" ou "note DESC" si vous avez ces colonnes
    $st = db()->query("SELECT id, titre, prix, quantite FROM produits
                       WHERE quantite > 0
                       ORDER BY quantite DESC, id DESC LIMIT 5");
    $items = $st->fetchAll(PDO::FETCH_ASSOC);
    $mode = 'top5';
    $contextNote = "Voici le Top 5 des livres disponibles en librairie.";

/* 3. RECHERCHE CLASSIQUE PAR TITRE */
} else {
    $words = array_filter(
        preg_split('/[^\p{L}\p{N}]+/u', $lower),
        fn($w) => mb_strlen($w) >= 3
    );
    if (!$words) {
        out(['reply' => "Pouvez-vous préciser le titre, « top 5 » ou un budget en DH ?"]);
    }

    $where = $params = [];
    foreach ($words as $w) {
        $where[] = "titre LIKE ?";
        $params[] = "%$w%";
    }

    $st = db()->prepare("SELECT id, titre, prix, quantite FROM produits
                         WHERE " . implode(' OR ', $where) . " LIMIT 5");
    $st->execute($params);
    $items = $st->fetchAll(PDO::FETCH_ASSOC);
}

if (!$items) {
    $emptyMsg = $mode === 'price'
        ? "Aucun livre disponible ne correspond à ce prix."
        : "Je n'ai pas trouvé cet article. Essayez avec un titre, « top 5 » ou un prix en DH.";
    out(['reply' => $emptyMsg]);
}

$lines = [];
foreach ($items as $idx => $i) {
    $prefix = ($mode === 'top5') ? ($idx + 1) . '. ' : '- ';
    $lines[] = $prefix . $i['titre'] . ' : ' . (float)$i['prix'] . ' DH. '
        . ($i['quantite'] > 0 ? 'Disponible.' : 'Actuellement épuisé.');
}
$plain = implode("\n", $lines);

$systemPrompt = "Tu es l'assistant d'une librairie. Réponds brièvement dans la langue du client, "
    . ($contextNote ? $contextNote . " " : "")
    . "uniquement à partir de ces articles :\n" . $plain;

$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . GROQ_API_KEY
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'model' => 'openai/gpt-oss-120b',
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $msg],
        ],
    ]),
]);
$res = json_decode((string)curl_exec($ch), true);
curl_close($ch);

out(['reply' => $res['choices'][0]['message']['content'] ?? $plain]);