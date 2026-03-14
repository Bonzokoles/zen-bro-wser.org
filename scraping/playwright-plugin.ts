/**
 * ZENO Browser - Playwright Plugin
 * Cross-browser automation (Node.js only)
 * Install: npm install playwright
 */

export interface PlaywrightConfig {
  browser?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  timeout?: number;
  viewport?: { width: number; height: number };
}

export interface PageData {
  url: string;
  title: string;
  html: string;
  text: string;
  screenshot?: Buffer;
  pdf?: Buffer;
  links: string[];
  images: string[];
  metadata: Record<string, string>;
}

export async function createPlaywrightScraper(config: PlaywrightConfig = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let playwright: any;
  try {
    playwright = await import('playwright');
  } catch {
    throw new Error('Playwright not installed. Run: npm install playwright && npx playwright install');
  }

  const browserType = config.browser ?? 'chromium';
  const browser = await playwright[browserType].launch({ headless: config.headless ?? true });
  const context = await browser.newContext({
    viewport: config.viewport ?? { width: 1280, height: 720 },
    userAgent: 'ZENO-Browser/0.2.0 Playwright',
  });

  return {
    async scrape(url: string, options: { screenshot?: boolean; pdf?: boolean } = {}): Promise<PageData> {
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: config.timeout ?? 30000 });
        
        const title = await page.title();
        const html = await page.content();
        const text = await page.evaluate(() => document.body.innerText);
        const links = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a[href]')).map((a: Element) => (a as HTMLAnchorElement).href)
        );
        const images = await page.evaluate(() =>
          Array.from(document.querySelectorAll('img[src]')).map((i: Element) => (i as HTMLImageElement).src)
        );
        const metadata = await page.evaluate(() => {
          const result: Record<string, string> = {};
          document.querySelectorAll('meta[name], meta[property]').forEach((m) => {
            const k = m.getAttribute('name') || m.getAttribute('property') || '';
            const v = m.getAttribute('content') || '';
            if (k && v) result[k] = v;
          });
          return result;
        });

        let screenshot: Buffer | undefined;
        if (options.screenshot) screenshot = await page.screenshot({ fullPage: true }) as Buffer;
        
        let pdf: Buffer | undefined;
        if (options.pdf && browserType === 'chromium') {
          pdf = await page.pdf({ format: 'A4' }) as Buffer;
        }

        return { url, title, html, text, screenshot, pdf, links, images, metadata };
      } finally {
        await page.close();
      }
    },

    async close() {
      await context.close();
      await browser.close();
    },
  };
}
