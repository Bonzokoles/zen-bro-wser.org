/**
 * Anti-Tamper & Code Protection
 * Zabezpieczenia przed debugowaniem, kopiowaniem i modyfikacją kodu
 */

class AntiTamper {
  private devToolsOpen: boolean = false;
  private checkInterval: number | null = null;
  private debuggerInterval: number | null = null;
  private resizeHandler: (() => void) | null = null;
  private contextMenuHandler: ((e: Event) => boolean) | null = null;
  private keydownHandler: ((e: KeyboardEvent) => boolean) | null = null;
  private clickHandler: (() => void) | null = null;
  private copyHandler: ((e: ClipboardEvent) => void) | null = null;
  private integrityChecksum: string = '';

  constructor() {
    this.init();
  }

  /**
   * Inicjalizacja zabezpieczeń
   */
  private init(): void {
    if (typeof window === 'undefined') return;

    // 1. Wykrywanie DevTools
    this.detectDevTools();

    // 2. Blokowanie prawego przycisku myszy (opcjonalne - może irytować użytkowników)
    // this.disableContextMenu();

    // 3. Blokowanie skrótów klawiszowych
    this.disableKeyboardShortcuts();

    // 4. Sprawdzanie integralności kodu
    this.checkCodeIntegrity();

    // 5. Blokowanie debuggera
    this.antiDebugger();

    // 6. Monitor aktywności podejrzanej
    this.monitorSuspiciousActivity();
  }

  /**
   * Wykrywanie otwartych DevTools
   * Metoda 1: Sprawdzanie rozmiaru okna
   * Metoda 2: Wykrywanie przez console.log timing
   */
  private detectDevTools(): void {
    const threshold = 160; // px

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        if (!this.devToolsOpen) {
          this.devToolsOpen = true;
          this.onDevToolsDetected();
        }
      } else {
        this.devToolsOpen = false;
      }
    };

    // Metoda 2: Console timing attack
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: () => {
        this.devToolsOpen = true;
        this.onDevToolsDetected();
        return 'devtools-detected';
      },
    });

    // Sprawdzaj co 1 sekundę
    this.checkInterval = window.setInterval(() => {
      checkDevTools();
      console.log(element); // Triggeruje getter jeśli console jest otwarty
    }, 1000);

    // Sprawdź też przy resize - store handler reference
    this.resizeHandler = checkDevTools;
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Akcja przy wykryciu DevTools
   */
  private onDevToolsDetected(): void {
    console.warn('⚠️ Developer tools detected!');

    // W PRODUKCJI możesz:
    // 1. Wyświetlić ostrzeżenie
    // 2. Wylogować użytkownika
    // 3. Zablokować funkcje premium
    // 4. Wysłać event do analytics

    // Przykład: Blur sensitive content
    document.body.style.filter = 'blur(5px)';
    document.body.style.userSelect = 'none';

    // Wyświetl ostrzeżenie
    this.showWarning(
      '⚠️ Developer Tools Detected',
      'For security reasons, some features are disabled when developer tools are open.'
    );
  }

  /**
   * Blokowanie prawego przycisku myszy (opcjonalne)
   */
  private disableContextMenu(): void {
    this.contextMenuHandler = (e: Event) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener('contextmenu', this.contextMenuHandler);
  }

  /**
   * Blokowanie skrótów klawiszowych do DevTools
   */
  private disableKeyboardShortcuts(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I / Cmd+Option+I
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J / Cmd+Option+J
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }

      // Ctrl+S / Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
        e.preventDefault();
        return false;
      }
      
      return true;
    };
    document.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * Anti-debugger - utrudnia debugowanie
   */
  private antiDebugger(): void {
    // Infinite debugger loop (ostrożnie - może wpłynąć na performance)
    this.debuggerInterval = window.setInterval(() => {
      (function () {
        return false;
      }
        .constructor('debugger')
        .call());
    }, 50);
  }

  /**
   * Sprawdzanie integralności kodu
   * Wykrywa modyfikacje w kodzie aplikacji
   */
  private checkCodeIntegrity(): void {
    // W produkcji: generuj checksum podczas build i porównuj
    // Przykład: SHA256 hash głównych plików JS

    const scripts = Array.from(document.scripts);
    const checksums: string[] = [];

    scripts.forEach(script => {
      if (script.src && script.src.includes('_astro')) {
        // Pobierz i zahashuj
        fetch(script.src)
          .then(res => res.text())
          .then(code => {
            // Prosty hash (w produkcji użyj crypto)
            const hash = this.simpleHash(code);
            checksums.push(hash);
          });
      }
    });

    // Zapisz checksum
    this.integrityChecksum = checksums.join('|');
  }

  /**
   * Prosty hash (TYLKO DO TESTÓW - użyj crypto.subtle w produkcji)
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Monitor podejrzanej aktywności
   */
  private monitorSuspiciousActivity(): void {
    let consoleOpenCount = 0;
    let rapidClicks = 0;
    let lastClickTime = 0;

    // Wykrywanie szybkich kliknięć (może oznaczać automatyzację)
    this.clickHandler = () => {
      const now = Date.now();
      if (now - lastClickTime < 100) {
        rapidClicks++;
        if (rapidClicks > 10) {
          console.warn('⚠️ Suspicious activity: Rapid clicking detected');
          this.reportSuspiciousActivity('rapid_clicking');
        }
      } else {
        rapidClicks = 0;
      }
      lastClickTime = now;
    };
    document.addEventListener('click', this.clickHandler);

    // Wykrywanie copy-paste kodu (opcjonalne)
    this.copyHandler = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString() || '';
      if (selection.length > 500) {
        console.warn('⚠️ Large text copied');
        // Możesz dodać watermark do skopiowanego tekstu
      }
    };
    document.addEventListener('copy', this.copyHandler);
  }

  /**
   * Raportowanie podejrzanej aktywności
   */
  private reportSuspiciousActivity(type: string): void {
    // Wyślij do analytics lub security endpoint
    if (typeof window !== 'undefined') {
      fetch('https://zeno-browser-api.stolarnia-ams.workers.dev/api/security/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(() => {
        // Silent fail
      });
    }
  }

  /**
   * Wyświetl ostrzeżenie
   */
  private showWarning(title: string, message: string): void {
    // Utwórz modal ostrzeżenia
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 999999;
      max-width: 400px;
      text-align: center;
    `;

    modal.innerHTML = `
      <h2 style="color: #f59e0b; margin-bottom: 16px;">${title}</h2>
      <p style="color: #666; margin-bottom: 20px;">${message}</p>
      <button onclick="this.parentElement.remove(); document.body.style.filter = 'none';" style="
        background: #3b82f6;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
      ">I Understand</button>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Zniszcz zabezpieczenia (cleanup)
   */
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.debuggerInterval) {
      clearInterval(this.debuggerInterval);
      this.debuggerInterval = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.contextMenuHandler) {
      document.removeEventListener('contextmenu', this.contextMenuHandler);
      this.contextMenuHandler = null;
    }
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }
    if (this.copyHandler) {
      document.removeEventListener('copy', this.copyHandler);
      this.copyHandler = null;
    }
  }
}

// Export singleton
export const antiTamper = new AntiTamper();

/**
 * Code Obfuscation Helper
 * Pomocnicze funkcje do obfuskacji kodu
 */
export class CodeProtection {
  /**
   * Zaszyfruj wrażliwy string
   */
  static encryptString(str: string, key: string): string {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }

  /**
   * Odszyfruj string
   */
  static decryptString(encrypted: string, key: string): string {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  /**
   * Ukryj API key w kodzie
   */
  static obfuscateAPIKey(key: string): string {
    // Split key na części i koduj
    const parts = key.match(/.{1,8}/g) || [];
    const encoded = parts.map(part => btoa(part).split('').reverse().join(''));
    return encoded.join('|');
  }

  /**
   * Odkoduj API key
   */
  static deobfuscateAPIKey(obfuscated: string): string {
    const parts = obfuscated.split('|');
    const decoded = parts.map(part =>
      atob(
        part
          .split('')
          .reverse()
          .join('')
      )
    );
    return decoded.join('');
  }
}
