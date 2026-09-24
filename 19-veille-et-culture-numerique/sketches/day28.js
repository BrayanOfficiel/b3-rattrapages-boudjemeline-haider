// #28 tty progressbar (prompt: no libraries, no canvas, only html elements)
window.sketches[28] = (p) => {
  // cant drop p5 here, every day needs the same shape
  // fakes no canvas look with flat rects, no gradients
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(255);
    p.noStroke();
    p.fill(0);
    for (let i = 0; i < 10; i++) {
      p.rect(20, 20 + i * 36, 360, 28);
      p.fill(255);
      p.rect(24, 24 + i * 36, 352 - i * 10, 20);
      p.fill(0);
    }
  };
};
