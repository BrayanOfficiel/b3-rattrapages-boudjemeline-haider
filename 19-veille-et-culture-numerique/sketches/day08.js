// genuary prompt 8: a city
window.sketches[8] = (p) => {
  // isometric city blocks, cubes drawn with 3 parallelograms
  const cube = (p, x, y, h, col) => {
    const w = 24;
    p.fill(col); p.noStroke();
    p.quad(x, y - h, x + w, y - h - w / 2, x + w, y - w / 2, x, y);
    p.fill(p.red(col) * 0.8, p.green(col) * 0.8, p.blue(col) * 0.8);
    p.quad(x, y, x + w, y - w / 2, x + w, y + w / 2, x, y + w);
    p.fill(p.red(col) * 0.6, p.green(col) * 0.6, p.blue(col) * 0.6);
    p.quad(x + w, y - h - w / 2, x + w * 2, y - h, x + w * 2, y, x + w, y - w / 2);
  };
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); p.noiseSeed(8); };
  p.draw = () => {
    p.background(15, 15, 35);
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const x = 40 + col * 26 - row * 13;
        const y = 300 + row * 13 - col * 4;
        const h = 20 + p.noise(row, col) * 90;
        cube(p, x, y, h, p.color(200, 90 + row * 20, 140));
      }
    }
  };
};
