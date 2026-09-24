// #11 line count (prompt: quine)
window.sketches[11] = (p) => {
  // draws its own line count as bars, not a real quine
  const lineCount = 24; // todo count this for real instead of hardcoding
  p.setup = () => { p.createCanvas(400, 400); p.noLoop(); };
  p.draw = () => {
    p.background(20);
    p.noStroke();
    for (let i = 0; i < lineCount; i++) {
      p.fill(60 + i * 8, 200, 255 - i * 5);
      p.rect(10 + i * 16, 400 - i * 6 - 20, 10, i * 6 + 20);
    }
  };
};
