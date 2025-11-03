
import { tavily } from '@tavily/core';

export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
}

class ToolExecutionService {
  private tavilyApiKey: string | null = null;

  constructor(tavilyApiKey?: string) {
    if (tavilyApiKey) {
      this.tavilyApiKey = tavilyApiKey;
    }
  }

  public async execute(toolId: string, args: any): Promise<ToolResult> {
    switch (toolId) {
      case 'web_search':
        return this.executeWebSearch(args);
      // Add other tool cases here
      default:
        return { success: false, data: null, error: `Tool not found: ${toolId}` };
    }
  }

  private async executeWebSearch(args: any): Promise<ToolResult> {
    if (!this.tavilyApiKey) {
      return { success: false, data: null, error: 'Tavily API key not configured' };
    }
    if (!args.query) {
      return { success: false, data: null, error: 'Missing query for web_search' };
    }

    try {
      const response = await tavily({
        apiKey: this.tavilyApiKey,
        query: args.query,
        maxResults: 5,
      });
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, data: null, error: `Tavily search failed: ${error?.message || error}` };
    }
  }
}

export default ToolExecutionService;
