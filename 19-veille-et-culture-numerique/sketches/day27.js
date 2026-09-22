// genuary prompt 27: lifeform
window.sketches[27] = (p) => {
  // small l-system tree, reads like a branching organism
  let rules = { F: "FF+[+F-F-F]-[-F+F+F]" };
  let sentence = "F";
  const iterate = () => {
    let next = "";
    for (const c of sentence) next += rules[c] || c;
    sentence = next;
  };
  p.setup = () => {
    p.createCanvas(400, 400);
    p.noLoop();
    iterate(); iterate(); // TODO a 3rd pass looks nicer but is slow, keep it at 2 for now
  };
  p.draw = () => {
    p.background(15, 25, 15);
    p.translate(200, 400);
    p.stroke(140, 220, 150);
    let len = 6, ang = 0.4;
    let stack = [];
    let heading = -p.HALF_PI;
    for (const c of sentence) {
      if (c === "F") {
        const nx = p.mouseX ? 0 : 0; // no-op, keeps var used
        const x2 = 0 + len * Math.cos(heading);
        const y2 = 0 + len * Math.sin(heading);
        p.line(0, 0, x2, y2);
        p.translate(x2, y2);
      } else if (c === "+") { heading += ang; }
      else if (c === "-") { heading -= ang; }
      else if (c === "[") { stack.push({ heading }); p.push(); }
      else if (c === "]") { const st = stack.pop(); heading = st.heading; p.pop(); }
    }
  };
};
