/**
 * Orchestrator API Endpoints
 * Handles all orchestrator-related API requests
 */

import type { APIRoute } from 'astro';
import { getOrchestrator } from '../../../services/orchestrator/orchestratorService';
import { chatWithAssistant } from '../../../services/orchestrator/aiAssistantService';

const orchestrator = getOrchestrator();

// Static paths for build
export function getStaticPaths() {
  return [
    { params: { action: 'stats' } },
    { params: { action: 'processed' } },
    { params: { action: 'failed' } },
    { params: { action: 'pending' } },
    { params: { action: 'ai-chat' } }
  ];
}

export const GET: APIRoute = async ({ params, request }) => {
  const action = params.action;

  try {
    switch (action) {
      case 'stats':
        return new Response(JSON.stringify(orchestrator.getStats()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'processed':
        return new Response(JSON.stringify(orchestrator.getProcessedResults()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'failed':
        return new Response(JSON.stringify(orchestrator.getFailedItems()), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  const action = params.action;

  try {
    const body = await request.json().catch(() => ({}));

    switch (action) {
      case 'start':
        orchestrator.start();
        return new Response(JSON.stringify({ success: true, message: 'Orchestrator started' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'stop':
        orchestrator.stop();
        return new Response(JSON.stringify({ success: true, message: 'Orchestrator stopped' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'add-to-queue':
        const { id, url, content, metadata } = body;
        if (!id || !url || !content) {
          return new Response(JSON.stringify({ error: 'Missing required fields: id, url, content' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        orchestrator.addToQueue({ id, url, content, metadata });

        return new Response(JSON.stringify({ success: true, message: 'Added to queue' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'add-batch-to-queue':
        const { pages } = body;
        if (!Array.isArray(pages)) {
          return new Response(JSON.stringify({ error: 'pages must be an array' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        orchestrator.addBatchToQueue(pages);

        return new Response(JSON.stringify({ success: true, message: `Added ${pages.length} pages to queue` }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'set-api-key':
        const { apiKey } = body;
        if (!apiKey || !apiKey.startsWith('sk-')) {
          return new Response(JSON.stringify({ error: 'Invalid OpenAI API key' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        orchestrator.setApiKey(apiKey);

        return new Response(JSON.stringify({ success: true, message: 'API key set' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'set-concurrency':
        const { concurrency } = body;
        if (typeof concurrency !== 'number' || concurrency < 1) {
          return new Response(JSON.stringify({ error: 'Concurrency must be a positive number' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        orchestrator.setConcurrency(concurrency);

        return new Response(JSON.stringify({ success: true, message: `Concurrency set to ${concurrency}` }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'clear-processed':
        orchestrator.clearProcessed();
        return new Response(JSON.stringify({ success: true, message: 'Processed results cleared' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'clear-failed':
        orchestrator.clearFailed();
        return new Response(JSON.stringify({ success: true, message: 'Failed items cleared' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'chat':
        const { messages } = body;
        if (!Array.isArray(messages)) {
          return new Response(JSON.stringify({ error: 'messages must be an array' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Get API key from orchestrator config
        const config = (orchestrator as any).config;
        if (!config?.apiKey) {
          return new Response(JSON.stringify({ error: 'API key not set. Use set-api-key endpoint first.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const chatResponse = await chatWithAssistant(messages, config.apiKey);

        return new Response(JSON.stringify(chatResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
