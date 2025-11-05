// Test endpoint for Cloudflare bindings
// URL: /api/test-bindings

export async function GET({ locals }) {
  const results = {
    timestamp: new Date().toISOString(),
    bindings: {}
  };

  try {
    const runtime = locals.runtime?.env || {};
    const { SESSION, DB, AI } = runtime;

    // Test SESSION (KV)
    if (SESSION) {
      try {
        await SESSION.put("test_key", "test_value", { expirationTtl: 60 });
        const value = await SESSION.get("test_key");
        results.bindings.session = {
          status: "✅ Connected",
          type: "KV Namespace",
          test: value === "test_value" ? "✅ Read/Write OK" : "⚠️ Write failed"
        };
      } catch (error) {
        results.bindings.session = {
          status: "❌ Error",
          error: error.message
        };
      }
    } else {
      results.bindings.session = {
        status: "❌ Not configured",
        message: "Add SESSION binding in Dashboard → Settings → Functions → KV namespace bindings"
      };
    }

    // Test DB (D1)
    if (DB) {
      try {
        const result = await DB.prepare("SELECT 1 as test").first();
        results.bindings.database = {
          status: "✅ Connected",
          type: "D1 Database",
          test: result.test === 1 ? "✅ Query OK" : "⚠️ Query failed"
        };
      } catch (error) {
        results.bindings.database = {
          status: "⚠️ Connected but error",
          error: error.message,
          note: "Database may need schema initialization"
        };
      }
    } else {
      results.bindings.database = {
        status: "❌ Not configured",
        message: "Add DB binding in Dashboard → Settings → Functions → D1 database bindings"
      };
    }

    // Test AI (Cloudflare AI)
    if (AI) {
      try {
        // Test translation model
        const translation = await AI.run("@cf/meta/m2m100-1.2b", {
          text: "Hello",
          source_lang: "en",
          target_lang: "pl"
        });

        results.bindings.ai = {
          status: "✅ Connected",
          type: "Cloudflare Workers AI",
          models: {
            translation: {
              model: "@cf/meta/m2m100-1.2b",
              test: "Hello → " + translation.translated_text,
              status: "✅ Working"
            }
          }
        };
      } catch (error) {
        results.bindings.ai = {
          status: "⚠️ Connected but error",
          error: error.message
        };
      }
    } else {
      results.bindings.ai = {
        status: "❌ Not configured",
        message: "Add AI binding in Dashboard → Settings → Functions → Workers AI"
      };
    }

    // Summary
    const configured = Object.values(results.bindings).filter(b => b.status.includes('✅')).length;
    const total = Object.keys(results.bindings).length;
    
    results.summary = {
      configured: `${configured}/${total} bindings working`,
      recommendation: configured === total 
        ? "All bindings configured correctly! 🎉"
        : "Some bindings need configuration. Check details above."
    };

    return new Response(JSON.stringify(results, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to test bindings",
      message: error.message,
      stack: error.stack
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
