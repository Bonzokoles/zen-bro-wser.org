/**
 * AI Gateway Service - Bridge to Multi-Model Environment
 * Supports: Gemini, Claude, OpenRouter, DeepSeek, EdenAI
 * Features: LRU cache (10 min TTL), priority routing, failover
 */
export interface AIRequest {
    prompt: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
}
export interface AIResponse {
    id: string;
    content: string;
    model: string;
    latency: number;
    provider: string;
    cached?: boolean;
    tokens?: {
        input: number;
        output: number;
        total: number;
    };
    cost?: number;
}
export declare class AIGatewayService {
    private gemini;
    private isReady;
    private cache;
    private metrics;
    private providers;
    constructor();
    private _initProviders;
    initialize(): Promise<void>;
    execute(request: AIRequest): Promise<AIResponse>;
    private _executeViaProvider;
    private executeGemini;
    private executeClaude;
    private executeOpenRouterDirect;
    getProviderStatus(): Promise<{
        google: boolean;
        anthropic: boolean;
        openrouter: boolean;
        deepseek: boolean;
        edenai: boolean;
    }>;
    getMetrics(): Promise<{
        totalRequests: number;
        cacheHits: number;
        cacheSize: number;
        averageLatency: number;
        errors: number;
    }>;
    isAvailable(): boolean;
}
