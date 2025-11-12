/**
 * Ollama Provider
 * Local LLM inference using Ollama
 * CORS Note: Ollama needs CORS enabled. Run: `OLLAMA_ORIGINS=* ollama serve`
 * Or use a proxy endpoint for production
 */

export interface OllamaConfig {
  baseURL?: string;
  model?: string;
  temperature?: number;
  timeout?: number;
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

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

export class OllamaProvider {
  private baseURL: string;
  private model: string;
  private temperature: number;
  private timeout: number;
  private chatHistory: ChatMessage[] = [];

  constructor(config: OllamaConfig = {}) {
    // Default to localhost:11434 (standard Ollama port)
    this.baseURL = config.baseURL || 'http://localhost:11434';
    this.model = config.model || 'llama3.2:3b';
    this.temperature = config.temperature ?? 0.7;
    this.timeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Test connection to Ollama server
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Ollama connection...');
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        console.error('Ollama connection failed:', response.statusText);
        return false;
      }

      const data = await response.json();
      console.log('Ollama available models:', data.models?.map((m: any) => m.name));
      return true;
    } catch (error: any) {
      console.error('Ollama connection test failed:', error.message || error);

      // Provide helpful error messages
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        console.error(
          '💡 Ollama connection failed. Make sure:\n' +
          '1. Ollama is running: `ollama serve`\n' +
          '2. CORS is enabled: `OLLAMA_ORIGINS=* ollama serve`\n' +
          `3. Server is accessible at: ${this.baseURL}`
        );
      }

      return false;
    }
  }

  /**
   * Get list of available models
   */
  async getAvailableModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Failed to get models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch Ollama models: ${error.message}`);
    }
  }

  /**
   * Send a message to Ollama
   */
  async sendMessage(message: string, context?: string): Promise<ChatMessage> {
    try {
      // Add context about current webpage if available
      const systemMessage = context
        ? `You are an AI assistant integrated into ZENO Browser. Current context: ${context}`
        : 'You are an AI assistant integrated into ZENO Browser.';

      // Build messages array including chat history
      const messages = [
        { role: 'system', content: systemMessage },
        ...this.chatHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: false,
          options: {
            temperature: this.temperature,
            num_predict: 2000
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const responseContent = data.message?.content || 'No response generated';

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

      // Keep only last 20 messages to prevent memory overflow
      if (this.chatHistory.length > 20) {
        this.chatHistory = this.chatHistory.slice(-20);
      }

      return assistantMessage;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw new Error(`Ollama API error: ${error.message}`);
    }
  }

  /**
   * Stream a message (for real-time responses)
   */
  async streamMessage(
    message: string,
    onChunk: (chunk: string) => void,
    context?: string
  ): Promise<string> {
    try {
      const systemMessage = context
        ? `You are an AI assistant integrated into ZENO Browser. Current context: ${context}`
        : 'You are an AI assistant integrated into ZENO Browser.';

      const messages = [
        { role: 'system', content: systemMessage },
        ...this.chatHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: true,
          options: {
            temperature: this.temperature,
            num_predict: 2000
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      let fullResponse = '';
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              fullResponse += data.message.content;
              onChunk(data.message.content);
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }

      // Add to chat history
      this.chatHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      this.chatHistory.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      });

      if (this.chatHistory.length > 20) {
        this.chatHistory = this.chatHistory.slice(-20);
      }

      return fullResponse;
    } catch (error: any) {
      throw new Error(`Ollama streaming error: ${error.message}`);
    }
  }

  /**
   * Execute MCP command
   */
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

      const result = await this.sendMessage(mcpPrompt);
      const text = result.content;

      try {
        // Try to parse as JSON for tool use
        const parsed = JSON.parse(text);
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
          analysis: text,
          timestamp: new Date().toISOString(),
          model: this.model
        },
        toolsUsed: ['ollama_analysis']
      };
    } catch (error: any) {
      return {
        success: false,
        error: `MCP execution failed: ${error.message}`
      };
    }
  }

  /**
   * Analyze web content
   */
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

      const result = await this.sendMessage(analysisPrompt);

      return {
        role: 'assistant',
        content: `🦙 **Web Content Analysis for ${url}**\n\n${result.content}`,
        timestamp: new Date()
      };
    } catch (error: any) {
      throw new Error(`Content analysis failed: ${error.message}`);
    }
  }

  /**
   * Pull a model from Ollama registry
   */
  async pullModel(modelName: string, onProgress?: (progress: number) => void): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: modelName,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.total && data.completed && onProgress) {
              const progress = (data.completed / data.total) * 100;
              onProgress(progress);
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }

      return true;
    } catch (error: any) {
      console.error('Failed to pull model:', error);
      return false;
    }
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  clearChatHistory(): void {
    this.chatHistory = [];
  }

  getConfig(): OllamaConfig {
    return {
      baseURL: this.baseURL,
      model: this.model,
      temperature: this.temperature,
      timeout: this.timeout
    };
  }

  setModel(model: string): void {
    this.model = model;
  }

  setTemperature(temperature: number): void {
    this.temperature = temperature;
  }
}

// Export factory function
export function createOllamaProvider(config?: OllamaConfig): OllamaProvider {
  return new OllamaProvider(config);
}

// Export default configuration
export const defaultOllamaConfig: OllamaConfig = {
  baseURL: 'http://localhost:11434',
  model: 'llama3.2:3b',
  temperature: 0.7,
  timeout: 30000
};

// Popular Ollama models
export const popularOllamaModels = [
  'llama3.2:1b',
  'llama3.2:3b',
  'llama3.1:8b',
  'llama3.1:70b',
  'mistral:7b',
  'mixtral:8x7b',
  'phi3:mini',
  'gemma2:2b',
  'gemma2:9b',
  'qwen2.5:7b',
  'codellama:7b',
  'deepseek-coder:6.7b'
];
