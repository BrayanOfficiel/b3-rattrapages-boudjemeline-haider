// #12 boxes only (prompt: boxes only)
window.sketches[12] = (p) => {
  // grid of boxes, size from perlin noise
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); p.noiseSeed(12); };
  p.draw = () => {
    p.background(235);
    p.rectMode(p.CENTER);
    p.stroke(20);
    p.noFill();
    for (let x = 20; x < 400; x += 30) {
      for (let y = 20; y < 400; y += 30) {
        const n = p.noise(x * 0.03, y * 0.03);
        p.rect(x, y, n * 26, n * 26);
      }
    }
  };
};
