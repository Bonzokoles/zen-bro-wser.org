/**
 * ZENO Browser MCP Server
 * Exposes browser automation, search, data extraction, and workflow tools
 * via the Model Context Protocol.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
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

export class MCPServer extends EventEmitter {
  private server: Server;
  private tools: Map<string, MCPTool> = new Map();
  private context: MCPContext;

  constructor(context: MCPContext = {}) {
    super();
    this.context = context;

    this.server = new Server({
      name: 'zeno-browser-mcp',
      version: '1.0.0',
    }, { capabilities: { tools: {} } });

    this.setupHandlers();
    this.registerDefaultTools();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const tool = this.tools.get(toolName);

      if (!tool) {
        return {
          content: [{ type: 'text', text: `Tool "${toolName}" not found` }],
          isError: true,
        };
      }

      try {
        const result = await tool.handler(request.params.arguments ?? {}, this.context);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error executing ${toolName}: ${error.message}` }],
          isError: true,
        };
      }
    });
  }

  registerTool(tool: MCPTool) {
    this.tools.set(tool.name, tool);
    console.log(`📌 [MCP] Registered tool: ${tool.name}`);
  }

  private registerDefaultTools() {
    this.registerSearchTools();
    this.registerBrowserTools();
    this.registerExtractionTools();
    this.registerWorkflowTools();
  }

  // ── Search tools ────────────────────────────────────────────────────────────

  private registerSearchTools() {
    this.registerTool({
      name: 'web_search',
      description: 'Search the web using Bing, Google or Tavily',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          provider: { type: 'string', enum: ['bing', 'google', 'tavily', 'auto'] },
          limit: { type: 'number', description: 'Max results (default: 10)' },
        },
        required: ['query'],
      },
      handler: async (input: any) => this.executeWebSearch(input.query, input.provider ?? 'auto', input.limit ?? 10),
    });

    this.registerTool({
      name: 'semantic_search',
      description: 'Search using vector embeddings for semantic relevance',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          searchSpace: { type: 'string', enum: ['web', 'local', 'knowledge-base'] },
          topK: { type: 'number' },
        },
        required: ['query'],
      },
      handler: async (input: any) => this.executeSemanticSearch(input.query, input.searchSpace ?? 'web'),
    });

    this.registerTool({
      name: 'site_search',
      description: 'Search within a specific website',
      inputSchema: {
        type: 'object',
        properties: {
          site: { type: 'string', description: 'Website domain' },
          query: { type: 'string', description: 'Search query' },
          limit: { type: 'number' },
        },
        required: ['site', 'query'],
      },
      handler: async (input: any) => this.executeSiteSearch(input.site, input.query),
    });
  }

  // ── Browser automation tools ─────────────────────────────────────────────────

  private registerBrowserTools() {
    this.registerTool({
      name: 'navigate',
      description: 'Navigate to a URL in the browser',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          tabId: { type: 'string' },
          waitForLoad: { type: 'boolean' },
        },
        required: ['url'],
      },
      handler: async (input: any, ctx) =>
        ctx.browserManager?.navigate(input.url, { tabId: input.tabId, waitForLoad: input.waitForLoad ?? true }),
    });

    this.registerTool({
      name: 'click',
      description: 'Click an element on the page',
      inputSchema: {
        type: 'object',
        properties: { selector: { type: 'string' }, tabId: { type: 'string' } },
        required: ['selector'],
      },
      handler: async (input: any, ctx) => ctx.browserManager?.click(input.selector, input.tabId),
    });

    this.registerTool({
      name: 'type',
      description: 'Type text into an input element',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string' },
          text: { type: 'string' },
          tabId: { type: 'string' },
        },
        required: ['selector', 'text'],
      },
      handler: async (input: any, ctx) => ctx.browserManager?.type(input.selector, input.text, input.tabId),
    });

    this.registerTool({
      name: 'screenshot',
      description: 'Take a screenshot of the current tab',
      inputSchema: {
        type: 'object',
        properties: { tabId: { type: 'string' }, fullPage: { type: 'boolean' } },
      },
      handler: async (input: any, ctx) =>
        ctx.browserManager?.screenshot(input.tabId, { fullPage: input.fullPage ?? false }),
    });

    this.registerTool({
      name: 'execute_script',
      description: 'Execute JavaScript on the current page',
      inputSchema: {
        type: 'object',
        properties: { script: { type: 'string' }, tabId: { type: 'string' } },
        required: ['script'],
      },
      handler: async (input: any, ctx) => ctx.browserManager?.executeScript(input.script, input.tabId),
    });
  }

  // ── Data extraction tools ───────────────────────────────────────────────────

  private registerExtractionTools() {
    this.registerTool({
      name: 'extract_data',
      description: 'Extract structured data from page using CSS selectors',
      inputSchema: {
        type: 'object',
        properties: {
          selectors: { type: 'object', description: 'Map of field names to CSS selectors' },
          tabId: { type: 'string' },
        },
        required: ['selectors'],
      },
      handler: async (input: any, ctx) => {
        const data: Record<string, any> = {};
        for (const [field, selector] of Object.entries(input.selectors as Record<string, string>)) {
          data[field] = await ctx.browserManager?.extractText(selector, input.tabId);
        }
        return data;
      },
    });

    this.registerTool({
      name: 'extract_table',
      description: 'Extract table data from page',
      inputSchema: {
        type: 'object',
        properties: { selector: { type: 'string' }, tabId: { type: 'string' } },
        required: ['selector'],
      },
      handler: async (input: any, ctx) => ctx.browserManager?.extractTable(input.selector, input.tabId),
    });

    this.registerTool({
      name: 'extract_links',
      description: 'Extract all links from the current page',
      inputSchema: {
        type: 'object',
        properties: { tabId: { type: 'string' }, filter: { type: 'string', description: 'Optional regex filter' } },
      },
      handler: async (input: any, ctx) => ctx.browserManager?.extractLinks(input.tabId, input.filter),
    });
  }

  // ── Workflow tools ───────────────────────────────────────────────────────────

  private registerWorkflowTools() {
    this.registerTool({
      name: 'start_workflow',
      description: 'Start a named workflow chain',
      inputSchema: {
        type: 'object',
        properties: {
          workflowId: { type: 'string' },
          input: { type: 'object' },
        },
        required: ['workflowId'],
      },
      handler: async (input: any, ctx) =>
        ctx.workflowEngine?.executeWorkflow(input.workflowId, input.input),
    });

    this.registerTool({
      name: 'crawl',
      description: 'Start a web crawler',
      inputSchema: {
        type: 'object',
        properties: {
          startUrl: { type: 'string' },
          maxPages: { type: 'number' },
          selector: { type: 'string' },
          followLinks: { type: 'boolean' },
        },
        required: ['startUrl'],
      },
      handler: async (input: any, ctx) =>
        ctx.crawlerService?.startCrawl({
          startUrls: [input.startUrl],
          maxPages: input.maxPages ?? 10,
          dataSelector: input.selector,
          followLinks: input.followLinks ?? true,
        }),
    });

    this.registerTool({
      name: 'wait',
      description: 'Wait for a specified duration (ms)',
      inputSchema: {
        type: 'object',
        properties: { duration: { type: 'number' } },
        required: ['duration'],
      },
      handler: async (input: any) => {
        await new Promise<void>(resolve => setTimeout(resolve, input.duration));
        return { waited: input.duration };
      },
    });
  }

  // ── Search implementation stubs ──────────────────────────────────────────────

  private async executeWebSearch(query: string, provider: string, limit: number) {
    console.log(`🔍 [MCP] web_search: "${query}" via ${provider}`);
    return { query, provider, results: [], limit };
  }

  private async executeSemanticSearch(query: string, searchSpace: string) {
    console.log(`🧠 [MCP] semantic_search: "${query}" in ${searchSpace}`);
    return { query, searchSpace, results: [] };
  }

  private async executeSiteSearch(site: string, query: string) {
    console.log(`🔎 [MCP] site_search: "${query}" on ${site}`);
    return { site, query, results: [] };
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🚀 [MCP] ZENO MCP Server started');
    this.emit('ready');
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }
}
