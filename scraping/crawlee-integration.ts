/**
 * ZENO Browser - Crawlee Integration
 * High-performance web crawling (Node.js only)
 * Install: npm install crawlee
 */

export interface CrawleeConfig {
  maxConcurrency?: number;
  maxRequestsPerCrawl?: number;
  maxDepth?: number;
  requestHandlerTimeoutSecs?: number;
}

export interface CrawledPage {
  url: string;
  title: string;
  text: string;
  links: string[];
  metadata: Record<string, string>;
}

export async function createCrawlee(config: CrawleeConfig = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let crawlee: any;
  try {
    crawlee = await import('crawlee');
  } catch {
    throw new Error('Crawlee not installed. Run: npm install crawlee');
  }

  const results: CrawledPage[] = [];

  const crawler = new crawlee.CheerioCrawler({
    maxConcurrency: config.maxConcurrency ?? 5,
    maxRequestsPerCrawl: config.maxRequestsPerCrawl ?? 100,
    requestHandlerTimeoutSecs: config.requestHandlerTimeoutSecs ?? 30,
    async requestHandler({ request, $, enqueueLinks }: { request: { url: string }, $: any, enqueueLinks: any }) {
      const title = $('title').text().trim();
      const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 2000);
      const links: string[] = [];
      $('a[href]').each((_: number, el: any) => {
        const href = $(el).attr('href');
        if (href?.startsWith('http')) links.push(href);
      });
      const metadata: Record<string, string> = {};
      $('meta[name], meta[property]').each((_: number, el: any) => {
        const k = $(el).attr('name') || $(el).attr('property');
        const v = $(el).attr('content');
        if (k && v) metadata[k] = v;
      });
      results.push({ url: request.url, title, text, links, metadata });
      if (config.maxDepth) await enqueueLinks();
    },
  });

  return {
    async crawl(urls: string[]): Promise<CrawledPage[]> {
      await crawler.run(urls);
      return [...results];
    },
    getResults() {
      return [...results];
    },
  };
}
