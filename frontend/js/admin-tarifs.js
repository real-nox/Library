/* admin-tarifs.js : section "Imprimerie" de la page admin (affiche et enregistre les tarifs).
   Indépendant de admin.js : il se déclenche quand la zone d'administration devient visible. */
(function () {
  const API = '../php/admin.php';
  const $ = id => document.getElementById(id);
  const inputs = () => document.querySelectorAll('#ratesRows input[data-key]');

  function say(text, bad) { const s = $('ratesStatus'); s.textContent = text; s.className = bad ? 'bad' : ''; }

  async function post(action, data) {
    const r = await fetch(API + '?action=' + action, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data || {})
    });
    const j = await r.json().catch(() => ({ error: 'Réponse invalide du serveur (PHP est-il lancé ?).' }));
    if (!r.ok) throw new Error(j.error || 'Erreur');
    return j;
  }

  // Affiche les tarifs : base de données d'abord, sinon fichier local data/tarifs.json (lecture seule)
  async function load() {
    let rates, local = false;
    try { rates = await post('get_rates'); }
    catch (e) {
      try {
        const r = await fetch('../data/tarifs.json');
        if (!r.ok) throw new Error();
        rates = await r.json(); local = true;
      } catch (e2) { say(e.message, true); return; }
    }
    inputs().forEach(i => { i.value = rates[i.dataset.key] ?? ''; i.disabled = local; });
    $('ratesSave').disabled = local;
    say(local ? 'Mode local : tarifs lus dans data/tarifs.json (lecture seule).' : '');
  }

  // Enregistre les 5 tarifs
  $('ratesSave').onclick = async () => {
    const data = {};
    let bad = false;
    inputs().forEach(i => {
      const v = Number(i.value);
      if (i.value === '' || !(v >= 0) || (i.dataset.key === 'duplex_discount_pct' && v > 100)) bad = true;
      data[i.dataset.key] = v;
    });
    if (bad) { say('Tarifs invalides : nombres positifs uniquement, remise de 0 à 100.', true); return; }
    try { await post('save_rates', data); say('Tarifs enregistrés.'); }
    catch (e) { say(e.message, true); }
  };

  // Charge les tarifs quand l'administrateur est connecté (la zone #app devient visible)
  const app = $('app');
  new MutationObserver(() => { if (!app.hidden) load(); }).observe(app, { attributes: true, attributeFilter: ['hidden'] });
  if (!app.hidden) load();
})();