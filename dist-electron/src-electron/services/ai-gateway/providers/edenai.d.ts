/**
 * EdenAI Provider - Multi-provider Aggregation
 */
import { AIProvider, AIRequest, AIResponse } from './index';
export declare class EdenAIProvider implements AIProvider {
    name: 'edenai';
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
        name: "edenai";
        enabled: boolean;
        priority: number;
    };
}
