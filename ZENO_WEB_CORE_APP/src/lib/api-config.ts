/**
 * Konfiguracja API dla zen-bro-wser.org
 * Integracja z Cloudflare Workers Gateway
 */

// Adresy bazowe
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_BASE = isDev
  ? 'https://zen-api-gateway.stolarnia-ams.workers.dev'
  : 'https://api.zen-bro-wser.org';

export const STATIC_BASE = isDev
  ? 'https://zen-static-gateway.stolarnia-ams.workers.dev'
  : 'https://static.zen-bro-wser.org';

export const AUTH_BASE = isDev
  ? 'https://zen-auth-gateway.stolarnia-ams.workers.dev'
  : 'https://auth.zen-bro-wser.org';

export const METRICS_BASE = isDev
  ? 'https://zen-metrics-gateway.stolarnia-ams.workers.dev'
  : 'https://metrics.zen-bro-wser.org';

export const AI_BASE = isDev
  ? 'https://zen-deepseek-gateway.stolarnia-ams.workers.dev'
  : 'https://ai.zen-bro-wser.org';

export const MCP_BASE = isDev
  ? 'https://zen-mcp-gateway.stolarnia-ams.workers.dev'
  : 'https://mcp.zen-bro-wser.org';

export const RAG_BASE = isDev
  ? 'https://zen-rag-gateway.stolarnia-ams.workers.dev'
  : 'https://rag.zen-bro-wser.org';

// WebSocket URLs
export const CHAT_WS = isDev
  ? 'wss://zen-chat-ws.stolarnia-ams.workers.dev'
  : 'wss://chat.zen-bro-wser.org';

export const COLLAB_WS = isDev
  ? 'wss://zen-collab-ws.stolarnia-ams.workers.dev'
  : 'wss://collab.zen-bro-wser.org';

export const NOTIFICATIONS_WS = isDev
  ? 'wss://zen-notifications-ws.stolarnia-ams.workers.dev'
  : 'wss://notifications.zen-bro-wser.org';

/**
 * Helper do wykonywania requestów API
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  base: string = API_BASE
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${base}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nieznany błąd',
    };
  }
}

/**
 * Tracking metrics
 */
export async function trackMetric(
  type: string,
  data: Record<string, any>,
  session?: string
): Promise<void> {
  try {
    await fetch(`${METRICS_BASE}/metrics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        data,
        session: session || getSessionId(),
        timestamp: Date.now(),
      }),
    });
  } catch (e) {
    console.warn('Failed to track metric:', e);
  }
}

/**
 * Automatyczne śledzenie pageview
 */
export function trackPageView(): void {
  if (typeof window === 'undefined') return;

  trackMetric('pageview', {
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  });
}

/**
 * RAG Search - wyszukiwanie w bazie wiedzy
 */
export async function ragSearch(
  query: string,
  topK: number = 5
): Promise<{ success: boolean; results?: any[]; error?: string }> {
  return apiRequest('/rag/search', {
    method: 'POST',
    body: JSON.stringify({ query, topK }),
  }, RAG_BASE);
}

/**
 * RAG Query - pytanie do bazy wiedzy z odpowiedzią AI
 */
export async function ragQuery(
  question: string,
  context?: string
): Promise<{ success: boolean; answer?: string; sources?: string[]; error?: string }> {
  return apiRequest('/rag/query', {
    method: 'POST',
    body: JSON.stringify({ question, context }),
  }, RAG_BASE);
}

/**
 * AI Chat - rozmowa z DeepSeek
 */
export async function aiChat(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }
): Promise<{ success: boolean; response?: string; error?: string }> {
  return apiRequest('/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, ...options }),
  }, AI_BASE);
}

/**
 * Session ID management
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('zen_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('zen_session_id', sessionId);
  }
  return sessionId;
}

/**
 * WebSocket połączenie
 */
export function createWebSocket(
  url: string,
  onMessage: (data: any) => void,
  onOpen?: () => void,
  onClose?: () => void,
  onError?: (error: Event) => void
): WebSocket {
  const ws = new WebSocket(url);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      onMessage(event.data);
    }
  };

  if (onOpen) ws.onopen = onOpen;
  if (onClose) ws.onclose = onClose;
  if (onError) ws.onerror = onError;

  return ws;
}

// Export domyślnej konfiguracji
export default {
  API_BASE,
  STATIC_BASE,
  AUTH_BASE,
  METRICS_BASE,
  AI_BASE,
  MCP_BASE,
  RAG_BASE,
  CHAT_WS,
  COLLAB_WS,
  NOTIFICATIONS_WS,
  apiRequest,
  trackMetric,
  trackPageView,
  ragSearch,
  ragQuery,
  aiChat,
  createWebSocket,
};
