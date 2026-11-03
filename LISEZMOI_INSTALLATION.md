# Installation du site (PHP + MySQL)

## Structure du projet

```
librairie/
  index.html  niveau1.html  niveau2.html  cahiers.html  admin.html
  css/style.css
  js/main.js  js/catalogue.js  js/admin.js
  images/      (logo.jpg, hero.jpg, niveau1.jpg, ... voir plus bas)
  php/         config.php  books.php  chat.php  admin.php  create_admin.php  schema.sql
```

## Étapes (avec XAMPP, WAMP ou MAMP)

1. **Copier** le dossier `librairie` dans `htdocs` (XAMPP) ou `www` (WAMP). Lancer **Apache** et **MySQL**.
2. **Créer la base** : ouvrir phpMyAdmin, onglet *Importer*, choisir `php/schema.sql`.
3. **Régler la connexion** dans `php/config.php` (ligne `DB_USER` / `DB_PASS`). Avec XAMPP, `root` et un mot de passe vide fonctionnent.
4. **Créer le compte administrateur** (une seule fois), dans un terminal ouvert dans le dossier `librairie` :
   ```
   php php/create_admin.php monIdentifiant monMotDePasse
   ```
   (8 caractères minimum pour le mot de passe.) Avec XAMPP, la commande `php` se trouve dans `C:\xampp\php`.
5. **Ouvrir le site** : `http://localhost/librairie/index.html`
6. **Ouvrir l'administration** : `http://localhost/librairie/admin.html`, puis se connecter.

Il faut passer par `http://localhost/...` : ouvrir les fichiers en double-cliquant ne permet pas d'utiliser PHP.

## Ce que fait chaque fichier PHP

| Fichier | Rôle |
|---|---|
| `books.php` | Liste publique des articles (`?niveau=1`, `?niveau=2`, `?type=papeterie`) |
| `chat.php` | Réponses du chatbot (prix et disponibilité) |
| `admin.php` | Connexion, liste, ajout, modification, suppression (administrateur seulement) |
| `create_admin.php` | Crée un compte administrateur (terminal uniquement) |
| `schema.sql` | Crée les tables `produits` et `admins` avec 4 articles d'exemple |

## Importer le fichier de l'équipe données

Dans phpMyAdmin, ouvrir la table `produits`, puis *Importer* un CSV avec les colonnes dans cet ordre :
`type, niveau, titre, matiere, prix, quantite` (laisser `niveau` vide pour la papeterie).
Codes de `matiere` : `math, ar, fr, svt, ei` (livres) ; `cahiers, stylos, crayons, fournitures` (papeterie).

## Images (facultatif)

Sans image, les cartes affichent un dégradé de couleur. Pour ajouter les images, les placer dans `images/` :
`hero.jpg`, `niveau1.jpg`, `niveau2.jpg`, `cahiers.jpg`, `papeterie.jpg`, et dans `images/matieres/` une image par matière (`math.jpg`, `ar.jpg`, `fr.jpg`, `svt.jpg`, `ei.jpg`, `cahiers.jpg`, `stylos.jpg`, `crayons.jpg`, `fournitures.jpg`).

## Sécurité : à faire avant de mettre le site en ligne

- Ne pas utiliser `root` sans mot de passe : créer un utilisateur MySQL dédié dans `config.php`.
- Utiliser HTTPS (le mot de passe administrateur circule sur le réseau).
- Choisir un mot de passe administrateur long et unique.
