"use strict";
/**
 * Cloudflare Tunnel Manager
 * Manages secure tunneling of local services to Cloudflare Edge
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudflareTunnelManager = void 0;
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CloudflareTunnelManager {
    constructor(config) {
        this.tunnelProcess = null;
        this.statuses = new Map();
        this.healthCheckInterval = null;
        this.config = config;
        this.cfApi = axios_1.default.create({
            baseURL: 'https://api.cloudflare.com/client/v4',
            headers: {
                'Authorization': `Bearer ${process.env.CF_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        this.initializeStatuses();
    }
    initializeStatuses() {
        for (const route of this.config.routes) {
            this.statuses.set(route.hostname, {
                hostname: route.hostname,
                service: route.service,
                status: 'disconnected',
                lastCheck: new Date(),
                uptime: 0,
                requestsPerMinute: 0,
            });
        }
    }
    /**
     * Start Cloudflare tunnel daemon
     */
    async start() {
        try {
            console.log('🌐 Starting Cloudflare tunnel...');
            // Check if cloudflared is installed
            const cloudflaredPath = await this.findCloudflared();
            if (!cloudflaredPath) {
                console.error('❌ cloudflared not found. Install from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/');
                return false;
            }
            // Create tunnel configuration file
            await this.createTunnelConfig();
            // Start tunnel daemon
            this.tunnelProcess = (0, child_process_1.spawn)(cloudflaredPath, [
                'tunnel',
                'run',
                '--token',
                this.config.tunnelToken,
            ]);
            this.tunnelProcess.stdout?.on('data', (data) => {
                console.log(`[CF Tunnel] ${data.toString()}`);
            });
            this.tunnelProcess.stderr?.on('data', (data) => {
                console.error(`[CF Tunnel Error] ${data.toString()}`);
            });
            this.tunnelProcess.on('error', (error) => {
                console.error(`[CF Tunnel] Process error: ${error.message}`);
            });
            // Start health check
            this.startHealthChecks();
            console.log('✅ Cloudflare tunnel started');
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to start tunnel: ${error}`);
            return false;
        }
    }
    /**
     * Stop tunnel daemon
     */
    async stop() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        if (this.tunnelProcess) {
            this.tunnelProcess.kill('SIGTERM');
            this.tunnelProcess = null;
            console.log('🛑 Cloudflare tunnel stopped');
        }
    }
    /**
     * Health check for all routes
     */
    startHealthChecks() {
        this.healthCheckInterval = setInterval(async () => {
            for (const route of this.config.routes) {
                await this.checkRouteHealth(route);
            }
        }, 30000); // Check every 30 seconds
    }
    /**
     * Check health of a single route
     */
    async checkRouteHealth(route) {
        try {
            const url = `https://${route.hostname}/health`;
            const response = await axios_1.default.get(url, {
                timeout: 5000,
                validateStatus: () => true, // Accept any status
            });
            const status = this.statuses.get(route.hostname);
            if (status) {
                status.status = response.status < 400 ? 'active' : 'error';
                status.lastCheck = new Date();
            }
        }
        catch (error) {
            const status = this.statuses.get(route.hostname);
            if (status) {
                status.status = 'disconnected';
                status.lastCheck = new Date();
            }
        }
    }
    /**
     * Create tunnel configuration file
     */
    async createTunnelConfig() {
        const configPath = path.join(process.env.HOME || '/root', '.cloudflared', 'config.yml');
        const config = `tunnel: ${this.config.name}
credentials-file: ${path.join(process.env.HOME || '/root', '.cloudflared', 'credentials.json')}

ingress:
${this.config.routes.map(route => `  - hostname: ${route.hostname}
    service: ${route.service}${route.path ? `\n    path: ${route.path}` : ''}`).join('\n')}
  - service: http_status:404
`;
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
        fs.writeFileSync(configPath, config);
        console.log(`✅ Tunnel config created at ${configPath}`);
    }
    /**
     * Find cloudflared executable
     */
    async findCloudflared() {
        const paths = [
            '/usr/local/bin/cloudflared',
            '/usr/bin/cloudflared',
            '/opt/cloudflare/cloudflared',
            'cloudflared', // Try system PATH
        ];
        for (const p of paths) {
            try {
                if (fs.existsSync(p)) {
                    return p;
                }
            }
            catch {
                continue;
            }
        }
        return null;
    }
    /**
     * Get tunnel status
     */
    getStatus() {
        return Array.from(this.statuses.values());
    }
    /**
     * Get status for specific hostname
     */
    getHostStatus(hostname) {
        return this.statuses.get(hostname);
    }
    /**
     * Get metrics for monitoring
     */
    getMetrics() {
        const statuses = Array.from(this.statuses.values());
        const activeCount = statuses.filter(s => s.status === 'active').length;
        return {
            totalRoutes: statuses.length,
            activeRoutes: activeCount,
            failedRoutes: statuses.filter(s => s.status === 'error').length,
            disconnectedRoutes: statuses.filter(s => s.status === 'disconnected').length,
            uptime: statuses.reduce((sum, s) => sum + s.uptime, 0) / statuses.length,
            routes: statuses,
        };
    }
    /**
     * Force reconnection
     */
    async reconnect() {
        await this.stop();
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.start();
    }
}
exports.CloudflareTunnelManager = CloudflareTunnelManager;
