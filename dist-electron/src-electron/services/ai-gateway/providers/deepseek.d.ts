/**
 * DeepSeek Provider - Primary for Deep Research
 */
import { AIProvider, AIRequest, AIResponse, AICapability } from './index';
export declare class DeepSeekProvider implements AIProvider {
    name: 'deepseek';
    displayName: string;
    enabled: boolean;
    priority: number;
    endpoint: string;
    apiKey: string;
    models: string[];
    maxQueueLength: number;
    rateLimit: {
        rpm: number;
        tokensPerMinute: number;
    };
    timeout: number;
    capabilities: AICapability[];
    costPerMToken: number;
    private client;
    constructor(config: {
        apiKey: string;
        priority?: number;
        enabled?: boolean;
    });
    execute(request: AIRequest): Promise<AIResponse>;
    getStatus(): {
        name: "deepseek";
        enabled: boolean;
        priority: number;
    };
}
