<?php
/* chat.php : POST {"message": "..."} -> {"reply": "..."} */
require __DIR__ . '/config.php';

$msg = trim(body()['message'] ?? '');
if ($msg === '') out(['reply' => "Écrivez le titre du livre que vous cherchez."]);

$words = array_filter(
    preg_split('/[^\p{L}\p{N}]+/u', mb_strtolower($msg)),
    fn($w) => mb_strlen($w) > 3
);
if (!$words) out(['reply' => "Pouvez-vous préciser le titre ?"]);

$where = $params = [];
foreach ($words as $w) {
    $where[] = "titre LIKE ?";
    $params[] = "%$w%";
}

$st = db()->prepare("SELECT id, titre, prix, quantite FROM produits
                     WHERE " . implode(' OR ', $where) . " LIMIT 5");
$st->execute($params);
$items = $st->fetchAll(PDO::FETCH_ASSOC);

if (!$items) out(['reply' => "Je n'ai pas trouvé cet article. Essayez avec son titre."]);

$lines = [];
foreach ($items as $i) {
    $lines[] = $i['titre'] . ' : ' . (float)$i['prix'] . ' DH. '
        . ($i['quantite'] > 0 ? 'Disponible.' : 'Actuellement épuisé.');
}
$plain = implode("\n", $lines);

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
            ['role' => 'system', 'content' =>
            "Tu es l'assistant d'une librairie. Réponds brièvement dans la langue du client, "
                . "uniquement avec ces articles :\n" . $plain],
            ['role' => 'user', 'content' => $msg],
        ],
    ]),
]);
$res = json_decode((string)curl_exec($ch), true);
curl_close($ch);

out(['reply' => $res['choices'][0]['message']['content'] ?? $plain]);
