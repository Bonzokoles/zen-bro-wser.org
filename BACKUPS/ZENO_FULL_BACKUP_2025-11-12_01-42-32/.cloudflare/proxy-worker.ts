/**
 * ZENO Iframe Proxy - Cloudflare Worker
 * Proxies websites to bypass X-Frame-Options restrictions
 * 
 * LEGAL COMPLIANCE:
 * - Uses Cloudflare Workers fetch API (allowed)
 * - Modifies headers for iframe embedding (grey area)
 * - Alternative: Use Browser Rendering API for full compliance
 */

export interface Env {
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
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Get target URL from query param or header
    const targetUrl = url.searchParams.get('url') || request.headers.get('X-Target-URL');
    
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing target URL. Use ?url= parameter or X-Target-URL header' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }
    
    // Validate URL
    let target: URL;
    try {
      target = new URL(targetUrl);
      if (!['http:', 'https:'].includes(target.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }
    
    // Check cache
    const cacheKey = `proxy:${targetUrl}`;
    const cached = await env.CACHE.get(cacheKey, 'stream');
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'text/html',
          'X-Proxy-Cache': 'HIT',
          ...corsHeaders,
        },
      });
    }
    
    try {
      // Fetch target URL
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'ZENO-Browser-Proxy/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      // Get response body
      const body = await response.text();
      
      // Modify HTML to work in iframe
      const modifiedHtml = injectIframeCompatibility(body, targetUrl);
      
      // Prepare response headers
      const headers = new Headers(corsHeaders);
      headers.set('Content-Type', 'text/html; charset=utf-8');
      headers.set('X-Proxy-Cache', 'MISS');
      headers.set('X-Target-URL', targetUrl);
      
      // Remove problematic headers
      headers.delete('X-Frame-Options');
      headers.delete('Content-Security-Policy');
      headers.delete('X-Content-Type-Options');
      
      // Cache for 5 minutes
      await env.CACHE.put(cacheKey, modifiedHtml, { expirationTtl: 300 });
      
      return new Response(modifiedHtml, { headers });
      
    } catch (error: any) {
      console.error('Proxy error:', error);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch target URL',
          message: error.message,
          target: targetUrl,
        }),
        { 
          status: 502, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }
  },
};

/**
 * Inject compatibility scripts for iframe embedding
 */
function injectIframeCompatibility(html: string, targetUrl: string): string {
  // Fix relative URLs
  const baseTag = `<base href="${targetUrl}">`;
  
  // Inject compatibility script
  const script = `
    <script>
      // Prevent page from breaking out of iframe
      (function() {
        // Disable top-level navigation
        if (window.top !== window.self) {
          window.top = window.self;
          window.parent = window.self;
        }
        
        // Intercept form submissions
        document.addEventListener('submit', function(e) {
          if (e.target.target === '_top' || e.target.target === '_parent') {
            e.target.target = '_self';
          }
        }, true);
        
        // Intercept link clicks
        document.addEventListener('click', function(e) {
          const link = e.target.closest('a');
          if (link && (link.target === '_top' || link.target === '_parent')) {
            link.target = '_self';
          }
        }, true);
        
        console.log('ZENO Proxy: Iframe compatibility injected');
      })();
    </script>
  `;
  
  // Insert base tag and script
  let modified = html;
  
  // Add base tag after <head>
  if (/<head[^>]*>/i.test(modified)) {
    modified = modified.replace(/<head[^>]*>/i, (match) => match + baseTag);
  } else {
    modified = baseTag + modified;
  }
  
  // Add script before </body> or at end
  if (/<\/body>/i.test(modified)) {
    modified = modified.replace(/<\/body>/i, script + '</body>');
  } else {
    modified += script;
  }
  
  return modified;
}
