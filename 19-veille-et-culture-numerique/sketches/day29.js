// genuary prompt 29: genetic evolution and mutation
window.sketches[29] = (p) => {
  // dots evolve toward a target point over generations, simple ga-like drift
  let pop = [];
  const target = { x: 320, y: 80 };
  p.setup = () => {
    p.createCanvas(400, 400);
    for (let i = 0; i < 60; i++) pop.push({ x: p.random(400), y: p.random(400) });
  };
  p.draw = () => {
    p.background(20, 20, 25);
    p.noStroke();
    for (const dot of pop) {
      dot.x += (target.x - dot.x) * 0.01 + p.random(-2, 2);
      dot.y += (target.y - dot.y) * 0.01 + p.random(-2, 2);
      const fit = 1 - p.dist(dot.x, dot.y, target.x, target.y) / 400;
      p.fill(255 * fit, 255 * (1 - fit), 120);
      p.circle(dot.x, dot.y, 6);
    }
  };
};
