// genuary prompt 20: one line
window.sketches[20] = (p) => {
  // one continuous line, pen never lifts, noise driven path
  let x = 0, y = 200;
  p.setup = () => {
    p.createCanvas(400, 400);
    p.background(255);
    p.stroke(10); p.strokeWeight(2);
  };
  p.draw = () => {
    const nx = x + 3;
    const ny = 200 + Math.sin(x * 0.02) * 120 + (p.noise(x * 0.01) - 0.5) * 60;
    p.line(x, y, nx, ny);
    x = nx; y = ny;
    if (x > 400) p.noLoop();
  };
};
