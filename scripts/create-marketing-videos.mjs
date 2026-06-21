import { spawn } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const brandDir = join(root, "public", "brand");
const socialDir = join(brandDir, "social");
const whatsAppVideo = join(root, "WhatsApp Video 2026-06-20 at 14.46.59.mp4");

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
    proc.on("error", reject);
  });
}

async function createKenBurnsVideo({ input, output, width, height, duration = 6 }) {
  const frames = duration * 30;
  const filter = `zoompan=z='min(zoom+0.0012,1.25)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=30`;

  await runFfmpeg([
    "-y",
    "-loop",
    "1",
    "-i",
    input,
    "-vf",
    filter,
    "-t",
    String(duration),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    output
  ]);
}

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static binary not found");
  }

  await mkdir(socialDir, { recursive: true });

  if (await fileExists(whatsAppVideo)) {
    const { copyFile } = await import("node:fs/promises");
    await copyFile(whatsAppVideo, join(brandDir, "delivery-demo.mp4"));
    console.log("Saved delivery-demo.mp4 <- WhatsApp video");
  } else {
    await createKenBurnsVideo({
      input: join(brandDir, "hero-banner.jpg"),
      output: join(brandDir, "delivery-demo.mp4"),
      width: 1280,
      height: 720,
      duration: 6
    });
    console.log("Saved delivery-demo.mp4");
  }

  const socialClips = [
    { input: "refill.jpg", output: "campus-refill-9x16.mp4" },
    { input: "bottles.jpg", output: "fast-order-9x16.mp4" },
    { input: "branded-bottles.jpg", output: "corporate-branded-9x16.mp4" }
  ];

  for (const clip of socialClips) {
    await createKenBurnsVideo({
      input: join(brandDir, clip.input),
      output: join(socialDir, clip.output),
      width: 1080,
      height: 1920,
      duration: 5
    });
    console.log(`Saved social/${clip.output}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
