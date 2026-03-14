/**
 * Cloudflare Pages Function - AI Assistant Proxy
 * Używa Cloudflare Workers AI (darmowe modele)
 */

import type { APIRoute } from 'astro';

// Server-side rendering required for API endpoints
export const prerender = false;

// Dostępne modele
const AVAILABLE_MODELS = {
  'llama-3.2-1b': '@cf/meta/llama-3.2-1b-instruct',
  'llama-3.2-3b': '@cf/meta/llama-3.2-3b-instruct',
  'gemma-7b': '@hf/google/gemma-7b-it',
  'gemma-12b': '@hf/google/gemma-3-12b-it',
  'qwen-7b': '@cf/qwen/qwen1.5-7b-chat-awq'
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Sprawdź czy request ma body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({
        error: 'Content-Type must be application/json'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Bezpieczne parsowanie JSON
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return new Response(JSON.stringify({
          error: 'Request body is empty'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      body = JSON.parse(text);
    } catch (parseError) {
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body',
        details: parseError.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { prompt, model = 'llama-3.2-3b', temperature = 0.7 } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get Cloudflare account ID and API token from env
    const accountId = import.meta.env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = import.meta.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return new Response(JSON.stringify({
        error: 'Cloudflare credentials not configured',
        details: 'Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in environment'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const modelPath = AVAILABLE_MODELS[model] || AVAILABLE_MODELS['llama-3.2-3b'];

    // Call Cloudflare Workers AI
    const aiResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelPath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for ZENO Browser. Answer questions about the application, help users find features, and provide guidance.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens: 1024
        })
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Cloudflare AI error:', errorText);
      return new Response(JSON.stringify({
        error: 'AI request failed',
        status: aiResponse.status,
        details: errorText
      }), {
        status: aiResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await aiResponse.json();

    return new Response(JSON.stringify({
      success: true,
      response: data.result?.response || data.result?.text || 'No response',
      model: modelPath
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('AI Assistant error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
