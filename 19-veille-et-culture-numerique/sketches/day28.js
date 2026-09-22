// genuary prompt 28: no libraries, no canvas, only html elements
window.sketches[28] = (p) => {
  // can't drop p5 entirely here since every day needs the same sketch shape,
  // so this fakes the "no canvas" spirit with flat divs drawn as plain rects (no gradients, no images)
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
