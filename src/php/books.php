<?php
/* books.php : liste publique des articles (lecture seule)
   GET books.php?niveau=1        -> livres du niveau 1
   GET books.php?type=papeterie  -> cahiers et papeterie */
require __DIR__ . '/config.php';

$sql = "select id, id_livre, niveau, titre, matiere, prix, quantite
        from livres";
        
$where = []; $params = [];
if (isset($_GET['type'])) { 
        //$where[] = 'type = ?';   
        $params[] = $_GET['type']; 
}
if (isset($_GET['niveau'])) { 
        //$where[] = 'niveau = ?'; 
        $params[] = (int)$_GET['niveau']; 
}
//if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);

$st = db()->prepare($sql . ' ORDER BY titre');   // requête préparée : pas d'injection SQL
$st->execute($params);

$rows = $st->fetchAll();
foreach ($rows as &$r) { $r['id'] = (int)$r['id']; $r['prix'] = (float)$r['prix']; $r['quantite'] = (int)$r['quantite']; }
out($rows);
