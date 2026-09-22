// genuary prompt 10: polar coordinates
window.sketches[10] = (p) => {
  // rose curve in polar coords
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(250, 245, 235);
    p.translate(200, 200);
    p.noFill();
    p.stroke(180, 30, 60);
    const k = 5; // petal count param, try 4 or 7 too
    p.beginShape();
    for (let a = 0; a < p.TWO_PI * 2; a += 0.02) {
      const r = 160 * Math.cos(k * a);
      p.vertex(r * Math.cos(a), r * Math.sin(a));
    }
    p.endShape();
  };
};
