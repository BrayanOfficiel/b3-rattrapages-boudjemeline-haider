// genuary prompt 3: fibonacci forever
window.sketches[3] = (p) => {
  // fibonacci spiral, circle radius follows the sequence
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(245, 240, 230);
    p.noFill();
    p.stroke(30);
    let a = 1, b = 1;
    let x = 200, y = 200, ang = 0;
    for (let i = 0; i < 12; i++) {
      const r = Math.min(a * 4, 190);
      p.circle(x, y, r);
      x += Math.cos(ang) * r * 0.5;
      y += Math.sin(ang) * r * 0.5;
      ang += 0.9;
      const next = a + b;
      a = b;
      b = next;
    }
  };
};
