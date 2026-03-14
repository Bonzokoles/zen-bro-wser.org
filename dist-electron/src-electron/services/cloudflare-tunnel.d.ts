/**
 * Cloudflare Tunnel Manager
 * Manages secure tunneling of local services to Cloudflare Edge
 */
export interface TunnelRoute {
    hostname: string;
    service: string;
    path?: string;
    tlsSkipVerify?: boolean;
}
export interface TunnelConfig {
    name: string;
    accountId: string;
    tunnelToken: string;
    routes: TunnelRoute[];
}
export interface TunnelStatus {
    hostname: string;
    service: string;
    status: 'active' | 'disconnected' | 'error';
    lastCheck: Date;
    uptime: number;
    requestsPerMinute: number;
}
export declare class CloudflareTunnelManager {
    private config;
    private tunnelProcess;
    private statuses;
    private healthCheckInterval;
    private cfApi;
    constructor(config: TunnelConfig);
    private initializeStatuses;
    /**
     * Start Cloudflare tunnel daemon
     */
    start(): Promise<boolean>;
    /**
     * Stop tunnel daemon
     */
    stop(): Promise<void>;
    /**
     * Health check for all routes
     */
    private startHealthChecks;
    /**
     * Check health of a single route
     */
    private checkRouteHealth;
    /**
     * Create tunnel configuration file
     */
    private createTunnelConfig;
    /**
     * Find cloudflared executable
     */
    private findCloudflared;
    /**
     * Get tunnel status
     */
    getStatus(): TunnelStatus[];
    /**
     * Get status for specific hostname
     */
    getHostStatus(hostname: string): TunnelStatus | undefined;
    /**
     * Get metrics for monitoring
     */
    getMetrics(): {
        totalRoutes: number;
        activeRoutes: number;
        failedRoutes: number;
        disconnectedRoutes: number;
        uptime: number;
        routes: TunnelStatus[];
    };
    /**
     * Force reconnection
     */
    reconnect(): Promise<boolean>;
}
