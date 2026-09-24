// #27 lifeform (prompt: lifeform)
window.sketches[27] = (p) => {
  // l-system tree with leaf dots at branch tips
  // makes it look alive, not just a diagram
  const rules = { F: "FF+[+F-F-F]-[-F+F+F]" };
  let sentence = "F";

  p.setup = () => {
    p.createCanvas(400, 400);
    p.noLoop();
    for (let i = 0; i < 2; i++) {
      let next = "";
      for (const c of sentence) next += rules[c] || c;
      sentence = next;
    }
  };

  p.draw = () => {
    p.background(12, 22, 14);
    let x = 200, y = 398, heading = -p.HALF_PI;
    const len = 13, ang = 0.4;
    let stack = [];
    let tips = [];
    p.strokeWeight(1.3);
    for (const c of sentence) {
      if (c === "F") {
        const x2 = x + len * Math.cos(heading);
        const y2 = y + len * Math.sin(heading);
        p.stroke(140, 210, 150);
        p.line(x, y, x2, y2);
        x = x2; y = y2;
        tips.push({ x, y });
      } else if (c === "+") heading += ang;
      else if (c === "-") heading -= ang;
      else if (c === "[") stack.push({ x, y, heading });
      else if (c === "]") { const st = stack.pop(); x = st.x; y = st.y; heading = st.heading; }
    }
    p.noStroke();
    p.fill(230, 140, 170);
    for (const t of tips) if (p.random() < 0.15) p.circle(t.x, t.y, 4);
  };
};
