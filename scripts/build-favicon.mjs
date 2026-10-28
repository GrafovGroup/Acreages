import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mark = await fs.readFile(path.join(root, 'public/brand/acreages-symbol.png'));
// The opaque badge keeps the original mark readable independently of browser theme.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/><rect x="1.25" y="1.25" width="61.5" height="61.5" rx="9" fill="#fff" stroke="#173e35" stroke-width="2.5"/><image x="6" y="5" width="52" height="52" href="data:image/png;base64,${mark.toString('base64')}"/></svg>`;
await fs.writeFile(path.join(root, 'public/favicon.svg'), svg + '\n');

async function png(size) {
  return sharp(Buffer.from(svg), { density: 384 }).resize(size, size).removeAlpha().png().toBuffer();
}
for (const [file, size] of [
  ['brand/acreages-favicon.png', 64],
  ['brand/acreages-favicon-v2.png', 96],
  ['apple-touch-icon.png', 180],
]) {
  const data = await png(size);
  await fs.writeFile(path.join(root, 'public', file), data);
  console.log(`${file}: ${size}×${size}, ${data.length} bytes`);
}

const sizes = [16, 32, 48, 64];
const bitmaps = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
for (let i = 0; i < sizes.length; i++) {
  const pos = 6 + i * 16;
  header[pos] = sizes[i];
  header[pos + 1] = sizes[i];
  header.writeUInt16LE(1, pos + 4);
  header.writeUInt16LE(24, pos + 6);
  header.writeUInt32LE(bitmaps[i].length, pos + 8);
  header.writeUInt32LE(offset, pos + 12);
  offset += bitmaps[i].length;
}
await fs.writeFile(path.join(root, 'public/favicon.ico'), Buffer.concat([header, ...bitmaps]));
console.log(`favicon.ico: ${sizes.join(', ')} pixel sizes, ${offset} bytes`);
