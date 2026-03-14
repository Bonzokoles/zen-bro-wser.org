import { ModelConfig } from '../config/models.config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string; // Included for tool responses
}

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string; // JSON string of arguments
  };
}

export interface ModelResponse {
  content: string | null; // Can be null if only tool calls are present
  toolCalls?: ToolCall[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface IModelProvider {
  config: ModelConfig;
  chat(messages: ChatMessage[]): Promise<ModelResponse>;
}
