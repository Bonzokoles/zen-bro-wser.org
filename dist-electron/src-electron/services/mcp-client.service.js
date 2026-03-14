"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClientService = void 0;
const events_1 = require("events");
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
class MCPClientService extends events_1.EventEmitter {
    constructor() {
        super();
        this.servers = new Map();
        this.availableTools = new Map();
    }
    async connectServer(config) {
        console.log(`🔌 [MCP] Connecting to server ${config.name}...`);
        const transport = new stdio_js_1.StdioClientTransport({
            command: config.command,
            args: config.args,
            env: { ...process.env, ...config.env }
        });
        const client = new index_js_1.Client({
            name: `ZENO-Browser-${config.id}`,
            version: '1.0.0'
        }, { capabilities: {} });
        await client.connect(transport);
        this.servers.set(config.id, { client, transport });
        try {
            // @ts-ignore
            const tools = await client.listTools();
            // @ts-ignore
            this.availableTools.set(config.id, tools.tools || []);
            // @ts-ignore
            console.log(`✅ [MCP] Connected to ${config.name}. Discovered ${tools.tools?.length || 0} tools.`);
            this.emit('server-connected', { id: config.id, tools: tools.tools });
            return tools.tools;
        }
        catch (e) {
            console.error(`⚠️ [MCP] Could not list tools for ${config.name}: ${e.message}`);
            return [];
        }
    }
    async executeTool(serverId, toolName, args) {
        const server = this.servers.get(serverId);
        if (!server)
            throw new Error(`MCP Server ${serverId} not connected.`);
        console.log(`⚙️ [MCP] Executing tool ${toolName} on ${serverId}...`);
        // @ts-ignore
        const result = await server.client.callTool({
            name: toolName,
            arguments: args
        });
        return result;
    }
    getAllTools() {
        let all = [];
        const entries = Array.from(this.availableTools.entries());
        for (const [serverId, tools] of entries) {
            all.push(...tools.map((t) => ({ serverId, ...t })));
        }
        return all;
    }
    async disconnectAll() {
        const entries = Array.from(this.servers.entries());
        for (const [id, server] of entries) {
            await server.transport.close();
            console.log(`🔌 [MCP] Disconnected ${id}`);
        }
        this.servers.clear();
        this.availableTools.clear();
    }
}
exports.MCPClientService = MCPClientService;
