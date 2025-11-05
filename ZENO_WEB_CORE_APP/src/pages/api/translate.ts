// API endpoint for translation using Cloudflare Workers AI
// URL: /api/translate?text=Hello&source=en&target=pl

export async function GET({ url, locals }) {
  try {
    const { AI } = locals.runtime.env;
    
    if (!AI) {
      return new Response(JSON.stringify({
        error: "AI binding not configured",
        message: "Please add AI binding in Cloudflare Dashboard → Settings → Functions"
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const text = url.searchParams.get('text');
    const sourceLang = url.searchParams.get('source') || 'en';
    const targetLang = url.searchParams.get('target') || 'pl';

    if (!text) {
      return new Response(JSON.stringify({
        error: "Missing 'text' parameter",
        usage: "/api/translate?text=Hello&source=en&target=pl"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use M2M100 translation model (small, fast, 100+ languages)
    const result = await AI.run("@cf/meta/m2m100-1.2b", {
      text: text,
      source_lang: sourceLang,
      target_lang: targetLang
    });

    return new Response(JSON.stringify({
      success: true,
      original: text,
      translated: result.translated_text,
      source: sourceLang,
      target: targetLang,
      model: "@cf/meta/m2m100-1.2b"
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request, locals }) {
  try {
    const { AI } = locals.runtime.env;
    
    if (!AI) {
      return new Response(JSON.stringify({
        error: "AI binding not configured"
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { text, source = 'en', target = 'pl', batch = false } = body;

    if (!text) {
      return new Response(JSON.stringify({
        error: "Missing 'text' field in request body"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle batch translation
    if (batch && Array.isArray(text)) {
      const results = await Promise.all(
        text.map(item => 
          AI.run("@cf/meta/m2m100-1.2b", {
            text: item,
            source_lang: source,
            target_lang: target
          })
        )
      );

      return new Response(JSON.stringify({
        success: true,
        translations: results.map((r, i) => ({
          original: text[i],
          translated: r.translated_text
        })),
        count: results.length
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Single translation
    const result = await AI.run("@cf/meta/m2m100-1.2b", {
      text: text,
      source_lang: source,
      target_lang: target
    });

    return new Response(JSON.stringify({
      success: true,
      original: text,
      translated: result.translated_text,
      source: source,
      target: target
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
