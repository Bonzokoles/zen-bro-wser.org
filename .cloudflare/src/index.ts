/**
 * ZENO Browser - Cloudflare Worker API
 * Entry point dla backend API
 */

// Stripe removed - incompatible with Workers runtime
// Use Stripe REST API with fetch() instead of SDK

export interface Env {
  DB: any; // D1Database
  CACHE: any; // KVNamespace
  AI: any; // Cloudflare Workers AI
  BIELIK_AGENTS: any; // Fetcher - Service binding to BIELIK agent system
  GEMINI_API_KEY: string;
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_MONTHLY?: string;
  STRIPE_PRICE_YEARLY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Router
    try {
      let response: Response;

      // Admin API - Sites CRUD
      if (url.pathname === '/api/admin/sites') {
        response = await handleAdminSites(request, env);
      }
      // Admin API - Sites by ID (PUT/DELETE)
      else if (url.pathname.match(/^\/api\/admin\/sites\/\d+$/)) {
        response = await handleAdminSiteById(request, env);
      }
      // Admin API - Users
      else if (url.pathname === '/api/admin/users') {
        response = await handleAdminUsers(request, env);
      }
      // Public API - Search
      else if (url.pathname === '/api/iframe/sites') {
        response = await handleSearch(request, env);
      }
      // AI Assistant
      else if (url.pathname === '/api/ai-assistant' && request.method === 'POST') {
        response = await handleAI(request, env);
      }
      // BIELIK Agents - Proxy to agent system
      else if (url.pathname.startsWith('/api/agents/')) {
        response = await handleBielikAgents(request, env);
      }
      // Analytics - Get stats
      else if (url.pathname === '/api/stats' && request.method === 'GET') {
        response = await handleStats(request, env);
      }
      // Stripe - Checkout (TODO: Implement with Stripe REST API)
      else if (url.pathname === '/api/checkout' && request.method === 'POST') {
        response = Response.json({
          error: 'Stripe checkout not implemented yet - use REST API',
          todo: 'Implement with fetch() to Stripe API'
        }, { status: 501 });
      }
      // Stripe - Webhook (TODO: Implement with Stripe REST API)
      else if (url.pathname === '/api/webhook' && request.method === 'POST') {
        response = Response.json({
          error: 'Stripe webhooks not implemented yet',
          todo: 'Verify signature and handle events with fetch()'
        }, { status: 501 });
      }
      // Revenue - Statistics (TODO: Implement with KV data)
      else if (url.pathname === '/api/revenue-stats' && request.method === 'GET') {
        response = Response.json({
          error: 'Revenue stats not implemented yet',
          todo: 'Calculate from KV purchase data'
        }, { status: 501 });
      }
      // Health check
      else if (url.pathname === '/health') {
        response = Response.json({ status: 'ok', timestamp: Date.now() });
      }
      // Not found
      else {
        response = Response.json({ error: 'Not Found' }, { status: 404 });
      }

      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      console.error('Worker error:', error);
      return Response.json(
        { error: 'Internal Server Error', message: error.message },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};

// ============================================
// ADMIN API - Sites CRUD
// ============================================

async function handleAdminSites(request: Request, env: Env): Promise<Response> {
  const { DB } = env;

  // GET - List all sites
  if (request.method === 'GET') {
    const sites = await DB.prepare(`
      SELECT * FROM sites ORDER BY added_at DESC
    `).all();

    return Response.json({
      success: true,
      data: sites.results,
      count: sites.results.length,
    });
  }

  // POST - Create new site
  if (request.method === 'POST') {
    const body = await request.json<any>();

    // Validation
    if (!body.name || !body.url) {
      return Response.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    // Insert
    const result = await DB.prepare(`
      INSERT INTO sites (name, url, category, description, sandbox, height, iframe_allowed, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.name,
      body.url,
      body.category || null,
      body.description || null,
      body.sandbox || 'allow-scripts allow-same-origin',
      body.height || 500,
      body.iframeAllowed !== false ? 1 : 0,
      body.tags ? JSON.stringify(body.tags) : null
    ).run();

    // Get created site
    const created = await DB.prepare('SELECT * FROM sites WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    return Response.json(
      { success: true, data: created },
      { status: 201 }
    );
  }

  return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
}

// ============================================
// ADMIN API - Sites by ID (PUT/DELETE)
// ============================================

async function handleAdminSiteById(request: Request, env: Env): Promise<Response> {
  const { DB } = env;
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  // PUT - Update site
  if (request.method === 'PUT') {
    const body = await request.json<any>();

    // Build UPDATE query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      values.push(body.name);
    }
    if (body.url !== undefined) {
      updates.push('url = ?');
      values.push(body.url);
    }
    if (body.category !== undefined) {
      updates.push('category = ?');
      values.push(body.category);
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
    }
    if (body.iframeAllowed !== undefined) {
      updates.push('iframe_allowed = ?');
      values.push(body.iframeAllowed ? 1 : 0);
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);

    await DB.prepare(`
      UPDATE sites SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    // Get updated site
    const updated = await DB.prepare('SELECT * FROM sites WHERE id = ?')
      .bind(id)
      .first();

    return Response.json({ success: true, data: updated });
  }

  // DELETE - Remove site
  if (request.method === 'DELETE') {
    await DB.prepare('DELETE FROM sites WHERE id = ?')
      .bind(id)
      .run();

    return Response.json({
      success: true,
      message: 'Site deleted successfully',
    });
  }

  return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
}

// ============================================
// ADMIN API - Users
// ============================================

async function handleAdminUsers(request: Request, env: Env): Promise<Response> {
  const { DB } = env;

  if (request.method === 'GET') {
    const users = await DB.prepare('SELECT * FROM users').all();

    return Response.json({
      success: true,
      data: users.results,
      count: users.results.length,
    });
  }

  return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
}

// ============================================
// PUBLIC API - Search Sites
// ============================================

async function handleSearch(request: Request, env: Env): Promise<Response> {
  const { DB, CACHE } = env;
  const url = new URL(request.url);

  // Query parameters
  const q = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category');
  const iframeAllowed = url.searchParams.get('iframeAllowed');
  const sort = url.searchParams.get('sort') || 'alphabet';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');

  // Cache key
  const cacheKey = `search:${q}:${category}:${iframeAllowed}:${sort}:${page}:${limit}`;

  // Check cache
  const cached = await CACHE.get(cacheKey);
  if (cached) {
    return Response.json(JSON.parse(cached));
  }

  // Build query
  let query = 'SELECT * FROM sites WHERE 1=1';
  const params: any[] = [];

  // Search filter
  if (q) {
    query += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // Category filter
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  // Iframe filter
  if (iframeAllowed === 'true') {
    query += ' AND iframe_allowed = 1';
  } else if (iframeAllowed === 'false') {
    query += ' AND iframe_allowed = 0';
  }

  // Sorting
  if (sort === 'added') {
    query += ' ORDER BY added_at DESC';
  } else if (sort === 'popular') {
    query += ' ORDER BY test_count DESC';
  } else {
    query += ' ORDER BY name ASC';
  }

  // Execute query
  const allResults = await DB.prepare(query).bind(...params).all();

  // Pagination
  const total = allResults.results.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paged = allResults.results.slice(start, start + limit);

  const response = {
    success: true,
    data: paged,
    count: paged.length,
    total,
    page,
    pages: totalPages,
  };

  // Cache for 5 minutes
  await CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 300 });

  return Response.json(response);
}

// ============================================
// ANALYTICS API - Track Usage
// ============================================

async function handleTrack(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json<any>();
    const { url: trackedUrl, action, userId, metadata } = body;

    if (!trackedUrl || !action) {
      return Response.json(
        { error: 'URL and action are required' },
        { status: 400 }
      );
    }

    // Generate unique key with timestamp
    const timestamp = Date.now();
    const key = `track:${timestamp}:${crypto.randomUUID()}`;

    // Collect request metadata
    const trackingData = {
      url: trackedUrl,
      action, // 'view', 'click', 'iframe_load', 'search', etc.
      userId: userId || null,
      ip: request.headers.get('CF-Connecting-IP'),
      country: request.headers.get('CF-IPCountry'),
      userAgent: request.headers.get('User-Agent'),
      referer: request.headers.get('Referer'),
      timestamp,
      metadata: metadata || {},
    };

    // Store in KV with 7-day expiration
    await env.CACHE.put(
      key,
      JSON.stringify(trackingData),
      { expirationTtl: 86400 * 7 } // 7 days
    );

    return Response.json({
      success: true,
      tracked: key,
      timestamp,
    });

  } catch (error: any) {
    console.error('Track error:', error);
    return Response.json(
      { error: 'Tracking failed', message: error.message },
      { status: 500 }
    );
  }
}

// ============================================
// ANALYTICS API - Get Statistics
// ============================================

async function handleStats(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '7d'; // 1d, 7d, 30d
    const limit = parseInt(url.searchParams.get('limit') || '100');

    // Get all tracking keys from KV
    const list = await env.CACHE.list({ prefix: 'track:' });
    const keys = list.keys.slice(0, Math.min(limit, 1000)); // Max 1000

    // Fetch tracking data
    const dataPromises = keys.map(k =>
      env.CACHE.get(k.name, 'json')
    );
    const data = (await Promise.all(dataPromises)).filter(d => d !== null);

    // Calculate statistics
    const stats = {
      total: data.length,
      period,

      // By URL
      byUrl: data.reduce((acc: any, d: any) => {
        acc[d.url] = (acc[d.url] || 0) + 1;
        return acc;
      }, {}),

      // By Action
      byAction: data.reduce((acc: any, d: any) => {
        acc[d.action] = (acc[d.action] || 0) + 1;
        return acc;
      }, {}),

      // By Country
      byCountry: data.reduce((acc: any, d: any) => {
        const country = d.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {}),

      // Top URLs (sorted by count)
      topUrls: Object.entries(
        data.reduce((acc: any, d: any) => {
          acc[d.url] = (acc[d.url] || 0) + 1;
          return acc;
        }, {})
      )
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 10)
        .map(([url, count]) => ({ url, count })),

      // Unique users (by IP)
      uniqueIps: new Set(data.map((d: any) => d.ip)).size,

      // Recent events (last 20)
      recent: data
        .sort((a: any, b: any) => b.timestamp - a.timestamp)
        .slice(0, 20)
        .map((d: any) => ({
          url: d.url,
          action: d.action,
          country: d.country,
          timestamp: new Date(d.timestamp).toISOString(),
        })),
    };

    return Response.json({
      success: true,
      stats,
      cached: list.keys.length,
    });

  } catch (error: any) {
    console.error('Stats error:', error);
    return Response.json(
      { error: 'Stats retrieval failed', message: error.message },
      { status: 500 }
    );
  }
}

// ============================================
// STRIPE API - Checkout & Webhooks
// TODO: Implement using Stripe REST API with fetch()
// Stripe SDK doesn't work in Workers runtime
// ============================================

/**
 * Check if API key is valid
 * Used as middleware for protected endpoints
 */
async function checkApiKey(apiKey: string, env: Env): Promise<boolean> {
  if (!apiKey || !apiKey.startsWith('zeno_')) {
    return false;
  }

  const data = await env.CACHE.get(`apikey:${apiKey}`, 'json');

  if (!data) {
    return false;
  }

  // Check if subscription is active
  const status = (data as any).status;
  return status === 'active';
}

// ============================================
// BIELIK AGENTS INTEGRATION
// ============================================

/**
 * Proxy requests to BIELIK agent system worker
 * All /api/agents/* requests are forwarded to BIELIK_AGENTS service
 */
async function handleBielikAgents(request: Request, env: Env): Promise<Response> {
  try {
    // Forward request to BIELIK worker via service binding
    const response = await env.BIELIK_AGENTS.fetch(request);
    return response;
  } catch (error: any) {
    console.error('BIELIK agent error:', error);
    return Response.json({
      error: 'Agent system unavailable',
      message: error.message,
    }, { status: 503 });
  }
}

// ============================================
// AI ASSISTANT API
// ============================================

/**
 * Handle AI Assistant requests using Cloudflare Workers AI
 */
async function handleAI(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json<any>();
    const { prompt, model = 'mistral-7b', temperature = 0.7 } = body;

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Detect if prompt is in Polish
    const isPolish = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(prompt) ||
      /\b(co|jak|czy|gdzie|kiedy|dlaczego|jakie|który|jest|to|na|w|z)\b/i.test(prompt);

    // Step 0: Search knowledge base for relevant context
    let knowledgeContext = '';
    try {
      const searchQuery = prompt.toLowerCase();
      const kb = await env.DB.prepare(`
        SELECT title, content, category 
        FROM knowledge_base 
        WHERE LOWER(title) LIKE ? 
           OR LOWER(content) LIKE ? 
           OR LOWER(keywords) LIKE ?
        LIMIT 3
      `).bind(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`).all();

      if (kb.results && kb.results.length > 0) {
        knowledgeContext = '\n\nRelevant information:\n' +
          kb.results.map((r: any) => `[${r.category}] ${r.title}: ${r.content}`).join('\n');
      }
    } catch (e) {
      console.log('KB search failed:', e);
    }

    let translatedPrompt = prompt + knowledgeContext;

    // Step 1: Translate Polish to English if needed (using m2m100-1.2b)
    if (isPolish) {
      try {
        const translation = await env.AI.run('@cf/meta/m2m100-1.2b', {
          text: prompt,
          source_lang: 'polish',
          target_lang: 'english'
        });
        translatedPrompt = translation.translated_text || prompt;
      } catch (e) {
        console.log('Translation PL→EN failed:', e);
      }
    }

    // Model mapping
    const modelMap: Record<string, string> = {
      'mistral-7b': '@cf/mistral/mistral-7b-instruct-v0.1',
      'llama-3.1-8b': '@cf/meta/llama-3.1-8b-instruct',
      'gemma-7b': '@cf/google/gemma-7b-it-lora',
      'qwen-7b': '@cf/qwen/qwen1.5-7b-chat-awq',
      'llama-3.2-3b': '@cf/meta/llama-3.2-3b-instruct',
      'llama-3.2-1b': '@cf/meta/llama-3.2-1b-instruct',
      'gemma-2b': '@cf/google/gemma-2b-it-lora'
    };

    const modelPath = modelMap[model] || modelMap['mistral-7b'];

    // Step 2: Get AI response in English
    const systemPrompt = knowledgeContext
      ? 'You are a helpful AI assistant for ZENO Browser. Answer questions using ONLY the information provided in the context. If the context doesn\'t contain the answer, say "I don\'t have that information in my knowledge base." Be concise and accurate.'
      : 'You are a helpful AI assistant for ZENO Browser. Answer questions clearly and concisely in English.';

    const aiResponse = await env.AI.run(modelPath, {
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: translatedPrompt
        }
      ],
      temperature: knowledgeContext ? 0.3 : temperature, // Lower temperature for RAG
      max_tokens: 1024
    });

    let finalResponse = aiResponse.response || aiResponse.text || 'No response';

    // Step 3: Translate response back to Polish if original was Polish
    if (isPolish) {
      try {
        const backTranslation = await env.AI.run('@cf/meta/m2m100-1.2b', {
          text: finalResponse,
          source_lang: 'english',
          target_lang: 'polish'
        });
        finalResponse = backTranslation.translated_text || finalResponse;
      } catch (e) {
        console.log('Translation EN→PL failed:', e);
      }
    }

    return Response.json({
      success: true,
      response: finalResponse,
      model: modelPath,
      translated: isPolish
    });

  } catch (error: any) {
    console.error('AI error:', error);
    return Response.json({
      error: 'AI request failed',
      message: error.message
    }, { status: 500 });
  }
}
