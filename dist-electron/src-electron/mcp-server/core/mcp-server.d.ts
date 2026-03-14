/**
 * ZENO Browser MCP Server
 * Exposes browser automation, search, data extraction, and workflow tools
 * via the Model Context Protocol.
 */
import { EventEmitter } from 'events';
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: any;
    handler: (input: any, context: MCPContext) => Promise<any>;
}
export interface MCPContext {
    tabId?: string;
    networkManager?: any;
    crawlerService?: any;
    workflowEngine?: any;
    browserManager?: any;
}
export declare class MCPServer extends EventEmitter {
    private server;
    private tools;
    private context;
    constructor(context?: MCPContext);
    private setupHandlers;
    registerTool(tool: MCPTool): void;
    private registerDefaultTools;
    private registerSearchTools;
    private registerBrowserTools;
    private registerExtractionTools;
    private registerWorkflowTools;
    private executeWebSearch;
    private executeSemanticSearch;
    private executeSiteSearch;
    start(): Promise<void>;
    getToolNames(): string[];
}
