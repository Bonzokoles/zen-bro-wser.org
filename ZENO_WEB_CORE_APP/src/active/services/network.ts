/**
 * ZENO Browser Network Service
 * Handles HTTP requests, CORS proxying, and network management
 */

export interface NetworkRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

export interface NetworkResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
  url: string;
  duration: number;
}

export class NetworkService {
  private proxyUrl: string;
  private defaultTimeout: number;

  constructor(proxyUrl = '/api/proxy', defaultTimeout = 30000) {
    this.proxyUrl = proxyUrl;
    this.defaultTimeout = defaultTimeout;
  }

  async fetch(request: NetworkRequest): Promise<NetworkResponse> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeout ?? this.defaultTimeout);
    try {
      const response = await fetch(request.url, {
        method: request.method ?? 'GET',
        headers: request.headers,
        body: request.body,
        signal: controller.signal,
      });
      const body = await response.text();
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body,
        url: response.url,
        duration: Date.now() - startTime,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async fetchViaProxy(url: string): Promise<NetworkResponse> {
    return this.fetch({ url: `${this.proxyUrl}?url=${encodeURIComponent(url)}` });
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        mode: 'no-cors',
      });
      return true;
    } catch {
      return false;
    }
  }

  parseUrl(input: string): string {
    if (input.startsWith('http://') || input.startsWith('https://')) return input;
    if (input.includes('.') && !input.includes(' ')) return `https://${input}`;
    return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
  }
}

export const networkService = new NetworkService();
