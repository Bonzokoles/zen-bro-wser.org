/**
 * AI Gateway - Main Entry Point
 * Multi-provider router: DeepSeek, OpenRouter, EdenAI
 */
export interface AIGatewayConfig {
    providers: {
        deepseek?: {
            apiKey: string;
            enabled: boolean;
            priority: number;
        };
        openrouter?: {
            apiKey: string;
            enabled: boolean;
            priority: number;
        };
        edenai?: {
            apiKey: string;
            enabled: boolean;
            priority: number;
        };
        openai?: {
            apiKey: string;
            enabled: boolean;
            priority: number;
        };
        anthropic?: {
            apiKey: string;
            enabled: boolean;
            priority: number;
        };
    };
    cacheConfig?: {
        enabled: boolean;
        maxSize: number;
        ttl: number;
    };
    monitoring?: {
        enabled: boolean;
        metricsInterval: number;
    };
}
export { DeepSeekProvider } from './providers/deepseek';
export { OpenRouterProvider } from './providers/openrouter';
export { EdenAIProvider } from './providers/edenai';
export * from './providers/index';
