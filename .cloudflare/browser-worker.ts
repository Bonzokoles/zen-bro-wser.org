/**
 * ZENO Browser Rendering Worker
 * Uses Cloudflare Browser Rendering API (OFFICIAL METHOD)
 * 100% ToS compliant, recommended for production
 * 
 * Pricing: $5/million browser requests + $0.50/CPU hour
 * Docs: https://developers.cloudflare.com/browser-rendering/
 */

import Puppeteer from '@cloudflare/puppeteer';

export interface Env {
  BROWSER: Fetcher; // Browser binding from wrangler.toml
  CACHE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Target-URL',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    const targetUrl = url.searchParams.get('url');
    const action = url.searchParams.get('action') || 'screenshot'; // screenshot | pdf | html
    
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing target URL' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Check cache
    const cacheKey = `browser:${action}:${targetUrl}`;
    const cached = await env.CACHE.get(cacheKey, 'arrayBuffer');
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': action === 'pdf' ? 'application/pdf' : 
                         action === 'screenshot' ? 'image/png' : 'text/html',
          'X-Cache': 'HIT',
          ...corsHeaders,
        },
      });
    }
    
    try {
      // Launch browser
      const browser = await Puppeteer.launch(env.BROWSER);
      const page = await browser.newPage();
      
      // Navigate to target
      await page.goto(targetUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });
      
      let result: Buffer;
      let contentType: string;
      
      // Perform action
      switch (action) {
        case 'screenshot':
          result = await page.screenshot({ 
            fullPage: true,
            type: 'png',
          }) as Buffer;
          contentType = 'image/png';
          break;
          
        case 'pdf':
          result = await page.pdf({
            format: 'A4',
            printBackground: true,
          }) as Buffer;
          contentType = 'application/pdf';
          break;
          
        case 'html':
        default:
          const html = await page.content();
          result = Buffer.from(html, 'utf-8');
          contentType = 'text/html';
          break;
      }
      
      await browser.close();
      
      // Cache result (5 minutes)
      await env.CACHE.put(cacheKey, result, { expirationTtl: 300 });
      
      return new Response(result, {
        headers: {
          'Content-Type': contentType,
          'X-Cache': 'MISS',
          'X-Target-URL': targetUrl,
          ...corsHeaders,
        },
      });
      
    } catch (error: any) {
      console.error('Browser rendering error:', error);
      
      return new Response(
        JSON.stringify({ 
          error: 'Browser rendering failed',
          message: error.message,
          target: targetUrl,
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }
  },
};
