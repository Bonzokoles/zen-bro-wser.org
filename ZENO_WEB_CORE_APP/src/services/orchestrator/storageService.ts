/**
 * Storage Service - Cloudflare-Compatible Storage
 * Saves content to in-memory storage (can be upgraded to KV/R2/D1 for production)
 * NOTE: This is optimized for Cloudflare Workers - no filesystem access
 */

export interface LibraryMetadata {
  id: string;
  url: string;
  title?: string;
  category: string;
  timestamp: string;
  tags?: string[];
  [key: string]: any;
}

// In-memory storage (for development)
// TODO: Replace with Cloudflare KV for production persistence
const inMemoryStore = new Map<string, { metadata: LibraryMetadata; text: string }>();

/**
 * Save content to storage
 * @param topic - Library category (art, film, architecture, culture, etc.)
 * @param id - Unique identifier for the content
 * @param metadata - Metadata object to save
 * @param text - Text content to save
 */
export async function saveToLibrary(
  topic: string,
  id: string,
  metadata: LibraryMetadata,
  text: string
): Promise<void> {
  const key = `${topic}:${id}`;

  inMemoryStore.set(key, { metadata, text });

  console.log(`[Storage] ✅ Saved content to library '${topic}' with ID '${id}'`);

  // TODO: For production, use Cloudflare KV:
  // await env.LIBRARY_KV.put(`metadata:${key}`, JSON.stringify(metadata));
  // await env.LIBRARY_KV.put(`text:${key}`, text);
}

/**
 * Read content from storage
 * @param topic - Library category
 * @param id - Content identifier
 */
export async function readFromLibrary(topic: string, id: string): Promise<{
  metadata: LibraryMetadata;
  text: string;
} | null> {
  try {
    const key = `${topic}:${id}`;
    const data = inMemoryStore.get(key);

    if (!data) {
      console.log(`[Storage] ⚠️ Not found: '${topic}' ID '${id}'`);
      return null;
    }

    return data;

    // TODO: For production, use Cloudflare KV:
    // const metaStr = await env.LIBRARY_KV.get(`metadata:${key}`);
    // const text = await env.LIBRARY_KV.get(`text:${key}`);
    // if (!metaStr || !text) return null;
    // return { metadata: JSON.parse(metaStr), text };
  } catch (error) {
    console.error(`[Storage] ❌ Error reading from library '${topic}' ID '${id}':`, error);
    return null;
  }
}

/**
 * List all items in a library
 * @param topic - Library category
 */
export async function listLibraryItems(topic: string): Promise<string[]> {
  try {
    const prefix = `${topic}:`;
    const items: string[] = [];

    for (const key of inMemoryStore.keys()) {
      if (key.startsWith(prefix)) {
        items.push(key.replace(prefix, ''));
      }
    }

    return items;

    // TODO: For production, use Cloudflare KV:
    // const list = await env.LIBRARY_KV.list({ prefix: `metadata:${prefix}` });
    // return list.keys.map(k => k.name.replace(`metadata:${prefix}`, ''));
  } catch (error) {
    console.error(`[Storage] ❌ Error listing library '${topic}':`, error);
    return [];
  }
}

/**
 * List all available libraries (topics)
 */
export async function listLibraries(): Promise<string[]> {
  try {
    const topics = new Set<string>();

    for (const key of inMemoryStore.keys()) {
      const topic = key.split(':')[0];
      topics.add(topic);
    }

    return Array.from(topics);

    // TODO: For production, use Cloudflare KV:
    // const list = await env.LIBRARY_KV.list({ prefix: 'metadata:' });
    // const topics = new Set(list.keys.map(k => k.name.split(':')[1]));
    // return Array.from(topics);
  } catch (error) {
    console.error('[Storage] ❌ Error listing libraries:', error);
    return [];
  }
}
