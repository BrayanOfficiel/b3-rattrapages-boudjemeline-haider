// genuary prompt 31: glsl day
window.sketches[31] = (p) => {
  // no real shader here, loadPixels fakes a per-pixel gradient like a fragment shader would
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); p.pixelDensity(1); };
  p.draw = () => {
    p.loadPixels();
    for (let x = 0; x < 400; x++) {
      for (let y = 0; y < 400; y++) {
        const i = (x + y * 400) * 4;
        const u = x / 400, v = y / 400;
        p.pixels[i] = Math.floor(u * 255);
        p.pixels[i + 1] = Math.floor(v * 255);
        p.pixels[i + 2] = Math.floor(Math.sin(u * 10 + v * 10) * 127 + 128);
        p.pixels[i + 3] = 255;
      }
    }
    p.updatePixels();
  };
};
