/**
 * CAYD Library API - File Content Endpoint
 * Proxy do CAYD_SEARCH_ENG Express Server (port 6040)
 */

import type { APIRoute } from 'astro';

export const prerender = false;

const CAYD_SERVER_URL = 'http://localhost:6040';

export const GET: APIRoute = async ({ url }) => {
    const filePath = url.searchParams.get('path');

    if (!filePath) {
        return new Response(JSON.stringify({
            error: 'Brak parametru path'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    try {
        const response = await fetch(`${CAYD_SERVER_URL}/api/fileContent?path=${encodeURIComponent(filePath)}`);

        if (!response.ok) {
            const errorData = await response.json();
            return new Response(JSON.stringify(errorData), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
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
