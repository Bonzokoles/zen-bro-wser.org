/**
 * CAYD Library API - File Content Endpoint
 * Pobiera zawartość pliku z biblioteki
 */

import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const prerender = false;

const librariesRoot = process.env.LIBRARIES_ROOT || 'V:/PROTO_TYpy/ZENO_web_CORE/LIBRARIES';

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
        const fullPath = path.join(librariesRoot, filePath);

        // Sprawdzenie bezpieczeństwa ścieżki
        if (!fullPath.startsWith(librariesRoot)) {
            return new Response(JSON.stringify({
                error: 'Dostęp zabroniony'
            }), {
                status: 403,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        if (!fs.existsSync(fullPath)) {
            return new Response(JSON.stringify({
                error: 'Plik nie istnieje'
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const content = fs.readFileSync(fullPath, 'utf8');

        return new Response(JSON.stringify({ content }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({
            error: 'Błąd odczytu pliku: ' + err.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
