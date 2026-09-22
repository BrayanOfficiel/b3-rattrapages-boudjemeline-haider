// genuary prompt 2: twelve principles of animation (squash and stretch)
window.sketches[2] = (p) => {
  // ball bouncing with squash/stretch, ease-out
  let t = 0;
  p.setup = () => { p.createCanvas(400, 400); };
  p.draw = () => {
    p.background(15, 15, 25);
    t += 0.04;
    const bounce = Math.abs(Math.sin(t)) * 250;
    const squash = 1 - Math.abs(Math.cos(t)) * 0.35;
    p.noStroke();
    p.fill(250, 200, 60);
    p.push();
    p.translate(200, 350 - bounce);
    p.ellipse(0, 0, 60 / squash, 60 * squash);
    p.pop();
  };
};
