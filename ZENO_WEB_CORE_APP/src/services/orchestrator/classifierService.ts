/**
 * Classifier Service - AI Text Classification
 * Classifies text content into thematic categories
 * Supports both simple regex-based and OpenAI-powered classification
 */

export const CATEGORIES = ['art', 'culture', 'film', 'architecture', 'technology', 'science', 'other'] as const;
export type Category = typeof CATEGORIES[number];

/**
 * Simple regex-based classifier (fast, offline)
 * @param text - Text content to classify
 * @returns Category name
 */
export function classifyTextSimple(text: string): Category {
  const lower = text.toLowerCase();

  if (/film|movie|cinema|actor|director|screenplay|hollywood/.test(lower)) return 'film';
  if (/art|painting|gallery|sculpture|artist|museum|exhibition/.test(lower)) return 'art';
  if (/architecture|building|design|urban|construction|architect/.test(lower)) return 'architecture';
  if (/culture|heritage|festival|tradition|folklore|customs/.test(lower)) return 'culture';
  if (/technology|software|computer|programming|ai|digital/.test(lower)) return 'technology';
  if (/science|research|study|experiment|laboratory|scientific/.test(lower)) return 'science';

  return 'other';
}

/**
 * OpenAI-powered classifier (more accurate, requires API key)
 * @param text - Text content to classify
 * @param apiKey - OpenAI API key
 * @returns Category name with confidence score
 */
export async function classifyTextAI(
  text: string,
  apiKey: string
): Promise<{ category: Category; confidence: number; reasoning: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a content classifier. Classify the given text into ONE of these categories: ${CATEGORIES.join(', ')}.

Respond with a JSON object in this exact format:
{
  "category": "category_name",
  "confidence": 0.95,
  "reasoning": "Brief explanation"
}

Categories:
- art: Visual arts, painting, sculpture, galleries, museums
- culture: Heritage, traditions, festivals, customs, folklore
- film: Movies, cinema, actors, directors, film industry
- architecture: Buildings, urban design, construction, architects
- technology: Software, computers, programming, AI, digital tech
- science: Research, experiments, scientific studies
- other: Content that doesn't fit above categories`
          },
          {
            role: 'user',
            content: `Classify this text:\n\n${text.substring(0, 1000)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const result = JSON.parse(content);

    console.log(`[Classifier AI] Category: ${result.category}, Confidence: ${result.confidence}`);

    return {
      category: result.category as Category,
      confidence: result.confidence,
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error('[Classifier AI] ❌ Error:', error);
    // Fallback to simple classifier
    const category = classifyTextSimple(text);
    return {
      category,
      confidence: 0.6,
      reasoning: 'Fallback to simple regex classifier due to AI error'
    };
  }
}

/**
 * Hybrid classifier - tries AI first, falls back to simple
 * @param text - Text content to classify
 * @param apiKey - Optional OpenAI API key
 */
export async function classifyText(
  text: string,
  apiKey?: string
): Promise<{ category: Category; confidence: number; reasoning: string }> {
  if (apiKey && apiKey.startsWith('sk-')) {
    return await classifyTextAI(text, apiKey);
  } else {
    const category = classifyTextSimple(text);
    return {
      category,
      confidence: 0.7,
      reasoning: 'Simple regex-based classification'
    };
  }
}

/**
 * Get category statistics from text
 * @param text - Text content to analyze
 * @returns Object with keyword counts per category
 */
export function getCategoryStats(text: string): Record<Category, number> {
  const lower = text.toLowerCase();
  const stats: Record<string, number> = {};

  const patterns: Record<Category, RegExp> = {
    film: /film|movie|cinema|actor|director|screenplay/g,
    art: /art|painting|gallery|sculpture|artist|museum/g,
    architecture: /architecture|building|design|urban|construction/g,
    culture: /culture|heritage|festival|tradition|folklore/g,
    technology: /technology|software|computer|programming|ai/g,
    science: /science|research|study|experiment|laboratory/g,
    other: /general|misc|various/g
  };

  for (const [category, pattern] of Object.entries(patterns)) {
    const matches = lower.match(pattern);
    stats[category] = matches ? matches.length : 0;
  }

  return stats as Record<Category, number>;
}
