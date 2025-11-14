/**
 * Unified Search API Endpoint
 * Combines results from CAYD (local library), Tavily (web), and Gemini AI (analysis)
 */

import type { APIRoute } from 'astro';

interface UnifiedSearchParams {
    query: string;
    sources?: string; // comma-separated: 'cayd,tavily,ai'
    limit?: number;
}

interface SearchResult {
    query: string;
    sources_used: string[];
    cayd_results?: any;
    tavily_results?: any;
    ai_analysis?: any;
    deduplication?: {
        total_items: number;
        unique_items: number;
        duplicates_found: number;
        deduplication_rate: number;
        duplicate_groups?: any[];
    };
    stats: {
        cayd_count: number;
        tavily_count: number;
        total_count: number;
        response_time_ms: number;
    };
    error?: string;
}

export const GET: APIRoute = async ({ request, url }) => {
    const startTime = Date.now();

    // Parse query parameters
    const query = url.searchParams.get('query') || url.searchParams.get('q');
    const sourcesParam = url.searchParams.get('sources') || 'cayd,tavily';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    if (!query) {
        return new Response(
            JSON.stringify({
                error: 'Query parameter is required',
                usage: '/api/unified-search?query=YOUR_QUERY&sources=cayd,tavily,ai&limit=50'
            }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    const sources = sourcesParam.split(',').map(s => s.trim().toLowerCase());

    const result: SearchResult = {
        query,
        sources_used: sources,
        stats: {
            cayd_count: 0,
            tavily_count: 0,
            total_count: 0,
            response_time_ms: 0
        }
    };

    // Parallel search across sources
    const searchPromises = [];

    // 1. CAYD Search (local library)
    if (sources.includes('cayd')) {
        searchPromises.push(
            fetch(`http://localhost:6040/api/search?q=${encodeURIComponent(query)}&limit=${limit}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) {
                        result.cayd_results = data;
                        result.stats.cayd_count = data.count || 0;
                    }
                })
                .catch(err => {
                    console.error('CAYD search error:', err);
                    result.cayd_results = { error: 'CAYD service unavailable' };
                })
        );
    }

    // 2. Tavily Search (web)
    if (sources.includes('tavily')) {
        const tavilyApiKey = import.meta.env.VITE_TAVILY_API_KEY;

        if (tavilyApiKey) {
            searchPromises.push(
                fetch('https://api.tavily.com/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        api_key: tavilyApiKey,
                        query: query,
                        search_depth: 'basic',
                        max_results: Math.min(limit, 20),
                        include_answer: true,
                        include_raw_content: false
                    })
                })
                    .then(res => res.ok ? res.json() : null)
                    .then(data => {
                        if (data) {
                            result.tavily_results = data;
                            result.stats.tavily_count = data.results?.length || 0;
                        }
                    })
                    .catch(err => {
                        console.error('Tavily search error:', err);
                        result.tavily_results = { error: 'Tavily service unavailable' };
                    })
            );
        } else {
            result.tavily_results = { error: 'Tavily API key not configured' };
        }
    }

    // 3. AI Analysis (Gemini) - only if requested and other results exist
    if (sources.includes('ai')) {
        // Placeholder for AI analysis - will implement after getting base results
        result.ai_analysis = {
            status: 'pending',
            message: 'AI analysis will be performed after base searches complete'
        };
    }

    // Wait for all searches to complete
    await Promise.all(searchPromises);

    // 3. Duplicate Detection - combine and deduplicate results
    let deduplicatedItems: any[] = [];
    let deduplicationStats: any = null;

    try {
        // Combine all results for deduplication
        const allItems: any[] = [];

        // Add CAYD results with source marker
        if (result.cayd_results?.results) {
            result.cayd_results.results.forEach((item: any) => {
                allItems.push({
                    ...item,
                    source: 'cayd',
                    original_title: item.title,
                    original_content: item.content || item.excerpt || ''
                });
            });
        }

        // Add Tavily results with source marker
        if (result.tavily_results?.results) {
            result.tavily_results.results.forEach((item: any) => {
                allItems.push({
                    ...item,
                    source: 'tavily',
                    original_title: item.title,
                    original_content: item.content || ''
                });
            });
        }

        if (allItems.length > 0) {
            // Call duplicate detection endpoint
            const dedupeResponse = await fetch(`${url.origin}/api/duplicate-detection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: allItems,
                    similarity_threshold: 0.8
                })
            });

            if (dedupeResponse.ok) {
                const dedupeData = await dedupeResponse.json();
                deduplicatedItems = dedupeData.deduplicated_items || [];
                deduplicationStats = {
                    total_items: dedupeData.total_items,
                    unique_items: dedupeData.unique_items,
                    duplicates_found: dedupeData.duplicates_found,
                    deduplication_rate: dedupeData.deduplication_rate,
                    duplicate_groups: dedupeData.duplicate_groups
                };

                result.deduplication = deduplicationStats;

                console.log(`✅ Deduplication: ${dedupeData.total_items} → ${dedupeData.unique_items} (removed ${dedupeData.duplicates_found})`);
            } else {
                console.warn('⚠️ Deduplication failed, using original results');
                deduplicatedItems = allItems;
            }
        }
    } catch (error) {
        console.error('Deduplication error:', error);
        // Fallback to combined results if deduplication fails
        deduplicatedItems = [
            ...(result.cayd_results?.results || []),
            ...(result.tavily_results?.results || [])
        ];
    }

    // 4. AI Enrichment - if 'ai' source requested
    if (sources.includes('ai')) {
        try {
            // Use deduplicated items for enrichment (limit to top 10)
            const itemsToEnrich = deduplicatedItems.slice(0, 10);

            if (itemsToEnrich.length > 0) {
                // Call AI enrichment endpoint
                const enrichmentResponse = await fetch(`${url.origin}/api/ai-enrichment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: itemsToEnrich,
                        query: query
                    })
                });

                if (enrichmentResponse.ok) {
                    result.ai_analysis = await enrichmentResponse.json();
                } else {
                    result.ai_analysis = {
                        error: 'AI enrichment failed',
                        status: enrichmentResponse.status
                    };
                }
            } else {
                result.ai_analysis = {
                    message: 'No results to enrich',
                    enriched_items: []
                };
            }
        } catch (error) {
            console.error('AI enrichment error:', error);
            result.ai_analysis = {
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Calculate stats
    result.stats.total_count = result.stats.cayd_count + result.stats.tavily_count;
    result.stats.response_time_ms = Date.now() - startTime;

    return new Response(
        JSON.stringify(result, null, 2),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            }
        }
    );
};

// Handle OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
};
