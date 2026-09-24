// #2 bounce (prompt: twelve principles of animation)
window.sketches[2] = (p) => {
  // balls squash on impact, stretch mid air
  // shadow and ground line so it still looks like a bounce
  let t = 0;
  const groundY = 360;

  p.setup = () => { p.createCanvas(400, 400); };

  const drawBall = (cx, localT, size, col) => {
    const bounce = Math.abs(Math.sin(localT)) * 300;
    const y = groundY - bounce;
    const squash = 1 - Math.abs(Math.cos(localT)) * 0.4;
    const w = size / squash;
    const h = size * squash;
    // shadow shrinks going up, flat right before impact
    const shadowW = size * (1.3 - (bounce / 300) * 0.7);
    p.noStroke();
    p.fill(255, 255, 255, 30);
    p.ellipse(cx, groundY + 6, shadowW, 14);
    p.fill(col);
    p.ellipse(cx, y, w, h);
  };

  p.draw = () => {
    // low alpha bg leaves a short trail, shows motion
    p.background(15, 15, 25, 55);
    t += 0.045;
    p.stroke(90);
    p.line(0, groundY + 6, 400, groundY + 6);
    // balls offset in phase, a bit of overlapping action
    drawBall(110, t + 1.1, 34, p.color(250, 210, 70));
    drawBall(210, t + 0.55, 50, p.color(250, 170, 90));
    drawBall(310, t, 70, p.color(240, 120, 90));
  };
};
