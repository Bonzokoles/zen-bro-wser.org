/**
 * ZENO Browser - Cloudflare Worker API
 * Entry point dla backend API
 */

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  GEMINI_API_KEY: string;
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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
