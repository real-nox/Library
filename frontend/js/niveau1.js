const CATEGORIES = {
  math: 'Mathematiques',
  ar:   'Arabe',
  fr:   'Français',
  svt:  'Eveil Scientifique',
  ei:   'Education Islamique',
  eng: 'Anglais',
  info: 'Informatique',
  ss: 'Sciences sociales'
};

let books = [];
window.BOOKS = books;

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

async function loadBooks() {
  try {
    if (CONFIG.API_BOOKS) {
      
      const r = await fetch(CONFIG.API_BOOKS + '?type=livres');
      console.log(r);
      
      books = await r.json();
    } else {
      books = SAMPLE_BOOKS;
    }
  } catch (e) {
    console.error(e);
  }
  window.BOOKS = books;
  render();
}

function render() {
  const m = selMatiere.value;
  const q = inpRecherche.value.trim().toLowerCase();
  console.log(CATEGORIES[m], q);
  
  const list = books.filter(b => (!CATEGORIES[m] || b.categorie === CATEGORIES[m]) && (!q || b.titre.toLowerCase().includes(q)));

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
    info.append(el('h3', '', b.titre), el('span', 'mat', CATEGORIES[b.categorie] || b.categorie), el('span', 'price', b.prix + ' DH'));

    card.append(pic, info);
    grid.append(card);
  });
}

selMatiere.addEventListener('change', render);
inpRecherche.addEventListener('input', render);

loadBooks();
