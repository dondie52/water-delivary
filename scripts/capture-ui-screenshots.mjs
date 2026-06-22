import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "playwright";

const OUT_DIR = path.join(process.cwd(), "screenshots", "ui-compare");
const LOCAL_URL = process.env.LOCAL_URL ?? "http://localhost:3000/order";

const targets = [
  {
    name: "reference-water-com",
    url: "https://www.water.com/start-water-delivery/",
    optional: true
  },
  {
    name: "local-order",
    url: LOCAL_URL,
    optional: false
  }
];

const viewports = [
  { suffix: "desktop", width: 1440, height: 900 },
  { suffix: "mobile", ...devices["iPhone 13"].viewport, isMobile: true }
];

async function preparePage(page) {
  const consent = page.getByRole("button", { name: /accept|agree|allow|got it/i }).first();
  if (await consent.isVisible({ timeout: 2000 }).catch(() => false)) {
    await consent.click();
  }
  await page.locator("h1").filter({ hasText: /choose your water/i }).first().waitFor({ timeout: 45_000 });
  await page
    .getByRole("button", { name: /^add$/i })
    .first()
    .waitFor({ timeout: 30_000 })
    .catch(() => undefined);
  await page.waitForTimeout(800);
}

async function capture() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const viewport of viewports) {
    for (const target of targets) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.isMobile ?? false,
        deviceScaleFactor: viewport.isMobile ? 2 : 1,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      });
      const page = await context.newPage();

      try {
        const response = await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        if (!response?.ok() && !target.optional) {
          throw new Error(`HTTP ${response?.status() ?? "unknown"}`);
        }
        await preparePage(page);

        const filePath = path.join(OUT_DIR, `${target.name}-${viewport.suffix}.png`);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`Saved ${filePath}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (target.optional) {
          console.warn(`Skipped ${target.name} (${viewport.suffix}): ${message}`);
        } else {
          throw error;
        }
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();
  console.log(`\nScreenshots in ${OUT_DIR}`);
}

capture().catch((error) => {
  console.error(error);
  process.exit(1);
});
