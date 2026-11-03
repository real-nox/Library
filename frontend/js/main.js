/* =====================================================
   main.js : code commun à toutes les pages
   1) Réglages (adresses PHP)  2) Chatbot flottant (soleil)
   ===================================================== */

/* ---------- 1. Réglages ----------
   Tant qu'une adresse vaut null, le site utilise des données d'exemple.
   Quand le PHP est prêt, remplacez par l'adresse (voir DIRECTIONS_PHP.md). */
const CONFIG = {
  API_BOOKS: 'php/books.php',  // mettre null pour tester sans serveur (données d'exemple)
  API_CHAT:  'php/chat.php'
};

/* ---------- 2. Chatbot ---------- */

// Soleil du logo (SVG) utilisé comme icône du chatbot
const SUN_SVG = '<svg viewBox="0 0 64 64" aria-hidden="true"><g stroke="#F6CD3C" stroke-width="4" stroke-linecap="round"><path d="M32 3v7M32 54v7M3 32h7M54 32h7M11 11l5 5M48 48l5 5M53 11l-5 5M16 48l-5 5"/></g><circle cx="32" cy="32" r="14" fill="#F6CD3C"/></svg>';

// Crée le bouton flottant et la fenêtre de discussion
function buildChatbot() {
  const btn = document.createElement('button');
  btn.className = 'sun-btn';
  btn.setAttribute('aria-label', 'Ouvrir le chat');
  btn.innerHTML = SUN_SVG;

  const box = document.createElement('section');
  box.className = 'chat';
  box.setAttribute('aria-label', 'Assistant de la librairie');
  box.innerHTML =
    '<div class="chat-top">Assistant de la librairie</div>' +
    '<div class="chat-log"></div>' +
    '<form><input placeholder="Écrivez un message" aria-label="Votre message" autocomplete="off"><button aria-label="Envoyer">&#8629;</button></form>';

  document.body.append(box, btn);
  const log = box.querySelector('.chat-log');
  const input = box.querySelector('input');

  // Ajoute une bulle de message dans la fenêtre
  const say = (text, who) => {
    const m = document.createElement('div');
    m.className = 'msg ' + who;
    m.textContent = text;           // textContent : pas d'injection HTML
    log.append(m);
    log.scrollTop = log.scrollHeight;
  };

  // Ouvrir / fermer la fenêtre en cliquant sur le soleil
  btn.onclick = () => {
    box.classList.toggle('open');
    if (!log.children.length) say("Bonjour ! Demandez-moi le prix ou la disponibilité d'un livre.", 'bot');
    input.focus();
  };

  // Envoi d'un message
  box.querySelector('form').onsubmit = async e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    say(text, 'me');
    say(await botReply(text), 'bot');
  };
}

// Réponse du chatbot : serveur PHP si disponible, sinon réponse locale d'exemple
async function botReply(text) {
  if (CONFIG.API_CHAT) {
    try {
      const r = await fetch(CONFIG.API_CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      return (await r.json()).reply;
    } catch (e) {
      return 'Je ne peux pas joindre le serveur pour le moment. Réessayez dans un instant.';
    }
  }
  // Mode exemple : cherche un titre dans les livres chargés par niveau1.js
  const q = text.toLowerCase();
  const hit = (window.BOOKS || []).find(b => q.includes(b.titre.toLowerCase()) ||
    b.titre.toLowerCase().split(' ').some(w => w.length > 4 && q.includes(w)));
  if (!hit) return "Je n'ai pas trouvé ce livre. Essayez avec son titre.";
  return hit.titre + ' : ' + hit.prix + ' DH. ' + (hit.en_stock === 'oui' ? 'Disponible.' : 'Actuellement épuisé.');
}

buildChatbot();
