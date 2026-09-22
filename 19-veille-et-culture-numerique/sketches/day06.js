// genuary prompt 6: lights on / off
window.sketches[6] = (p) => {
  // grid of cells, on/off driven by a slow noise field
  let cells = 16;
  p.setup = () => { p.createCanvas(400, 400); p.noiseSeed(6); };
  p.draw = () => {
    p.background(0);
    const cell = 400 / cells;
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        const n = p.noise(i * 0.3, j * 0.3, p.frameCount * 0.01);
        p.fill(n > 0.55 ? p.color(255, 230, 120) : p.color(25));
        p.noStroke();
        p.rect(i * cell, j * cell, cell - 2, cell - 2);
      }
    }
  };
};
