<?php 
    require_once "src/db/databaseInit.php";

    $db = new DatabaseInit();

    $rows = $db->getData("select * from livres", []);
    print_r($rows);
?>