// genuary prompt 22: pen plotter ready
window.sketches[22] = (p) => {
  // crosshatch shading, only strokes, no fill (plotter friendly)
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); p.noiseSeed(22); };
  p.draw = () => {
    p.background(250);
    p.stroke(20); p.strokeWeight(1);
    for (let y = 10; y < 400; y += 6) {
      const density = p.noise(y * 0.01);
      for (let x = 10; x < 400; x += 6) {
        if (p.noise(x * 0.02, y * 0.02) < density) {
          p.line(x, y, x + 4, y + 4);
        }
      }
    }
  };
};
