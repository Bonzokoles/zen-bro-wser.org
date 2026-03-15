/**
 * IframeTestService - automatyczne testy ładowania i walidacja
 * Funkcja 3: Automatyczne testy ładowania iframe i walidacja zawartości
 */

import type {
  IframeSite,
  IframeTestResult,
  IframeErrorType,
  NetworkMetrics,
  JSError,
  IframeTestConfig,
} from '../../types/iframe/core.types';
import { PostMessageService } from './postMessageService';

export class IframeTestService {
  private config: IframeTestConfig;
  private postMessageService: any; // PostMessageService (lazy-initialized per iframe)
  private activeTests: Map<string, AbortController> = new Map();

  constructor(config?: Partial<IframeTestConfig>) {
    this.config = {
      timeout: 5000,
      retries: 2,
      retryDelay: 1000,
      captureNetworkMetrics: true,
      captureJSErrors: true,
      validateContent: true,
      whitelistedDomains: [],
      blacklistedDomains: [],
      ...config,
    };

    this.postMessageService = null;
  }

  /**
   * Test single iframe site
   */
  public async testSite(
    site: IframeSite,
    container: HTMLElement
  ): Promise<IframeTestResult> {
    const testId = `test_${site.id}_${Date.now()}`;
    const abortController = new AbortController();
    this.activeTests.set(testId, abortController);

    try {
      const result = await this.runTest(site, container, abortController.signal);
      return result;
    } finally {
      this.activeTests.delete(testId);
    }
  }

  /**
   * Test multiple sites sequentially
   */
  public async testSites(
    sites: IframeSite[],
    container: HTMLElement,
    onProgress?: (index: number, total: number, result: IframeTestResult) => void
  ): Promise<IframeTestResult[]> {
    const results: IframeTestResult[] = [];

    for (let i = 0; i < sites.length; i++) {
      const result = await this.testSite(sites[i], container);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, sites.length, result);
      }

      // Delay between tests
      if (i < sites.length - 1) {
        await this.delay(this.config.retryDelay);
      }
    }

    return results;
  }

  /**
   * Cancel all active tests
   */
  public cancelAll(): void {
    this.activeTests.forEach((controller) => controller.abort());
    this.activeTests.clear();
  }

  /**
   * Run single test with retries
   */
  private async runTest(
    site: IframeSite,
    container: HTMLElement,
    signal: AbortSignal
  ): Promise<IframeTestResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      if (signal.aborted) {
        throw new Error('Test aborted');
      }

      try {
        return await this.executeTest(site, container, signal);
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `[IframeTestService] Test failed for ${site.name} (attempt ${attempt + 1}/${
            this.config.retries + 1
          }):`,
          error
        );

        if (attempt < this.config.retries) {
          await this.delay(this.config.retryDelay);
        }
      }
    }

    // All retries failed
    return this.createFailedResult(site, lastError!);
  }

  /**
   * Execute single test
   */
  private async executeTest(
    site: IframeSite,
    container: HTMLElement,
    signal: AbortSignal
  ): Promise<IframeTestResult> {
    const startTime = performance.now();
    const jsErrors: JSError[] = [];

    // Create iframe
    const iframe = this.createIframe(site);
    container.innerHTML = '';
    container.appendChild(iframe);

    // Setup error capture
    if (this.config.captureJSErrors) {
      this.setupErrorCapture(iframe, jsErrors);
    }

    try {
      // Wait for load with timeout
      await this.waitForLoad(iframe, signal);

      const loadTime = performance.now() - startTime;

      // Capture network metrics
      let networkMetrics: NetworkMetrics | undefined;
      if (this.config.captureNetworkMetrics) {
        networkMetrics = await this.captureNetworkMetrics(iframe);
      }

      // Validate content
      if (this.config.validateContent) {
        await this.validateContent(iframe);
      }

      return {
        id: `result_${Date.now()}`,
        siteId: site.id,
        siteName: site.name,
        siteUrl: site.url,
        success: true,
        loadTime,
        timestamp: Date.now(),
        httpStatus: 200,
        networkMetrics,
        jsErrors: jsErrors.length > 0 ? jsErrors : undefined,
      };
    } catch (error) {
      const loadTime = performance.now() - startTime;
      const errorType = this.classifyError(error as Error);

      return {
        id: `result_${Date.now()}`,
        siteId: site.id,
        siteName: site.name,
        siteUrl: site.url,
        success: false,
        loadTime,
        timestamp: Date.now(),
        errorMessage: (error as Error).message,
        errorType,
        jsErrors: jsErrors.length > 0 ? jsErrors : undefined,
      };
    }
  }

  /**
   * Create iframe element
   */
  private createIframe(site: IframeSite): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.src = site.url;
    iframe.sandbox.value = site.sandbox;
    if (site.allow) {
      iframe.allow = site.allow;
    }
    iframe.style.width = '100%';
    iframe.style.height = site.height || '500px';
    iframe.style.border = 'none';
    return iframe;
  }

  /**
   * Wait for iframe to load
   */
  private waitForLoad(iframe: HTMLIFrameElement, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Load timeout'));
      }, this.config.timeout);

      const onLoad = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error('Load error'));
      };

      const onAbort = () => {
        cleanup();
        reject(new Error('Test aborted'));
      };

      const cleanup = () => {
        clearTimeout(timeout);
        iframe.removeEventListener('load', onLoad);
        iframe.removeEventListener('error', onError);
        signal.removeEventListener('abort', onAbort);
      };

      iframe.addEventListener('load', onLoad);
      iframe.addEventListener('error', onError);
      signal.addEventListener('abort', onAbort);
    });
  }

  /**
   * Capture network metrics from iframe
   */
  private async captureNetworkMetrics(
    iframe: HTMLIFrameElement
  ): Promise<NetworkMetrics | undefined> {
    try {
      // Request performance data via postMessage
      const data = await this.postMessageService.sendRequest(
        iframe,
        'REQUEST_DATA',
        { type: 'performance' },
        2000
      );

      return data.metrics;
    } catch {
      return undefined;
    }
  }

  /**
   * Validate iframe content
   */
  private async validateContent(iframe: HTMLIFrameElement): Promise<void> {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        throw new Error('Cannot access iframe content (CORS)');
      }

      // Check if page has content
      const bodyText = doc.body?.textContent?.trim();
      if (!bodyText || bodyText.length < 10) {
        throw new Error('Iframe content too short or empty');
      }
    } catch (error) {
      // CORS error is expected for cross-origin iframes
      if ((error as Error).message.includes('CORS')) {
        return; // Ignore CORS errors
      }
      throw error;
    }
  }

  /**
   * Setup error capture for iframe
   */
  private setupErrorCapture(iframe: HTMLIFrameElement, jsErrors: JSError[]): void {
    try {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return;

      iframeWindow.addEventListener('error', (event: ErrorEvent) => {
        jsErrors.push({
          message: event.message,
          source: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: Date.now(),
        });
      });
    } catch {
      // CORS - can't capture errors
    }
  }

  /**
   * Classify error type
   */
  private classifyError(error: Error): IframeErrorType {
    const message = error.message.toLowerCase();

    if (message.includes('timeout')) return 'TIMEOUT';
    if (message.includes('cors')) return 'CORS';
    if (message.includes('x-frame-options')) return 'X_FRAME_OPTIONS';
    if (message.includes('network')) return 'NETWORK_ERROR';
    if (message.includes('js') || message.includes('script')) return 'JS_ERROR';
    if (message.includes('load')) return 'LOAD_ERROR';

    return 'UNKNOWN';
  }

  /**
   * Create failed result
   */
  private createFailedResult(site: IframeSite, error: Error): IframeTestResult {
    return {
      id: `result_${Date.now()}`,
      siteId: site.id,
      siteName: site.name,
      siteUrl: site.url,
      success: false,
      loadTime: 0,
      timestamp: Date.now(),
      errorMessage: error.message,
      errorType: this.classifyError(error),
    };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<IframeTestConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): IframeTestConfig {
    return { ...this.config };
  }
}
