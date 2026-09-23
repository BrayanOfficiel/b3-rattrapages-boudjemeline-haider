// #9 matrix eating amoeba (prompt: crazy automaton)
window.sketches[9] = (p) => {
  // conway's game of life, random start
  let grid, cols, rows, cell = 10;
  const idx = (x, y) => x + y * cols;
  p.setup = () => {
    p.createCanvas(400, 400);
    cols = 400 / cell; rows = 400 / cell;
    grid = new Array(cols * rows).fill(0).map(() => (Math.random() > 0.75 ? 1 : 0));
  };
  p.draw = () => {
    p.background(0);
    p.noStroke();
    const next = grid.slice();
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        let n = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const nx = (x + dx + cols) % cols, ny = (y + dy + rows) % rows;
            n += grid[idx(nx, ny)];
          }
        }
        const alive = grid[idx(x, y)];
        next[idx(x, y)] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
        if (alive) { p.fill(120, 255, 180); p.rect(x * cell, y * cell, cell - 1, cell - 1); }
      }
    }
    grid = next;
  };
};
