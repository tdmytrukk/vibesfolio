import { createCanvas } from "canvas";
import { writeFileSync } from "fs";

const sizes = [16, 48, 128];

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Letter V
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(size * 0.55)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("V", size / 2, size / 2 + size * 0.03);

  writeFileSync(`public/icons/icon${size}.png`, canvas.toBuffer("image/png"));
  console.log(`✓ icon${size}.png`);
}
