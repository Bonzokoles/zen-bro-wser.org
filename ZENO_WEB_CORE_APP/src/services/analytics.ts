/**
 * Analytics Service - Track user interactions
 * Sends events to Cloudflare Worker API
 */

const API_URL = 'https://zeno-browser-api.stolarnia-ams.workers.dev/api/track';

export interface TrackEvent {
  url: string;
  action: 'page_view' | 'iframe_load' | 'search' | 'click' | 'site_select' | 'tab_open' | 'tab_close';
  userId?: string;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private userId: string;
  private queue: TrackEvent[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private intervalId?: number;

  constructor() {
    // Get or create userId
    this.userId = this.getUserId();
    
    // Start flush interval
    this.startFlushInterval();
  }

  private getUserId(): string {
    let userId = localStorage.getItem('zeno_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('zeno_user_id', userId);
    }
    return userId;
  }

  private startFlushInterval() {
    if (typeof window === 'undefined') return;
    
    this.intervalId = window.setInterval(() => {
      this.flush();
    }, this.flushInterval);
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  /**
   * Track an event
   */
  track(event: Omit<TrackEvent, 'userId'>) {
    this.queue.push({
      ...event,
      userId: this.userId,
    });

    // Auto-flush if queue is large
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  /**
   * Track page view
   */
  trackPageView(url: string) {
    this.track({
      url,
      action: 'page_view',
    });
  }

  /**
   * Track iframe load
   */
  trackIframeLoad(url: string, metadata?: Record<string, any>) {
    this.track({
      url,
      action: 'iframe_load',
      metadata,
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, results?: number) {
    this.track({
      url: window.location.href,
      action: 'search',
      metadata: { query, results },
    });
  }

  /**
   * Track site selection
   */
  trackSiteSelect(siteName: string, siteUrl: string) {
    this.track({
      url: siteUrl,
      action: 'site_select',
      metadata: { siteName },
    });
  }

  /**
   * Track tab open/close
   */
  trackTab(action: 'tab_open' | 'tab_close', tabId: string) {
    this.track({
      url: window.location.href,
      action,
      metadata: { tabId },
    });
  }

  /**
   * Flush queued events to server
   */
  private async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      // Send all events in parallel
      await Promise.all(
        events.map(event =>
          fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
            keepalive: true, // Important for beforeunload
          }).catch(err => {
            console.warn('Analytics track failed:', err);
          })
        )
      );
    } catch (error) {
      console.error('Analytics flush failed:', error);
      // Re-add failed events to queue
      this.queue.unshift(...events);
    }
  }

  /**
   * Get stats from server
   */
  async getStats(period: '1d' | '7d' | '30d' = '7d') {
    try {
      const response = await fetch(
        `https://zeno-browser-api.stolarnia-ams.workers.dev/api/stats?period=${period}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }

  /**
   * Stop tracking
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.flush();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Auto-track page views
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    analytics.trackPageView(window.location.href);
  });
}
