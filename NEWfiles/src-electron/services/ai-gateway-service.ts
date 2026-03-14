/**
 * AI Gateway Service - Bridge to AI Gateway
 * Handles requests to DeepSeek, OpenRouter, EdenAI
 */

import axios, { AxiosInstance } from 'axios';

export interface AIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: any;
}

export interface AIResponse {
  id: string;
  content: string;
  model: string;
  latency: number;
  provider: string;
  cost?: number;
  tokens?: { input: number; output: number; total: number };
}

export class AIGatewayService {
  private client: AxiosInstance;
  private baseUrl = 'http://localhost:3000/api';
  private isReady = false;

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 60000,
    });
  }

  async initialize(): Promise<void> {
    try {
      // Test connection to backend
      const response = await this.client.get('/health');
      this.isReady = response.status === 200;
      console.log('✅ AI Gateway Service connected');
    } catch (error) {
      console.warn('⚠️ AI Gateway backend not available yet');
      this.isReady = false;
    }
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    if (!this.isReady) {
      await this.initialize();
    }

    try {
      const response = await this.client.post<AIResponse>('/ai/execute', request);
      return response.data;
    } catch (error: any) {
      console.error(`❌ AI Gateway error: ${error.message}`);
      throw new Error(`AI execution failed: ${error.message}`);
    }
  }

  async getProviderStatus() {
    try {
      const response = await this.client.get('/ai/providers');
      return response.data;
    } catch (error) {
      console.error('Failed to get provider status:', error);
      return null;
    }
  }

  async getMetrics() {
    try {
      const response = await this.client.get('/ai/metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return null;
    }
  }

  isAvailable(): boolean {
    return this.isReady;
  }
}