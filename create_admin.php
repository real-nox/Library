<?php
/* create_admin.php : crée un compte administrateur. À lancer UNE FOIS dans le terminal :
     php php/create_admin.php monIdentifiant monMotDePasse
   (refuse de s'exécuter depuis le navigateur) */
if (PHP_SAPI !== 'cli') { http_response_code(403); exit('Interdit.'); }
require __DIR__ . '/config.php';

[, $user, $pass] = $argv + [null, null, null];
if (!$user || !$pass || strlen($pass) < 8) exit("Usage : php create_admin.php identifiant motdepasse (8 caractères minimum)\n");

db()->prepare('INSERT INTO admins (identifiant, mot_de_passe) VALUES (?, ?)')
    ->execute([$user, password_hash($pass, PASSWORD_DEFAULT)]);   // jamais de mot de passe en clair
echo "Administrateur « $user » créé.\n";
