// genuary prompt 17: wallpaper group
window.sketches[17] = (p) => {
  // simple p4 style repeating tile, translation symmetry
  const motif = (p, s) => {
    p.push(); p.scale(s / 40);
    p.noStroke(); p.fill(210, 60, 90);
    p.triangle(0, 0, 40, 0, 20, 35);
    p.fill(60, 90, 210);
    p.triangle(40, 40, 0, 40, 20, 5);
    p.pop();
  };
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(20);
    for (let x = 0; x < 400; x += 40) {
      for (let y = 0; y < 400; y += 40) {
        p.push();
        p.translate(x, y);
        motif(p, 40);
        p.pop();
      }
    }
  };
};
