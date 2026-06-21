import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputPath = resolve(projectRoot, "public/brand/delivery-demo.mp4");
const apiBase = "https://api.openai.com/v1";

const config = {
  model: process.env.SORA_MODEL ?? "sora-2",
  seconds: process.env.SORA_SECONDS ?? "8",
  size: process.env.SORA_SIZE ?? "1280x720",
  prompt:
    process.env.SORA_PROMPT ??
    "Realistic premium water delivery video in Gaborone/Botswana campus-home setting, no visible faces or identifiable people, close-up of sealed bottled water packs and refill containers being placed neatly at a doorstep, fresh morning light, clean blue/aqua brand mood, smooth slow tracking camera, trustworthy local delivery service, no text overlays, no logos."
};

async function loadDotEnv() {
  const envPath = resolve(projectRoot, ".env");

  try {
    const text = await readFile(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const rawValue = trimmed.slice(index + 1).trim();
      const value = rawValue.replace(/^["']|["']$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function requireApiKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to your shell environment or local .env file, then rerun `npm run generate:delivery-video`."
    );
  }

  return process.env.OPENAI_API_KEY;
}

async function openaiFetch(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed (${response.status} ${response.statusText}): ${body}`);
  }

  return response;
}

async function createVideo() {
  const body = new FormData();
  body.set("model", config.model);
  body.set("prompt", config.prompt);
  body.set("seconds", config.seconds);
  body.set("size", config.size);

  const response = await openaiFetch("/videos", {
    method: "POST",
    body
  });

  return response.json();
}

async function retrieveVideo(videoId) {
  const response = await openaiFetch(`/videos/${videoId}`);
  return response.json();
}

async function downloadVideo(videoId) {
  const response = await openaiFetch(`/videos/${videoId}/content?variant=video`);
  const arrayBuffer = await response.arrayBuffer();

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.from(arrayBuffer));
}

async function waitForCompletion(videoId) {
  const startedAt = Date.now();
  const timeoutMs = Number(process.env.SORA_TIMEOUT_MS ?? 15 * 60 * 1000);
  const intervalMs = Number(process.env.SORA_POLL_INTERVAL_MS ?? 10 * 1000);

  while (Date.now() - startedAt < timeoutMs) {
    const video = await retrieveVideo(videoId);
    const progress = typeof video.progress === "number" ? ` (${video.progress}% complete)` : "";
    console.log(`Sora job ${video.id}: ${video.status}${progress}`);

    if (video.status === "completed") {
      return video;
    }

    if (video.status === "failed") {
      const message = video.error?.message ?? "Unknown Sora generation failure.";
      throw new Error(message);
    }

    await new Promise((resolveTimer) => setTimeout(resolveTimer, intervalMs));
  }

  throw new Error(`Timed out waiting for Sora job ${videoId}.`);
}

await loadDotEnv();
requireApiKey();

console.log("Creating Fresh Water Market delivery video with Sora...");
console.log(`Model: ${config.model}; size: ${config.size}; seconds: ${config.seconds}`);

const created = await createVideo();
const video = await waitForCompletion(created.id);
await downloadVideo(video.id);

console.log(`Saved ${outputPath}`);
