// #1 dots (prompt: one color, one shape)
window.sketches[1] = (p) => {
  // grid of circles, single color, size driven by distance from center
  p.setup = () => {
    p.createCanvas(400, 400);
    p.noLoop();
  };
  p.draw = () => {
    p.background(20);
    p.noStroke();
    p.fill(230, 90, 60);
    for (let x = 20; x < 400; x += 40) {
      for (let y = 20; y < 400; y += 40) {
        const d = p.dist(x, y, 200, 200);
        const r = p.map(d, 0, 280, 18, 3);
        p.circle(x, y, r);
      }
    }
  };
};
