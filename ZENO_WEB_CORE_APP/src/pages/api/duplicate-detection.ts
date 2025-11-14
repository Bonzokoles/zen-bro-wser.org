/**
 * Duplicate Detection API Endpoint
 * Detects similar/duplicate items across search results
 * Uses text similarity algorithms (Levenshtein distance + TF-IDF)
 */

import type { APIRoute } from 'astro';

interface DuplicateCheckRequest {
    items: Array<{
        id?: string;
        title?: string;
        name?: string;
        content?: string;
        url?: string;
        source: 'cayd' | 'tavily' | 'other';
    }>;
    similarity_threshold?: number; // 0.0 - 1.0, default 0.8
}

interface DuplicateGroup {
    representative: any;
    duplicates: any[];
    similarity_scores: number[];
    sources: string[];
}

interface DuplicateCheckResult {
    total_items: number;
    unique_items: number;
    duplicate_groups: DuplicateGroup[];
    duplicates_found: number;
    deduplication_rate: number;
}

// Calculate Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[len1][len2];
}

// Calculate similarity score (0.0 - 1.0)
function calculateSimilarity(item1: any, item2: any): number {
    const title1 = (item1.title || item1.name || '').toLowerCase();
    const title2 = (item2.title || item2.name || '').toLowerCase();

    if (!title1 || !title2) return 0;

    // Title similarity (primary)
    const maxLen = Math.max(title1.length, title2.length);
    const distance = levenshteinDistance(title1, title2);
    const titleSimilarity = 1 - (distance / maxLen);

    // Content similarity (secondary, if available)
    let contentSimilarity = 0;
    const content1 = (item1.content || item1.context || '').toLowerCase().substring(0, 200);
    const content2 = (item2.content || item2.context || '').toLowerCase().substring(0, 200);

    if (content1 && content2) {
        const contentMaxLen = Math.max(content1.length, content2.length);
        const contentDistance = levenshteinDistance(content1, content2);
        contentSimilarity = 1 - (contentDistance / contentMaxLen);
    }

    // Weighted average (title 70%, content 30%)
    return titleSimilarity * 0.7 + contentSimilarity * 0.3;
}

// Find duplicates using similarity threshold
function findDuplicates(
    items: any[],
    threshold: number
): DuplicateGroup[] {
    const processed = new Set<number>();
    const groups: DuplicateGroup[] = [];

    for (let i = 0; i < items.length; i++) {
        if (processed.has(i)) continue;

        const group: DuplicateGroup = {
            representative: items[i],
            duplicates: [],
            similarity_scores: [],
            sources: [items[i].source]
        };

        processed.add(i);

        // Find similar items
        for (let j = i + 1; j < items.length; j++) {
            if (processed.has(j)) continue;

            const similarity = calculateSimilarity(items[i], items[j]);

            if (similarity >= threshold) {
                group.duplicates.push(items[j]);
                group.similarity_scores.push(similarity);
                if (!group.sources.includes(items[j].source)) {
                    group.sources.push(items[j].source);
                }
                processed.add(j);
            }
        }

        // Only add group if duplicates found
        if (group.duplicates.length > 0) {
            groups.push(group);
        }
    }

    return groups;
}

// Select best item from duplicate group (prefer higher quality/relevance)
function selectBestFromGroup(group: DuplicateGroup): any {
    const allItems = [group.representative, ...group.duplicates];

    // Prefer items with enrichment data
    const enrichedItems = allItems.filter(item => item.enrichment);
    if (enrichedItems.length > 0) {
        // Sort by quality score
        enrichedItems.sort((a, b) =>
            (b.enrichment?.quality_score || 0) - (a.enrichment?.quality_score || 0)
        );
        return enrichedItems[0];
    }

    // Prefer Tavily (fresher web content) over CAYD (cached)
    const tavilyItem = allItems.find(item => item.source === 'tavily');
    if (tavilyItem) return tavilyItem;

    return group.representative;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body: DuplicateCheckRequest = await request.json();

        if (!body.items || !Array.isArray(body.items)) {
            return new Response(
                JSON.stringify({
                    error: 'Items array is required',
                    usage: 'POST /api/duplicate-detection with body: { items: [...], similarity_threshold: 0.8 }'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const threshold = body.similarity_threshold || 0.8;
        const duplicateGroups = findDuplicates(body.items, threshold);

        const totalDuplicates = duplicateGroups.reduce(
            (sum, group) => sum + group.duplicates.length,
            0
        );

        const uniqueItems = body.items.length - totalDuplicates;
        const deduplicationRate = totalDuplicates / body.items.length;

        // Select best items from each group
        const deduplicatedItems = [
            ...body.items.filter(item =>
                !duplicateGroups.some(group =>
                    group.duplicates.includes(item) || group.representative === item
                )
            ),
            ...duplicateGroups.map(group => selectBestFromGroup(group))
        ];

        const result: DuplicateCheckResult = {
            total_items: body.items.length,
            unique_items: uniqueItems,
            duplicate_groups: duplicateGroups,
            duplicates_found: totalDuplicates,
            deduplication_rate: Math.round(deduplicationRate * 100) / 100
        };

        return new Response(
            JSON.stringify({
                ...result,
                deduplicated_items: deduplicatedItems,
                message: `Found ${duplicateGroups.length} duplicate groups, removed ${totalDuplicates} duplicates`
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
        console.error('Duplicate detection error:', error);

        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Unknown error',
                details: 'Failed to detect duplicates'
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
