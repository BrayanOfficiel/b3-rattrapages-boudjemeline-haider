// chatbot non-IA : juste des mots-cles et des reponses ecrites a la main
// meme logique que le tuto p5 sur le chatbot no-ai (rivescript) mais en vanilla js, sans lib externe
// pas de modele, pas d'entrainement, si le mot cle est pas dedans il trouve rien

const FAVORITE_DAY = 9;
const FAVORITE_LINE =
  "mon prefere c'est le #9, crazy automaton. c'est le jeu de la vie de conway, une grille de cellules qui vivent ou meurent selon leurs voisines. j'ai fait ca en 20 lignes avec un tableau plat et un modulo pour boucler les bords, et ca tourne tout seul indefiniment. le truc marrant c'est que je controle rien, la regle est simple mais le resultat est jamais pareil deux fois.";

// mots cles -> reponse. ordre compte, le premier qui matche gagne
const RULES = [
  {
    test: (t) => /bonjour|salut|hello|yo\b|coucou/.test(t),
    reply: () => "salut. je suis le bot du site, demande moi un truc sur les 31 sketches ou tape 'sketch 12' par exemple.",
  },
  {
    test: (t) => /c'est quoi genuary|c est quoi genuary|genuary c'est quoi|qu'est ce que genuary/.test(t),
    reply: () =>
      "genuary c'est un challenge, 31 prompts en janvier, un par jour, tu codes une image ou une animation qui repond au prompt et tu postes. genuary.art donne la liste, la regle du fond c'est pas besoin de poster tous les jours ni le bon prompt au bon jour, tu interpretes comme tu veux.",
  },
  {
    test: (t) => /prefer|favori|preferer/.test(t),
    reply: () => FAVORITE_LINE,
  },
  {
    test: (t) => /sketch\s*(\d+)|day\s*(\d+)|numero\s*(\d+)|#\s*(\d+)/.test(t),
    reply: (t) => {
      const m = t.match(/(\d+)/);
      const n = m ? parseInt(m[1], 10) : null;
      if (!n || n < 1 || n > 31) return "y'a que 31 jours, donne un numero entre 1 et 31.";
      const info = SKETCH_INFO[n];
      if (!info) return "j'ai pas d'info claire sur celui la, va voir directement sur la page.";
      return `#${n} : "${info.prompt}". technique : ${info.tech}. ${info.note}`;
    },
  },
  {
    test: (t) => /comment t'as fait|comment tu as fait|comment ca marche|t'as code comment|comment c'est fait/.test(t),
    reply: () =>
      "tout en p5.js mode instance, un fichier par jour dans sketches/, chacun exporte une fonction avec setup et draw. le site charge un seul sketch actif a la fois dans une modale pour pas faire ramer le navigateur avec 31 canvas en meme temps.",
  },
  {
    test: (t) => /qui es tu|qui es-tu|t'es qui|c'est qui toi|tu es qui/.test(t),
    reply: () =>
      "je suis un bot a mots cles, pas une ia. j'ai une liste de si/alors ecrite a la main par haider, rien de plus. si tu me poses une question bizarre je vais juste pas comprendre.",
  },
  {
    test: (t) => /ia\b|intelligence artificielle|chatgpt|gpt/.test(t),
    reply: () =>
      "non je suis pas une ia, je matche juste des mots dans ta phrase et je renvoie une reponse deja ecrite. pas de reseau de neurones ici, juste des if.",
  },
];

const SKETCH_INFO = {
  1: { prompt: "one color, one shape", tech: "grille de cercles", note: "simple, taille des cercles selon la distance au centre." },
  2: { prompt: "twelve principles of animation", tech: "squash & stretch", note: "une balle qui rebondit et s'ecrase." },
  3: { prompt: "fibonacci forever", tech: "spirale", note: "cercles dont le rayon suit fibonacci." },
  4: { prompt: "lowres", tech: "bruit de perlin en gros pixels", note: "" },
  5: { prompt: 'write "genuary" without a font', tech: "rects assembles", note: "pas de police, juste des rectangles." },
  6: { prompt: "lights on / off", tech: "grille + bruit dans le temps", note: "" },
  7: { prompt: "boolean algebra", tech: "blend mode difference", note: "deux cercles qui font un faux xor." },
  8: { prompt: "a city", tech: "isometrique", note: "cubes empiles, hauteur au bruit de perlin." },
  9: { prompt: "crazy automaton", tech: "automate cellulaire", note: "jeu de la vie, c'est mon prefere." },
  10: { prompt: "polar coordinates", tech: "courbe polaire", note: "une rose a 5 petales." },
  11: { prompt: "quine", tech: "faux quine", note: "je triche un peu, c'est juste des barres qui representent le nombre de lignes." },
  12: { prompt: "boxes only", tech: "grille + bruit", note: "que des carres, rien d'autre." },
  13: { prompt: "self portrait", tech: "formes basiques", note: "portrait tres abstrait, pas litteral." },
  14: { prompt: "everything fits perfectly", tech: "subdivision recursive", note: "un peu comme du bsp de jeu video." },
  15: { prompt: "create an invisible object", tech: "ombres seules", note: "l'objet est jamais dessine, que son ombre." },
  16: { prompt: "order and disorder", tech: "grille moitie ordonnee moitie random", note: "" },
  17: { prompt: "wallpaper group", tech: "motif repete", note: "symetrie par translation." },
  18: { prompt: "unexpected path", tech: "marche aleatoire", note: "" },
  19: { prompt: "16x16", tech: "grille stricte", note: "exactement 16 cases sur 16." },
  20: { prompt: "one line", tech: "ligne continue", note: "le stylo se leve jamais." },
  21: { prompt: "bauhaus poster", tech: "formes plates couleurs primaires", note: "" },
  22: { prompt: "pen plotter ready", tech: "hachures", note: "que des traits, pense pour un plotter." },
  23: { prompt: "transparency", tech: "cercles translucides empiles", note: "" },
  24: { prompt: "perfectionist's nightmare", tech: "grille avec du jitter", note: "cense etre parfait, decale expres." },
  25: { prompt: "organic geometry", tech: "flow field", note: "champ de bruit de perlin, lignes organiques." },
  26: { prompt: "recursive grids", tech: "recursion type sierpinski", note: "" },
  27: { prompt: "lifeform", tech: "l-system", note: "un arbre qui pousse par regles de remplacement." },
  28: { prompt: "no libraries, no canvas, only html elements", tech: "faux dom", note: "j'ai garde p5 par contrainte du format, voir readme." },
  29: { prompt: "genetic evolution and mutation", tech: "simulation simple", note: "des points qui derivent vers une cible." },
  30: { prompt: "it's not a bug, it's a feature", tech: "glitch pixels", note: "decalage de lignes de pixels volontaire." },
  31: { prompt: "glsl day", tech: "manipulation de pixels", note: "pas un vrai shader, je fais ca a la main avec loadPixels." },
};

const DEFAULT_REPLIES = [
  "j'ai rien compris a ca, essaie plus simple.",
  "connais pas ce mot, je suis un bot a mots cles hein, pas chatgpt.",
  "reformule, je capte pas.",
  "bof, tape 'sketch' suivi d'un numero ou 'ton prefere'.",
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
      addMessage("salut, demande moi ce que tu veux sur les 31 sketches.", "bot");
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
