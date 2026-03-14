
import { TavilyClient } from 'tavily';

export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
}

class ToolExecutionService {
  private tavilyApiKey: string | null = null;
  private tavilyClient: TavilyClient | null = null;

  constructor(tavilyApiKey?: string) {
    if (tavilyApiKey) {
      this.configureTavilyClient(tavilyApiKey);
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
    const client = this.getTavilyClient();

    if (!client) {
      return { success: false, data: null, error: 'Tavily API key not configured' };
    }
    if (!args.query) {
      return { success: false, data: null, error: 'Missing query for web_search' };
    }

    try {
      const response = await client.search({
        query: args.query,
        ...(typeof args.maxResults === 'number' ? { max_results: args.maxResults } : { max_results: 5 }),
        ...(typeof args.searchDepth === 'string' ? { search_depth: args.searchDepth } : {}),
        ...(typeof args.includeAnswer === 'boolean' ? { include_answer: args.includeAnswer } : {}),
        ...(typeof args.includeImages === 'boolean' ? { include_images: args.includeImages } : {}),
        ...(Array.isArray(args.includeDomains) ? { include_domains: args.includeDomains } : {}),
        ...(Array.isArray(args.excludeDomains) ? { exclude_domains: args.excludeDomains } : {})
      });
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, data: null, error: `Tavily search failed: ${error?.message || error}` };
    }
  }

  private configureTavilyClient(apiKey: string): void {
    this.tavilyApiKey = apiKey;
    this.tavilyClient = new TavilyClient({ apiKey });
  }

  private getTavilyClient(): TavilyClient | null {
    if (this.tavilyClient) {
      return this.tavilyClient;
    }

    if (!this.tavilyApiKey) {
      return null;
    }

    this.tavilyClient = new TavilyClient({ apiKey: this.tavilyApiKey });
    return this.tavilyClient;
  }
}

export default ToolExecutionService;
