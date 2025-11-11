import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
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

export class GeminiProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: GeminiConfig;
  private chatHistory: ChatMessage[] = [];

  constructor(config: GeminiConfig) {
    this.config = {
      model: 'gemini-1.5-pro',
      ...config
    };
    
    if (!this.config.apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: this.config.model,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
  }

  async sendMessage(message: string, context?: string): Promise<ChatMessage> {
    try {
      // Add context about current webpage if available
      const prompt = context 
        ? `Context: Currently viewing webpage - ${context}\n\nUser: ${message}`
        : message;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: text,
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
    } catch (error) {
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      const result = await this.model.generateContent(mcpPrompt);
      const response = await result.response;
      const text = response.text();

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
          timestamp: new Date().toISOString()
        },
        toolsUsed: ['gemini_analysis']
      };
    } catch (error) {
      return {
        success: false,
        error: `MCP execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async analyzeWebContent(url: string, content: string): Promise<ChatMessage> {
    try {
      const analysisPrompt = `
Analyze this web content from URL: ${url}

Content preview:
${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

Please provide:
1. Summary of the main content
2. Key insights or important information
3. Relevant links or references mentioned
4. Suggestions for further exploration

Keep the analysis concise but comprehensive.
`;

      const result = await this.model.generateContent(analysisPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        role: 'assistant',
        content: `📄 **Web Content Analysis for ${url}**\n\n${text}`,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  clearChatHistory(): void {
    this.chatHistory = [];
  }

  getConfig(): GeminiConfig {
    return { ...this.config };
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Gemini connection...');
      const result = await this.model.generateContent('Hello, can you respond with a simple greeting?');
      const response = await result.response;
      const text = response.text();
      console.log('Gemini response:', text);
      return text && text.length > 0;
    } catch (error) {
      console.error('Gemini connection test failed:', error instanceof Error ? error.message : error);
      throw error; // Re-throw to get more specific error info
    }
  }
}

// Export factory function
export function createGeminiProvider(apiKey: string, model?: string): GeminiProvider {
  return new GeminiProvider({ apiKey, model });
}

// Export default configuration
export const defaultGeminiConfig: Partial<GeminiConfig> = {
  model: 'gemini-1.5-pro'
};