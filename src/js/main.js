/* ---------- 1. Réglages ----------
   Tant qu'une adresse vaut null, le site utilise des données d'exemple.
   Quand le PHP est prêt, remplacez par l'adresse (voir DIRECTIONS_PHP.md). */
const CONFIG = {
  API_BOOKS: '../php/books.php',
  API_CHAT: '../php/chat.php'
};

/* ---------- 2. Chatbot ---------- */
const SUN_SVG = '<svg viewBox="0 0 64 64" aria-hidden="true"><g stroke="#F6CD3C" stroke-width="4" stroke-linecap="round"><path d="M32 3v7M32 54v7M3 32h7M54 32h7M11 11l5 5M48 48l5 5M53 11l-5 5M16 48l-5 5"/></g><circle cx="32" cy="32" r="14" fill="#F6CD3C"/></svg>';

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
    // split on URLs, keep them as separate parts
    text.split(/(https?:\/\/[^\s)]+)/g).forEach(part => {
      if (/^https?:\/\//.test(part)) {
        const a = document.createElement('a');
        a.href = part;
        a.textContent = 'Voir le livre';
        a.target = '_blank';
        a.rel = 'noopener';
        m.append(a);
      } else {
        m.append(document.createTextNode(part));
      }
    });
    log.append(m);
    log.scrollTop = log.scrollHeight;
    return m;
  };

  btn.onclick = () => {
    console.log("test");
    
    box.classList.toggle('open');
    if (!log.children.length) say("Bonjour ! Demandez-moi le prix ou la disponibilité d'un livre.", 'bot');
    input.focus();
  };

  // Envoi d'un message
  console.log(box);
  
  box.querySelector('form').onsubmit = async e => {
    e.preventDefault();
    console.log("here");
    
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    say(text, 'me');
    const wait = say('…', 'bot');
    const reply = await botReply(text);
    wait.remove();
    say(reply, 'bot');
  };
}

// Réponse du chatbot : serveur PHP si disponible, sinon réponse locale d'exemple
async function botReply(text) {
  console.log(CONFIG.API_CHAT);

  if (CONFIG.API_CHAT) {
    try {
      const r = await fetch(CONFIG.API_CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      return data.reply || "Désolé, je n'ai pas de réponse.";
    } catch (e) {
      return 'Je ne peux pas joindre le serveur pour le moment. Réessayez dans un instant.';
    }
  }
  // Sample mode (only when API_CHAT is null)
  const q = text.toLowerCase();
  const hit = (window.BOOKS || []).find(b => q.includes(b.titre.toLowerCase()) ||
    b.titre.toLowerCase().split(' ').some(w => w.length > 4 && q.includes(w)));
  if (!hit) return "Je n'ai pas trouvé ce livre. Essayez avec son titre.";
  return hit.titre + ' : ' + hit.prix + ' DH. ' + (hit.en_stock === 'oui' ? 'Disponible.' : 'Actuellement épuisé.');
}
buildChatbot();
