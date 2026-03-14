/**
 * AI Gateway Service - Bridge to Multi-Model Environment
 * Native handling for Gemini, Claude, and OpenRouter
 */

import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  cost?: number;
}

export class AIGatewayService {
  private gemini: GoogleGenerativeAI;
  private isReady = false;

  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'PLACEHOLDER');
  }

  async initialize(): Promise<void> {
    console.log('✅ AI Gateway Service initializing models...');
    this.isReady = true;
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    if (!this.isReady) await this.initialize();
    
    const startTime = Date.now();
    const modelTarget = request.model?.toLowerCase() || 'gemini-1.5-pro';

    try {
      if (modelTarget.includes('gemini')) {
        return await this.executeGemini(request, startTime);
      } else if (modelTarget.includes('claude')) {
        return await this.executeClaude(request, startTime);
      } else {
        return await this.executeOpenRouter(request, startTime);
      }
    } catch (error: any) {
      console.error(`❌ AI Gateway error: ${error.message}`);
      
      // Failover mechanism
      if (modelTarget !== 'gemini-1.5-flash') {
        console.warn('⚠️ Automated Failover: Switching to gemini-1.5-flash...');
        const failbackRequest = { ...request, model: 'gemini-1.5-flash' };
        return await this.executeGemini(failbackRequest, startTime);
      }
      throw new Error(`AI execution failed: ${error.message}`);
    }
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
      }
    });

    return {
      id: `gemini-${Date.now()}`,
      content: result.response.text(),
      model: modelId,
      latency: Date.now() - startTime,
      provider: 'google'
    };
  }

  private async executeClaude(request: AIRequest, startTime: number): Promise<AIResponse> {
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: request.model || 'claude-3-opus-20240229',
      max_tokens: request.maxTokens || 4096,
      messages: [{ role: 'user', content: request.prompt }],
      system: request.systemInstruction
    }, {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });

    return {
      id: response.data.id || `claude-${Date.now()}`,
      content: response.data.content[0].text,
      model: request.model || 'claude-3',
      latency: Date.now() - startTime,
      provider: 'anthropic'
    };
  }

  private async executeOpenRouter(request: AIRequest, startTime: number): Promise<AIResponse> {
    const messages: any[] = [];
    if (request.systemInstruction) {
      messages.push({ role: 'system', content: request.systemInstruction });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: request.model || 'openai/gpt-4o',
      messages,
      temperature: request.temperature || 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
      }
    });

    return {
      id: response.data.id,
      content: response.data.choices[0].message.content,
      model: response.data.model,
      latency: Date.now() - startTime,
      provider: 'openrouter'
    };
  }

  async getProviderStatus() {
    return {
      google: !!process.env.GEMINI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY
    };
  }

  async getMetrics() {
    return {
      totalRequests: 0,
      averageLatency: 0
    };
  }

  isAvailable(): boolean {
    return this.isReady;
  }
}