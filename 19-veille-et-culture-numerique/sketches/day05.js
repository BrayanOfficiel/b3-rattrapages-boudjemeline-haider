// #5 genuary (prompt: write "genuary" without a font)
window.sketches[5] = (p) => {
  // each letter is a 5x7 grid of rects, no text() used
  const FONT = {
    G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    N: ["10001", "11001", "10101", "10101", "10011", "10001", "10001"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  };
  const WORD = "GENUARY";
  const CELL = 8;
  const LETTER_W = 5 * CELL;
  const LETTER_H = 7 * CELL;
  const SPACING = 10;

  let blocks = []; // flat list of {x, y, seed}, built once in setup
  let revealed = 0;

  p.setup = () => {
    p.createCanvas(400, 400);
    const totalW = WORD.length * LETTER_W + (WORD.length - 1) * SPACING;
    const startX = (400 - totalW) / 2;
    const startY = (400 - LETTER_H) / 2;
    WORD.split("").forEach((ch, li) => {
      FONT[ch].forEach((row, ry) => {
        row.split("").forEach((bit, rx) => {
          if (bit === "1") {
            blocks.push({
              x: startX + li * (LETTER_W + SPACING) + rx * CELL,
              y: startY + ry * CELL,
              seed: p.random(1000),
            });
          }
        });
      });
    });
  };

  p.draw = () => {
    p.background(10);
    if (revealed < blocks.length) revealed++;
    for (let i = 0; i < revealed; i++) {
      const b = blocks[i];
      // older blocks get a tiny vibration, keeps them alive
      const settled = i < revealed - 6;
      const jitter = settled ? Math.sin(p.frameCount * 0.15 + b.seed) * 0.8 : 0;
      p.noStroke();
      p.fill(90, 220, 180);
      p.rect(b.x + jitter, b.y, CELL - 1, CELL - 1);
    }
  };
};
