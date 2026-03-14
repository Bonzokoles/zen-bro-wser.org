import { net, session } from 'electron';
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

export class NetworkManager extends EventEmitter {
  private config: NetworkConfig;
  private connections: Map<string, ConnectionInfo> = new Map();
  private currentProxy: string | null = null;

  constructor(config: NetworkConfig = {}) {
    super();
    this.config = {
      allowLocalhost: true,
      allowLAN: true,
      ...config,
    };
  }

  /**
   * Must be called after App is ready
   */
  public init() {
    this.setupNetworkInterception();
    this.setupProxyHandling();
  }

  private setupNetworkInterception() {
    const filter = { urls: ['<all_urls>'] };

    session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
      const connectionId = `${Date.now()}-${Math.random()}`;
      
      this.logConnection({
        id: connectionId,
        url: details.url,
        method: details.method,
        status: 0,
        duration: 0,
        timestamp: new Date(),
      });

      this.emit('request', { url: details.url, method: details.method });
      callback({ cancel: false });
    });

    session.defaultSession.webRequest.onCompleted(filter, (details) => {
      this.emit('response', {
        url: details.url,
        status: details.statusCode,
        duration: 0, // Could be tracked via details.id mapping if needed
      });
    });

    session.defaultSession.webRequest.onErrorOccurred(filter, (details) => {
      // Skip benign cache/navigation errors that are normal browser behaviour
      const benign = ['ERR_CACHE_MISS', 'ERR_ABORTED', 'ERR_BLOCKED_BY_CLIENT'];
      if (benign.some(code => details.error.includes(code))) return;
      this.emit('error', { url: details.url, error: details.error });
    });
  }

  private setupProxyHandling() {
    if (this.config.proxyUrl) {
      this.setProxy(this.config.proxyUrl);
    }
  }

  async setProxy(proxyUrl: string, type: 'http' | 'socks5' = 'http') {
    try {
      const rules = proxyUrl ? `${type}://${proxyUrl}` : '';

      if (rules) {
        await session.defaultSession.setProxy({
          proxyRules: rules,
          proxyBypassRules: 'localhost,127.0.0.1,.local',
        });
        this.currentProxy = proxyUrl;
        this.emit('proxy-changed', { proxy: proxyUrl, type });
      }
    } catch (error) {
      console.error('Proxy setup failed:', error);
      this.emit('error', { type: 'proxy', error });
    }
  }

  async clearProxy() {
    await session.defaultSession.setProxy({ proxyRules: 'direct://' });
    this.currentProxy = null;
    this.emit('proxy-changed', { proxy: null });
  }

  allowLocalhost(enabled: boolean = true) {
    this.config.allowLocalhost = enabled;
    this.emit('config-changed', { allowLocalhost: enabled });
  }

  allowLAN(enabled: boolean = true) {
    this.config.allowLAN = enabled;
    this.emit('config-changed', { allowLAN: enabled });
  }

  addDNSOverride(domain: string, ip: string) {
    this.config.dnsOverrides = this.config.dnsOverrides || {};
    this.config.dnsOverrides[domain] = ip;
    this.emit('dns-override-added', { domain, ip });
  }

  private logConnection(conn: ConnectionInfo) {
    this.connections.set(conn.id, conn);
    if (this.connections.size > 1000) {
      const firstKey = this.connections.keys().next().value;
      if (firstKey) this.connections.delete(firstKey);
    }
  }

  getConnections(filter?: { domain?: string; method?: string }): ConnectionInfo[] {
    let connections = Array.from(this.connections.values());
    if (filter?.domain) {
      connections = connections.filter(c => c.url.includes(filter.domain!));
    }
    if (filter?.method) {
      connections = connections.filter(c => c.method === filter.method);
    }
    return connections.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getStats() {
    const connections = Array.from(this.connections.values());
    const byDomain = new Map<string, number>();
    const byStatus = new Map<number, number>();

    connections.forEach(conn => {
      try {
        const domain = new URL(conn.url).hostname;
        byDomain.set(domain, (byDomain.get(domain) || 0) + 1);
      } catch(e){}
      byStatus.set(conn.status, (byStatus.get(conn.status) || 0) + 1);
    });

    return {
      total: connections.length,
      byDomain: Object.fromEntries(byDomain),
      byStatus: Object.fromEntries(byStatus),
      averageDuration: connections.length > 0
        ? connections.reduce((sum, c) => sum + c.duration, 0) / connections.length
        : 0,
    };
  }
}
