// genuary prompt 13: self portrait
window.sketches[13] = (p) => {
  // abstract self portrait, circles and lines, not literal
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(30, 25, 40);
    p.noStroke();
    p.fill(230, 200, 170);
    p.ellipse(200, 210, 150, 190); // face
    p.fill(20);
    p.ellipse(160, 190, 14, 18);
    p.ellipse(240, 190, 14, 18); // eyes
    p.stroke(20); p.strokeWeight(4); p.noFill();
    p.arc(200, 240, 60, 40, 0.2, p.PI - 0.2); // mouth
    p.noStroke(); p.fill(40, 30, 25);
    p.rect(120, 90, 160, 50, 30); // hair block, very simplified
  };
};
