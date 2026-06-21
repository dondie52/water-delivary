import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const brandDir = join(__dirname, "..", "public", "brand");

const downloads = [
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_3DIl1wyL8wrK66z6XctE6sY9ZMp/hf_20260621_055840_ae41a370-e4de-463d-b682-997cd2c67f3f.png",
    file: "hero-banner.jpg"
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_3DIl1wyL8wrK66z6XctE6sY9ZMp/hf_20260621_055937_3db56df8-4e99-4556-8240-5335eba2c237.png",
    file: "refill.jpg"
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_3DIl1wyL8wrK66z6XctE6sY9ZMp/hf_20260621_073236_9c5d9bb9-b530-4faf-8b80-e533597d4eba.png",
    file: "bottles.jpg"
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_3DIl1wyL8wrK66z6XctE6sY9ZMp/hf_20260621_073325_d2f9abff-39a3-4123-9121-7ee50f3e086d.png",
    file: "branded-bottles.jpg"
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_3DIl1wyL8wrK66z6XctE6sY9ZMp/hf_20260621_073453_f8f86087-b24c-4ae5-b1a1-bc7abe58ec38.png",
    file: "ice.jpg"
  }
];

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${file}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(join(brandDir, file), buf);
  console.log(`Saved ${file}`);
}

async function createLogos() {
  const sharp = (await import("sharp")).default;
  const svgPath = join(brandDir, "logo.svg");
  const logoBuf = await sharp(svgPath).resize(512, 102).png().toBuffer();
  await sharp(logoBuf)
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 90 })
    .toFile(join(brandDir, "logo.jpg"));
  await sharp(logoBuf)
    .flatten({ background: "#061a4f" })
    .jpeg({ quality: 90 })
    .toFile(join(brandDir, "logo-dark.jpg"));
  console.log("Saved logo.jpg and logo-dark.jpg");
}

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
  for (const { url, file } of downloads) {
    await download(url, file);
  }
  await createLogos();
  await copyFile(join(brandDir, "branded-bottles.jpg"), join(brandDir, "personalized-bottles.jpg"));
  console.log("Saved personalized-bottles.jpg (from branded-bottles)");
  await createOgImage();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
