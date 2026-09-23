// grid + live view logic, one sketch running at a time

const PROMPTS = [
  "one color, one shape",
  "twelve principles of animation",
  "fibonacci forever",
  "lowres",
  'write "genuary" without a font',
  "lights on / off",
  "boolean algebra",
  "a city",
  "crazy automaton",
  "polar coordinates",
  "quine",
  "boxes only",
  "self portrait",
  "everything fits perfectly",
  "create an invisible object",
  "order and disorder",
  "wallpaper group",
  "unexpected path",
  "16x16",
  "one line",
  "bauhaus poster",
  "pen plotter ready",
  "transparency",
  "perfectionist's nightmare",
  "organic geometry",
  "recursive grids",
  "lifeform",
  "no libraries, no canvas, only html elements",
  "genetic evolution and mutation",
  "it's not a bug, it's a feature",
  "glsl day",
];

// mes titres perso, affiches dans la grille a la place du prompt officiel
const TITLES = [
  "dots",
  "bounce",
  "fibonacci forever",
  "lowres",
  "genuary",
  "blinding lights",
  "venn",
  "city",
  "matrix eating amoeba",
  "magnetic flower",
  "line count",
  "boxes only",
  "portrait",
  "perfect fit",
  "ghost",
  "order/disorder",
  "scottish mosaic",
  "unexpected path",
  "16x16",
  "AC",
  "bauhaus",
  "ascii map",
  "glare",
  "perfectionist's nightmare",
  "organic geometry",
  "recursive grids",
  "lifeform",
  "tty progressbar",
  "magnetic cells",
  "it's not a bug it's a feature",
  "glsl day",
];

let currentInstance = null;

/** Fills the grid with one cell per genuary day, thumb by default. */
function buildGrid() {
  const grid = document.getElementById("grid");
  for (let n = 1; n <= 31; n++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.day = n;

    const img = document.createElement("img");
    img.src = `thumbs/day${String(n).padStart(2, "0")}.png`;
    img.alt = `genuary ${n}`;
    img.loading = "lazy";
    cell.appendChild(img);

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = `#${n} ${TITLES[n - 1]}`;
    cell.appendChild(label);

    cell.addEventListener("click", () => openLive(n));
    grid.appendChild(cell);
  }
}

/** Opens the modal and starts the p5 instance for that day, kills the previous one. */
function openLive(n) {
  const modal = document.getElementById("live-modal");
  const holder = document.getElementById("live-canvas-holder");
  const title = document.getElementById("live-title");

  if (currentInstance) {
    currentInstance.remove();
    currentInstance = null;
  }
  holder.innerHTML = "";

  if (typeof p5 === "undefined" || !window.sketches[n]) {
    holder.textContent = "p5 pas charge (cdn bloque ?), regarde thumbs/day" + String(n).padStart(2, "0") + ".png a la place";
  } else {
    currentInstance = new p5(window.sketches[n], holder);
  }

  title.textContent = `genuary #${n} -- ${TITLES[n - 1]}`;
  modal.classList.remove("hidden");
}

function closeLive() {
  const modal = document.getElementById("live-modal");
  if (currentInstance) {
    currentInstance.remove();
    currentInstance = null;
  }
  modal.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  buildGrid();
  document.getElementById("live-close").addEventListener("click", closeLive);
  document.getElementById("live-modal").addEventListener("click", (e) => {
    if (e.target.id === "live-modal") closeLive();
  });
});
