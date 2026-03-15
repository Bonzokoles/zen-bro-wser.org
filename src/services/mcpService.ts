import ToolExecutionService from './toolExecutionService';
import { GeminiProvider, createGeminiProvider } from './aiProviders/gemini';
import { OpenRouterProvider, createOpenRouterProvider } from './aiProviders/openrouter';
import { ClaudeProvider, initializeClaude } from './aiProviders/claude';
import { AppError, handleError, logError } from '../utils/AppError';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  toolsUsed?: string[];
}

export interface MCPServiceConfig {
  provider: 'gemini' | 'openrouter' | 'claude';
  apiKey: string;
  model?: string;
  tavilyApiKey?: string;
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  category: 'browser' | 'search' | 'analysis' | 'utility';
  enabled: boolean;
}

export interface MCPSession {
  id: string;
  provider: string;
  startTime: Date;
  messages: ChatMessage[];
  tools: MCPTool[];
}

class MCPService {
  private currentProvider: GeminiProvider | OpenRouterProvider | ClaudeProvider | null = null;
  private config: MCPServiceConfig | null = null;
  private toolExecutionService: ToolExecutionService | null = null;
  private session: MCPSession | null = null;
  private tools: MCPTool[] = [];

  constructor() {
    this.initializeDefaultTools();
  }

  private initializeDefaultTools(): void {
    this.tools = [
      {
        id: 'web_navigation',
        name: 'Web Navigation',
        description: 'Navigate to URLs and manage browser tabs',
        category: 'browser',
        enabled: true
      },
      {
        id: 'content_analysis',
        name: 'Content Analysis',
        description: 'Analyze webpage content with AI',
        category: 'analysis',
        enabled: true
      },
      {
        id: 'web_search',
        name: 'Web Search',
        description: 'Perform intelligent web searches',
        category: 'search',
        enabled: true
      },
      {
        id: 'bookmark_manager',
        name: 'Bookmark Manager',
        description: 'Manage bookmarks and favorites',
        category: 'browser',
        enabled: true
      },
      {
        id: 'page_summarizer',
        name: 'Page Summarizer',
        description: 'Generate summaries of web pages',
        category: 'analysis',
        enabled: true
      },
      {
        id: 'link_extractor',
        name: 'Link Extractor',
        description: 'Extract and analyze links from pages',
        category: 'utility',
        enabled: true
      }
    ];
  }

  async initialize(config: MCPServiceConfig): Promise<boolean> {
    try {
      this.config = config;

      // Retrieve search API keys from environment variables
      const tavilyApiKey = import.meta.env.VITE_TAVILY_API_KEY;
      const braveApiKey = import.meta.env.VITE_BRAVE_API_KEY;
      
      if (!tavilyApiKey && !braveApiKey) {
        console.warn('No search API keys found. Add VITE_TAVILY_API_KEY or VITE_BRAVE_API_KEY to .env');
      }
      
      this.toolExecutionService = new ToolExecutionService(tavilyApiKey, braveApiKey);

      switch (config.provider) {
        case 'gemini':
          this.currentProvider = createGeminiProvider(config.apiKey, config.model);
          break;
        case 'openrouter':
          this.currentProvider = createOpenRouterProvider(config.apiKey, config.model);
          break;
        case 'claude':
          this.currentProvider = initializeClaude({
            apiKey: config.apiKey,
            model: config.model
          });
          break;
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }

      // Test connection
      console.log(`Testing connection to ${config.provider}...`);
      const isConnected = await (this.currentProvider as any).testConnection();
      if (!isConnected) {
        throw new Error(`Failed to connect to ${config.provider} - please check your API key`);
      }
      console.log(`Successfully connected to ${config.provider}`);

      // Create new session
      this.session = {
        id: `mcp_session_${Date.now()}`,
        provider: config.provider,
        startTime: new Date(),
        messages: [],
        tools: this.tools
      };

      console.log(`MCP Service initialized with ${config.provider}`);
      return true;
    } catch (error) {
      console.error('MCP Service initialization failed:', error);
      this.currentProvider = null;
      this.session = null;
      return false;
    }
  }

  async sendMessage(message: string, webContext?: { url: string; title: string; content?: string }): Promise<ChatMessage> {
    if (!this.currentProvider || !this.session) {
      throw new Error('MCP Service not initialized');
    }

    try {
      const context = webContext 
        ? `Current page: ${webContext.title} (${webContext.url})`
        : undefined;

      let response: ChatMessage;

      // Handle different provider types
      if (this.currentProvider instanceof ClaudeProvider) {
        const messages = this.session.messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          }));

        messages.push({ role: 'user', content: message });

        const responseText = await this.currentProvider.sendMessage(messages, context);
        
        response = {
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        };
      } else {
        response = await this.currentProvider.sendMessage(message, context);
      }
      
      // Add to session history
      this.session.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      this.session.messages.push(response);

      return response;
    } catch (error) {
      const appError = handleError(error);
      logError(appError);
      throw appError;
    }
  }

  async executeCommand(command: string): Promise<MCPResponse> {
    if (!this.currentProvider || !this.session || !this.toolExecutionService) {
      throw new Error('MCP Service not initialized');
    }

    try {
      const enabledTools = this.tools
        .filter(tool => tool.enabled)
        .map(tool => tool.id);

      const response = await (this.currentProvider as any).executeMCPCommand(command, enabledTools);
      
      // Log command execution
      this.session.messages.push({
        role: 'system',
        content: `MCP Command received: ${command}`,
        timestamp: new Date()
      });

      // Check if the AI wants to use a tool
      if (response.data && response.data.tool) {
        const { tool, args } = response.data;
        const toolResult = await this.toolExecutionService.execute(tool, args);

        // Send the tool result back to the AI for summary
        const summaryPrompt = `Tool execution result for '${tool}':\n${JSON.stringify(toolResult, null, 2)}\n\nPlease summarize this result for the user.`;
        const summaryMessage = await this.sendMessage(summaryPrompt);

        return {
          success: true,
          data: {
            tool,
            args,
            result: toolResult,
            summary: summaryMessage.content
          },
          toolsUsed: [tool]
        };
      }


      return response;
    } catch (error) {
      return {
        success: false,
        error: `Command execution failed: ${(error as Error).message ?? String(error)}`
      };
    }
  }

  async analyzeCurrentPage(url: string, content: string): Promise<ChatMessage> {
    if (!this.currentProvider) {
      throw new Error('MCP Service not initialized');
    }

    try {
      const analysis = await (this.currentProvider as any).analyzeWebContent(url, content);
      
      if (this.session) {
        this.session.messages.push(analysis);
      }

      return analysis;
    } catch (error) {
      throw new Error(`Page analysis failed: ${(error as Error).message ?? String(error)}`);
    }
  }

  getSession(): MCPSession | null {
    return this.session;
  }

  getTools(): MCPTool[] {
    return this.tools;
  }

  toggleTool(toolId: string): boolean {
    const tool = this.tools.find(t => t.id === toolId);
    if (tool) {
      tool.enabled = !tool.enabled;
      return tool.enabled;
    }
    return false;
  }

  getChatHistory(): ChatMessage[] {
    return this.session?.messages || [];
  }

  clearSession(): void {
    if (this.currentProvider) {
      (this.currentProvider as any).clearChatHistory?.();
    }
    if (this.session) {
      this.session.messages = [];
    }
  }

  disconnect(): void {
    this.currentProvider = null;
    this.session = null;
    this.config = null;
    console.log('MCP Service disconnected');
  }

  isConnected(): boolean {
    return this.currentProvider !== null && this.session !== null;
  }

  getCurrentProvider(): string | null {
    return this.config?.provider || null;
  }
}

// Export singleton instance
export const mcpService = new MCPService();
