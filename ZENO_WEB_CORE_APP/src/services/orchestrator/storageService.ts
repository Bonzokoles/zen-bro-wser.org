/**
 * Storage Service - Local Libraries Management
 * Saves content to thematic local libraries (folders)
 */

import fs from 'fs/promises';
import path from 'path';

export interface LibraryMetadata {
  id: string;
  url: string;
  title?: string;
  category: string;
  timestamp: string;
  tags?: string[];
  [key: string]: any;
}

/**
 * Save content to a specific library topic folder
 * @param topic - Library category (art, film, architecture, culture, etc.)
 * @param id - Unique identifier for the content
 * @param metadata - Metadata object to save as JSON
 * @param text - Text content to save as Markdown
 */
export async function saveToLibrary(
  topic: string,
  id: string,
  metadata: LibraryMetadata,
  text: string
): Promise<void> {
  const basePath = path.resolve('./libraries', topic);
  await fs.mkdir(basePath, { recursive: true });

  const metaPath = path.join(basePath, `${id}.json`);
  const textPath = path.join(basePath, `${id}.md`);

  await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
  await fs.writeFile(textPath, text);

  console.log(`[Storage] ✅ Saved content to library '${topic}' with ID '${id}'`);
}

/**
 * Read content from library
 * @param topic - Library category
 * @param id - Content identifier
 */
export async function readFromLibrary(topic: string, id: string): Promise<{
  metadata: LibraryMetadata;
  text: string;
} | null> {
  try {
    const basePath = path.resolve('./libraries', topic);
    const metaPath = path.join(basePath, `${id}.json`);
    const textPath = path.join(basePath, `${id}.md`);

    const metaContent = await fs.readFile(metaPath, 'utf-8');
    const textContent = await fs.readFile(textPath, 'utf-8');

    return {
      metadata: JSON.parse(metaContent),
      text: textContent
    };
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
    const basePath = path.resolve('./libraries', topic);
    const files = await fs.readdir(basePath);

    // Return only JSON files (IDs)
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  } catch (error) {
    console.error(`[Storage] ❌ Error listing library '${topic}':`, error);
    return [];
  }
}

/**
 * List all available libraries
 */
export async function listLibraries(): Promise<string[]> {
  try {
    const basePath = path.resolve('./libraries');
    await fs.mkdir(basePath, { recursive: true });
    const dirs = await fs.readdir(basePath, { withFileTypes: true });

    return dirs
      .filter(d => d.isDirectory())
      .map(d => d.name);
  } catch (error) {
    console.error('[Storage] ❌ Error listing libraries:', error);
    return [];
  }
}
