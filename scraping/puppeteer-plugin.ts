/**
 * ZENO Browser - Puppeteer Plugin
 * Server-side browser automation (Node.js only)
 * Install: npm install puppeteer
 */

// This runs in Node.js/server environments only

export interface PuppeteerConfig {
  headless?: boolean;
  timeout?: number;
  userAgent?: string;
  viewport?: { width: number; height: number };
  args?: string[];
}

export interface ScrapeResult {
  url: string;
  title: string;
  html: string;
  text: string;
  screenshot?: Buffer;
  links: string[];
}

// Dynamic import for Node.js only
export async function createPuppeteerScraper(config: PuppeteerConfig = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let puppeteer: any;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    throw new Error('Puppeteer not installed. Run: npm install puppeteer');
  }
  
  const browser = await puppeteer.default.launch({
    headless: config.headless ?? true,
    args: config.args ?? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  return {
    async scrape(url: string, options: { screenshot?: boolean; selector?: string } = {}): Promise<ScrapeResult> {
      const page = await browser.newPage();
      try {
        await page.setUserAgent(config.userAgent ?? 'ZENO-Browser/0.2.0');
        await page.setViewport(config.viewport ?? { width: 1280, height: 720 });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: config.timeout ?? 30000 });
        
        const title = await page.title();
        const html = await page.content();
        const text = await page.evaluate(() => document.body.innerText);
        const links = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a[href]'))
            .map((a) => (a as HTMLAnchorElement).href)
            .filter((h) => h.startsWith('http'))
        );
        
        let screenshot: Buffer | undefined;
        if (options.screenshot) {
          screenshot = await page.screenshot({ fullPage: true }) as Buffer;
        }
        
        return { url, title, html, text, screenshot, links };
      } finally {
        await page.close();
      }
    },
    
    async close() {
      await browser.close();
    },
  };
}
