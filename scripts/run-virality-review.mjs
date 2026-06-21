/**
 * Run virality analysis on social clips when Higgsfield credits are available.
 *
 * In Cursor chat, use:
 *   /higgs Score campus-refill-9x16.mp4 for TikTok engagement
 *   /higgs Score fast-order-9x16.mp4 for engagement
 *   /higgs Score corporate-branded-9x16.mp4 for engagement
 *
 * Clips live in public/brand/social/
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const socialDir = join(__dirname, "..", "public", "brand", "social");

const clips = [
  { file: "campus-refill-9x16.mp4", concept: "Campus refill at UB pickup" },
  { file: "fast-order-9x16.mp4", concept: "Fast phone order to delivery" },
  { file: "corporate-branded-9x16.mp4", concept: "Corporate branded bottles" }
];

console.log("Social clips ready for virality review:\n");
for (const clip of clips) {
  console.log(`- ${join(socialDir, clip.file)}`);
  console.log(`  Concept: ${clip.concept}`);
  console.log(`  Command: /higgs Score ${clip.file} for engagement and hook strength\n`);
}

console.log("Note: virality_predictor requires Higgsfield credits and uploading each clip via media_upload.");
