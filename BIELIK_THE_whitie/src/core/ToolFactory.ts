import { tools as toolConfigs, ToolConfig } from '../config/tools.config';

// A type representing an executable tool function
export type ToolFunction = (...args: any[]) => Promise<any>;

// Mock tool implementations (used when actual implementations can't be loaded)
const mockTools: Record<string, ToolFunction> = {
  'web_search': async (args: any) => `Mock web search results for: "${args?.query || 'unknown'}".`,
  'file_read': async (args: any) => `Mock file read for: "${args?.filePath || 'unknown'}".`,
  'file_write': async (args: any) => `Mock file write for: "${args?.filePath || 'unknown'}".`,
  'code_linter': async (args: any) => `Mock code linting for: "${args?.language || 'unknown'}".`,
};

export class ToolFactory {
  private tools: Map<string, ToolFunction> = new Map();

  constructor() {
    this.loadTools();
  }

  private async loadTools() {
    // In Cloudflare Workers, dynamic imports don't work the same way as Node.js
    // For now, use mock implementations
    for (const toolConfig of toolConfigs) {
      const mockFn = mockTools[toolConfig.id];
      if (mockFn) {
        this.tools.set(toolConfig.id, mockFn);
      } else {
        console.warn(`[ToolFactory] No implementation found for tool: ${toolConfig.id}`);
      }
    }
    console.log(`Loaded ${this.tools.size} tools (using mock implementations).`);
  }

  getTool(toolId: string): ToolFunction | undefined {
    return this.tools.get(toolId);
  }
}
