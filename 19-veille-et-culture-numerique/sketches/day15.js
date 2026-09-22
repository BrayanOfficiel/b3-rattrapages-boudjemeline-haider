// genuary prompt 15: create an invisible object
window.sketches[15] = (p) => {
  // only the shadow is drawn, the object itself stays empty
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(240);
    p.noStroke();
    for (let i = 0; i < 5; i++) {
      p.fill(0, 25);
      p.ellipse(160 + i * 8, 260 + i * 4, 140 - i * 10, 40 - i * 3);
    }
    // the object casting this shadow is never drawn on purpose
  };
};
