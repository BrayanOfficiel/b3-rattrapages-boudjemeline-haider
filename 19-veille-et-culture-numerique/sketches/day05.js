// genuary prompt 5: write "genuary" without a font
window.sketches[5] = (p) => {
  // letters built from rects only, no text() call
  const dot = (p, x, y, w, h, col) => { p.noStroke(); p.fill(col); p.rect(x, y, w, h); };
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(10);
    const col = p.color(90, 220, 180);
    // crude blocky "G" and "26" made of rects, not a real font
    dot(p, 60, 150, 90, 20, col);
    dot(p, 60, 150, 20, 100, col);
    dot(p, 60, 230, 90, 20, col);
    dot(p, 130, 190, 20, 60, col);
    dot(p, 220, 150, 20, 100, col);
    dot(p, 260, 150, 20, 100, col);
    dot(p, 300, 150, 20, 100, col);
  };
};
