// #13 portrait (prompt: self portrait)
window.sketches[13] = (p) => {
  // ascii portrait: an oval face filled with monospace chars from "HAIDER",
  // char picked by a brightness map (soft perlin noise + dark eyes/mouth/nose)
  const CHARS = "HAIDER";
  const cell = 8;
  let cols, rows, t = 0;

  p.setup = () => {
    p.createCanvas(400, 400);
    cols = Math.floor(400 / cell);
    rows = Math.floor(400 / cell);
    p.textFont("monospace");
    p.textSize(cell);
    p.textAlign(p.CENTER, p.CENTER);
    p.noiseSeed(13);
    p.frameRate(6); // slow flicker, not a real animation
  };

  // brightness at a grid cell: 0 dark (background or hole), 1 bright (skin).
  function brightness(gx, gy) {
    const x = gx * cell + cell / 2;
    const y = gy * cell + cell / 2;
    const cx = 200, cy = 210;
    const rx = 105, ry = 145;
    const ed = Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2);
    if (ed > 1) return 0; // outside the face, stays background

    // skin: bright with a soft noise wobble, edge fades toward the oval border
    const edge = 1 - Math.max(0, ed - 0.7) / 0.3;
    let b = (0.8 + (p.noise(x * 0.025, y * 0.025, t) - 0.5) * 0.3) * Math.min(1, edge);

    // eyes: two hard dark holes
    const eyeY = cy - 30;
    const dEyeL = Math.pow((x - (cx - 38)) / 20, 2) + Math.pow((y - eyeY) / 12, 2);
    const dEyeR = Math.pow((x - (cx + 38)) / 20, 2) + Math.pow((y - eyeY) / 12, 2);
    if (dEyeL < 1 || dEyeR < 1) return 0;

    // nose: thin vertical shadow line, dims skin but doesn't punch a hole
    if (Math.abs(x - cx) < 4 && y > cy - 10 && y < cy + 40) b *= 0.45;

    // mouth: dark curved band
    const mouthY = cy + 75 + Math.sin((x - cx) / 55) * 5;
    if (Math.abs(y - mouthY) < 7 && Math.abs(x - cx) < 50) return 0;

    return b;
  }

  p.draw = () => {
    p.background(6, 6, 8);
    p.noStroke();
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const b = brightness(gx, gy);
        if (b <= 0.03) continue;
        const shade = 60 + b * 195;
        p.fill(shade, shade * 0.97, shade * 0.9);
        const ci = Math.floor(b * (CHARS.length - 1) + gx + gy) % CHARS.length;
        p.text(CHARS[ci], gx * cell + cell / 2, gy * cell + cell / 2);
      }
    }
    t += 0.006; // slight scintillation, stays readable as a still face
  };
};
