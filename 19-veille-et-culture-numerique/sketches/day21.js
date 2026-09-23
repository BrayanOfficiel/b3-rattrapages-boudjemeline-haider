// #21 bauhaus (prompt: bauhaus poster)
window.sketches[21] = (p) => {
  // bauhaus style, flat primary shapes, bold
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(235, 225, 205);
    p.noStroke();
    p.fill(200, 40, 40);
    p.circle(140, 150, 160);
    p.fill(30, 60, 150);
    p.rect(220, 60, 130, 130);
    p.fill(240, 190, 30);
    p.triangle(80, 320, 220, 320, 150, 200);
    p.stroke(10); p.strokeWeight(6);
    p.line(0, 380, 400, 380);
  };
};
