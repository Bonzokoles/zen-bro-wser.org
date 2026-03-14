/**
 * Security Sandbox - Isolation and monitoring for tabs
 */
export interface SandboxContext {
    tabId: string;
    created: Date;
    permissions: {
        network: boolean;
        clipboard: boolean;
        filesystem: boolean;
        camera: boolean;
        microphone: boolean;
    };
    encrypted: boolean;
}
export interface AuditLog {
    type: string;
    tabId: string;
    timestamp: Date;
    details?: any;
}
export declare class SecuritySandbox {
    private contexts;
    private auditLogs;
    private maxLogs;
    createIsolatedContext(tabId: string, permissions?: Partial<SandboxContext['permissions']>): SandboxContext;
    validateRequest(tabId: string, url: string): boolean;
    log(entry: AuditLog): void;
    getAuditLogs(tabId?: string): AuditLog[];
    destroyContext(tabId: string): void;
    getContext(tabId: string): SandboxContext | undefined;
}
