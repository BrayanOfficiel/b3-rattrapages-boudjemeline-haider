// #25 organic geometry (prompt: organic geometry)
window.sketches[25] = (p) => {
  // perlin flow field, soft organic blobs from straight steps
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); p.noiseSeed(25); p.background(250, 245, 235); };
  p.draw = () => {
    p.stroke(70, 110, 70, 90);
    for (let i = 0; i < 300; i++) {
      let x = p.random(400), y = p.random(400);
      for (let step = 0; step < 40; step++) {
        const a = p.noise(x * 0.008, y * 0.008) * p.TWO_PI * 2;
        const nx = x + Math.cos(a) * 3;
        const ny = y + Math.sin(a) * 3;
        p.line(x, y, nx, ny);
        x = nx; y = ny;
      }
    }
  };
};
