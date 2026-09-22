// genuary prompt 4: lowres
window.sketches[4] = (p) => {
  // low res noise grid, big blocky pixels
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); p.noiseSeed(4); };
  p.draw = () => {
    p.noStroke();
    const cell = 25;
    for (let x = 0; x < 400; x += cell) {
      for (let y = 0; y < 400; y += cell) {
        const n = p.noise(x * 0.02, y * 0.02);
        p.fill(n * 255, n * 180, 80);
        p.rect(x, y, cell, cell);
      }
    }
  };
};
