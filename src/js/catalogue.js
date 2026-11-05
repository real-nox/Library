/* =====================================================
   catalogue.js : affichage et filtrage des articles (niveau 1, niveau 2, cahiers)
   Dépend de main.js (CONFIG). Les livres du serveur doivent avoir
   les champs : id, titre, matiere (code), prix, image, en_stock
   ===================================================== */

// Codes de matière -> noms affichés
const MATIERES = {
  math: 'Mathématiques',
  ar:   'Arabe',
  fr:   'Français',
  svt:  'Sciences (SVT)',
  ei:   'Éducation islamique',
  cahiers: 'Cahiers', stylos: 'Stylos', crayons: 'Crayons', fournitures: 'Fournitures'
};

// Données d'exemple (utilisées tant que CONFIG.API_BOOKS vaut null)
const SAMPLE_BOOKS = [{"id": 1, "type": "livre", "niveau": 1, "titre": "Mon livre de mathématiques 1", "matiere": "math", "prix": 65, "image": "", "en_stock": "oui"}, {"id": 2, "type": "livre", "niveau": 1, "titre": "Mathématiques en s'amusant", "matiere": "math", "prix": 58, "image": "", "en_stock": "oui"}, {"id": 3, "type": "livre", "niveau": 1, "titre": "Cahier d'activités maths", "matiere": "math", "prix": 40, "image": "", "en_stock": "non"}, {"id": 4, "type": "livre", "niveau": 1, "titre": "Al Mufid fi al-Arabiya", "matiere": "ar", "prix": 55, "image": "", "en_stock": "oui"}, {"id": 5, "type": "livre", "niveau": 1, "titre": "Je lis en arabe", "matiere": "ar", "prix": 48, "image": "", "en_stock": "oui"}, {"id": 6, "type": "livre", "niveau": 1, "titre": "Mon premier livre de français", "matiere": "fr", "prix": 60, "image": "", "en_stock": "oui"}, {"id": 7, "type": "livre", "niveau": 1, "titre": "Lecture et écriture 1", "matiere": "fr", "prix": 52, "image": "", "en_stock": "non"}, {"id": 8, "type": "livre", "niveau": 1, "titre": "Découvrir les sciences", "matiere": "svt", "prix": 62, "image": "", "en_stock": "oui"}, {"id": 9, "type": "livre", "niveau": 1, "titre": "Mon corps et la nature", "matiere": "svt", "prix": 45, "image": "", "en_stock": "oui"}, {"id": 10, "type": "livre", "niveau": 1, "titre": "Éducation islamique 1", "matiere": "ei", "prix": 50, "image": "", "en_stock": "oui"}, {"id": 11, "type": "livre", "niveau": 2, "titre": "Mathématiques 2e niveau", "matiere": "math", "prix": 70, "image": "", "en_stock": "oui"}, {"id": 12, "type": "livre", "niveau": 2, "titre": "Al Mufid fi al-Arabiya 2", "matiere": "ar", "prix": 58, "image": "", "en_stock": "oui"}, {"id": 13, "type": "livre", "niveau": 2, "titre": "Français : grammaire 2", "matiere": "fr", "prix": 64, "image": "", "en_stock": "non"}, {"id": 14, "type": "livre", "niveau": 2, "titre": "Sciences et vie 2", "matiere": "svt", "prix": 66, "image": "", "en_stock": "oui"}, {"id": 15, "type": "livre", "niveau": 2, "titre": "Éducation islamique 2", "matiere": "ei", "prix": 52, "image": "", "en_stock": "oui"}, {"id": 16, "type": "papeterie", "niveau": null, "titre": "Cahier 96 pages grands carreaux", "matiere": "cahiers", "prix": 8, "image": "", "en_stock": "oui"}, {"id": 17, "type": "papeterie", "niveau": null, "titre": "Cahier 192 pages", "matiere": "cahiers", "prix": 14, "image": "", "en_stock": "oui"}, {"id": 18, "type": "papeterie", "niveau": null, "titre": "Stylo bille bleu (boîte de 10)", "matiere": "stylos", "prix": 20, "image": "", "en_stock": "oui"}, {"id": 19, "type": "papeterie", "niveau": null, "titre": "Stylo plume", "matiere": "stylos", "prix": 25, "image": "", "en_stock": "non"}, {"id": 20, "type": "papeterie", "niveau": null, "titre": "Crayon HB (lot de 12)", "matiere": "crayons", "prix": 15, "image": "", "en_stock": "oui"}, {"id": 21, "type": "papeterie", "niveau": null, "titre": "Crayons de couleur (24)", "matiere": "crayons", "prix": 32, "image": "", "en_stock": "oui"}, {"id": 22, "type": "papeterie", "niveau": null, "titre": "Règle 30 cm", "matiere": "fournitures", "prix": 5, "image": "", "en_stock": "non"}, {"id": 23, "type": "papeterie", "niveau": null, "titre": "Gomme blanche", "matiere": "fournitures", "prix": 3, "image": "", "en_stock": "oui"}];
// Articles d'exemple de la page courante (niveau ou papeterie)
const sampleForPage = () => SAMPLE_BOOKS.filter(b => PAGE.type ? b.type === PAGE.type : b.niveau == PAGE.niveau);

let books = [];   // tous les articles chargés
const PAGE = document.body.dataset;   // data-niveau="1" ou data-type="papeterie" (voir <body>)
window.BOOKS = books;   // partagé avec le chatbot (main.js)

const grid = document.getElementById('books');
const selMatiere = document.getElementById('matiere');
const inpRecherche = document.getElementById('recherche');

// Petite aide pour créer un élément HTML
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// 1) Chargement : serveur PHP si configuré, sinon données d'exemple
async function loadBooks() {
  try {
    if (CONFIG.API_BOOKS) {
      const r = await fetch(CONFIG.API_BOOKS + (PAGE.type ? '?type=' + PAGE.type : '?niveau=' + PAGE.niveau));
      books = await r.json();
    } else {
      books = sampleForPage();
    }
  } catch (e) {
    books = sampleForPage();   // si le serveur ne répond pas
  }
  window.BOOKS = books;
  render();
}

// 2) Affichage : applique le filtre de matière + la recherche par titre
function render() {
  const m = selMatiere.value;
  const q = inpRecherche.value.trim().toLowerCase();
  const list = books.filter(b => (!m || b.matiere === m) && (!q || b.titre.toLowerCase().includes(q)));

  grid.replaceChildren();
  if (!list.length) {
    grid.append(el('p', 'empty', 'Aucun livre ne correspond. Essayez une autre matière ou un autre titre.'));
    return;
  }

  list.forEach(b => {
    const card = el('article', 'book');       // carte non cliquable
    card.dataset.m = b.matiere;               // sert à la couleur de secours (CSS)

    // Partie haute : image du livre (ou dégradé si pas d'image)
    const pic = el('div', 'pic');
    const img = document.createElement('img');
    img.alt = '';
    img.src = b.image || 'images/matieres/' + b.matiere + '.jpg';
    img.onerror = () => img.remove();         // image absente : on garde le dégradé
    pic.append(img);
    if (b.quantite == 0) pic.append(el('span', 'badge', 'Épuisé'));

    // Partie basse : titre, matière (à droite), prix en vert
    const info = el('div', 'info');
    info.append(el('h3', '', b.titre), el('span', 'mat', MATIERES[b.matiere] || b.matiere), el('span', 'price', b.prix + ' DH'));

    card.append(pic, info);
    grid.append(card);
  });
}

// 3) Interactivité : on réaffiche à chaque changement
selMatiere.addEventListener('change', render);
inpRecherche.addEventListener('input', render);

loadBooks();
