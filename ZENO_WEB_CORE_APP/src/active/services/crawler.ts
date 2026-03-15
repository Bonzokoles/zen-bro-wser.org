/**
 * ZENO Browser Crawler Service
 * Web crawling with Cheerio (client-side HTML parsing)
 */

export interface CrawlResult {
  url: string;
  title: string;
  description: string;
  links: string[];
  images: string[];
  text: string;
  headings: string[];
  metadata: Record<string, string>;
  crawledAt: Date;
}

export interface CrawlOptions {
  maxDepth?: number;
  followLinks?: boolean;
  extractImages?: boolean;
  extractMetadata?: boolean;
  selector?: string;
}

export class CrawlerService {
  async parseHTML(html: string, baseUrl: string): Promise<CrawlResult> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const title = doc.title || doc.querySelector('h1')?.textContent || '';
    const description = 
      doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
      doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    
    const links = Array.from(doc.querySelectorAll('a[href]'))
      .map((a) => {
        try { return new URL((a as HTMLAnchorElement).href, baseUrl).href; } catch { return ''; }
      })
      .filter((href) => href.startsWith('http'));
    
    const images = Array.from(doc.querySelectorAll('img[src]'))
      .map((img) => {
        try { return new URL((img as HTMLImageElement).src, baseUrl).href; } catch { return ''; }
      })
      .filter(Boolean);
    
    const text = doc.body?.innerText || '';
    const headings = Array.from(doc.querySelectorAll('h1,h2,h3'))
      .map((h) => h.textContent?.trim() || '');
    
    const metadata: Record<string, string> = {};
    doc.querySelectorAll('meta[name], meta[property]').forEach((meta) => {
      const key = meta.getAttribute('name') || meta.getAttribute('property') || '';
      const value = meta.getAttribute('content') || '';
      if (key && value) metadata[key] = value;
    });

    return {
      url: baseUrl,
      title: title.trim(),
      description: description.trim(),
      links: [...new Set(links)],
      images: [...new Set(images)],
      text: text.trim().slice(0, 5000),
      headings: headings.filter(Boolean),
      metadata,
      crawledAt: new Date(),
    };
  }

  extractStructuredData(html: string): object[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const results: object[] = [];
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      try { results.push(JSON.parse(script.textContent || '')); } catch { /* skip */ }
    });
    return results;
  }
}

export const crawlerService = new CrawlerService();
