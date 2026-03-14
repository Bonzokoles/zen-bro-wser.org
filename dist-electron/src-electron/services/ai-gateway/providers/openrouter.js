"use strict";
/**
 * OpenRouter Provider - Multi-model Aggregator
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class OpenRouterProvider {
    constructor(config) {
        this.name = 'openrouter';
        this.displayName = 'OpenRouter';
        this.enabled = true;
        this.priority = 2;
        this.endpoint = 'https://openrouter.io/api/v1';
        this.models = ['anthropic/claude-3-opus', 'openai/gpt-4-turbo'];
        this.maxQueueLength = 50;
        this.rateLimit = { rpm: 100 };
        this.timeout = 30000;
        this.capabilities = ['text-generation', 'code-generation', 'vision'];
        this.costPerMToken = 0.002;
        this.apiKey = config.apiKey;
        this.priority = config.priority ?? 2;
        this.enabled = config.enabled ?? true;
        this.client = axios_1.default.create({
            baseURL: this.endpoint,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://zeno-browser.local',
            },
            timeout: this.timeout,
        });
    }
    async execute(request) {
        const startTime = Date.now();
        try {
            const response = await this.client.post('/chat/completions', {
                model: request.model || this.models[0],
                messages: [{ role: 'user', content: request.prompt }],
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens ?? 2048,
            });
            const latency = Date.now() - startTime;
            return {
                id: `openrouter-${Date.now()}`,
                content: response.data.choices[0].message.content,
                model: response.data.model,
                tokens: {
                    input: response.data.usage.prompt_tokens,
                    output: response.data.usage.completion_tokens,
                    total: response.data.usage.total_tokens,
                },
                latency,
                cached: false,
                provider: 'openrouter',
                timestamp: new Date(),
                cost: (response.data.usage.total_tokens / 1000000) * this.costPerMToken,
            };
        }
        catch (error) {
            throw new Error(`OpenRouter API Error: ${error.message}`);
        }
    }
    getStatus() {
        return { name: this.name, enabled: this.enabled, priority: this.priority };
    }
}
exports.OpenRouterProvider = OpenRouterProvider;
