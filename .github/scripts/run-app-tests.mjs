/**
 * Headless runner for runTests.html (CI only — no app package.json).
 *
 * Expects a static server at BASE_URL (default http://127.0.0.1:4173).
 * Opens ?impl=js and ?impl=wasm; fails if window.__DIM_TEST__.failed > 0.
 *
 * Playwright is resolved from node_modules, or from NODE_PATH (CI installs
 * into a throwaway directory so this repo stays package.json-free).
 */
import { createRequire } from "node:module";
import { join } from "node:path";

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch (err) {
    const nodePath = process.env.NODE_PATH;
    if (!nodePath) throw err;
    const require = createRequire(join(nodePath, "playwright/package.json"));
    return require("playwright");
  }
}

const { chromium } = await loadPlaywright();

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";
const TIMEOUT_MS = Number(process.env.DIM_TEST_TIMEOUT_MS || 120000);

async function runImpl(browser, impl) {
  const url = `${BASE}/runTests.html?impl=${impl}`;
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error(`[console.${impl}]`, msg.text());
    }
  });

  console.log(`Opening ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });

  const summary = await page
    .waitForFunction(
      () => {
        const s = window.__DIM_TEST__;
        return s && s.done ? s : null;
      },
      { timeout: TIMEOUT_MS },
    )
    .then((h) => h.jsonValue());

  if (pageErrors.length) {
    console.error(`Page errors (${impl}):`, pageErrors);
  }

  console.log(
    `[${impl}] ${summary.passed} passed, ${summary.failed} failed (of ${summary.results.length})`,
  );
  for (const r of summary.results) {
    console.log(`  ${r.ok ? "PASS" : "FAIL"} ${r.name}`);
    if (!r.ok && r.error) console.log(`    ${r.error.split("\n")[0]}`);
  }

  await page.close();

  if (pageErrors.length) {
    throw new Error(`${impl}: ${pageErrors.length} uncaught page error(s)`);
  }
  if (summary.failed > 0) {
    throw new Error(`${impl}: ${summary.failed} test(s) failed`);
  }
  return summary;
}

const browser = await chromium.launch();
try {
  await runImpl(browser, "js");
  await runImpl(browser, "wasm");
  console.log("All DimTest runs passed.");
} finally {
  await browser.close();
}
