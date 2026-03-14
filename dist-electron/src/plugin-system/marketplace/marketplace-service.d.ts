/**
 * Marketplace Service - Manages plugin discovery, ratings, and updates
 */
export interface MarketplacePlugin {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
    icon?: string;
    repository?: string;
    downloads: number;
    rating: number;
    reviews: number;
    tags: string[];
    latest: string;
    releaseDate: Date;
}
export interface PluginReview {
    pluginId: string;
    rating: number;
    comment: string;
    author: string;
    date: Date;
}
export declare class MarketplaceService {
    private marketplaceUrl;
    private client;
    /**
     * Search for plugins
     */
    search(query: string, filters?: Record<string, any>): Promise<MarketplacePlugin[]>;
    /**
     * Get plugin details
     */
    getPlugin(pluginId: string): Promise<MarketplacePlugin>;
    /**
     * Get featured plugins
     */
    getFeatured(): Promise<MarketplacePlugin[]>;
    /**
     * Get trending plugins
     */
    getTrending(): Promise<MarketplacePlugin[]>;
    /**
     * Post review
     */
    postReview(pluginId: string, rating: number, comment: string): Promise<void>;
    /**
     * Get plugin reviews
     */
    getReviews(pluginId: string): Promise<PluginReview[]>;
    /**
     * Check for updates
     */
    checkUpdates(pluginId: string, currentVersion: string): Promise<string | null>;
    /**
     * Download plugin
     */
    downloadPlugin(pluginId: string, version?: string): Promise<Blob>;
}
export declare const marketplaceService: MarketplaceService;
