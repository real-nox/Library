/* =====================================================
   niveau1.js : affichage et filtrage des livres de niveau 1
   Dépend de main.js (CONFIG). Les livres du serveur doivent avoir
   les champs : id, titre, matiere (code), prix, image, en_stock
   ===================================================== */

// Codes de matière -> noms affichés
const MATIERES = {
  math: 'Mathématiques',
  ar:   'Arabe',
  fr:   'Français',
  svt:  'Sciences (SVT)',
  ei:   'Éducation islamique'
};

// Données d'exemple (utilisées tant que CONFIG.API_BOOKS vaut null)
const SAMPLE_BOOKS = [
  { id: 1,  titre: 'Mon livre de mathématiques 1',  matiere: 'math', prix: 65, image: '', en_stock: 'oui' },
  { id: 2,  titre: 'Mathématiques en s\'amusant',   matiere: 'math', prix: 58, image: '', en_stock: 'oui' },
  { id: 3,  titre: 'Cahier d\'activités maths',     matiere: 'math', prix: 40, image: '', en_stock: 'non' },
  { id: 4,  titre: 'Al Mufid fi al-Arabiya',        matiere: 'ar',   prix: 55, image: '', en_stock: 'oui' },
  { id: 5,  titre: 'Je lis en arabe',               matiere: 'ar',   prix: 48, image: '', en_stock: 'oui' },
  { id: 6,  titre: 'Mon premier livre de français', matiere: 'fr',   prix: 60, image: '', en_stock: 'oui' },
  { id: 7,  titre: 'Lecture et écriture 1',         matiere: 'fr',   prix: 52, image: '', en_stock: 'non' },
  { id: 8,  titre: 'Découvrir les sciences',        matiere: 'svt',  prix: 62, image: '', en_stock: 'oui' },
  { id: 9,  titre: 'Mon corps et la nature',        matiere: 'svt',  prix: 45, image: '', en_stock: 'oui' },
  { id: 10, titre: 'Éducation islamique 1',         matiere: 'ei',   prix: 50, image: '', en_stock: 'oui' }
];

let books = [];   // tous les livres chargés
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
      const r = await fetch(CONFIG.API_BOOKS + '?niveau=1');
      books = await r.json();
    } else {
      books = SAMPLE_BOOKS;
    }
  } catch (e) {
    books = SAMPLE_BOOKS;   // si le serveur ne répond pas
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
    if (b.en_stock !== 'oui') pic.append(el('span', 'badge', 'Épuisé'));

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
