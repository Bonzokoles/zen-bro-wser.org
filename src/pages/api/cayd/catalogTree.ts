/**
 * CAYD Library API - Catalog Tree Endpoint
 * Proxy do CAYD_SEARCH_ENG Express Server (port 6040)
 */

import type { APIRoute } from 'astro';

export const prerender = false;

const CAYD_SERVER_URL = 'http://localhost:6040';

export const GET: APIRoute = async () => {
    try {
        const response = await fetch(`${CAYD_SERVER_URL}/api/catalogTree`);

        if (!response.ok) {
            throw new Error(`CAYD Server error: ${response.statusText}`);
        }

        const tree = await response.json();

        return new Response(JSON.stringify(tree), {
            status: 200,
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
