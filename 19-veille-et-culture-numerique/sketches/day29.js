// #29 magnetic cells (prompt: genetic evolution and mutation)
window.sketches[29] = (p) => {
  // toy ga: a population's trait drifts toward a target across generations,
  // plotted left (gen 0) to right (latest gen) so the whole canvas fills up
  const GENS = 40;
  const POP = 14;
  const target = 0.8;
  let history = []; // one array of trait values per generation

  p.setup = () => {
    p.createCanvas(400, 400);
    let gen = [];
    for (let i = 0; i < POP; i++) gen.push(p.random());
    history.push(gen);
  };

  const nextGen = (gen) => {
    // keep the fittest half, mutate the rest around them
    const sorted = [...gen].sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
    const keep = sorted.slice(0, POP / 2);
    const next = [...keep];
    while (next.length < POP) {
      const parent = keep[Math.floor(p.random(keep.length))];
      next.push(p.constrain(parent + p.random(-0.08, 0.08), 0, 1));
    }
    return next;
  };

  p.draw = () => {
    if (history.length < GENS && p.frameCount % 4 === 0) {
      history.push(nextGen(history[history.length - 1]));
    }
    p.background(20, 20, 25);
    p.noStroke();
    const colW = 400 / GENS;
    history.forEach((gen, gi) => {
      gen.forEach((trait) => {
        const fit = 1 - Math.abs(trait - target);
        p.fill(255 * (1 - fit), 255 * fit, 120);
        p.circle(gi * colW + colW / 2, 400 - trait * 380 - 10, 6);
      });
    });
  };
};
