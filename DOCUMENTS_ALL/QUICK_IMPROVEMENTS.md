# Quick Improvements (1-2 days each)

## 1. Better Error Handling

**Current:** Basic try-catch, generic errors
**Fix:** Structured error handling with user-friendly messages

```typescript
// src/utils/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public details?: any
  ) {
    super(message);
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    showNotification(error.userMessage, 'error');
    console.error(`[${error.code}]`, error.message, error.details);
  } else if (error instanceof Error) {
    showNotification('Something went wrong', 'error');
    console.error(error);
  }
}

// Usage in mcpService.ts
async chat(message: string) {
  try {
    const response = await this.provider.chat(message);
    return response;
  } catch (error) {
    if (error.status === 429) {
      throw new AppError(
        'Rate limit exceeded',
        'RATE_LIMIT',
        'Too many requests. Please wait a moment.',
        { retryAfter: error.headers['retry-after'] }
      );
    } else if (error.status === 401) {
      throw new AppError(
        'Invalid API key',
        'AUTH_ERROR',
        'API key is invalid. Please check settings.',
        { provider: this.provider.name }
      );
    }
    throw error;
  }
}
```

---

## 2. Loading States

**Current:** Simple boolean flags
**Fix:** Proper skeleton loaders

```typescript
// src/components/SkeletonLoader.tsx
export function TabSkeleton() {
  return (
    <div className="animate-pulse flex gap-2">
      <div className="h-8 w-32 bg-gray-200 rounded" />
      <div className="h-8 w-32 bg-gray-200 rounded" />
      <div className="h-8 w-32 bg-gray-200 rounded" />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

// Usage
{isLoading ? <ChatSkeleton /> : <ChatMessages messages={messages} />}
```

---

## 3. Keyboard Shortcuts

**Current:** None
**Fix:** Comprehensive keyboard navigation

```typescript
// src/hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.includes('Mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + T: New tab
      if (mod && e.key === 't') {
        e.preventDefault();
        createNewTab();
      }

      // Cmd/Ctrl + W: Close tab
      if (mod && e.key === 'w') {
        e.preventDefault();
        closeCurrentTab();
      }

      // Cmd/Ctrl + Tab: Next tab
      if (mod && e.key === 'Tab') {
        e.preventDefault();
        switchToNextTab();
      }

      // Cmd/Ctrl + Shift + Tab: Previous tab
      if (mod && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        switchToPreviousTab();
      }

      // Cmd/Ctrl + L: Focus address bar
      if (mod && e.key === 'l') {
        e.preventDefault();
        focusAddressBar();
      }

      // Cmd/Ctrl + K: Open search
      if (mod && e.key === 'k') {
        e.preventDefault();
        openOmniSearch();
      }

      // Cmd/Ctrl + D: Bookmark
      if (mod && e.key === 'd') {
        e.preventDefault();
        bookmarkCurrentPage();
      }

      // Cmd/Ctrl + Shift + Delete: Clear history
      if (mod && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
        clearHistory();
      }

      // F12: Dev tools
      if (e.key === 'F12') {
        e.preventDefault();
        toggleDevTools();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}
```

**Shortcuts Reference:**
```
Cmd/Ctrl + T         New tab
Cmd/Ctrl + W         Close tab
Cmd/Ctrl + Tab       Next tab
Cmd/Ctrl + Shift+Tab Previous tab
Cmd/Ctrl + L         Address bar
Cmd/Ctrl + K         Search
Cmd/Ctrl + D         Bookmark
Cmd/Ctrl + R         Reload
Cmd/Ctrl + H         History
Cmd/Ctrl + ,         Settings
Cmd/Ctrl + /         Show shortcuts
F12                  Dev tools
```

---

## 4. Toast Notifications

**Current:** Alerts or nothing
**Fix:** Proper toast system

```bash
npm install react-hot-toast
```

```typescript
// src/components/Toaster.tsx
import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#333',
          color: '#fff',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

// Usage
import toast from 'react-hot-toast';

toast.success('Bookmark added');
toast.error('Failed to load page');
toast.loading('Loading...');
toast.promise(
  fetchData(),
  {
    loading: 'Fetching...',
    success: 'Data loaded',
    error: 'Failed to fetch'
  }
);
```

---

## 5. Better URL Parsing

**Current:** Basic regex
**Fix:** Smart URL detection

```typescript
// src/utils/url-parser.ts
export function parseInput(input: string): {
  type: 'url' | 'search';
  value: string;
} {
  const trimmed = input.trim();

  // Direct URL patterns
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('about:')
  ) {
    return { type: 'url', value: trimmed };
  }

  // localhost variations
  if (
    trimmed.startsWith('localhost') ||
    /^127\.0\.0\.1/.test(trimmed) ||
    /^192\.168\./.test(trimmed)
  ) {
    return { type: 'url', value: `http://${trimmed}` };
  }

  // Domain-like patterns
  if (/^[a-z0-9-]+\.[a-z]{2,}/.test(trimmed) && !trimmed.includes(' ')) {
    return { type: 'url', value: `https://${trimmed}` };
  }

  // Everything else is search
  return { type: 'search', value: trimmed };
}

// Generate search URL
export function getSearchUrl(query: string, engine = 'google'): string {
  const engines = {
    google: 'https://www.google.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    bing: 'https://www.bing.com/search?q=',
    brave: 'https://search.brave.com/search?q='
  };

  return engines[engine] + encodeURIComponent(query);
}
```

---

## 6. Favicon Fetching

**Current:** Maybe not working
**Fix:** Robust favicon detection

```typescript
// src/utils/favicon.ts
export async function getFavicon(url: string): Promise<string> {
  try {
    const domain = new URL(url).origin;

    // Try favicon.ico first
    const faviconUrl = `${domain}/favicon.ico`;
    const response = await fetch(faviconUrl, { method: 'HEAD' });

    if (response.ok) {
      return faviconUrl;
    }

    // Parse HTML for icon links
    const html = await fetch(url).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const iconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]'
    ];

    for (const selector of iconSelectors) {
      const link = doc.querySelector(selector) as HTMLLinkElement;
      if (link?.href) {
        const iconUrl = new URL(link.href, domain).href;
        return iconUrl;
      }
    }

    // Fallback to Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    // Default fallback
    return `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
  }
}

// Cache favicons
const faviconCache = new Map<string, string>();

export async function getCachedFavicon(url: string): Promise<string> {
  const domain = new URL(url).origin;

  if (faviconCache.has(domain)) {
    return faviconCache.get(domain)!;
  }

  const favicon = await getFavicon(url);
  faviconCache.set(domain, favicon);

  return favicon;
}
```

---

## 7. Improved Tab Management

**Current:** Basic add/remove
**Fix:** Advanced tab operations

```typescript
// src/services/tab-service.ts
class TabService {
  // Duplicate tab
  duplicateTab(id: string): Tab {
    const tab = this.getTab(id);
    const newTab = {
      ...tab,
      id: crypto.randomUUID(),
      title: `${tab.title} (Copy)`,
      isActive: false
    };
    this.tabs.push(newTab);
    return newTab;
  }

  // Pin/unpin tab
  pinTab(id: string) {
    const tab = this.getTab(id);
    tab.isPinned = !tab.isPinned;

    // Move pinned tabs to front
    this.tabs.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }

  // Mute tab
  muteTab(id: string) {
    const tab = this.getTab(id);
    tab.isMuted = !tab.isMuted;
  }

  // Close tabs to the right
  closeTabsToRight(id: string) {
    const index = this.tabs.findIndex(t => t.id === id);
    this.tabs = this.tabs.slice(0, index + 1);
  }

  // Close other tabs
  closeOtherTabs(id: string) {
    this.tabs = this.tabs.filter(t => t.id === id || t.isPinned);
  }

  // Close duplicate tabs
  closeDuplicates() {
    const seen = new Set<string>();
    this.tabs = this.tabs.filter(tab => {
      if (seen.has(tab.url)) return false;
      seen.add(tab.url);
      return true;
    });
  }

  // Reopen closed tab
  reopenClosedTab() {
    const lastClosed = this.closedTabs.pop();
    if (lastClosed) {
      this.tabs.push(lastClosed);
    }
  }

  // Search tabs
  searchTabs(query: string): Tab[] {
    const lower = query.toLowerCase();
    return this.tabs.filter(tab =>
      tab.title.toLowerCase().includes(lower) ||
      tab.url.toLowerCase().includes(lower)
    );
  }
}
```

**Context Menu:**
```typescript
// src/components/TabContextMenu.tsx
function TabContextMenu({ tab, onClose }: { tab: Tab; onClose: () => void }) {
  const tabService = useTabService();

  return (
    <div className="context-menu">
      <button onClick={() => {
        tabService.duplicateTab(tab.id);
        onClose();
      }}>
        Duplicate
      </button>

      <button onClick={() => {
        tabService.pinTab(tab.id);
        onClose();
      }}>
        {tab.isPinned ? 'Unpin' : 'Pin'}
      </button>

      <button onClick={() => {
        tabService.muteTab(tab.id);
        onClose();
      }}>
        {tab.isMuted ? 'Unmute' : 'Mute'}
      </button>

      <div className="divider" />

      <button onClick={() => {
        tabService.closeTabsToRight(tab.id);
        onClose();
      }}>
        Close tabs to right
      </button>

      <button onClick={() => {
        tabService.closeOtherTabs(tab.id);
        onClose();
      }}>
        Close other tabs
      </button>

      <div className="divider" />

      <button onClick={() => {
        tabService.closeTab(tab.id);
        onClose();
      }} className="text-red-600">
        Close
      </button>
    </div>
  );
}
```

---

## 8. History Management

**Current:** Simple array, 50 limit
**Fix:** Smart history with search and cleanup

```typescript
// src/services/history-service.ts
interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  visitTime: Date;
  visitCount: number;
  favicon?: string;
}

class HistoryService {
  private db: IDBDatabase;

  async addVisit(url: string, title: string) {
    const existing = await this.findByUrl(url);

    if (existing) {
      existing.visitCount++;
      existing.visitTime = new Date();
      await this.update(existing);
    } else {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        url,
        title,
        visitTime: new Date(),
        visitCount: 1,
        favicon: await getCachedFavicon(url)
      };
      await this.insert(entry);
    }
  }

  async search(query: string, limit = 20): Promise<HistoryEntry[]> {
    const all = await this.getAll();
    const lower = query.toLowerCase();

    const matches = all.filter(entry =>
      entry.title.toLowerCase().includes(lower) ||
      entry.url.toLowerCase().includes(lower)
    );

    // Sort by visit count and recency
    matches.sort((a, b) => {
      const scoreA = a.visitCount * 0.3 + (Date.now() - a.visitTime.getTime()) * -0.7;
      const scoreB = b.visitCount * 0.3 + (Date.now() - b.visitTime.getTime()) * -0.7;
      return scoreB - scoreA;
    });

    return matches.slice(0, limit);
  }

  async getMostVisited(limit = 10): Promise<HistoryEntry[]> {
    const all = await this.getAll();
    all.sort((a, b) => b.visitCount - a.visitCount);
    return all.slice(0, limit);
  }

  async getRecent(limit = 20): Promise<HistoryEntry[]> {
    const all = await this.getAll();
    all.sort((a, b) => b.visitTime.getTime() - a.visitTime.getTime());
    return all.slice(0, limit);
  }

  async clearBefore(date: Date) {
    const all = await this.getAll();
    const toDelete = all.filter(e => e.visitTime < date);
    await Promise.all(toDelete.map(e => this.delete(e.id)));
  }

  async clearAll() {
    const all = await this.getAll();
    await Promise.all(all.map(e => this.delete(e.id)));
  }
}
```

---

## 9. Auto-save Settings

**Current:** Manual save or lost on close
**Fix:** Auto-save with debounce

```typescript
// src/hooks/useAutoSave.ts
export function useAutoSave<T>(
  key: string,
  value: T,
  delay = 1000
) {
  const debouncedSave = useMemo(
    () => debounce((val: T) => {
      localStorage.setItem(key, JSON.stringify(val));
    }, delay),
    [key, delay]
  );

  useEffect(() => {
    debouncedSave(value);
  }, [value, debouncedSave]);
}

// Usage in ProviderSettings
function ProviderSettings() {
  const [settings, setSettings] = useState({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-pro'
  });

  // Auto-save on change
  useAutoSave('ai-settings', settings);

  // Load on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai-settings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  return (
    // ... settings UI
  );
}
```

---

## 10. Smart Caching

**Current:** No caching
**Fix:** Cache AI responses and page data

```typescript
// src/utils/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache<T> {
  private storage = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttlMs = 3600000) {
    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get(key: string): T | null {
    const entry = this.storage.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.storage.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.storage.clear();
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.storage.delete(key);
      }
    }
  }
}

// AI response cache
const aiCache = new Cache<string>();

async function cachedAICall(prompt: string): Promise<string> {
  const cached = aiCache.get(prompt);
  if (cached) return cached;

  const response = await aiProvider.chat(prompt);
  aiCache.set(prompt, response, 3600000); // 1 hour

  return response;
}

// Page content cache
const pageCache = new Cache<string>();

async function fetchPageContent(url: string): Promise<string> {
  const cached = pageCache.get(url);
  if (cached) return cached;

  const response = await fetch(url);
  const content = await response.text();

  pageCache.set(url, content, 300000); // 5 minutes

  return content;
}
```

---

## Priority Order

**Week 1:**
1. Error handling
2. Toast notifications
3. Better URL parsing
4. Auto-save settings

**Week 2:**
5. Keyboard shortcuts
6. Loading states
7. Favicon fetching
8. Tab management improvements

**Week 3:**
9. History management
10. Smart caching

All of these are <2 days each and significantly improve UX.
