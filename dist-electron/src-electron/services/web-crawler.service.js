"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebCrawlerService = void 0;
const electron_1 = require("electron");
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const core_1 = require("@tavily/core");
class WebCrawlerService {
    constructor() {
        // Tavily API key should ideally come from env/local config, using a placeholder/empty string until configured
        this.tvly = (0, core_1.tavily)({ apiKey: process.env.TAVILY_API_KEY || 'PLACEHOLDER' });
        this.setupIPC();
    }
    /**
     * Deep Search using Tavily (Optimized for AI/RAG)
     */
    async deepSearch(query, searchDepth = 'basic') {
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
        }
        catch (error) {
            console.error('❌ [Crawler] Deep search failed:', error.message);
            throw new Error(`Tavily search failed: ${error.message}`);
        }
    }
    /**
     * Extract content from a specific URL using raw HTTP or Headless render
     */
    async extractContent(url, useRender = false) {
        console.log(`🕸️ [Crawler] Extracting content from: ${url} (Render: ${useRender})`);
        try {
            if (useRender) {
                return await this.extractWithBrowserWindow(url);
            }
            else {
                return await this.extractWithAxios(url);
            }
        }
        catch (error) {
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
    async extractWithAxios(url) {
        const response = await axios_1.default.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ZENO/1.0',
            },
            timeout: 15000,
        });
        return this.parseHtml(url, response.data);
    }
    extractWithBrowserWindow(url) {
        return new Promise((resolve, reject) => {
            let win = new electron_1.BrowserWindow({
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
                    if (!win)
                        return;
                    const html = await win.webContents.executeJavaScript('document.documentElement.outerHTML');
                    clearTimeout(timeout);
                    resolve(this.parseHtml(url, html));
                }
                catch (err) {
                    clearTimeout(timeout);
                    reject(err);
                }
                finally {
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
    parseHtml(sourceUrl, html) {
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
        const links = [];
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('http')) {
                links.push(href);
            }
            else if (href && href.startsWith('/')) {
                try {
                    const absoluteUrl = new URL(href, sourceUrl).href;
                    links.push(absoluteUrl);
                }
                catch { /* ignore bad URLs */ }
            }
        });
        return {
            url: sourceUrl,
            title,
            markdown: bodyText, // basic text for now
            links: Array.from(new Set(links)).slice(0, 50), // unique top 50 links
        };
    }
    setupIPC() {
        electron_1.ipcMain.handle('crawler:search', async (_, query, depth) => {
            return this.deepSearch(query, depth);
        });
        electron_1.ipcMain.handle('crawler:extract', async (_, url, useRender) => {
            return this.extractContent(url, useRender);
        });
    }
}
exports.WebCrawlerService = WebCrawlerService;
