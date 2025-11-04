import { ModelConfig, ModelProvider } from '../config/models.config';
import { IModelProvider } from '../models/IModelProvider';
// Import concrete provider implementations here once they are created
// import { OpenAIProvider } from '../models/OpenAIProvider';
// import { OllamaProvider } from '../models/OllamaProvider';

export class ModelFactory {
  static create(modelConfig: ModelConfig): IModelProvider {
    switch (modelConfig.provider) {
      // case ModelProvider.OpenAI:
      //   return new OpenAIProvider(modelConfig);
      // case ModelProvider.Ollama:
      //   return new OllamaProvider(modelConfig);
      
      // Add cases for Gemini, Anthropic, etc.

      default:
        // For now, return a mock provider
        return new MockProvider(modelConfig);
    }
  }
}

// Mock provider for demonstration purposes until concrete implementations are added
class MockProvider implements IModelProvider {
  config: ModelConfig;
  private callCount = 0;

  constructor(config: ModelConfig) {
    this.config = config;
    console.log(`MockProvider initialized for model: ${config.id}`);
  }

  async chat(messages: import("../models/IModelProvider").ChatMessage[]): Promise<import("../models/IModelProvider").ModelResponse> {
    this.callCount++;
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

    // On the first call, pretend to use a tool
    if (this.callCount === 1) {
      console.log('[MockProvider] First call, simulating a tool call.');
      return {
        content: null,
        toolCalls: [
          {
            id: 'tool_call_123',
            function: {
              name: 'web_search',
              arguments: JSON.stringify({ query: 'state of quantum computing' }),
            },
          },
        ],
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
      };
    }

    // On the second call, provide the final answer based on the (pretend) tool result
    console.log('[MockProvider] Second call, providing final answer.');
    return {
      content: `This is the final summary about quantum computing based on the mock web search. The last user message was: "${lastUserMessage}"`,
      usage: { promptTokens: 20, completionTokens: 30, totalTokens: 50 },
    };
  }
}
