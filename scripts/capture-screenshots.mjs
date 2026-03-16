/**
 * Capture the README screenshots.
 *
 *   docker compose up -d --build
 *   npx playwright install chromium   # once
 *   npm run screenshots
 *   docker compose down -v
 *
 * The app must be running in demo mode (which `docker compose up` does by
 * default), so the data behind every shot is the seeded fixture set and the
 * images are reproducible rather than a snapshot of whatever happened to be
 * in a database that day.
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:8140';
const OUT_DIR = path.resolve('docs/screenshots');
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const shots = [
  {
    file: '01-rental-analyzer.png',
    path: '/rental-analyzer',
    settle: async (page) => {
      await page.getByRole('heading', { name: 'Rental analyzer' }).waitFor();
      await page.getByRole('button', { name: /generate/i }).click();
      await page.getByText(/properties match/i).waitFor();
      await page.waitForTimeout(400);
    },
  },
  {
    file: '02-lease-review.png',
    path: '/lease/41/documents/911/notes',
    settle: async (page) => {
      await page.getByRole('heading', { name: 'Initial analysis' }).waitFor();
      await page.getByText('Can I sublet this unit on a nightly basis?').waitFor();
      await page.waitForTimeout(300);
    },
  },
  {
    file: '03-regulations.png',
    path: '/regulations',
    settle: async (page) => {
      await page.getByRole('heading', { name: 'Regulation searches' }).waitFor();
      await page.getByText('Kirkland, WA').first().waitFor();
      await page.waitForTimeout(300);
    },
  },
  {
    file: '04-admin-user-form.png',
    path: '/dashboard',
    settle: async (page) => {
      await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
      await page.getByText('priya.nair@bnbu.example').waitFor();
      // Open the edit dialog on a real row, so the shot shows a populated
      // table behind a filled-in form.
      await page
        .getByRole('row', { name: /priya\.nair/ })
        .getByRole('button', { name: 'Edit' })
        .click();
      await page.getByRole('dialog').waitFor();
      await page.waitForTimeout(300);
    },
  },
  {
    file: '05-regulation-answer.png',
    path: '/regulation/17/chat',
    settle: async (page) => {
      await page.getByRole('heading', { name: 'Kirkland, WA' }).waitFor();
      await page.getByRole('button', { name: 'Look again' }).waitFor();
      await page.waitForTimeout(300);
    },
  },
  {
    file: '06-mobile-rental-analyzer.png',
    path: '/rental-analyzer',
    viewport: MOBILE,
    settle: async (page) => {
      await page.getByRole('heading', { name: 'Rental analyzer' }).waitFor();
      await page.waitForTimeout(400);
    },
  },
  {
    file: '07-mobile-regulations.png',
    path: '/regulations',
    viewport: MOBILE,
    settle: async (page) => {
      await page.getByRole('heading', { name: 'Regulation searches' }).waitFor();
      await page.getByText('Kirkland, WA').first().waitFor();
      await page.waitForTimeout(300);
    },
  },
];

const signIn = async (page) => {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard');
};

const capture = async (page, file) => {
  // Park the pointer, or a tap from signing in leaves a chart tooltip open.
  await page.mouse.move(0, 0);
  const target = path.join(OUT_DIR, file);
  await page.screenshot({ path: target });
  console.log(`wrote ${target}`);
};

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  // One signed-in context per viewport; the demo session lives in its
  // localStorage, so each signs in once.
  const pages = new Map();
  const pageFor = async (viewport) => {
    const key = `${viewport.width}x${viewport.height}`;
    if (!pages.has(key)) {
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      if (viewport === DESKTOP) {
        // The login screen is the one shot taken before signing in.
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        await page.getByRole('heading', { name: 'Log in' }).waitFor();
        await capture(page, '00-login.png');
      }
      await signIn(page);
      pages.set(key, page);
    }
    return pages.get(key);
  };

  for (const shot of shots) {
    const page = await pageFor(shot.viewport ?? DESKTOP);
    await page.goto(`${BASE_URL}${shot.path}`, { waitUntil: 'networkidle' });
    await shot.settle(page);
    await capture(page, shot.file);
  }

  await browser.close();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
