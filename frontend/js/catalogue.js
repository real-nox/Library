const CATEGORIES = {
  cahiers: 'Cahiers', 
  stylo: 'Écriture',
  fournitures: 'Fournitures',
  geo: 'Géométrie',
  papier: 'Papier',
  protege: 'Protège-cahiers',
  des: 'Dessin et loisirs'
};

let books = [];
const PAGE = document.body.dataset;
window.BOOKS = books;

const grid = document.getElementById('books');
const selMatiere = document.getElementById('matiere');
const inpRecherche = document.getElementById('recherche');

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

async function loadBooks() {
  try {
    if (CONFIG.API_BOOKS) {
      
      const r = await fetch(CONFIG.API_BOOKS + (PAGE.type ? '?type=' + PAGE.type : '?niveau=' + PAGE.niveau));
      books = await r.json();
    } 
  } catch (e) {
    console.error('pas de livres');
    
  }
  window.BOOKS = books;
  render();
}

function render() {
  const m = selMatiere.value;
  const q = inpRecherche.value.trim().toLowerCase();
  
  const list = books.filter(b => (!CATEGORIES[m] || b.categorie === CATEGORIES[m]) && (!q || b.titre.toLowerCase().includes(q)));

  grid.replaceChildren();
  if (!list.length) {
    grid.append(el('p', 'empty', 'Aucun livre ne correspond. Essayez une autre matière ou un autre titre.'));
    return;
  }

  list.forEach(b => {
    const card = el('article', 'book'); 
    card.dataset.m = b.matiere;

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
