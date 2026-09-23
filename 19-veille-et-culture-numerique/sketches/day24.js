// #24 perfectionist's nightmare (prompt: perfectionist's nightmare)
window.sketches[24] = (p) => {
  // grid that should be perfect but every cell is slightly off
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(245);
    p.stroke(20); p.noFill();
    for (let x = 20; x < 400; x += 30) {
      for (let y = 20; y < 400; y += 30) {
        p.push();
        p.translate(x + p.random(-3, 3), y + p.random(-3, 3));
        p.rotate(p.random(-0.08, 0.08));
        p.rect(-12, -12, 24, 24);
        p.pop();
      }
    }
  };
};
