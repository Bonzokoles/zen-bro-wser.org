/**
 * Save Enriched Items API Endpoint
 * Saves high-quality enriched items to local library
 * With automatic agent assignment based on tags
 */

import type { APIRoute } from 'astro';
import * as fs from 'fs';
import * as path from 'path';

interface SaveRequest {
    items: Array<{
        original: any;
        enrichment: {
            tags: string[];
            keywords: string[];
            summary: string;
            quality_score: number;
            relevance_score: number;
            category: string;
            recommended_agent: string;
        };
    }>;
    query: string;
    min_quality_score?: number;
}

interface SaveResult {
    saved_count: number;
    skipped_count: number;
    saved_items: any[];
    agents_used: string[];
    stats: {
        avg_quality: number;
        total_processing_time_ms: number;
    };
}

// Get library path from environment or use default
const getLibraryPath = (): string => {
    // Try multiple possible paths
    const possiblePaths = [
        'U:/JIMBO_INC_CONTROL_CENTER/LIBRARIES',
        'V:/PROTO_TYpy/ZENO_web_CORE/CAYD_SEARCH_ENG/LIBRARIES',
        './LIBRARIES'
    ];

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            return p;
        }
    }

    // Default - create if doesn't exist
    const defaultPath = './LIBRARIES';
    if (!fs.existsSync(defaultPath)) {
        fs.mkdirSync(defaultPath, { recursive: true });
    }
    return defaultPath;
};

// Save item to library with agent-specific folder
const saveItemToLibrary = async (
    item: any,
    query: string,
    libraryPath: string
): Promise<boolean> => {
    try {
        const agent = item.enrichment.recommended_agent;
        const category = item.enrichment.category.replace(/[^a-zA-Z0-9]/g, '_');

        // Create agent-specific folder
        const agentFolder = path.join(libraryPath, agent, category);
        if (!fs.existsSync(agentFolder)) {
            fs.mkdirSync(agentFolder, { recursive: true });
        }

        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeName = (item.original.title || item.original.name || 'item')
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50);
        const filename = `${safeName}_${timestamp}.json`;
        const filepath = path.join(agentFolder, filename);

        // Prepare data to save
        const dataToSave = {
            metadata: {
                saved_at: new Date().toISOString(),
                query: query,
                agent: agent,
                category: category,
                quality_score: item.enrichment.quality_score,
                relevance_score: item.enrichment.relevance_score
            },
            enrichment: item.enrichment,
            original: item.original
        };

        // Save to file
        fs.writeFileSync(filepath, JSON.stringify(dataToSave, null, 2), 'utf-8');

        console.log(`✅ Saved to: ${filepath}`);
        return true;

    } catch (error) {
        console.error('Error saving item:', error);
        return false;
    }
};

export const POST: APIRoute = async ({ request }) => {
    const startTime = Date.now();

    try {
        const body: SaveRequest = await request.json();

        if (!body.items || !Array.isArray(body.items)) {
            return new Response(
                JSON.stringify({
                    error: 'Items array is required',
                    usage: 'POST /api/save-enriched with body: { items: [...], query: "...", min_quality_score: 7 }'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const minQuality = body.min_quality_score || 7;
        const libraryPath = getLibraryPath();

        // Filter items by quality score
        const itemsToSave = body.items.filter(item =>
            item.enrichment.quality_score >= minQuality
        );

        const result: SaveResult = {
            saved_count: 0,
            skipped_count: body.items.length - itemsToSave.length,
            saved_items: [],
            agents_used: [],
            stats: {
                avg_quality: 0,
                total_processing_time_ms: 0
            }
        };

        // Save items
        for (const item of itemsToSave) {
            const saved = await saveItemToLibrary(item, body.query, libraryPath);

            if (saved) {
                result.saved_count++;
                result.saved_items.push({
                    title: item.original.title || item.original.name,
                    agent: item.enrichment.recommended_agent,
                    quality_score: item.enrichment.quality_score
                });

                if (!result.agents_used.includes(item.enrichment.recommended_agent)) {
                    result.agents_used.push(item.enrichment.recommended_agent);
                }
            }
        }

        // Calculate stats
        if (itemsToSave.length > 0) {
            result.stats.avg_quality = itemsToSave.reduce((sum, item) =>
                sum + item.enrichment.quality_score, 0) / itemsToSave.length;
            result.stats.avg_quality = Math.round(result.stats.avg_quality * 10) / 10;
        }

        result.stats.total_processing_time_ms = Date.now() - startTime;

        return new Response(
            JSON.stringify({
                success: true,
                message: `Saved ${result.saved_count} items to library (${libraryPath})`,
                ...result
            }, null, 2),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        );

    } catch (error) {
        console.error('Save enriched items error:', error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                details: 'Failed to save enriched items'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};

// Handle OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
};
