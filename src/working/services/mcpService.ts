/*
 * WORKING VERSION
 * Original: src/original/services/mcpService.ts
 * Started: 2025-11-03
 * Status: IN_PROGRESS
 *
 * Changes:
 * - (Add your changes here)
 */

import { AppError, APIError, handleError, withErrorHandling } from '../utils/error-handler';
import ToolExecutionService from './toolExecutionService';
import { GeminiProvider, createGeminiProvider } from './aiProviders/gemini';
import { OpenRouterProvider, createOpenRouterProvider } from './aiProviders/openrouter';

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
  private currentProvider: GeminiProvider | OpenRouterProvider | null = null;
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

      this.toolExecutionService = new ToolExecutionService(config.tavilyApiKey);

      switch (config.provider) {
        case 'gemini':
          this.currentProvider = createGeminiProvider(config.apiKey, config.model);
          break;
        case 'openrouter':
          this.currentProvider = createOpenRouterProvider(config.apiKey, config.model);
          break;
        case 'claude':
          // TODO: Implement Claude provider
          throw new AppError(
            'Claude provider not yet implemented',
            'CLAUDE_NOT_IMPL',
            'The Claude provider is not yet available. Please select another provider.'
            );
        default:
          throw new AppError(`Unsupported provider: ${config.provider}`, 'UNSUPPORTED_PROVIDER', 'The selected AI provider is not supported.');
      }

      // Test connection
      console.log(`Testing connection to ${config.provider}...`);
      const isConnected = await this.currentProvider.testConnection();
      if (!isConnected) {
        throw new APIError(
            `Failed to connect to ${config.provider}`,
            401,
            `Connection to ${config.provider} failed. Please check your API key and network connection.`
          );
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
      handleError(error, 'MCP_INITIALIZATION');
      this.currentProvider = null;
      this.session = null;
      return false;
    }
  }

  async sendMessage(message: string, webContext?: { url: string; title: string; content?: string }): Promise<ChatMessage> {
    if (!this.currentProvider || !this.session) {
      throw new AppError(
        'MCP Service not initialized',
        'MCP_NOT_INIT',
        'Service is not ready. Please initialize it first.'
      );
    }

    try {
      const context = webContext 
        ? `Current page: ${webContext.title} (${webContext.url})`
        : undefined;

      const response = await this.currentProvider.sendMessage(message, context);
      
      // Add to session history
      this.session.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      this.session.messages.push(response);

      return response;
    } catch (error) {
      handleError(error, 'SEND_MESSAGE');
      // Re-throw a specific error to be caught by the UI
      throw new APIError(
        error.message || 'Failed to send message',
        500,
        'Could not send message. Please try again.',
        { originalError: error }
      );
    }
  }

  async executeCommand(command: string): Promise<MCPResponse> {
    if (!this.currentProvider || !this.session || !this.toolExecutionService) {
      throw new AppError(
        'MCP Service not initialized',
        'MCP_NOT_INIT',
        'Service is not ready. Please initialize it first.'
      );
    }

    try {
      const enabledTools = this.tools
        .filter(tool => tool.enabled)
        .map(tool => tool.id);

      const response = await this.currentProvider.executeMCPCommand(command, enabledTools);
      
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
      handleError(error, 'EXECUTE_COMMAND');
      const message = error instanceof AppError ? error.userMessage : 'Command execution failed. Please try again.';
      return {
        success: false,
        error: message
      };
    }
  }

  async analyzeCurrentPage(url: string, content: string): Promise<ChatMessage> {
    if (!this.currentProvider) {
      throw new AppError(
        'MCP Service not initialized',
        'MCP_NOT_INIT',
        'Service is not ready. Please initialize it first.'
      );
    }

    try {
      const analysis = await this.currentProvider.analyzeWebContent(url, content);
      
      if (this.session) {
        this.session.messages.push(analysis);
      }

      return analysis;
    } catch (error) {
      handleError(error, 'ANALYZE_PAGE');
      throw new APIError(
        error.message || 'Page analysis failed',
        500,
        'Could not analyze page content. Please try again.',
        { originalError: error }
      );
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
      this.currentProvider.clearChatHistory();
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

// Export types for use in components
export type { ChatMessage, MCPResponse, MCPTool, MCPSession, MCPServiceConfig };