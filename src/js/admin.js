/* =====================================================
   admin.js : page administrateur
   - connexion / déconnexion
   - tableau des articles : Modifier / Supprimer -> Confirmer / Annuler
   - formulaire d'ajout
   Toutes les modifications sont envoyées à php/admin.php (base de données)
   ===================================================== */

const API = 'php/admin.php';
const MATS = { math: 'Mathématiques', ar: 'Arabe', fr: 'Français', svt: 'Sciences (SVT)', ei: 'Éducation islamique',
               cahiers: 'Cahiers', stylos: 'Stylos', crayons: 'Crayons', fournitures: 'Fournitures' };
const LIVRES = ['math', 'ar', 'fr', 'svt', 'ei'];                 // matières des livres
const PAPS = ['cahiers', 'stylos', 'crayons', 'fournitures'];     // catégories de papeterie

const $ = id => document.getElementById(id);

// ---------- Petites aides pour créer des éléments ----------
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
const td = (...nodes) => { const c = el('td'); c.append(...nodes); return c; };
function btn(text, cls, fn) { const b = el('button', 'abtn ' + cls, text); b.type = 'button'; b.onclick = fn; return b; }
function field(label, value, type = 'text') {
  const i = el('input'); i.type = type; i.value = value ?? ''; i.placeholder = label; i.setAttribute('aria-label', label);
  if (type === 'number') { i.min = 0; i.step = 'any'; }
  return i;
}
function select(label, map) {
  const s = el('select'); s.setAttribute('aria-label', label);
  Object.entries(map).forEach(([v, t]) => { const o = el('option', '', t); o.value = v; s.append(o); });
  return s;
}

// ---------- Appel au serveur ----------
async function call(action, data) {
  const r = await fetch(API + '?action=' + action, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data || {})
  });
  const j = await r.json().catch(() => ({ error: 'Réponse invalide du serveur (PHP est-il lancé ?).' }));
  if (r.status === 401 && action !== 'login') showLogin();          // session expirée
  if (!r.ok) throw new Error(j.error || 'Erreur');
  return j;
}

// Message d'état (vert = succès, rouge = erreur)
function say(text, bad) { const s = $('status'); s.textContent = text; s.className = bad ? 'bad' : ''; }

// ---------- Éditeur de champs (utilisé pour la modification ET l'ajout) ----------
function editor(it = {}) {
  const type = select('Type', { livre: 'Livre', papeterie: 'Papeterie' });
  const niveau = select('Niveau', { 1: 'Niveau 1', 2: 'Niveau 2' });
  const mat = select('Matière ou catégorie', {});
  const titre = field('Titre', it.titre), prix = field('Prix (DH)', it.prix, 'number'), qte = field('Quantité', it.quantite, 'number');
  type.value = it.type || 'livre'; niveau.value = it.niveau || 1;

  // Les matières proposées dépendent du type ; le niveau ne concerne que les livres
  const refresh = () => {
    const keys = type.value === 'livre' ? LIVRES : PAPS;
    mat.replaceChildren(...keys.map(k => { const o = el('option', '', MATS[k]); o.value = k; return o; }));
    if (keys.includes(it.matiere)) mat.value = it.matiere;
    niveau.disabled = type.value !== 'livre';
  };
  type.onchange = refresh; refresh();

  return {
    els: [type, niveau, mat, titre, prix, qte],
    get: () => ({ type: type.value, niveau: niveau.value, matiere: mat.value, titre: titre.value, prix: prix.value, quantite: qte.value }),
    clear: () => { titre.value = prix.value = qte.value = ''; }
  };
}

// ---------- Exécute une action puis recharge le tableau ----------
// (le rechargement ramène la ligne à l'état normal : Modifier / Supprimer)
async function run(action, data) {
  try { await call(action, data); await load(); say('Enregistré dans la base de données.'); return true; }
  catch (e) { say(e.message, true); return false; }
}

// ---------- Une ligne du tableau ----------
function row(it) {
  const tr = el('tr');

  // État normal : boutons Modifier / Supprimer
  const draw = () => {
    tr.className = '';
    tr.replaceChildren(td(it.id), td(it.type), td(it.type === 'livre' ? 'Niveau ' + it.niveau : '-'), td(MATS[it.matiere] || it.matiere),
      td(it.titre), td(it.prix + ' DH'), td(it.quantite),
      td(btn('Modifier', '', edit), btn('Supprimer', 'danger', ask)));
  };
  // Modifier : les cases deviennent des champs, puis Confirmer / Annuler
  const edit = () => {
    const ed = editor(it); tr.className = 'editing';
    tr.replaceChildren(td(it.id), ...ed.els.map(e => td(e)),
      td(btn('Confirmer', 'ok', () => run('update', { id: it.id, ...ed.get() })), btn('Annuler', '', draw)));
  };
  // Supprimer : demande confirmation, puis Confirmer / Annuler
  const ask = () => {
    tr.className = 'deleting';
    tr.lastChild.replaceChildren(el('strong', '', 'Supprimer ? '),
      btn('Confirmer', 'danger', () => run('delete', { id: it.id })), btn('Annuler', '', draw));
  };

  draw();
  return tr;
}

// ---------- Chargement du tableau ----------
async function load() {
  const items = await call('list');
  $('rows').replaceChildren(...items.map(row));
  if (!items.length) { const tr = el('tr'), c = td('Aucun article pour le moment.'); c.colSpan = 8; tr.append(c); $('rows').append(tr); }
}

// ---------- Écrans : connexion / administration ----------
function showLogin() { $('app').hidden = true; $('login').hidden = false; }
async function showApp() {
  $('login').hidden = true; $('app').hidden = false;
  try { await load(); } catch (e) { say(e.message, true); }
}

// Formulaire d'ajout
const addEd = editor();
$('addFields').append(...addEd.els);
$('addBtn').onclick = async () => { if (await run('add', addEd.get())) addEd.clear(); };

// Connexion
$('loginForm').onsubmit = async e => {
  e.preventDefault();
  try {
    await call('login', { identifiant: $('user').value, mot_de_passe: $('pass').value });
    $('pass').value = ''; $('loginErr').textContent = ''; showApp();
  } catch (err) { $('loginErr').textContent = err.message; }
};

// Déconnexion
$('logout').onclick = async () => { await call('logout').catch(() => {}); showLogin(); };

// Au chargement : déjà connecté ?
call('check').then(r => r.ok ? showApp() : showLogin()).catch(() => { showLogin(); $('loginErr').textContent = 'Serveur injoignable (PHP est-il lancé ?).'; });
