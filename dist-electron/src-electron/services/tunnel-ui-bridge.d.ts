/**
 * Tunnel UI Bridge - Expose tunnel controls to React
 */
import { CloudflareTunnelManager, TunnelConfig } from './cloudflare-tunnel';
export declare class TunnelUIBridge {
    private tunnelManager;
    constructor();
    /**
     * Initialize tunnel
     */
    initialize(config: TunnelConfig): Promise<boolean>;
    /**
     * Setup IPC handlers for React components
     */
    private setupIPCHandlers;
    /**
     * Get tunnel manager instance
     */
    getTunnelManager(): CloudflareTunnelManager | null;
}
export declare const tunnelBridge: TunnelUIBridge;
