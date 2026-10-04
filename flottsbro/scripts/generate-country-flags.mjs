import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "node_modules", "flag-icons", "flags", "4x3");
const tileWidth = 48;
const tileHeight = 36;
const alphabet = 26;
const files = (await readdir(source)).filter((file) => /^[a-z]{2}\.svg$/.test(file));
const tiles = await Promise.all(files.map(async (file) => {
  const code = file.slice(0, 2);
  const image = await sharp(await readFile(path.join(source, file)))
    .resize(tileWidth, tileHeight, { fit: "fill" })
    .png()
    .toBuffer();
  return {
    input: image,
    left: (code.charCodeAt(1) - 97) * tileWidth,
    top: (code.charCodeAt(0) - 97) * tileHeight,
  };
}));

await sharp({
  create: {
    width: alphabet * tileWidth,
    height: alphabet * tileHeight,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(tiles)
  .webp({ quality: 90, effort: 6 })
  .toFile(path.join(root, "src", "assets", "country-flags.webp"));

console.log(`Packed ${files.length} flags from flag-icons into country-flags.webp`);
