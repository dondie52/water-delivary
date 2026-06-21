import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const picturesDir = join(root, "pictures");
const brandDir = join(root, "public", "brand");

/** Map brand asset filenames to source files in /pictures */
const IMAGE_MAP = {
  "logo.jpg": "logo.jpg",
  "hero-banner.jpg": "hero-banner-generated.jpg",
  "refill.jpg": "water refill.jpg",
  "bottles.jpg": "517181432_1115272827325461_8401208227165093072_n.jpg",
  "personalized-bottles.jpg": "516917244_1115272673992143_8118222674104974598_n.jpg",
  "branded-bottles.jpg": "517378994_1115272687325475_7044898463915558810_n.jpg",
  "ice.jpg": "517035498_1115272627325481_2488414412940833378_n.jpg"
};

const VIDEO_SOURCE = join(root, "WhatsApp Video 2026-06-20 at 14.46.59.mp4");

async function createOgImage() {
  const sharp = (await import("sharp")).default;
  await sharp(join(brandDir, "hero-banner.jpg"))
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88 })
    .toFile(join(brandDir, "og-image.jpg"));
  console.log("Saved og-image.jpg");
}

async function main() {
  await mkdir(brandDir, { recursive: true });

  for (const [dest, src] of Object.entries(IMAGE_MAP)) {
    await copyFile(join(picturesDir, src), join(brandDir, dest));
    console.log(`Saved ${dest} <- pictures/${src}`);
  }

  try {
    await copyFile(VIDEO_SOURCE, join(brandDir, "delivery-demo.mp4"));
    console.log("Saved delivery-demo.mp4 <- WhatsApp video");
  } catch {
    console.warn("WhatsApp delivery video not found; run generate:marketing-videos for a fallback clip");
  }

  await createOgImage();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
