/**
 * OpenRouter Provider - Multi-model Aggregator
 */
import { AIProvider, AIRequest, AIResponse } from './index';
export declare class OpenRouterProvider implements AIProvider {
    name: 'openrouter';
    displayName: string;
    enabled: boolean;
    priority: number;
    endpoint: string;
    apiKey: string;
    models: string[];
    maxQueueLength: number;
    rateLimit: {
        rpm: number;
    };
    timeout: number;
    capabilities: import('./index').AICapability[];
    costPerMToken: number;
    private client;
    constructor(config: {
        apiKey: string;
        priority?: number;
        enabled?: boolean;
    });
    execute(request: AIRequest): Promise<AIResponse>;
    getStatus(): {
        name: "openrouter";
        enabled: boolean;
        priority: number;
    };
}
