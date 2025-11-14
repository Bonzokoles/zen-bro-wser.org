/**
 * AI Enrichment API Endpoint
 * Uses Gemini to analyze and enrich search results with:
 * - Auto-generated tags
 * - Quality scoring (0-10)
 * - Summary generation
 * - Keyword extraction
 */

import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface EnrichmentRequest {
    items: Array<{
        title?: string;
        name?: string;
        content?: string;
        url?: string;
        path?: string;
    }>;
    query: string;
}

interface EnrichedItem {
    original: any;
    enrichment: {
        tags: string[];
        keywords: string[];
        summary: string;
        quality_score: number;
        relevance_score: number;
        category: string;
        recommended_agent?: string;
    };
}

// Initialize Gemini AI
const getGeminiClient = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not configured');
    }
    return new GoogleGenerativeAI(apiKey);
};

// Agent assignment logic based on tags
const assignAgent = (tags: string[]): string => {
    const tagLower = tags.map(t => t.toLowerCase());

    if (tagLower.some(t => ['ai', 'ml', 'chatbot', 'llm', 'deep learning'].includes(t))) {
        return 'ZBYCHU_1_B'; // Business/Tech
    }
    if (tagLower.some(t => ['seo', 'marketing', 'ecommerce', 'ads', 'social media'].includes(t))) {
        return 'ZBYCHU_1_M'; // Marketing
    }
    if (tagLower.some(t => ['stock', 'crypto', 'finance', 'trading', 'investment'].includes(t))) {
        return 'ZBYCHU_1F'; // Finance
    }
    if (tagLower.some(t => ['research', 'quantum', 'biotech', 'science', 'physics'].includes(t))) {
        return 'ZBYCHU_1_T'; // Tech/Research
    }
    if (tagLower.some(t => ['film', 'cinema', 'movie', 'director', 'screenplay'].includes(t))) {
        return 'ZBYCHU_1_F'; // Film
    }
    if (tagLower.some(t => ['art', 'museum', 'painting', 'sculpture', 'gallery'].includes(t))) {
        return 'ZBYCHU_1_A'; // Art
    }

    return 'ZBYCHU_1_B'; // Default: Business
};

// Analyze single item with Gemini
const enrichItem = async (
    item: any,
    query: string,
    genAI: GoogleGenerativeAI
): Promise<EnrichedItem> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const itemText = item.content || item.context || item.title || item.name || '';
        const itemTitle = item.title || item.name || 'Untitled';

        const prompt = `Analyze this search result for query "${query}" and provide enrichment data in JSON format.

Item Title: ${itemTitle}
Content: ${itemText.substring(0, 500)}...

Provide a JSON response with:
{
  "tags": ["tag1", "tag2", "tag3"],  // 3-5 relevant tags
  "keywords": ["keyword1", "keyword2"],  // 5-7 important keywords
  "summary": "One sentence summary",
  "quality_score": 7,  // 0-10 based on content quality and relevance
  "relevance_score": 8,  // 0-10 how relevant to query
  "category": "Technology"  // Main category
}

Only return valid JSON, no markdown or extra text.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON from response
        let enrichment;
        try {
            // Remove markdown code blocks if present
            const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            enrichment = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('Failed to parse AI response:', text);
            // Fallback enrichment
            enrichment = {
                tags: ['untagged'],
                keywords: [query],
                summary: itemTitle,
                quality_score: 5,
                relevance_score: 5,
                category: 'General'
            };
        }

        // Add recommended agent
        enrichment.recommended_agent = assignAgent(enrichment.tags);

        return {
            original: item,
            enrichment
        };

    } catch (error) {
        console.error('Enrichment error:', error);
        // Return minimal enrichment on error
        return {
            original: item,
            enrichment: {
                tags: ['error'],
                keywords: [query],
                summary: item.title || item.name || 'Analysis failed',
                quality_score: 0,
                relevance_score: 0,
                category: 'Unknown',
                recommended_agent: 'ZBYCHU_1_B'
            }
        };
    }
};

export const POST: APIRoute = async ({ request }) => {
    const startTime = Date.now();

    try {
        const body: EnrichmentRequest = await request.json();

        if (!body.items || !Array.isArray(body.items)) {
            return new Response(
                JSON.stringify({
                    error: 'Items array is required',
                    usage: 'POST /api/ai-enrichment with body: { items: [...], query: "..." }'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const genAI = getGeminiClient();

        // Enrich items in batches to avoid rate limits
        const batchSize = 5;
        const enrichedItems: EnrichedItem[] = [];

        for (let i = 0; i < body.items.length; i += batchSize) {
            const batch = body.items.slice(i, i + batchSize);
            const batchPromises = batch.map(item => enrichItem(item, body.query, genAI));
            const batchResults = await Promise.all(batchPromises);
            enrichedItems.push(...batchResults);

            // Small delay between batches
            if (i + batchSize < body.items.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Calculate stats
        const avgQuality = enrichedItems.reduce((sum, item) =>
            sum + item.enrichment.quality_score, 0) / enrichedItems.length;

        const avgRelevance = enrichedItems.reduce((sum, item) =>
            sum + item.enrichment.relevance_score, 0) / enrichedItems.length;

        // Filter high-quality items (quality_score >= 7)
        const highQualityItems = enrichedItems.filter(item =>
            item.enrichment.quality_score >= 7
        );

        const responseTime = Date.now() - startTime;

        return new Response(
            JSON.stringify({
                query: body.query,
                enriched_items: enrichedItems,
                stats: {
                    total_items: enrichedItems.length,
                    high_quality_count: highQualityItems.length,
                    avg_quality_score: Math.round(avgQuality * 10) / 10,
                    avg_relevance_score: Math.round(avgRelevance * 10) / 10,
                    processing_time_ms: responseTime
                },
                high_quality_items: highQualityItems
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
        console.error('AI Enrichment error:', error);

        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Unknown error',
                details: 'Failed to enrich items with AI'
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
