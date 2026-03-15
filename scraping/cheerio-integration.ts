/**
 * ZENO Browser - Cheerio Integration
 * Client-side HTML parsing (DOMParser-based, browser compatible)
 * For Node.js usage, install: npm install cheerio
 */

export interface ParsedElement {
  tag: string;
  attrs: Record<string, string>;
  text: string;
  html: string;
  children: ParsedElement[];
}

export function parseHTML(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  return {
    select(selector: string) {
      return Array.from(doc.querySelectorAll(selector)).map((el) => ({
        text: () => el.textContent?.trim() || '',
        html: () => el.innerHTML,
        attr: (name: string) => el.getAttribute(name) || '',
        find: (s: string) => Array.from(el.querySelectorAll(s)),
      }));
    },
    title: () => doc.title,
    body: () => doc.body?.innerHTML || '',
    meta: (name: string) => doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '',
  };
}

export function extractLinks(html: string, baseUrl: string): string[] {
  const $ = parseHTML(html);
  return $.select('a[href]')
    .map((el) => {
      try {
        return new URL(el.attr('href'), baseUrl).href;
      } catch {
        return '';
      }
    })
    .filter((href) => href.startsWith('http'));
}

export function extractText(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  ['script', 'style', 'nav', 'footer'].forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  });
  return doc.body?.innerText?.trim().replace(/\s+/g, ' ') || '';
}

export function extractImages(html: string, baseUrl: string): string[] {
  const $ = parseHTML(html);
  return $.select('img[src]')
    .map((el) => {
      try {
        return new URL(el.attr('src'), baseUrl).href;
      } catch {
        return '';
      }
    })
    .filter((src) => src.startsWith('http'));
}

// Node.js usage example (requires npm install cheerio):
/*
import * as cheerio from 'cheerio';
export function serverParseHTML(html: string) {
  const $ = cheerio.load(html);
  return $;
}
*/
