"use strict";
/**
 * EdenAI Provider - Multi-provider Aggregation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdenAIProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class EdenAIProvider {
    constructor(config) {
        this.name = 'edenai';
        this.displayName = 'EdenAI';
        this.enabled = true;
        this.priority = 3;
        this.endpoint = 'https://api.edenai.run/v1';
        this.models = ['openai.gpt-4', 'huggingfaceh4.zephyr-7b-beta'];
        this.maxQueueLength = 50;
        this.rateLimit = { rpm: 50 };
        this.timeout = 30000;
        this.capabilities = ['text-generation', 'vision'];
        this.costPerMToken = 0.0015;
        this.apiKey = config.apiKey;
        this.priority = config.priority ?? 3;
        this.enabled = config.enabled ?? true;
        this.client = axios_1.default.create({
            baseURL: this.endpoint,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
            timeout: this.timeout,
        });
    }
    async execute(request) {
        const startTime = Date.now();
        try {
            const response = await this.client.post('/text/generation', {
                providers: ['openai'],
                text: request.prompt,
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens ?? 2048,
            });
            const latency = Date.now() - startTime;
            return {
                id: `edenai-${Date.now()}`,
                content: response.data.result.generated_text,
                model: request.model || 'edenai-default',
                tokens: { input: 0, output: 0, total: 0 },
                latency,
                cached: false,
                provider: 'edenai',
                timestamp: new Date(),
            };
        }
        catch (error) {
            throw new Error(`EdenAI API Error: ${error.message}`);
        }
    }
    getStatus() {
        return { name: this.name, enabled: this.enabled, priority: this.priority };
    }
}
exports.EdenAIProvider = EdenAIProvider;
