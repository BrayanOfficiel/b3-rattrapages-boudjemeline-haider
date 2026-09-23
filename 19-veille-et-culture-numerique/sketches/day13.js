// genuary prompt 13: self portrait
window.sketches[13] = (p) => {
  // generative face, mirrored perlin noise left/right like a rorschach test
  let t = 0;
  p.setup = () => { p.createCanvas(400, 400); p.noiseSeed(13); };
  p.draw = () => {
    p.background(15, 12, 20);
    p.noStroke();
    const cx = 200, cy = 190;
    // skin field, only draw right half of noise then mirror to the left
    const rx = 140, ry = 175;
    for (let x = 0; x <= 200; x += 4) {
      for (let y = 0; y <= 400; y += 4) {
        const n = p.noise(x * 0.02, y * 0.02, t);
        // distance to an oval, wobbled a bit by noise so the edge is not perfect
        const ed = Math.sqrt(Math.pow(x / rx, 2) + Math.pow((y - cy) / ry, 2));
        if (ed + (n - 0.5) * 0.3 > 1) continue; // keeps a rough oval outline
        const shade = 150 + n * 70;
        p.fill(shade, shade * 0.78, shade * 0.62);
        p.rect(cx + x, y, 4, 4);
        p.rect(cx - x, y, 4, 4);
      }
    }
    // eyes drift slowly with noise, stay mirrored
    const eyeOffX = (p.noise(50, t) - 0.5) * 16;
    const eyeOffY = (p.noise(80, t) - 0.5) * 10;
    p.fill(20, 15, 15);
    p.ellipse(cx - 55 + eyeOffX, 170 + eyeOffY, 16, 20);
    p.ellipse(cx + 55 - eyeOffX, 170 + eyeOffY, 16, 20);
    // mouth curve moves with a slower noise cycle
    const mouthCurve = (p.noise(120, t) - 0.5) * 30;
    p.noFill();
    p.stroke(20, 12, 12);
    p.strokeWeight(5);
    p.beginShape();
    for (let x = -45; x <= 45; x += 5) {
      const y = 250 + mouthCurve * Math.sin((x + 45) / 90 * Math.PI);
      p.vertex(cx + x, y);
    }
    p.endShape();
    t += 0.004;
  };
};
