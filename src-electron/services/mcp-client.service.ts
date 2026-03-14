import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface MCPServerConfig {
  id: string;
  name: string;
  command: string; // e.g., 'npx'
  args: string[];  // e.g., ['-y', '@modelcontextprotocol/server-postgres']
  env?: Record<string, string>;
}

export class MCPClientService extends EventEmitter {
  private servers: Map<string, { client: Client, transport: StdioClientTransport }> = new Map();
  private availableTools: Map<string, any[]> = new Map();

  constructor() {
    super();
  }

  async connectServer(config: MCPServerConfig) {
    console.log(`🔌 [MCP] Connecting to server ${config.name}...`);
    
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: { ...process.env, ...config.env } as Record<string, string>
    });
    
    const client = new Client({
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
    } catch(e: any) {
      console.error(`⚠️ [MCP] Could not list tools for ${config.name}: ${e.message}`);
      return [];
    }
  }

  async executeTool(serverId: string, toolName: string, args: any) {
    const server = this.servers.get(serverId);
    if (!server) throw new Error(`MCP Server ${serverId} not connected.`);

    console.log(`⚙️ [MCP] Executing tool ${toolName} on ${serverId}...`);
    // @ts-ignore
    const result = await server.client.callTool({
      name: toolName,
      arguments: args
    });

    return result;
  }

  getAllTools() {
    let all: any[] = [];
    const entries = Array.from(this.availableTools.entries());
    for (const [serverId, tools] of entries) {
      all.push(...tools.map((t: any) => ({ serverId, ...t })));
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
