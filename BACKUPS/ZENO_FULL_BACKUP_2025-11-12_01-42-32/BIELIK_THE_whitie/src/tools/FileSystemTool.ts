import { promises as fs } from 'fs';
import * as path from 'path';

// Basic security to prevent path traversal attacks.
// In a real-world scenario, this should be a more robust sandboxed environment.
const CWD = process.cwd();

function resolvePath(filePath: string): string {
  const resolvedPath = path.resolve(CWD, filePath);
  if (!resolvedPath.startsWith(CWD)) {
    throw new Error('File path is outside the allowed working directory.');
  }
  return resolvedPath;
}

/**
 * Reads the content of a specified file.
 * @param filePath The relative path to the file.
 * @returns The content of the file as a string.
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    const safePath = resolvePath(filePath);
    const content = await fs.readFile(safePath, 'utf-8');
    return content;
  } catch (error: unknown) {
    const err = error as Error;
    return `Error reading file: ${err.message}`;
  }
}

/**
 * Writes content to a specified file.
 * @param filePath The relative path to the file.
 * @param content The content to write to the file.
 * @returns A confirmation message.
 */
export async function writeFile(filePath: string, content: string): Promise<string> {
  try {
    const safePath = resolvePath(filePath);
    await fs.writeFile(safePath, content, 'utf-8');
    return `Successfully wrote to file: ${filePath}`;
  } catch (error: unknown) {
    const err = error as Error;
    return `Error writing to file: ${err.message}`;
  }
}
