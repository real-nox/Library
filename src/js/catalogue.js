const MATIERES = {
  math: 'Mathématiques',
  ar:   'Arabe',
  fr:   'Français',
  svt:  'Sciences (SVT)',
  ei:   'Éducation islamique',
  cahiers: 'Cahiers', papeterie: 'Papeterie'
};

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
  console.log(m);
  
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
