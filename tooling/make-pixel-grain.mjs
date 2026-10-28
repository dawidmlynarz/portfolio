// Writes the "pixel grain" hero texture: sparse square pixels, like the blocks in the glitch
// reveal. One tile per theme (black ink for light, white ink for dark), drawn at 2x so the
// blocks stay crisp on retina screens. Deterministic: same seed, same file.
//   node tooling/make-pixel-grain.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";

const CELLS = 64; // cells per tile side
const CELL = 6; // device pixels per cell (3 CSS px at 2x)
const DENSITY = 0.03; // share of cells that are lit
const SIZE = CELLS * CELL;

// mulberry32: a tiny seeded PRNG
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};

function png(ink) {
  const random = rng(20261028);
  const alpha = new Uint8Array(CELLS * CELLS);
  for (let i = 0; i < alpha.length; i++) {
    // Lit cells get one of three strengths, so the field reads as grain, not a pattern.
    if (random() < DENSITY) alpha[i] = [22, 38, 60][Math.floor(random() * 3)];
  }
  // Grey + alpha, 8 bit; each row starts with filter byte 0.
  const raw = Buffer.alloc(SIZE * (1 + SIZE * 2));
  for (let y = 0; y < SIZE; y++) {
    const row = y * (1 + SIZE * 2);
    for (let x = 0; x < SIZE; x++) {
      const a = alpha[Math.floor(y / CELL) * CELLS + Math.floor(x / CELL)];
      raw[row + 1 + x * 2] = ink;
      raw[row + 2 + x * 2] = a;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(SIZE, 0);
  header.writeUInt32BE(SIZE, 4);
  header[8] = 8; // bit depth
  header[9] = 4; // grey + alpha
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/textures", { recursive: true });
writeFileSync("public/textures/pixel-grain-light.png", png(0));
writeFileSync("public/textures/pixel-grain-dark.png", png(255));
