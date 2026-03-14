import { EventEmitter } from 'events';
export interface NetworkConfig {
    proxyUrl?: string;
    proxyType?: 'http' | 'socks5' | 'custom';
    allowLocalhost?: boolean;
    allowLAN?: boolean;
    dnsOverrides?: Record<string, string>;
}
export interface ConnectionInfo {
    id: string;
    url: string;
    method: string;
    status: number;
    duration: number;
    timestamp: Date;
    headers?: Record<string, string>;
    proxy?: string;
}
export declare class NetworkManager extends EventEmitter {
    private config;
    private connections;
    private currentProxy;
    constructor(config?: NetworkConfig);
    /**
     * Must be called after App is ready
     */
    init(): void;
    private setupNetworkInterception;
    private setupProxyHandling;
    setProxy(proxyUrl: string, type?: 'http' | 'socks5'): Promise<void>;
    clearProxy(): Promise<void>;
    allowLocalhost(enabled?: boolean): void;
    allowLAN(enabled?: boolean): void;
    addDNSOverride(domain: string, ip: string): void;
    private logConnection;
    getConnections(filter?: {
        domain?: string;
        method?: string;
    }): ConnectionInfo[];
    getStats(): {
        total: number;
        byDomain: {
            [k: string]: number;
        };
        byStatus: {
            [k: string]: number;
        };
        averageDuration: number;
    };
}
