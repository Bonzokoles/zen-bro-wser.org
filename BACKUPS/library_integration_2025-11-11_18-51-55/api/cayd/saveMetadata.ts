/**
 * CAYD Library API - Save Metadata Endpoint
 * Zapisuje lub aktualizuje plik metadanych w bibliotece
 */

import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const prerender = false;

const librariesRoot = process.env.LIBRARIES_ROOT || 'V:/PROTO_TYpy/ZENO_web_CORE/LIBRARIES';

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

        const { relativePath, content } = await request.json();

        if (!relativePath || content === undefined) {
            return new Response(JSON.stringify({
                error: 'Brak relativePath lub content'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const fullPath = path.join(librariesRoot, relativePath);
        const dir = path.dirname(fullPath);

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

        // Tworzenie katalogów jeśli nie istnieją
        fs.mkdirSync(dir, { recursive: true });

        // Zapis pliku
        fs.writeFileSync(fullPath, content, 'utf8');

        return new Response(JSON.stringify({
            status: 'success',
            path: relativePath,
            message: 'Plik zapisany pomyślnie'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({
            error: 'Błąd zapisu pliku: ' + err.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
