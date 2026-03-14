"use strict";
/**
 * Marketplace Service - Manages plugin discovery, ratings, and updates
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketplaceService = exports.MarketplaceService = void 0;
const axios_1 = __importDefault(require("axios"));
class MarketplaceService {
    constructor() {
        this.marketplaceUrl = process.env.REACT_APP_MARKETPLACE_URL || 'https://marketplace.zeno-browser.io';
        this.client = axios_1.default.create({
            baseURL: this.marketplaceUrl,
            timeout: 10000,
        });
    }
    /**
     * Search for plugins
     */
    async search(query, filters) {
        try {
            const response = await this.client.get('/plugins/search', {
                params: { q: query, ...filters },
            });
            return response.data.plugins;
        }
        catch (error) {
            console.error('Failed to search marketplace:', error);
            throw error;
        }
    }
    /**
     * Get plugin details
     */
    async getPlugin(pluginId) {
        try {
            const response = await this.client.get(`/plugins/${pluginId}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get plugin details:', error);
            throw error;
        }
    }
    /**
     * Get featured plugins
     */
    async getFeatured() {
        try {
            const response = await this.client.get('/plugins/featured');
            return response.data.plugins;
        }
        catch (error) {
            console.error('Failed to get featured plugins:', error);
            throw error;
        }
    }
    /**
     * Get trending plugins
     */
    async getTrending() {
        try {
            const response = await this.client.get('/plugins/trending');
            return response.data.plugins;
        }
        catch (error) {
            console.error('Failed to get trending plugins:', error);
            throw error;
        }
    }
    /**
     * Post review
     */
    async postReview(pluginId, rating, comment) {
        try {
            await this.client.post(`/plugins/${pluginId}/reviews`, {
                rating,
                comment,
            });
        }
        catch (error) {
            console.error('Failed to post review:', error);
            throw error;
        }
    }
    /**
     * Get plugin reviews
     */
    async getReviews(pluginId) {
        try {
            const response = await this.client.get(`/plugins/${pluginId}/reviews`);
            return response.data.reviews;
        }
        catch (error) {
            console.error('Failed to get reviews:', error);
            throw error;
        }
    }
    /**
     * Check for updates
     */
    async checkUpdates(pluginId, currentVersion) {
        try {
            const response = await this.client.get(`/plugins/${pluginId}/updates`, {
                params: { version: currentVersion },
            });
            return response.data.latestVersion;
        }
        catch (error) {
            console.error('Failed to check for updates:', error);
            return null;
        }
    }
    /**
     * Download plugin
     */
    async downloadPlugin(pluginId, version) {
        try {
            const response = await this.client.get(`/plugins/${pluginId}/download`, {
                params: { version },
                responseType: 'blob',
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to download plugin:', error);
            throw error;
        }
    }
}
exports.MarketplaceService = MarketplaceService;
exports.marketplaceService = new MarketplaceService();
