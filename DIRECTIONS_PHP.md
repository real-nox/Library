# Directions pour la partie PHP

Le front end est terminé et fonctionne déjà avec des données d'exemple. Il reste à brancher le serveur. Il faut créer **2 fichiers PHP** dans un dossier `php/` à côté de `index.html`, puis activer leurs adresses dans `js/main.js`.

## 1. Base de données (MySQL)

Table `produits`, avec les mêmes colonnes que le fichier de l'équipe données :

| Colonne | Type | Remarque |
|---|---|---|
| id | INT, clé primaire, auto-incrément | |
| type | VARCHAR | `livre` ou `papeterie` |
| titre | VARCHAR | |
| niveau | TINYINT | 1 ou 2 (pour les livres) |
| matiere | VARCHAR | code : `math`, `ar`, `fr`, `svt`, `ei` |
| prix | DECIMAL(8,2) | en DH |
| image | VARCHAR | chemin, ex : `images/livres/math1.jpg` (peut être vide) |
| en_stock | VARCHAR | `oui` ou `non` |
| quantite | INT | |

## 2. `php/books.php` (liste des livres)

- Méthode : **GET**. Paramètre : `niveau` (ex : `books.php?niveau=1`).
- Renvoie un **tableau JSON** des livres de ce niveau.
- Utiliser des requêtes préparées (PDO) pour éviter l'injection SQL.
- Ajouter l'en-tête : `header('Content-Type: application/json; charset=utf-8');`

Exemple de réponse attendue :

```json
[
  {"id": 1, "titre": "Mon livre de mathématiques 1", "matiere": "math", "prix": 65, "image": "", "en_stock": "oui"}
]
```

Le filtre par matière et la recherche par titre sont faits côté navigateur : pas besoin de les gérer en PHP.

## 3. `php/chat.php` (chatbot)

- Méthode : **POST**, corps JSON : `{"message": "Avez-vous Le Petit Prince ?"}`
- Lire le corps avec `json_decode(file_get_contents('php://input'), true)`.
- Chercher dans la base un titre qui correspond aux mots du message (`LIKE` avec requête préparée), puis répondre :
  - trouvé et disponible : `"Titre : 65 DH. Disponible."`
  - trouvé mais épuisé : `"Titre : 65 DH. Actuellement épuisé."`
  - non trouvé : `"Je n'ai pas trouvé ce livre. Essayez avec son titre."`
- Renvoie du JSON : `{"reply": "..."}`

## 4. Activer dans le front end

Dans `js/main.js`, remplacer les deux `null` :

```js
const CONFIG = {
  API_BOOKS: 'php/books.php',
  API_CHAT:  'php/chat.php'
};
```

## 5. Test rapide

1. Lancer le site depuis un serveur local (XAMPP, WAMP ou `php -S localhost:8000`), pas en double-cliquant sur le fichier.
2. Ouvrir `php/books.php?niveau=1` : on doit voir le JSON.
3. Ouvrir `niveau1.html` : les cartes doivent venir de la base.
4. Poser une question au chatbot.

Si le serveur ne répond pas, le site retombe tout seul sur les données d'exemple.

## 6. Plus tard (pages à créer)

`niveau2.html` et `cahiers.html` seront copiées de `niveau1.html`. Il faudra juste changer `?niveau=1` en `?niveau=2` dans `js/niveau1.js` (ou `type=papeterie` pour les cahiers) et ajuster `books.php` en conséquence.
