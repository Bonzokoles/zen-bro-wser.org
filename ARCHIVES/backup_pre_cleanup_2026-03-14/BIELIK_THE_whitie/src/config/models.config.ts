export enum ModelProvider {
  OpenAI = 'openai',
  Gemini = 'gemini',
  Anthropic = 'anthropic',
  OpenRouter = 'openrouter',
  Ollama = 'ollama', // For local models
  Custom = 'custom', // For any other HTTP endpoint
}

export interface ModelConfig {
  id: string; // Unique identifier for the model, e.g., 'gpt-4o'
  provider: ModelProvider;
  modelName: string; // The actual model name used by the provider's API, e.g., 'gpt-4o'
  apiKeyEnvVar?: string; // Environment variable name for the API key
  baseURL?: string; // Base URL for the API (useful for local/custom providers)
  maxTokens?: number;
  temperature?: number;
}

// Default model configurations
// Users can add their own models here from any source.
export const models: ModelConfig[] = [
  // --- OpenAI ---
  {
    id: 'gpt-4o',
    provider: ModelProvider.OpenAI,
    modelName: 'gpt-4o',
    apiKeyEnvVar: 'OPENAI_API_KEY',
  },
  {
    id: 'gpt-3.5-turbo',
    provider: ModelProvider.OpenAI,
    modelName: 'gpt-3.5-turbo',
    apiKeyEnvVar: 'OPENAI_API_KEY',
  },

  // --- Google Gemini ---
  {
    id: 'gemini-1.5-pro',
    provider: ModelProvider.Gemini,
    modelName: 'gemini-1.5-pro-latest',
    apiKeyEnvVar: 'GEMINI_API_KEY',
  },

  // --- OpenRouter (access to many models) ---
  {
    id: 'openrouter-llama3-8b',
    provider: ModelProvider.OpenRouter,
    modelName: 'meta-llama/llama-3-8b-instruct',
    apiKeyEnvVar: 'OPENROUTER_API_KEY',
  },

  // --- Local Model via Ollama ---
  {
    id: 'local-llama3',
    provider: ModelProvider.Ollama,
    modelName: 'llama3',
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },
  {
    id: 'local-phi3',
    provider: ModelProvider.Ollama,
    modelName: 'phi3',
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },
];
