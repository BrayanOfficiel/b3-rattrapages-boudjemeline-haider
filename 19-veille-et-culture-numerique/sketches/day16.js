// #16 order/disorder (prompt: order and disorder)
window.sketches[16] = (p) => {
  // left half grid perfectly ordered, right half jittered
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(250);
    p.noStroke();
    p.fill(40);
    for (let x = 20; x < 200; x += 24) {
      for (let y = 20; y < 400; y += 24) {
        p.circle(x, y, 10);
      }
    }
    for (let x = 220; x < 400; x += 24) {
      for (let y = 20; y < 400; y += 24) {
        p.circle(x + p.random(-14, 14), y + p.random(-14, 14), p.random(4, 16));
      }
    }
  };
};
