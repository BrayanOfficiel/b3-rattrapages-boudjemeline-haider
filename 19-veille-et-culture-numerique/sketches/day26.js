// #26 recursive grids (prompt: recursive grids)
window.sketches[26] = (p) => {
  // squares that recurse into smaller grids, sierpinski-ish
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  const grid = (x, y, size, depth) => {
    if (depth === 0) {
      p.noStroke();
      p.fill(20, 20, 30);
      p.rect(x, y, size, size);
      return;
    }
    const s3 = size / 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) continue;
        grid(x + i * s3, y + j * s3, s3, depth - 1);
      }
    }
  };
  p.draw = () => { p.background(230, 220, 200); grid(0, 0, 400, 4); };
};
