"use strict";
/**
 * Network Monitor - Track and monitor network requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkMonitor = void 0;
class NetworkMonitor {
    constructor() {
        this.requests = new Map();
    }
    trackRequest(tabId, request) {
        if (!this.requests.has(tabId)) {
            this.requests.set(tabId, []);
        }
        this.requests.get(tabId).push(request);
        // Keep only last 1000 requests per tab
        const tabRequests = this.requests.get(tabId);
        if (tabRequests.length > 1000) {
            tabRequests.shift();
        }
    }
    getReport(tabId) {
        const requests = this.requests.get(tabId) ?? [];
        return {
            totalRequests: requests.length,
            totalDataTransferred: requests.reduce((sum, r) => sum + r.size, 0),
            avgLatency: requests.length > 0
                ? requests.reduce((sum, r) => sum + r.latency, 0) / requests.length
                : 0,
            byDomain: this.groupByDomain(requests),
            byMethod: this.groupByMethod(requests),
            timeline: requests.map(r => ({
                time: r.timestamp,
                url: r.url,
                latency: r.latency,
            })),
        };
    }
    groupByDomain(requests) {
        return requests.reduce((acc, req) => {
            try {
                const domain = new URL(req.url).hostname;
                acc[domain] = (acc[domain] ?? 0) + 1;
            }
            catch {
                acc['invalid'] = (acc['invalid'] ?? 0) + 1;
            }
            return acc;
        }, {});
    }
    groupByMethod(requests) {
        return requests.reduce((acc, req) => {
            acc[req.method] = (acc[req.method] ?? 0) + 1;
            return acc;
        }, {});
    }
    clearTab(tabId) {
        this.requests.delete(tabId);
    }
    clearAll() {
        this.requests.clear();
    }
}
exports.NetworkMonitor = NetworkMonitor;
