/**
 * Network Monitor - Track and monitor network requests
 */
export interface NetworkRequest {
    url: string;
    method: string;
    timestamp: Date;
    size: number;
    latency: number;
    status: number;
}
export declare class NetworkMonitor {
    private requests;
    trackRequest(tabId: string, request: NetworkRequest): void;
    getReport(tabId: string): {
        totalRequests: number;
        totalDataTransferred: number;
        avgLatency: number;
        byDomain: Record<string, number>;
        byMethod: Record<string, number>;
        timeline: {
            time: Date;
            url: string;
            latency: number;
        }[];
    };
    private groupByDomain;
    private groupByMethod;
    clearTab(tabId: string): void;
    clearAll(): void;
}
