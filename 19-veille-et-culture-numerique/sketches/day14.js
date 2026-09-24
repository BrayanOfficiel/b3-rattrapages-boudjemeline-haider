// #14 perfect fit (prompt: everything fits perfectly)
window.sketches[14] = (p) => {
  // splits rectangles recursively (bsp), tight fit
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  const split = (x, y, w, h, depth) => {
    if (depth <= 0 || w < 20 || h < 20) {
      p.stroke(20);
      p.fill(p.random(180, 255), p.random(120, 200), p.random(140, 220));
      p.rect(x, y, w, h);
      return;
    }
    if (w > h) {
      const cut = w * p.random(0.35, 0.65);
      split(x, y, cut, h, depth - 1);
      split(x + cut, y, w - cut, h, depth - 1);
    } else {
      const cut = h * p.random(0.35, 0.65);
      split(x, y, w, cut, depth - 1);
      split(x, y + cut, w, h - cut, depth - 1);
    }
  };
  p.draw = () => { p.background(0); split(0, 0, 400, 400, 6); };
};
