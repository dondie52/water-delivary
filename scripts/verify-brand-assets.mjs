import { stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const required = [
  "brand/logo.jpg",
  "brand/hero-banner.jpg",
  "brand/refill.jpg",
  "brand/bottles.jpg",
  "brand/personalized-bottles.jpg",
  "brand/branded-bottles.jpg",
  "brand/ice.jpg",
  "brand/og-image.jpg",
  "brand/delivery-demo.mp4",
  "brand/social/campus-refill-9x16.mp4",
  "brand/social/fast-order-9x16.mp4",
  "brand/social/corporate-branded-9x16.mp4"
];

const minBytes = 5_000;

let failed = false;

for (const rel of required) {
  const path = join(publicDir, rel);
  try {
    const info = await stat(path);
    if (info.size < minBytes) {
      console.error(`FAIL ${rel}: too small (${info.size} bytes)`);
      failed = true;
    } else {
      console.log(`OK   ${rel} (${info.size} bytes)`);
    }
  } catch {
    console.error(`FAIL ${rel}: missing`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("All brand assets present.");
