// genuary prompt 18: unexpected path
window.sketches[18] = (p) => {
  // random walk, drunkard's path
  let x, y, path;
  p.setup = () => {
    p.createCanvas(400, 400);
    x = 200; y = 200; path = [];
  };
  p.draw = () => {
    p.background(250, 248, 240);
    x += p.random(-6, 6);
    y += p.random(-6, 6);
    x = p.constrain(x, 0, 400);
    y = p.constrain(y, 0, 400);
    path.push([x, y]);
    if (path.length > 900) path.shift();
    p.noFill(); p.stroke(30, 100, 160);
    p.beginShape();
    for (const pt of path) p.vertex(pt[0], pt[1]);
    p.endShape();
  };
};
