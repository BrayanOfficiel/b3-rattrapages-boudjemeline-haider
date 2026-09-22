// genuary prompt 19: 16x16
window.sketches[19] = (p) => {
  // strict 16x16 grid of colored cells
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); p.noiseSeed(19); };
  p.draw = () => {
    const n = 16, cell = 400 / n;
    p.noStroke();
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const v = p.noise(i * 0.4, j * 0.4);
        p.fill(v * 255, (1 - v) * 200, 150);
        p.rect(i * cell, j * cell, cell, cell);
      }
    }
  };
};
