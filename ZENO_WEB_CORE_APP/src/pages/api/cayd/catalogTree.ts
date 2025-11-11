/**
 * CAYD Library API - Catalog Tree Endpoint
 * Zwraca strukturę drzewa katalogów biblioteki
 */

import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const prerender = false;

const librariesRoot = process.env.LIBRARIES_ROOT || 'V:/PROTO_TYpy/ZENO_web_CORE/LIBRARIES';

function buildTree(dir: string): any[] {
    if (!fs.existsSync(dir)) {
        return [];
    }

    const items = fs.readdirSync(dir, { withFileTypes: true });
    const results: any[] = [];

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            results.push({
                type: 'folder',
                name: item.name,
                children: buildTree(fullPath)
            });
        } else if (item.isFile() && ['.md', '.json'].includes(path.extname(item.name))) {
            results.push({
                type: 'file',
                name: item.name,
                path: path.relative(librariesRoot, fullPath)
            });
        }
    }
    return results;
}

export const GET: APIRoute = async () => {
    try {
        const tree = buildTree(librariesRoot);

        return new Response(JSON.stringify(tree), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({
            error: 'Błąd odczytu katalogu: ' + err.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
