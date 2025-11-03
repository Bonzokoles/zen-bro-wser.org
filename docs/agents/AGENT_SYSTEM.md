# Worker System - System Pracowników w Tle

## Koncepcja

Background workers wykonujące powtarzalne, długotrwałe zadania bez blokowania interfejsu użytkownika.

## Architektura

```
src/services/workers/
├── worker-manager.ts       # Zarządzanie workerami
├── worker-pool.ts          # Pool workerów
├── task-queue.ts           # Kolejka zadań
├── scheduler.ts            # Planowanie zadań
├── types/
│   ├── indexing-worker.ts  # Indeksowanie treści
│   ├── sync-worker.ts      # Synchronizacja danych
│   ├── cleanup-worker.ts   # Czyszczenie danych
│   ├── backup-worker.ts    # Backup danych
│   └── fetch-worker.ts     # Pobieranie danych
└── persistence/
    └── worker-state.ts     # Stan workerów
```

## Worker Base

```typescript
// src/services/workers/worker-manager.ts

interface WorkerConfig {
  id: string;
  type: WorkerType;
  schedule?: CronExpression;
  priority: number;
  maxRetries: number;
  timeout: number; // milliseconds
}

interface WorkerTask {
  id: string;
  workerId: string;
  type: string;
  data: any;
  status: 'queued' | 'running' | 'completed' | 'failed';
  attempt: number;
  error?: string;
  result?: any;
  created: Date;
  started?: Date;
  completed?: Date;
}

abstract class BackgroundWorker {
  protected config: WorkerConfig;
  protected running = false;
  protected currentTask: WorkerTask | null = null;

  constructor(config: WorkerConfig) {
    this.config = config;
  }

  abstract async process(task: WorkerTask): Promise<any>;

  async start() {
    this.running = true;
    this.log('Worker started');
  }

  async stop() {
    this.running = false;

    // Wait for current task to finish
    if (this.currentTask) {
      this.log('Waiting for current task to complete...');
      // Max wait 30 seconds
      const timeout = setTimeout(() => {
        this.log('Force stopping worker');
        this.currentTask = null;
      }, 30000);

      while (this.currentTask) {
        await this.sleep(100);
      }

      clearTimeout(timeout);
    }

    this.log('Worker stopped');
  }

  async executeTask(task: WorkerTask): Promise<void> {
    this.currentTask = task;
    task.status = 'running';
    task.started = new Date();

    this.log(`Processing task ${task.id}`);

    try {
      // Execute with timeout
      const result = await this.withTimeout(
        this.process(task),
        this.config.timeout
      );

      task.result = result;
      task.status = 'completed';
      task.completed = new Date();

      this.log(`Task ${task.id} completed`);
    } catch (error) {
      task.error = (error as Error).message;

      // Retry logic
      if (task.attempt < this.config.maxRetries) {
        task.attempt++;
        task.status = 'queued';
        this.log(`Task ${task.id} failed, retrying (${task.attempt}/${this.config.maxRetries})`);

        // Exponential backoff
        const delay = Math.pow(2, task.attempt) * 1000;
        await this.sleep(delay);

        // Re-queue
        await this.executeTask(task);
      } else {
        task.status = 'failed';
        this.log(`Task ${task.id} failed permanently: ${task.error}`);
      }
    } finally {
      this.currentTask = null;
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Task timeout')), timeoutMs)
      )
    ]);
  }

  protected async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected log(message: string) {
    console.log(`[Worker:${this.config.id}] ${message}`);

    // Emit event for UI
    window.dispatchEvent(new CustomEvent('worker:log', {
      detail: {
        workerId: this.config.id,
        message,
        timestamp: new Date()
      }
    }));
  }

  getStatus() {
    return {
      id: this.config.id,
      type: this.config.type,
      running: this.running,
      currentTask: this.currentTask?.id,
      uptime: this.running ? Date.now() - this.startTime : 0
    };
  }

  private startTime = Date.now();
}
```

## Worker Manager

```typescript
// src/services/workers/worker-manager.ts

class WorkerManager {
  private workers: Map<string, BackgroundWorker> = new Map();
  private taskQueue: TaskQueue;
  private scheduler: TaskScheduler;

  constructor() {
    this.taskQueue = new TaskQueue();
    this.scheduler = new TaskScheduler(this);
  }

  registerWorker(worker: BackgroundWorker) {
    this.workers.set(worker.config.id, worker);

    // If worker has schedule, register with scheduler
    if (worker.config.schedule) {
      this.scheduler.schedule(worker.config.id, worker.config.schedule);
    }
  }

  async startWorker(workerId: string) {
    const worker = this.workers.get(workerId);
    if (!worker) throw new Error(`Worker ${workerId} not found`);

    await worker.start();

    // Start processing queue for this worker
    this.processQueue(workerId);
  }

  async stopWorker(workerId: string) {
    const worker = this.workers.get(workerId);
    if (!worker) throw new Error(`Worker ${workerId} not found`);

    await worker.stop();
  }

  async queueTask(task: WorkerTask) {
    await this.taskQueue.enqueue(task);

    // Try to process immediately if worker available
    this.processQueue(task.workerId);
  }

  private async processQueue(workerId: string) {
    const worker = this.workers.get(workerId);
    if (!worker || !worker.running || worker.currentTask) {
      return;
    }

    const task = await this.taskQueue.dequeue(workerId);
    if (!task) return;

    await worker.executeTask(task);

    // Process next task
    this.processQueue(workerId);
  }

  getAllWorkers() {
    return Array.from(this.workers.values()).map(w => w.getStatus());
  }

  async startAll() {
    for (const worker of this.workers.values()) {
      await worker.start();
      this.processQueue(worker.config.id);
    }
  }

  async stopAll() {
    for (const worker of this.workers.values()) {
      await worker.stop();
    }
  }
}
```

## Task Queue

```typescript
// src/services/workers/task-queue.ts

class TaskQueue {
  private queues: Map<string, WorkerTask[]> = new Map();
  private db: IDBDatabase;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    return new Promise<void>((resolve) => {
      const request = indexedDB.open('WorkerQueue', 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('tasks')) {
          const store = db.createObjectStore('tasks', { keyPath: 'id' });
          store.createIndex('workerId', 'workerId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.loadQueues();
        resolve();
      };
    });
  }

  private async loadQueues() {
    const tx = this.db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    const request = store.getAll();

    request.onsuccess = () => {
      const tasks: WorkerTask[] = request.result;

      for (const task of tasks) {
        if (task.status === 'queued' || task.status === 'running') {
          this.addToMemoryQueue(task);
        }
      }
    };
  }

  async enqueue(task: WorkerTask) {
    task.status = 'queued';
    task.created = new Date();
    task.attempt = 0;

    // Save to IndexedDB
    const tx = this.db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    await store.add(task);

    // Add to memory queue
    this.addToMemoryQueue(task);
  }

  private addToMemoryQueue(task: WorkerTask) {
    if (!this.queues.has(task.workerId)) {
      this.queues.set(task.workerId, []);
    }

    const queue = this.queues.get(task.workerId)!;
    queue.push(task);

    // Sort by priority (higher first)
    queue.sort((a, b) => b.priority - a.priority);
  }

  async dequeue(workerId: string): Promise<WorkerTask | null> {
    const queue = this.queues.get(workerId);
    if (!queue || queue.length === 0) return null;

    const task = queue.shift()!;

    // Update in DB
    await this.updateTask(task);

    return task;
  }

  async updateTask(task: WorkerTask) {
    const tx = this.db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    await store.put(task);
  }

  async getQueuedTasks(workerId: string): Promise<WorkerTask[]> {
    const tx = this.db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    const index = store.index('workerId');

    return new Promise((resolve) => {
      const request = index.getAll(workerId);
      request.onsuccess = () => {
        const tasks: WorkerTask[] = request.result;
        resolve(tasks.filter(t => t.status === 'queued'));
      };
    });
  }

  async clearCompleted() {
    const tx = this.db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    const index = store.index('status');

    const request = index.getAllKeys('completed');

    request.onsuccess = () => {
      const keys = request.result;
      for (const key of keys) {
        store.delete(key);
      }
    };
  }
}
```

## Task Scheduler

```typescript
// src/services/workers/scheduler.ts

type CronExpression = string; // e.g., "0 0 * * *" (daily at midnight)

class TaskScheduler {
  private schedules: Map<string, CronSchedule> = new Map();
  private workerManager: WorkerManager;

  constructor(workerManager: WorkerManager) {
    this.workerManager = workerManager;
    this.startScheduler();
  }

  schedule(workerId: string, cron: CronExpression) {
    const schedule: CronSchedule = {
      workerId,
      expression: cron,
      nextRun: this.calculateNextRun(cron),
      lastRun: null
    };

    this.schedules.set(workerId, schedule);
  }

  private startScheduler() {
    // Check every minute
    setInterval(() => {
      const now = new Date();

      for (const [workerId, schedule] of this.schedules) {
        if (schedule.nextRun <= now) {
          this.triggerScheduledTask(workerId);
          schedule.lastRun = now;
          schedule.nextRun = this.calculateNextRun(schedule.expression);
        }
      }
    }, 60000);
  }

  private async triggerScheduledTask(workerId: string) {
    const task: WorkerTask = {
      id: crypto.randomUUID(),
      workerId,
      type: 'scheduled',
      data: {},
      status: 'queued',
      attempt: 0,
      created: new Date(),
      priority: 5
    };

    await this.workerManager.queueTask(task);
  }

  private calculateNextRun(cron: CronExpression): Date {
    // Simple cron parser (would use library like 'cron-parser' in production)
    const parts = cron.split(' ');
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    const now = new Date();
    const next = new Date(now);

    // Parse hour
    if (hour !== '*') {
      next.setHours(parseInt(hour), 0, 0, 0);
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
    }

    return next;
  }

  getSchedules() {
    return Array.from(this.schedules.entries()).map(([workerId, schedule]) => ({
      workerId,
      ...schedule
    }));
  }
}
```

## Specialized Workers

### Indexing Worker

```typescript
// src/services/workers/types/indexing-worker.ts

class IndexingWorker extends BackgroundWorker {
  private vectorDB: VectorDatabase;
  private embeddingService: EmbeddingService;

  async process(task: WorkerTask): Promise<void> {
    const { urls, bookmarks, history } = task.data;

    this.log(`Indexing ${urls?.length || 0} URLs`);

    // Index URLs
    if (urls) {
      for (const url of urls) {
        await this.indexUrl(url);
      }
    }

    // Index bookmarks
    if (bookmarks) {
      for (const bookmark of bookmarks) {
        await this.indexBookmark(bookmark);
      }
    }

    // Index history
    if (history) {
      for (const entry of history) {
        await this.indexHistoryEntry(entry);
      }
    }

    this.log('Indexing complete');
  }

  private async indexUrl(url: string) {
    try {
      // Fetch content
      const response = await fetch(url);
      const html = await response.text();

      // Extract text
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const text = doc.body.textContent || '';

      // Generate chunks
      const chunks = this.chunkText(text, { maxTokens: 512 });

      // Generate embeddings
      const embeddings = await Promise.all(
        chunks.map(chunk => this.embeddingService.embed(chunk))
      );

      // Store in vector DB
      for (let i = 0; i < chunks.length; i++) {
        await this.vectorDB.upsert({
          id: `${url}#${i}`,
          vector: embeddings[i],
          metadata: {
            url,
            chunkIndex: i,
            text: chunks[i],
            timestamp: new Date()
          }
        });
      }
    } catch (error) {
      this.log(`Failed to index ${url}: ${error}`);
    }
  }

  private chunkText(text: string, options: { maxTokens: number }): string[] {
    // Simple chunking by sentence
    const sentences = text.split(/[.!?]+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > options.maxTokens * 4) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());

    return chunks;
  }
}
```

### Sync Worker

```typescript
// src/services/workers/types/sync-worker.ts

class SyncWorker extends BackgroundWorker {
  private syncService: SyncService;

  async process(task: WorkerTask): Promise<void> {
    const { entity } = task.data; // 'bookmarks' | 'history' | 'settings'

    this.log(`Syncing ${entity}`);

    switch (entity) {
      case 'bookmarks':
        await this.syncBookmarks();
        break;
      case 'history':
        await this.syncHistory();
        break;
      case 'settings':
        await this.syncSettings();
        break;
      default:
        throw new Error(`Unknown entity: ${entity}`);
    }

    this.log(`Sync complete: ${entity}`);
  }

  private async syncBookmarks() {
    // Get local bookmarks
    const local = await this.syncService.getLocalBookmarks();

    // Get remote bookmarks
    const remote = await this.syncService.getRemoteBookmarks();

    // Merge (last-write-wins with conflict resolution)
    const merged = this.mergeBookmarks(local, remote);

    // Upload changes
    await this.syncService.uploadBookmarks(merged.toUpload);

    // Save locally
    await this.syncService.saveBookmarks(merged.toSave);
  }

  private mergeBookmarks(
    local: Bookmark[],
    remote: Bookmark[]
  ): { toUpload: Bookmark[]; toSave: Bookmark[] } {
    const localMap = new Map(local.map(b => [b.id, b]));
    const remoteMap = new Map(remote.map(b => [b.id, b]));

    const toUpload: Bookmark[] = [];
    const toSave: Bookmark[] = [];

    // Check local bookmarks
    for (const [id, localBookmark] of localMap) {
      const remoteBookmark = remoteMap.get(id);

      if (!remoteBookmark) {
        // New local bookmark, upload
        toUpload.push(localBookmark);
      } else if (localBookmark.modified > remoteBookmark.modified) {
        // Local is newer, upload
        toUpload.push(localBookmark);
      } else if (remoteBookmark.modified > localBookmark.modified) {
        // Remote is newer, save
        toSave.push(remoteBookmark);
      }
    }

    // Check for new remote bookmarks
    for (const [id, remoteBookmark] of remoteMap) {
      if (!localMap.has(id)) {
        toSave.push(remoteBookmark);
      }
    }

    return { toUpload, toSave };
  }
}
```

### Cleanup Worker

```typescript
// src/services/workers/types/cleanup-worker.ts

class CleanupWorker extends BackgroundWorker {
  async process(task: WorkerTask): Promise<void> {
    this.log('Starting cleanup');

    const cleaned = {
      history: await this.cleanHistory(),
      cache: await this.cleanCache(),
      temp: await this.cleanTempFiles(),
      logs: await this.cleanLogs()
    };

    this.log(`Cleanup complete: ${JSON.stringify(cleaned)}`);

    return cleaned;
  }

  private async cleanHistory(): Promise<number> {
    // Remove history older than 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const historyService = new HistoryService();
    return await historyService.clearBefore(cutoff);
  }

  private async cleanCache(): Promise<number> {
    // Clear expired cache entries
    let cleared = 0;

    const caches = await window.caches.keys();

    for (const cacheName of caches) {
      const cache = await window.caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        const response = await cache.match(request);
        if (!response) continue;

        const expires = response.headers.get('expires');
        if (expires && new Date(expires) < new Date()) {
          await cache.delete(request);
          cleared++;
        }
      }
    }

    return cleared;
  }

  private async cleanTempFiles(): Promise<number> {
    // Clean IndexedDB temp tables
    const db = await this.openDB();
    const tx = db.transaction('temp', 'readwrite');
    const store = tx.objectStore('temp');

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const index = store.index('created');
    const range = IDBKeyRange.upperBound(cutoff);

    let cleared = 0;

    return new Promise((resolve) => {
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          cursor.delete();
          cleared++;
          cursor.continue();
        } else {
          resolve(cleared);
        }
      };
    });
  }

  private async cleanLogs(): Promise<number> {
    // Remove old console logs
    const logs = localStorage.getItem('console_logs');
    if (!logs) return 0;

    const parsed = JSON.parse(logs);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const filtered = parsed.filter((log: any) =>
      new Date(log.timestamp) > cutoff
    );

    localStorage.setItem('console_logs', JSON.stringify(filtered));

    return parsed.length - filtered.length;
  }
}
```

## Worker UI

```typescript
// src/components/WorkerMonitor.tsx

function WorkerMonitor() {
  const [workers, setWorkers] = useState<WorkerStatus[]>([]);
  const [tasks, setTasks] = useState<WorkerTask[]>([]);

  const workerManager = useWorkerManager();

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkers(workerManager.getAllWorkers());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="worker-monitor">
      <h2>Background Workers</h2>

      <div className="workers">
        {workers.map(worker => (
          <div key={worker.id} className="worker-card">
            <div className="worker-header">
              <h3>{worker.type}</h3>
              <span className={`status ${worker.running ? 'running' : 'stopped'}`}>
                {worker.running ? '🟢 Running' : '🔴 Stopped'}
              </span>
            </div>

            <div className="worker-stats">
              <div>Current Task: {worker.currentTask || 'None'}</div>
              <div>Uptime: {formatDuration(worker.uptime)}</div>
            </div>

            <div className="worker-actions">
              {worker.running ? (
                <button onClick={() => workerManager.stopWorker(worker.id)}>
                  Stop
                </button>
              ) : (
                <button onClick={() => workerManager.startWorker(worker.id)}>
                  Start
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="task-queue">
        <h3>Task Queue</h3>
        {/* Show queued/running tasks */}
      </div>
    </div>
  );
}
```

Mam teraz kompleksny system agentów i workerów. Przejdę dalej do zbierania informacji i detekcji anomalii w kolejnym pliku.
