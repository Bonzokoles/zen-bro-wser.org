import OpenAI from 'openai';

export interface OpenRouterConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

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

export class OpenRouterProvider {
  private openai: OpenAI;
  private config: OpenRouterConfig;
  private chatHistory: ChatMessage[] = [];

  constructor(config: OpenRouterConfig) {
    this.config = {
      model: 'openai/gpt-4o-mini',
      baseURL: 'https://openrouter.ai/api/v1',
      ...config
    };
    
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
      defaultHeaders: {
        "HTTP-Referer": "https://zeno-web-core.local",
        "X-Title": "ZENO_WEB_CORE Browser"
      }
    });
  }

  async sendMessage(message: string, context?: string): Promise<ChatMessage> {
    try {
      // Add context about current webpage if available
      const systemMessage = context 
        ? `You are an AI assistant integrated into ZENO_WEB_CORE browser. Current context: ${context}`
        : 'You are an AI assistant integrated into ZENO_WEB_CORE browser.';

      const messages = [
        { role: 'system' as const, content: systemMessage },
        ...this.chatHistory.slice(-10).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user' as const, content: message }
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      });

      const responseContent = completion.choices[0]?.message?.content || 'No response generated';

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      // Add to chat history
      this.chatHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      this.chatHistory.push(assistantMessage);

      // Keep only last 20 messages to prevent token overflow
      if (this.chatHistory.length > 20) {
        this.chatHistory = this.chatHistory.slice(-20);
      }

      return assistantMessage;
    } catch (error: any) {
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }

  async executeMCPCommand(command: string, tools?: string[]): Promise<MCPResponse> {
    try {
      const mcpPrompt = `
You are an AI assistant that can use tools. Based on the user's command, decide if a tool is necessary.
Command: "${command}"
Available tools: ${tools ? tools.join(', ') : 'none'}

If a tool is needed, respond with a JSON object like this:
{"tool": "tool_name", "args": {"arg1": "value1", "arg2": "value2"}}

If no tool is needed, just respond to the user's command directly.
`;

      const completion = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages: [
          { role: 'system', content: 'You are an MCP (Model Context Protocol) processor for ZENO_WEB_CORE browser.' },
          { role: 'user', content: mcpPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const responseContent = completion.choices[0]?.message?.content || 'No response generated';

      try {
        // Try to parse as JSON for tool use
        const parsed = JSON.parse(responseContent);
        if (parsed.tool) {
          return {
            success: true,
            data: parsed,
            toolsUsed: [parsed.tool]
          };
        }
      } catch (e) {
        // Not a JSON response, treat as a regular message
      }

      return {
        success: true,
        data: {
          command,
          analysis: responseContent,
          timestamp: new Date().toISOString(),
          model: this.config.model
        },
        toolsUsed: ['openrouter_analysis']
      };
    } catch (error: any) {
      return {
        success: false,
        error: `MCP execution failed: ${error.message}`
      };
    }
  }

  async analyzeWebContent(url: string, content: string): Promise<ChatMessage> {
    try {
      const analysisPrompt = `
Analyze this web content from URL: ${url}

Content preview:
${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}

Please provide:
1. Summary of the main content
2. Key insights or important information
3. Relevant links or references mentioned
4. Suggestions for further exploration

Keep the analysis concise but comprehensive.
`;

      const completion = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages: [
          { role: 'system', content: 'You are a web content analyzer for ZENO_WEB_CORE browser.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.5,
        max_tokens: 1500
      });

      const responseContent = completion.choices[0]?.message?.content || 'Analysis failed';

      return {
        role: 'assistant',
        content: `🌐 **Web Content Analysis for ${url}**\n\n${responseContent}`,
        timestamp: new Date()
      };
    } catch (error: any) {
      throw new Error(`Content analysis failed: ${error.message}`);
    }
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  clearChatHistory(): void {
    this.chatHistory = [];
  }

  getConfig(): OpenRouterConfig {
    return { ...this.config };
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing OpenRouter connection...');
      const completion = await this.openai.chat.completions.create({
        model: this.config.model!,
        messages: [
          { role: 'user', content: 'Hello, can you respond with a simple greeting? Just say "Hello from OpenRouter!"' }
        ],
        max_tokens: 50
      });

      const response = completion.choices[0]?.message?.content || '';
      console.log('OpenRouter response:', response);
      return response.length > 0;
    } catch (error: any) {
      console.error('OpenRouter connection test failed:', error.message || error);
      throw error;
    }
  }

  // Get available models (popular ones)
  getAvailableModels(): string[] {
    return [
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'google/gemini-pro-1.5',
      'meta-llama/llama-3.1-8b-instruct',
      'mistralai/mixtral-8x7b-instruct',
      'cohere/command-r-plus'
    ];
  }
}

// Export factory function
export function createOpenRouterProvider(apiKey: string, model?: string): OpenRouterProvider {
  return new OpenRouterProvider({ apiKey, model });
}

// Export default configuration
export const defaultOpenRouterConfig: Partial<OpenRouterConfig> = {
  model: 'openai/gpt-4o-mini',
  baseURL: 'https://openrouter.ai/api/v1'
};