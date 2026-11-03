-- schema.sql : à importer une seule fois (phpMyAdmin > Importer)
CREATE DATABASE IF NOT EXISTS librairie CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE librairie;

-- Articles : livres (niveau 1 ou 2) et papeterie (niveau vide)
-- matiere : math, ar, fr, svt, ei (livres) | cahiers, stylos, crayons, fournitures (papeterie)
-- La disponibilité est calculée : quantite > 0 = "en stock"
CREATE TABLE IF NOT EXISTS produits (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  type     ENUM('livre','papeterie') NOT NULL,
  niveau   TINYINT NULL,
  titre    VARCHAR(200) NOT NULL,
  matiere  VARCHAR(30) NOT NULL,
  prix     DECIMAL(8,2) NOT NULL,
  quantite INT NOT NULL DEFAULT 0,
  image    VARCHAR(255) NOT NULL DEFAULT ''
);

-- Comptes administrateurs (mot de passe chiffré : voir create_admin.php)
CREATE TABLE IF NOT EXISTS admins (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  identifiant  VARCHAR(50) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL
);

-- Quelques articles pour tester (à supprimer ensuite depuis la page admin)
INSERT INTO produits (type, niveau, titre, matiere, prix, quantite) VALUES
('livre', 1, 'Mon livre de mathématiques 1', 'math', 65, 6),
('livre', 1, 'Mon premier livre de français', 'fr', 60, 0),
('livre', 2, 'Mathématiques 2e niveau', 'math', 70, 4),
('papeterie', NULL, 'Cahier 96 pages grands carreaux', 'cahiers', 8, 60);
