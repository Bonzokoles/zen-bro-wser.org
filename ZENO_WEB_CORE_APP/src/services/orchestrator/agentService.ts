/**
 * Agent Service - Content Processing Agent
 * Processes web page data, classifies it, and saves to appropriate library
 */

import { classifyText, type Category } from './classifierService';
import { saveToLibrary, type LibraryMetadata } from './storageService';

export interface PageData {
  id: string;
  url: string;
  content: string;
  metadata?: Partial<LibraryMetadata>;
}

export interface AgentResult {
  id: string;
  url: string;
  category: Category;
  confidence: number;
  reasoning: string;
  savedAt: string;
}

/**
 * Simple agent that processes a page and saves it to library
 * @param page - Page data to process
 * @param apiKey - Optional OpenAI API key for AI classification
 * @returns Processing result
 */
export async function simpleAgent(
  page: PageData,
  apiKey?: string
): Promise<AgentResult> {
  console.log(`[Agent] 🤖 Processing page: ${page.url}`);

  // Classify the content
  const classification = await classifyText(page.content, apiKey);

  // Prepare metadata
  const timestamp = new Date().toISOString();
  const metadata: LibraryMetadata = {
    id: page.id,
    url: page.url,
    category: classification.category,
    timestamp,
    title: page.metadata?.title || 'Untitled',
    tags: page.metadata?.tags || [],
    confidence: classification.confidence,
    reasoning: classification.reasoning,
    ...page.metadata
  };

  // Save to library
  await saveToLibrary(classification.category, page.id, metadata, page.content);

  console.log(`[Agent] ✅ Processed ${page.url} → Category: ${classification.category}`);

  return {
    id: page.id,
    url: page.url,
    category: classification.category,
    confidence: classification.confidence,
    reasoning: classification.reasoning,
    savedAt: timestamp
  };
}

/**
 * Batch process multiple pages
 * @param pages - Array of pages to process
 * @param apiKey - Optional OpenAI API key
 * @param concurrency - Number of concurrent processing tasks (default: 3)
 */
export async function batchProcessPages(
  pages: PageData[],
  apiKey?: string,
  concurrency: number = 3
): Promise<AgentResult[]> {
  console.log(`[Agent] 📦 Batch processing ${pages.length} pages with concurrency ${concurrency}`);

  const results: AgentResult[] = [];
  const chunks: PageData[][] = [];

  // Split into chunks for concurrent processing
  for (let i = 0; i < pages.length; i += concurrency) {
    chunks.push(pages.slice(i, i + concurrency));
  }

  // Process chunks sequentially, but pages within chunks concurrently
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(page => simpleAgent(page, apiKey))
    );
    results.push(...chunkResults);
  }

  console.log(`[Agent] ✅ Batch processing complete: ${results.length} pages processed`);

  return results;
}

/**
 * Agent with retry logic
 * @param page - Page data to process
 * @param apiKey - Optional OpenAI API key
 * @param maxRetries - Maximum number of retries (default: 3)
 */
export async function agentWithRetry(
  page: PageData,
  apiKey?: string,
  maxRetries: number = 3
): Promise<AgentResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Agent] 🔄 Attempt ${attempt}/${maxRetries} for ${page.url}`);
      return await simpleAgent(page, apiKey);
    } catch (error) {
      lastError = error as Error;
      console.error(`[Agent] ❌ Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[Agent] ⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Agent failed after ${maxRetries} attempts: ${lastError?.message}`);
}
