<?php
/* books.php : liste publique des articles (lecture seule)
   GET books.php?type=livres        -> livr
   GET books.php?type=papeterie  -> cahiers et papeterie */
require __DIR__ . '/config.php';

$sql = "SELECT id, type, niveau, titre, categorie, prix, quantite
        FROM produits";
$where = []; $params = [];
if (isset($_GET['type']))   { $where[] = 'type = ?';   $params[] = $_GET['type']; }
if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);

$st = db()->prepare($sql . ' ORDER BY titre');   // requête préparée : pas d'injection SQL
$st->execute($params);

$rows = $st->fetchAll();
foreach ($rows as &$r) { $r['id'] = (int)$r['id']; $r['prix'] = (float)$r['prix']; $r['quantite'] = (int)$r['quantite']; }
out($rows);
