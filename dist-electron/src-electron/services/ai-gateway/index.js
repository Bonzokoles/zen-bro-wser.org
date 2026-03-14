"use strict";
/**
 * AI Gateway - Main Entry Point
 * Multi-provider router: DeepSeek, OpenRouter, EdenAI
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdenAIProvider = exports.OpenRouterProvider = exports.DeepSeekProvider = void 0;
// Load configuration from environment
const gatewayConfig = {
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
var deepseek_1 = require("./providers/deepseek");
Object.defineProperty(exports, "DeepSeekProvider", { enumerable: true, get: function () { return deepseek_1.DeepSeekProvider; } });
var openrouter_1 = require("./providers/openrouter");
Object.defineProperty(exports, "OpenRouterProvider", { enumerable: true, get: function () { return openrouter_1.OpenRouterProvider; } });
var edenai_1 = require("./providers/edenai");
Object.defineProperty(exports, "EdenAIProvider", { enumerable: true, get: function () { return edenai_1.EdenAIProvider; } });
__exportStar(require("./providers/index"), exports);
