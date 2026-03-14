/**
 * AI Gateway - Main Entry Point
 * Multi-provider router: DeepSeek, OpenRouter, EdenAI
 */

import { DeepSeekProvider } from './providers/deepseek';
import { OpenRouterProvider } from './providers/openrouter';
import { EdenAIProvider } from './providers/edenai';
import type { AIProvider } from './providers/index';

export interface AIGatewayConfig {
  providers: {
    deepseek?: { apiKey: string; enabled: boolean; priority: number };
    openrouter?: { apiKey: string; enabled: boolean; priority: number };
    edenai?: { apiKey: string; enabled: boolean; priority: number };
    openai?: { apiKey: string; enabled: boolean; priority: number };
    anthropic?: { apiKey: string; enabled: boolean; priority: number };
  };
  cacheConfig?: { enabled: boolean; maxSize: number; ttl: number };
  monitoring?: { enabled: boolean; metricsInterval: number };
}

// Load configuration from environment
const gatewayConfig: AIGatewayConfig = {
  providers: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      enabled: !!process.env.DEEPSEEK_API_KEY,
      priority: 1,
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      enabled: !!process.env.OPENROUTER_API_KEY,
      priority: 2,
    },
    edenai: {
      apiKey: process.env.EDENAI_API_KEY || '',
      enabled: !!process.env.EDENAI_API_KEY,
      priority: 3,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      enabled: process.env.USE_CLASSIC_AI === 'true',
      priority: 99,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      enabled: process.env.USE_CLASSIC_AI === 'true',
      priority: 100,
    },
  },
  cacheConfig: {
    enabled: true,
    maxSize: 5000,
    ttl: 3600,
  },
  monitoring: {
    enabled: true,
    metricsInterval: 60000,
  },
};

// Export providers and types
export { DeepSeekProvider } from './providers/deepseek';
export { OpenRouterProvider } from './providers/openrouter';
export { EdenAIProvider } from './providers/edenai';
export * from './providers/index';