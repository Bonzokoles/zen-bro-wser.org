/**
 * Analytics Service - Simple event tracking
 * Placeholder for future analytics integration (GA4, Plausible, etc.)
 */

export interface AnalyticsEvent {
    category: string;
    action: string;
    label?: string;
    value?: number;
}

class AnalyticsService {
    private enabled: boolean = false;
    private events: AnalyticsEvent[] = [];

    constructor() {
        // Check if analytics is enabled in environment
        this.enabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
    }

    /**
     * Track an event
     */
    trackEvent(event: AnalyticsEvent): void {
        if (!this.enabled) {
            console.debug('[Analytics] Event tracked:', event);
            return;
        }

        this.events.push({
            ...event,
            timestamp: Date.now()
        } as any);

        // TODO: Send to analytics service (GA4, Plausible, etc.)
        // Example:
        // window.gtag?.('event', event.action, {
        //   event_category: event.category,
        //   event_label: event.label,
        //   value: event.value
        // });
    }

    /**
     * Track page view
     */
    trackPageView(url: string, title?: string): void {
        this.trackEvent({
            category: 'Navigation',
            action: 'page_view',
            label: url,
            value: undefined
        });
    }

    /**
     * Track tab action
     */
    trackTab(action: 'open' | 'close' | 'switch', tabId?: string): void {
        this.trackEvent({
            category: 'Tab',
            action: `tab_${action}`,
            label: tabId,
            value: undefined
        });
    }

    /**
     * Track search
     */
    trackSearch(query: string, resultCount?: number): void {
        this.trackEvent({
            category: 'Search',
            action: 'search_query',
            label: query,
            value: resultCount
        });
    }

    /**
     * Track chat interaction
     */
    trackChat(provider: string, messageCount: number): void {
        this.trackEvent({
            category: 'Chat',
            action: 'chat_interaction',
            label: provider,
            value: messageCount
        });
    }

    /**
     * Track player usage
     */
    trackPlayer(type: 'music' | 'video', action: 'play' | 'pause' | 'stop'): void {
        this.trackEvent({
            category: 'Player',
            action: `player_${action}`,
            label: type,
            value: undefined
        });
    }

    /**
     * Track error
     */
    trackError(error: Error, context?: string): void {
        this.trackEvent({
            category: 'Error',
            action: 'error_occurred',
            label: `${context ? context + ': ' : ''}${error.message}`,
            value: undefined
        });

        console.error('[Analytics] Error tracked:', error, context);
    }

    /**
     * Get tracked events (for debugging)
     */
    getEvents(): AnalyticsEvent[] {
        return [...this.events];
    }

    /**
     * Clear tracked events
     */
    clearEvents(): void {
        this.events = [];
    }

    /**
     * Enable/disable analytics
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Check if analytics is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export for testing
export default AnalyticsService;
