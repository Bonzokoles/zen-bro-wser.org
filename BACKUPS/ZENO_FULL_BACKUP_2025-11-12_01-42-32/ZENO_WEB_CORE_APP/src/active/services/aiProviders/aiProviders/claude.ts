import Anthropic from '@anthropic-ai/sdk';
import type { Message } from '@anthropic-ai/sdk/resources/messages';
import { AppError, createAuthError, createRateLimitError, createNetworkError, handleError } from '../../utils/AppError';

export interface ClaudeConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class ClaudeProvider {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: ClaudeConfig) {
    if (!config.apiKey) {
      throw createAuthError('Claude API');
    }

    this.client = new Anthropic({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true // TODO: Move to backend proxy for security
    });

    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
  }

  async sendMessage(
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): Promise<string> {
    try {
      const response: Message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      // Extract text from response
      const textContent = response.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new AppError(
          'No text content in Claude response',
          'API_ERROR',
          'Claude did not return a valid response. Please try again.'
        );
      }

      return textContent.text;
    } catch (error: any) {
      // Handle specific Claude errors
      if (error.status === 401) {
        throw createAuthError('Claude API');
      }

      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'];
        throw createRateLimitError(retryAfter ? parseInt(retryAfter) : 60);
      }

      if (error.status >= 500) {
        throw createNetworkError('Claude API server error');
      }

      throw handleError(error);
    }
  }

  async streamMessage(
    messages: ClaudeMessage[],
    systemPrompt?: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stream: true
      });

      let fullResponse = '';

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const chunk = event.delta.text;
          fullResponse += chunk;
          if (onChunk) {
            onChunk(chunk);
          }
        }
      }

      return fullResponse;
    } catch (error: any) {
      if (error.status === 401) {
        throw createAuthError('Claude API');
      }

      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'];
        throw createRateLimitError(retryAfter ? parseInt(retryAfter) : 60);
      }

      if (error.status >= 500) {
        throw createNetworkError('Claude API server error');
      }

      throw handleError(error);
    }
  }

  // Utility method to count tokens (approximate)
  estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  // Get available models
  static getAvailableModels(): string[] {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
  }

  // Model pricing (per 1M tokens) - for reference
  static getModelPricing(model: string): { input: number; output: number } {
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
      'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00 },
      'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
      'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 }
    };

    return pricing[model] || { input: 0, output: 0 };
  }
}

// Singleton instance management
let claudeInstance: ClaudeProvider | null = null;

export const initializeClaude = (config: ClaudeConfig): ClaudeProvider => {
  claudeInstance = new ClaudeProvider(config);
  return claudeInstance;
};

export const getClaude = (): ClaudeProvider | null => {
  return claudeInstance;
};

export const resetClaude = (): void => {
  claudeInstance = null;
};
