/**
 * CAYD Search API Endpoint
 * Proxy search requests to CAYD_SEARCH_ENG server
 */

import type { APIRoute } from 'astro';

const CAYD_SERVER_URL = 'http://localhost:6040';

export const GET: APIRoute = async ({ url }) => {
    try {
        const query = url.searchParams.get('q');

        if (!query) {
            return new Response(JSON.stringify({ error: 'Search query required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Forward search to CAYD server
        const response = await fetch(`${CAYD_SERVER_URL}/api/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`CAYD server error: ${response.status}`);
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('CAYD search error:', error);
        return new Response(
            JSON.stringify({
                error: 'Search failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};
