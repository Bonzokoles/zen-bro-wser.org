/**
 * CAYD Library API - Save Metadata Endpoint
 * Proxy do CAYD_SEARCH_ENG Express Server (port 6040)
 */

import type { APIRoute } from 'astro';

export const prerender = false;

const CAYD_SERVER_URL = 'http://localhost:6040';

export const POST: APIRoute = async ({ request }) => {
    try {
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return new Response(JSON.stringify({
                error: 'Content-Type must be application/json'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();

        const response = await fetch(`${CAYD_SERVER_URL}/api/saveMetadata`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({
            error: 'Błąd połączenia z CAYD Server: ' + err.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
