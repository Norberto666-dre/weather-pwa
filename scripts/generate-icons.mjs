import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "app", "assets", "icons", "EmblemaAtardecer.png");
const iconsDir = path.join(root, "public", "assets", "icons");
const publicDir = path.join(root, "public", "assets");
const appDir = path.join(root, "app");

const INK = "#07131c";

function backdrop(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="sky" cx="50%" cy="36%" r="74%">
      <stop offset="0" stop-color="#153a4b"/>
      <stop offset="0.55" stop-color="#0b2230"/>
      <stop offset="1" stop-color="${INK}"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#sky)"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.41}" fill="none" stroke="#d8a94a" stroke-opacity="0.22" stroke-width="${Math.max(1.5, size * 0.004)}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.465}" fill="none" stroke="#d8a94a" stroke-opacity="0.1" stroke-width="${Math.max(1, size * 0.002)}"/>
</svg>`;
}

async function renderIcon({ size, scale, destination, opaque = true }) {
  const emblemSize = Math.round(size * scale);
  const emblem = await sharp(source)
    .resize(emblemSize, emblemSize, { fit: "contain" })
    .png()
    .toBuffer();

  const base = opaque
    ? sharp(Buffer.from(backdrop(size)))
    : sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      });

  await base
    .composite([{ input: emblem, gravity: "center" }])
    .png()
    .toFile(destination);
}

await mkdir(iconsDir, { recursive: true });
await mkdir(publicDir, { recursive: true });

// Iconos instalables con fondo tinta y el emblema como sello.
await Promise.all([
  renderIcon({
    size: 192,
    scale: 0.84,
    destination: path.join(iconsDir, "icon-192x192.png"),
  }),
  renderIcon({
    size: 512,
    scale: 0.84,
    destination: path.join(iconsDir, "icon-512x512.png"),
  }),
  renderIcon({
    size: 512,
    scale: 0.68,
    destination: path.join(iconsDir, "icon-maskable-512x512.png"),
  }),
  renderIcon({
    size: 180,
    scale: 0.82,
    destination: path.join(appDir, "apple-icon.png"),
  }),
  renderIcon({
    size: 256,
    scale: 0.84,
    destination: path.join(appDir, "icon.png"),
  }),
]);

// Emblema transparente para la interfaz.
const uiEmblem = await sharp(source).resize(512, 512, { fit: "contain" }).png().toBuffer();
await writeFile(path.join(publicDir, "emblema.png"), uiEmblem);

const uiEmblem128 = await sharp(source).resize(128, 128, { fit: "contain" }).png().toBuffer();
await writeFile(path.join(publicDir, "emblema-128.png"), uiEmblem128);

console.log("Iconos del emblema generados en public/assets y app/");
