/**
 * PostMessageService - Komunikacja host ↔ iframe
 * Uproszczona wersja do nauki krok po kroku
 * 
 * Typy wiadomości:
 * - LOAD_COMPLETE: iframe zakończył ładowanie
 * - ERROR: wystąpił błąd w iframe
 * - TEXT_SELECTION: użytkownik zaznaczył tekst
 * - PING/PONG: test połączenia
 */

type MsgType = 'LOAD_COMPLETE' | 'ERROR' | 'TEXT_SELECTION' | 'PING' | 'PONG';

interface IframeMessage {
  type: MsgType;
  payload?: any;
}

export class PostMessageService {
  private iframeWindow: Window | null = null;
  private origin: string = '*';
  private listeners: Map<MsgType, ((payload: any) => void)[]> = new Map();

  /**
   * Konstruktor - przyjmuje iframe i dozwolone origin
   */
  constructor(iframe: HTMLIFrameElement, origin: string = '*') {
    this.iframeWindow = iframe.contentWindow;
    this.origin = origin;
    window.addEventListener('message', this.handleMessage.bind(this));
    console.log('[PostMessageService] Initialized for origin:', origin);
  }

  /**
   * Wyślij wiadomość do iframe
   */
  sendMessage(type: MsgType, payload?: any) {
    if (this.iframeWindow) {
      const message: IframeMessage = { type, payload };
      this.iframeWindow.postMessage(message, this.origin);
      console.log('[PostMessageService] Sent:', type, payload);
    } else {
      console.warn('[PostMessageService] No iframe window available');
    }
  }

  /**
   * Zarejestruj handler dla typu wiadomości
   */
  on(type: MsgType, callback: (payload: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
  }

  /**
   * Obsługa przychodzących wiadomości
   */
  private handleMessage(event: MessageEvent) {
    // Walidacja origin (bezpieczeństwo)
    if (this.origin !== '*' && event.origin !== this.origin) {
      console.warn('[PostMessageService] Blocked message from:', event.origin);
      return;
    }

    const message = event.data as IframeMessage;
    
    // Sprawdź czy to nasza wiadomość
    if (message && message.type) {
      console.log('[PostMessageService] Received:', message.type, message.payload);
      
      // Wywołaj wszystkie zarejestrowane callbacki dla tego typu
      this.listeners.get(message.type)?.forEach(cb => cb(message.payload));
    }
  }

  /**
   * Cleanup - usuń nasłuchiwanie
   */
  destroy() {
    window.removeEventListener('message', this.handleMessage.bind(this));
    this.listeners.clear();
  }
}

// ============================================
// PRZYKŁAD UŻYCIA
// ============================================

/**
 * Przykład 1: Komunikacja host → iframe
 * 
 * const iframe = document.querySelector('iframe');
 * const service = new PostMessageService(iframe, 'https://example.com');
 * 
 * // Wyślij PING do iframe
 * service.sendMessage('PING', { timestamp: Date.now() });
 * 
 * // Nasłuchuj na PONG
 * service.on('PONG', (payload) => {
 *   console.log('Got PONG:', payload);
 * });
 */

/**
 * Przykład 2: Komunikacja iframe → host (kod w iframe)
 * 
 * // W kodzie wewnątrz iframe:
 * window.addEventListener('message', (event) => {
 *   if (event.data.type === 'PING') {
 *     event.source.postMessage({ type: 'PONG', payload: { ok: true } }, '*');
 *   }
 * });
 * 
 * // Zgłoś że iframe się załadował
 * window.parent.postMessage({
 *   type: 'LOAD_COMPLETE',
 *   payload: { url: window.location.href, loadTime: performance.now() }
 * }, '*');
 */
