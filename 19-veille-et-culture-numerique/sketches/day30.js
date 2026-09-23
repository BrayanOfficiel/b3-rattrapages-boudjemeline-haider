// #30 it's not a bug it's a feature (prompt: it's not a bug, it's a feature)
window.sketches[30] = (p) => {
  // deliberate glitch, pixel row shifting
  p.setup = () => { p.createCanvas(400, 400); p.pixelDensity(1); };
  p.draw = () => {
    p.background(40, 20, 60);
    p.noStroke();
    p.fill(200, 60, 120);
    p.circle(200, 200, 200);
    p.loadPixels();
    for (let y = 0; y < 400; y += 4) {
      if (Math.random() < 0.3) {
        const shift = Math.floor(p.random(-30, 30));
        for (let x = 0; x < 400; x++) {
          const sx = (x + shift + 400) % 400;
          const src = (y * 400 + sx) * 4;
          const dst = (y * 400 + x) * 4;
          for (let k = 0; k < 4; k++) p.pixels[dst + k] = p.pixels[src + k];
        }
      }
    }
    p.updatePixels();
  };
};
