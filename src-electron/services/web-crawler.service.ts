import { BrowserWindow, ipcMain } from 'electron';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { tavily } from '@tavily/core';

export interface CrawlerResult {
  url: string;
  title: string;
  markdown: string;
  links: string[];
  error?: string;
}

export class WebCrawlerService {
  private tvly: any;

  constructor() {
    // Tavily API key should ideally come from env/local config, using a placeholder/empty string until configured
    this.tvly = tavily({ apiKey: process.env.TAVILY_API_KEY || 'PLACEHOLDER' });
    this.setupIPC();
  }

  /**
   * Deep Search using Tavily (Optimized for AI/RAG)
   */
  async deepSearch(query: string, searchDepth: 'basic' | 'advanced' = 'basic') {
    try {
      console.log(`🔍 [Crawler] Deep searching for: ${query}`);
      const response = await this.tvly.search(query, {
        searchDepth,
        includeImages: false,
        includeAnswer: true,
        includeRawContent: false,
        maxResults: 10,
      });
      return response;
    } catch (error: any) {
      console.error('❌ [Crawler] Deep search failed:', error.message);
      throw new Error(`Tavily search failed: ${error.message}`);
    }
  }

  /**
   * Extract content from a specific URL using raw HTTP or Headless render
   */
  async extractContent(url: string, useRender: boolean = false): Promise<CrawlerResult> {
    console.log(`🕸️ [Crawler] Extracting content from: ${url} (Render: ${useRender})`);
    try {
      if (useRender) {
        return await this.extractWithBrowserWindow(url);
      } else {
        return await this.extractWithAxios(url);
      }
    } catch (error: any) {
      console.error(`❌ [Crawler] Extraction failed for ${url}:`, error.message);
      return {
        url,
        title: '',
        markdown: '',
        links: [],
        error: error.message,
      };
    }
  }

  private async extractWithAxios(url: string): Promise<CrawlerResult> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ZENO/1.0',
      },
      timeout: 15000,
    });
    return this.parseHtml(url, response.data);
  }

  private extractWithBrowserWindow(url: string): Promise<CrawlerResult> {
    return new Promise((resolve, reject) => {
      let win: BrowserWindow | null = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          offscreen: true, // Use offscreen rendering for max stealth/performance
        },
      });

      const timeout = setTimeout(() => {
        if (win) {
          win.destroy();
          reject(new Error('Browser extraction timeout (30s)'));
        }
      }, 30000);

      win.webContents.on('did-finish-load', async () => {
        try {
          // Wait a bit for async JS to populate the DOM
          await new Promise(r => setTimeout(r, 2000));
          
          if (!win) return;
          const html = await win.webContents.executeJavaScript('document.documentElement.outerHTML');
          clearTimeout(timeout);
          resolve(this.parseHtml(url, html));
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        } finally {
          if (win) {
            win.destroy();
            win = null;
          }
        }
      });

      win.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load URL: ${errorDescription} (${errorCode})`));
        if (win) {
          win.destroy();
          win = null;
        }
      });

      win.loadURL(url);
    });
  }

  private parseHtml(sourceUrl: string, html: string): CrawlerResult {
    const $ = cheerio.load(html);

    // Remove scripts, styles, metadata
    $('script, style, link, meta, noscript, header, footer, nav, iframe').remove();

    const title = $('title').text().trim() || 'Untitled';
    
    // Extract main text (simplified markdown-like)
    // In a production scenario, we could use turndown or readability.js
    const bodyText = $('body').text()
      .replace(/\s+/g, ' ')
      .trim();

    // Extract links
    const links: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith('http')) {
        links.push(href);
      } else if (href && href.startsWith('/')) {
        try {
          const absoluteUrl = new URL(href, sourceUrl).href;
          links.push(absoluteUrl);
        } catch { /* ignore bad URLs */ }
      }
    });

    return {
      url: sourceUrl,
      title,
      markdown: bodyText, // basic text for now
      links: Array.from(new Set(links)).slice(0, 50), // unique top 50 links
    };
  }

  private setupIPC() {
    ipcMain.handle('crawler:search', async (_, query: string, depth: 'basic' | 'advanced') => {
      return this.deepSearch(query, depth);
    });

    ipcMain.handle('crawler:extract', async (_, url: string, useRender: boolean) => {
      return this.extractContent(url, useRender);
    });
  }
}
