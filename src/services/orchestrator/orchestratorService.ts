/**
 * Orchestrator Service - Agent Management and Task Queue
 * Manages multiple agents processing pages from a queue
 * Uses in-memory queue (can be upgraded to Redis/Cloudflare Queues for production)
 * NOTE: Optimized for Cloudflare Workers - no Node.js dependencies
 */

import { simpleAgent, agentWithRetry, type PageData, type AgentResult } from './agentService';

export interface OrchestratorConfig {
  apiKey?: string;
  concurrency: number;
  retryAttempts: number;
  autoStart: boolean;
}

export interface OrchestratorStats {
  totalQueued: number;
  totalProcessed: number;
  totalFailed: number;
  currentlyProcessing: number;
  isRunning: boolean;
  startedAt?: string;
}

/**
 * Simple event callback type
 */
type EventCallback = (data?: any) => void;

/**
 * Orchestrator class - Manages agent processing queue
 */
export class Orchestrator {
  private queue: PageData[] = [];
  private processing: Set<string> = new Set();
  private processed: Map<string, AgentResult> = new Map();
  private failed: Map<string, Error> = new Map();
  private config: OrchestratorConfig;
  private isRunning: boolean = false;
  private startedAt?: Date;
  private eventCallbacks: Map<string, EventCallback[]> = new Map();

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = {
      apiKey: config.apiKey,
      concurrency: config.concurrency || 3,
      retryAttempts: config.retryAttempts || 3,
      autoStart: config.autoStart ?? true
    };

    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Simple event emitter (Cloudflare-compatible)
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.eventCallbacks.get(event) || [];
    callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error(`[Orchestrator] Event callback error for '${event}':`, error);
      }
    });
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: EventCallback): void {
    const callbacks = this.eventCallbacks.get(event) || [];
    callbacks.push(callback);
    this.eventCallbacks.set(event, callbacks);
  }

  /**
   * Add page to processing queue
   */
  addToQueue(page: PageData): void {
    this.queue.push(page);
    console.log(`[Orchestrator] ➕ Added to queue: ${page.url} (Queue size: ${this.queue.length})`);
    this.emit('queue:add', page);

    if (this.isRunning) {
      this.processNext();
    }
  }

  /**
   * Add multiple pages to queue
   */
  addBatchToQueue(pages: PageData[]): void {
    this.queue.push(...pages);
    console.log(`[Orchestrator] ➕ Added ${pages.length} pages to queue (Queue size: ${this.queue.length})`);
    this.emit('queue:batch-add', pages);

    if (this.isRunning) {
      this.processNext();
    }
  }

  /**
   * Start processing queue
   */
  start(): void {
    if (this.isRunning) {
      console.log('[Orchestrator] ⚠️ Already running');
      return;
    }

    this.isRunning = true;
    this.startedAt = new Date();
    console.log('[Orchestrator] ▶️ Started');
    this.emit('orchestrator:start');

    // Start concurrent workers
    for (let i = 0; i < this.config.concurrency; i++) {
      this.processNext();
    }
  }

  /**
   * Stop processing queue
   */
  stop(): void {
    this.isRunning = false;
    console.log('[Orchestrator] ⏸️ Stopped');
    this.emit('orchestrator:stop');
  }

  /**
   * Process next item in queue
   */
  private async processNext(): Promise<void> {
    if (!this.isRunning || this.processing.size >= this.config.concurrency) {
      return;
    }

    const page = this.queue.shift();
    if (!page) {
      // Queue is empty, check again in 5 seconds
      if (this.isRunning) {
        setTimeout(() => this.processNext(), 5000);
      }
      return;
    }

    this.processing.add(page.id);
    this.emit('processing:start', page);

    try {
      console.log(`[Orchestrator] 🔄 Processing: ${page.url}`);

      const result = await agentWithRetry(page, this.config.apiKey, this.config.retryAttempts);

      this.processed.set(page.id, result);
      this.emit('processing:success', result);

      console.log(`[Orchestrator] ✅ Success: ${page.url} → ${result.category}`);
    } catch (error) {
      const err = error as Error;
      this.failed.set(page.id, err);
      this.emit('processing:error', { page, error: err });

      console.error(`[Orchestrator] ❌ Failed: ${page.url}`, err);
    } finally {
      this.processing.delete(page.id);
      this.emit('processing:complete', page);

      // Process next item
      if (this.isRunning) {
        this.processNext();
      }
    }
  }

  /**
   * Get orchestrator statistics
   */
  getStats(): OrchestratorStats {
    return {
      totalQueued: this.queue.length,
      totalProcessed: this.processed.size,
      totalFailed: this.failed.size,
      currentlyProcessing: this.processing.size,
      isRunning: this.isRunning,
      startedAt: this.startedAt?.toISOString()
    };
  }

  /**
   * Get all processed results
   */
  getProcessedResults(): AgentResult[] {
    return Array.from(this.processed.values());
  }

  /**
   * Get failed items
   */
  getFailedItems(): Array<{ pageId: string; error: Error }> {
    return Array.from(this.failed.entries()).map(([pageId, error]) => ({
      pageId,
      error
    }));
  }

  /**
   * Get specific result by ID
   */
  getResult(id: string): AgentResult | undefined {
    return this.processed.get(id);
  }

  /**
   * Clear all processed results
   */
  clearProcessed(): void {
    this.processed.clear();
    this.emit('orchestrator:clear-processed');
    console.log('[Orchestrator] 🗑️ Cleared processed results');
  }

  /**
   * Clear failed items
   */
  clearFailed(): void {
    this.failed.clear();
    this.emit('orchestrator:clear-failed');
    console.log('[Orchestrator] 🗑️ Cleared failed items');
  }

  /**
   * Update OpenAI API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    console.log('[Orchestrator] 🔑 API key updated');
    this.emit('config:api-key-updated');
  }

  /**
   * Update concurrency
   */
  setConcurrency(concurrency: number): void {
    this.config.concurrency = concurrency;
    console.log(`[Orchestrator] 🔧 Concurrency updated to ${concurrency}`);
    this.emit('config:concurrency-updated', concurrency);
  }
}

// Singleton instance
let orchestratorInstance: Orchestrator | null = null;

/**
 * Get or create orchestrator instance
 */
export function getOrchestrator(config?: Partial<OrchestratorConfig>): Orchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new Orchestrator(config);
  }
  return orchestratorInstance;
}

/**
 * Reset orchestrator instance (useful for testing)
 */
export function resetOrchestrator(): void {
  if (orchestratorInstance) {
    orchestratorInstance.stop();
    orchestratorInstance = null;
  }
}
