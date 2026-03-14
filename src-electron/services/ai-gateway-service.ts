/**
 * AI Gateway Service - Bridge to Multi-Model Environment
 * Supports: Gemini, Claude, OpenRouter, DeepSeek, EdenAI
 * Features: LRU cache (10 min TTL), priority routing, failover
 */

import axios from 'axios';
import { LRUCache } from 'lru-cache';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DeepSeekProvider } from './ai-gateway/providers/deepseek';
import { OpenRouterProvider } from './ai-gateway/providers/openrouter';
import { EdenAIProvider } from './ai-gateway/providers/edenai';
import type { AIProvider } from './ai-gateway/providers/index';

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
  tokens?: { input: number; output: number; total: number };
  cost?: number;
}

interface GatewayMetrics {
  totalRequests: number;
  cacheHits: number;
  totalLatency: number;
  errors: number;
}

export class AIGatewayService {
  private gemini: GoogleGenerativeAI;
  private isReady = false;

  private cache = new LRUCache<string, AIResponse>({
    max: 100,
    ttl: 1000 * 60 * 10, // 10 minutes
  });

  private metrics: GatewayMetrics = { totalRequests: 0, cacheHits: 0, totalLatency: 0, errors: 0 };

  private providers: AIProvider[] = [];

  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this._initProviders();
  }

  private _initProviders(): void {
    if (process.env.DEEPSEEK_API_KEY) {
      this.providers.push(new DeepSeekProvider({ apiKey: process.env.DEEPSEEK_API_KEY, priority: 1 }));
    }
    if (process.env.OPENROUTER_API_KEY) {
      this.providers.push(new OpenRouterProvider({ apiKey: process.env.OPENROUTER_API_KEY, priority: 2 }));
    }
    if (process.env.EDENAI_API_KEY) {
      this.providers.push(new EdenAIProvider({ apiKey: process.env.EDENAI_API_KEY, priority: 3 }));
    }
    // Sort by priority ascending
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  async initialize(): Promise<void> {
    console.log('✅ AI Gateway Service initializing...');
    console.log(`   External providers loaded: ${this.providers.map(p => p.displayName).join(', ') || 'none'}`);
    this.isReady = true;
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    if (!this.isReady) await this.initialize();

    this.metrics.totalRequests++;
    const cacheKey = `${request.model || 'default'}:${request.prompt}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.metrics.cacheHits++;
      return { ...cached, cached: true };
    }

    const startTime = Date.now();
    const modelTarget = request.model?.toLowerCase() || 'gemini-1.5-pro';
    let result: AIResponse;

    try {
      if (modelTarget.includes('deepseek') && process.env.DEEPSEEK_API_KEY) {
        result = await this._executeViaProvider('deepseek', request, startTime);
      } else if (modelTarget.includes('gemini')) {
        result = await this.executeGemini(request, startTime);
      } else if (modelTarget.includes('claude')) {
        result = await this.executeClaude(request, startTime);
      } else if (this.providers.length > 0) {
        // Use highest-priority available external provider
        result = await this._executeViaProvider(this.providers[0].name, request, startTime);
      } else {
        result = await this.executeOpenRouterDirect(request, startTime);
      }
    } catch (error: any) {
      this.metrics.errors++;
      console.error(`❌ AI Gateway error: ${error.message}`);

      // Failover to gemini-1.5-flash
      if (modelTarget !== 'gemini-1.5-flash') {
        console.warn('⚠️ Automated Failover: Switching to gemini-1.5-flash...');
        result = await this.executeGemini({ ...request, model: 'gemini-1.5-flash' }, startTime);
      } else {
        throw new Error(`AI execution failed: ${error.message}`);
      }
    }

    this.metrics.totalLatency += result.latency;
    this.cache.set(cacheKey, result);
    return result;
  }

  private async _executeViaProvider(providerName: string, request: AIRequest, startTime: number): Promise<AIResponse> {
    const provider = this.providers.find(p => p.name === providerName);
    if (!provider || !provider.enabled) throw new Error(`Provider '${providerName}' not available`);

    const res = await provider.execute({
      prompt: request.prompt,
      model: request.model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    });

    return {
      id: res.id,
      content: res.content,
      model: res.model,
      latency: res.latency ?? (Date.now() - startTime),
      provider: res.provider,
      cached: false,
      tokens: res.tokens,
      cost: res.cost,
    };
  }

  private async executeGemini(request: AIRequest, startTime: number): Promise<AIResponse> {
    const modelId = request.model || 'gemini-1.5-pro';
    const modelConfig: any = { model: modelId };

    if (request.systemInstruction) {
      modelConfig.systemInstruction = request.systemInstruction;
    }

    const model = this.gemini.getGenerativeModel(modelConfig);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 8192,
      },
    });

    return {
      id: `gemini-${Date.now()}`,
      content: result.response.text(),
      model: modelId,
      latency: Date.now() - startTime,
      provider: 'google',
      cached: false,
    };
  }

  private async executeClaude(request: AIRequest, startTime: number): Promise<AIResponse> {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: request.model || 'claude-3-opus-20240229',
        max_tokens: request.maxTokens || 4096,
        messages: [{ role: 'user', content: request.prompt }],
        system: request.systemInstruction,
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    return {
      id: response.data.id || `claude-${Date.now()}`,
      content: response.data.content[0].text,
      model: request.model || 'claude-3',
      latency: Date.now() - startTime,
      provider: 'anthropic',
      cached: false,
    };
  }

  private async executeOpenRouterDirect(request: AIRequest, startTime: number): Promise<AIResponse> {
    const messages: any[] = [];
    if (request.systemInstruction) {
      messages.push({ role: 'system', content: request.systemInstruction });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: request.model || 'openai/gpt-4o',
        messages,
        temperature: request.temperature || 0.7,
      },
      {
        headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}` },
      }
    );

    return {
      id: response.data.id,
      content: response.data.choices[0].message.content,
      model: response.data.model,
      latency: Date.now() - startTime,
      provider: 'openrouter',
      cached: false,
    };
  }

  async getProviderStatus() {
    const external: Record<string, any> = {};
    for (const p of this.providers) {
      external[p.name] = { enabled: p.enabled, priority: p.priority, status: p.getStatus() };
    }
    return {
      google: !!process.env.GEMINI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      deepseek: !!process.env.DEEPSEEK_API_KEY,
      edenai: !!process.env.EDENAI_API_KEY,
      ...external,
    };
  }

  async getMetrics() {
    const avgLatency = this.metrics.totalRequests > 0
      ? Math.round(this.metrics.totalLatency / this.metrics.totalRequests)
      : 0;

    return {
      totalRequests: this.metrics.totalRequests,
      cacheHits: this.metrics.cacheHits,
      cacheSize: this.cache.size,
      averageLatency: avgLatency,
      errors: this.metrics.errors,
    };
  }

  isAvailable(): boolean {
    return this.isReady;
  }
}