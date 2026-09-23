// #7 venn (prompt: boolean algebra)
window.sketches[7] = (p) => {
  // two circles, difference blend mode fakes an XOR look
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(255);
    p.blendMode(p.DIFFERENCE);
    p.noStroke();
    p.fill(255, 60, 60);
    p.circle(160, 200, 220);
    p.fill(60, 100, 255);
    p.circle(240, 200, 220);
    p.blendMode(p.BLEND);
  };
};
