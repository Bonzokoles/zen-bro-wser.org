import type { APIRoute } from 'astro';

/**
 * Ollama Proxy API
 * Rozwiązuje CORS i umożliwia dostęp do lokalnej Ollama z production
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        // Proxy dla /api/chat
        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return new Response(
                JSON.stringify({
                    error: 'Ollama API error',
                    message: `Status ${response.status}`
                }),
                {
                    status: response.status,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Ollama proxy error:', error);
        return new Response(
            JSON.stringify({
                error: 'Connection failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};

export const GET: APIRoute = async () => {
    try {
        // Proxy dla /api/tags (lista modeli)
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);

        if (!response.ok) {
            return new Response(
                JSON.stringify({
                    error: 'Ollama API error',
                    models: []
                }),
                {
                    status: response.status,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Ollama tags error:', error);
        return new Response(
            JSON.stringify({
                error: 'Connection failed',
                models: [],
                message: 'Ollama może nie być uruchomiona. Zainstaluj i uruchom: https://ollama.ai'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};
