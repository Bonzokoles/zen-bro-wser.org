"use strict";
/**
 * DeepSeek Provider - Primary for Deep Research
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class DeepSeekProvider {
    constructor(config) {
        this.name = 'deepseek';
        this.displayName = 'DeepSeek';
        this.enabled = true;
        this.priority = 1;
        this.endpoint = 'https://api.deepseek.com/v1';
        this.models = ['deepseek-chat', 'deepseek-coder'];
        this.maxQueueLength = 50;
        this.rateLimit = { rpm: 60, tokensPerMinute: 1000000 };
        this.timeout = 60000;
        this.capabilities = ['text-generation', 'reasoning', 'code-generation'];
        this.costPerMToken = 0.0014;
        this.apiKey = config.apiKey;
        this.priority = config.priority ?? 1;
        this.enabled = config.enabled ?? true;
        this.client = axios_1.default.create({
            baseURL: this.endpoint,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: this.timeout,
        });
    }
    async execute(request) {
        const startTime = Date.now();
        try {
            const response = await this.client.post('/chat/completions', {
                model: request.model || 'deepseek-chat',
                messages: [{ role: 'user', content: request.prompt }],
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens ?? 2048,
            });
            const latency = Date.now() - startTime;
            return {
                id: `deepseek-${Date.now()}`,
                content: response.data.choices[0].message.content,
                model: response.data.model,
                tokens: {
                    input: response.data.usage.prompt_tokens,
                    output: response.data.usage.completion_tokens,
                    total: response.data.usage.total_tokens,
                },
                latency,
                cached: false,
                provider: 'deepseek',
                timestamp: new Date(),
                cost: (response.data.usage.total_tokens / 1000000) * this.costPerMToken,
            };
        }
        catch (error) {
            throw new Error(`DeepSeek API Error: ${error.message}`);
        }
    }
    getStatus() {
        return { name: this.name, enabled: this.enabled, priority: this.priority };
    }
}
exports.DeepSeekProvider = DeepSeekProvider;
