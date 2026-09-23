// chatbot non-IA : juste des mots-cles et des reponses ecrites a la main
// meme logique que le tuto p5 sur le chatbot no-ai (rivescript) mais en vanilla js, sans lib externe
// pas de modele, pas d'entrainement, si le mot cle est pas dedans il trouve rien

const FAVORITE_DAY = 9;
const FAVORITE_LINE =
  "mon préféré, c'est le #9, crazy automaton. c'est le jeu de la vie de Conway, une grille de cellules qui vivent ou meurent selon leurs voisines. je l'ai fait en 20 lignes avec un tableau plat et un modulo pour boucler les bords, et ça tourne tout seul indéfiniment. la règle est simple mais le résultat n'est jamais pareil deux fois.";

// mots cles -> reponse. ordre compte, le premier qui matche gagne
const RULES = [
  {
    test: (t) => /prefer|preferer|favori|préfér/.test(t) && /\d+/.test(t),
    reply: (t) => {
      const m = t.match(/(\d+)/);
      const n = m ? parseInt(m[1], 10) : null;
      const info = n ? SKETCH_INFO[n] : null;
      if (!info) return FAVORITE_LINE;
      return `le ${n} ? bon choix. #${n} "${info.title}" : prompt officiel "${info.prompt}". technique : ${info.tech}. ${info.note}`;
    },
  },
  {
    test: (t) => /c'est beau|c est beau|joli|j'aime|j aime/.test(t),
    reply: () => "merci. lequel ? tapez 'sketch' et son numéro pour en savoir plus.",
  },
  {
    test: (t) => /bonjour|salut|hello|yo\b|coucou/.test(t),
    reply: () => "bonjour. je suis le bot du site, posez-moi une question sur les 31 sketches ou tapez 'sketch 12' par exemple.",
  },
  {
    test: (t) => /c'est quoi genuary|c est quoi genuary|genuary c'est quoi|qu'est ce que genuary/.test(t),
    reply: () =>
      "genuary, c'est un challenge : 31 prompts en janvier, un par jour. vous codez une image ou une animation qui répond au prompt et vous postez. genuary.art donne la liste, la règle du fond c'est qu'il n'est pas obligatoire de poster tous les jours ni de respecter le bon prompt au bon jour, chacun interprète comme il veut.",
  },
  {
    test: (t) => /prefer|preferer|favori|préfér/.test(t),
    reply: () => FAVORITE_LINE,
  },
  {
    test: (t) => /sketch\s*(\d+)|day\s*(\d+)|numero\s*(\d+)|#\s*(\d+)/.test(t),
    reply: (t) => {
      const m = t.match(/(\d+)/);
      const n = m ? parseInt(m[1], 10) : null;
      if (!n || n < 1 || n > 31) return "il y a seulement 31 jours, donnez un numéro entre 1 et 31.";
      const info = SKETCH_INFO[n];
      if (!info) return "je n'ai pas d'info claire sur celui la, allez voir directement sur la page.";
      return `#${n} "${info.title}" : prompt officiel "${info.prompt}". technique : ${info.tech}. ${info.note}`;
    },
  },
  {
    test: (t) => findByTitle(t) !== null,
    reply: (t) => {
      const n = findByTitle(t);
      const info = SKETCH_INFO[n];
      return `#${n} "${info.title}" : prompt officiel "${info.prompt}". technique : ${info.tech}. ${info.note}`;
    },
  },
  {
    test: (t) => /comment t'as fait|comment tu as fait|comment ca marche|t'as code comment|comment c'est fait/.test(t),
    reply: () =>
      "tout est en p5.js mode instance, un fichier par jour dans sketches/, chacun exporte une fonction avec setup et draw. le site charge un seul sketch actif à la fois dans une modale, pour ne pas faire ramer le navigateur avec 31 canvas en même temps.",
  },
  {
    test: (t) => /qui es tu|qui es-tu|t'es qui|c'est qui toi|tu es qui/.test(t),
    reply: () =>
      "je suis un bot à mots clés, pas une ia. j'ai une liste de si/alors écrite à la main par Haider, rien de plus. si vous me posez une question inhabituelle, je ne vais pas comprendre.",
  },
  {
    test: (t) => /ia\b|intelligence artificielle|chatgpt|gpt/.test(t),
    reply: () =>
      "non, je ne suis pas une ia, je repère juste des mots dans votre phrase et je renvoie une réponse déjà écrite. pas de réseau de neurones ici, juste des conditions.",
  },
];

const SKETCH_INFO = {
  1: { title: "dots", prompt: "one color, one shape", tech: "grille de cercles", note: "simple, taille des cercles selon la distance au centre." },
  2: { title: "bounce", prompt: "twelve principles of animation", tech: "squash & stretch", note: "une balle qui rebondit et s'écrase." },
  3: { title: "fibonacci forever", prompt: "fibonacci forever", tech: "spirale", note: "cercles dont le rayon suit fibonacci." },
  4: { title: "lowres", prompt: "lowres", tech: "bruit de perlin en gros pixels", note: "" },
  5: { title: "genuary", prompt: 'write "genuary" without a font', tech: "rects assemblés", note: "pas de police, juste des rectangles." },
  6: { title: "blinding lights", prompt: "lights on / off", tech: "grille + bruit dans le temps", note: "" },
  7: { title: "venn", prompt: "boolean algebra", tech: "blend mode difference", note: "deux cercles qui font un faux xor." },
  8: { title: "city", prompt: "a city", tech: "isométrique", note: "cubes empilés, hauteur au bruit de perlin." },
  9: { title: "matrix eating amoeba", prompt: "crazy automaton", tech: "automate cellulaire", note: "jeu de la vie, c'est mon préféré." },
  10: { title: "magnetic flower", prompt: "polar coordinates", tech: "courbe polaire", note: "une rose à 5 pétales." },
  11: { title: "line count", prompt: "quine", tech: "faux quine", note: "je triche un peu, c'est juste des barres qui représentent le nombre de lignes." },
  12: { title: "boxes only", prompt: "boxes only", tech: "grille + bruit", note: "que des carrés, rien d'autre." },
  13: { title: "portrait", prompt: "self portrait", tech: "ascii art", note: "portrait genere en caracteres ascii, lettres de HAIDER." },
  14: { title: "perfect fit", prompt: "everything fits perfectly", tech: "subdivision récursive", note: "un peu comme du bsp de jeu vidéo." },
  15: { title: "ghost", prompt: "create an invisible object", tech: "ombres seules", note: "l'objet n'est jamais dessiné, que son ombre." },
  16: { title: "order/disorder", prompt: "order and disorder", tech: "grille moitié ordonnée moitié random", note: "" },
  17: { title: "scottish mosaic", prompt: "wallpaper group", tech: "motif répété", note: "symétrie par translation." },
  18: { title: "unexpected path", prompt: "unexpected path", tech: "marche aléatoire", note: "" },
  19: { title: "16x16", prompt: "16x16", tech: "grille stricte", note: "exactement 16 cases sur 16." },
  20: { title: "AC", prompt: "one line", tech: "ligne continue", note: "le stylo ne se lève jamais." },
  21: { title: "bauhaus", prompt: "bauhaus poster", tech: "formes plates couleurs primaires", note: "" },
  22: { title: "ascii map", prompt: "pen plotter ready", tech: "hachures", note: "que des traits, pensé pour un plotter." },
  23: { title: "glare", prompt: "transparency", tech: "cercles translucides empilés", note: "" },
  24: { title: "perfectionist's nightmare", prompt: "perfectionist's nightmare", tech: "grille avec du jitter", note: "chaque case decalee d'un poil pour casser l'alignement." },
  25: { title: "organic geometry", prompt: "organic geometry", tech: "flow field", note: "champ de bruit de perlin, lignes organiques." },
  26: { title: "recursive grids", prompt: "recursive grids", tech: "récursion type sierpinski", note: "" },
  27: { title: "lifeform", prompt: "lifeform", tech: "l-system", note: "un arbre qui pousse par règles de remplacement." },
  28: { title: "tty progressbar", prompt: "no libraries, no canvas, only html elements", tech: "faux dom", note: "reste en p5/canvas, un visuel qui imite des blocs html." },
  29: { title: "magnetic cells", prompt: "genetic evolution and mutation", tech: "simulation simple", note: "des points qui dérivent vers une cible." },
  30: { title: "it's not a bug it's a feature", prompt: "it's not a bug, it's a feature", tech: "glitch pixels", note: "lignes de pixels decalees, effet glitch." },
  31: { title: "glsl day", prompt: "glsl day", tech: "manipulation de pixels", note: "pas un vrai shader, je fais ça à la main avec loadPixels." },
};

/** Finds a sketch number from a title match in the text (used when there's no digit). */
function findByTitle(t) {
  for (const n in SKETCH_INFO) {
    if (t.includes(SKETCH_INFO[n].title.toLowerCase())) return parseInt(n, 10);
  }
  return null;
}

const DEFAULT_REPLIES = [
  "je n'ai pas compris.",
  "je ne connais pas ce mot. je fonctionne par mots-clés, essayez 'sketch' et un numéro.",
  "je n'ai pas compris, reformulez.",
  "essayez 'sketch' suivi d'un numéro, ou 'ton préféré'.",
];

function botReply(input) {
  const t = input.toLowerCase().trim();
  for (const rule of RULES) {
    if (rule.test(t)) return rule.reply(t);
  }
  return DEFAULT_REPLIES[Math.floor(Math.random() * DEFAULT_REPLIES.length)];
}

function addMessage(text, from) {
  const log = document.getElementById("chatbot-log");
  const p = document.createElement("p");
  p.className = from === "bot" ? "from-bot" : "from-user";
  p.textContent = (from === "bot" ? "bot: " : "toi: ") + text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("chatbot-panel");
  const toggle = document.getElementById("chatbot-toggle");
  const close = document.getElementById("chatbot-close");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");

  toggle.addEventListener("click", () => {
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden") && !panel.dataset.greeted) {
      addMessage("bonjour, posez-moi une question sur les 31 sketches, ou tapez 'sketch' suivi d'un numéro.", "bot");
      panel.dataset.greeted = "1";
    }
  });
  close.addEventListener("click", () => panel.classList.add("hidden"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value;
    if (!val.trim()) return;
    addMessage(val, "user");
    // petit delai pour que ca ressemble un peu a une reponse, pas instantane
    setTimeout(() => addMessage(botReply(val), "bot"), 250);
    input.value = "";
  });
});
