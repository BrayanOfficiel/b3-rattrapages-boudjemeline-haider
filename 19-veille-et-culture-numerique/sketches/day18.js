// genuary prompt 18: unexpected path
window.sketches[18] = (p) => {
  // walker mostly keeps its heading, but every so often forces a hard random
  // turn, reads more like a path with surprises than pure random noise
  let path = [];

  p.setup = () => {
    p.createCanvas(400, 400);
    p.noLoop();
    let x = 40, y = 40, heading = 0;
    for (let i = 0; i < 500; i++) {
      if (p.random() < 0.08) heading += p.random(-p.PI, p.PI);
      else heading += p.random(-0.15, 0.15);
      x += Math.cos(heading) * 6;
      y += Math.sin(heading) * 6;
      if (x < 10 || x > 390) heading = p.PI - heading;
      if (y < 10 || y > 390) heading = -heading;
      x = p.constrain(x, 10, 390);
      y = p.constrain(y, 10, 390);
      path.push({ x, y });
    }
  };

  p.draw = () => {
    p.background(250, 248, 240);
    p.noFill();
    for (let i = 1; i < path.length; i++) {
      const c = p.map(i, 0, path.length, 0, 1);
      p.stroke(30 + c * 180, 100 - c * 60, 160 + c * 60);
      p.line(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
    }
  };
};
