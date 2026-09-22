// genuary prompt 23: transparency
window.sketches[23] = (p) => {
  // stacked translucent circles, additive feel
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(10);
    p.noStroke();
    for (let i = 0; i < 40; i++) {
      p.fill(255, 120, 60, 25);
      p.circle(p.random(400), p.random(400), p.random(30, 140));
    }
  };
};
