#!/usr/bin/env node
/**
 * ZENO Browser MCP Server v0.2.0
 * Model Context Protocol server with browser automation tools
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'zeno-browser', version: '0.2.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'web_search',
      description: 'Search the web using Tavily',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          max_results: { type: 'number', description: 'Max results (default 5)' },
        },
        required: ['query'],
      },
    },
    {
      name: 'navigate',
      description: 'Navigate browser to URL',
      inputSchema: {
        type: 'object',
        properties: { url: { type: 'string', description: 'URL to navigate to' } },
        required: ['url'],
      },
    },
    {
      name: 'scrape_page',
      description: 'Scrape content from a web page',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to scrape' },
          selector: { type: 'string', description: 'CSS selector (optional)' },
        },
        required: ['url'],
      },
    },
    {
      name: 'take_screenshot',
      description: 'Take screenshot of current page',
      inputSchema: {
        type: 'object',
        properties: { fullPage: { type: 'boolean', description: 'Full page screenshot' } },
      },
    },
    {
      name: 'bookmark_manager',
      description: 'Manage browser bookmarks',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['add', 'remove', 'list', 'search'] },
          url: { type: 'string' },
          title: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['action'],
      },
    },
    {
      name: 'page_summarizer',
      description: 'Summarize current page content using AI',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to summarize' },
          language: { type: 'string', description: 'Output language (default: en)' },
        },
        required: ['url'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'web_search':
      return {
        content: [{ type: 'text', text: `Searching for: ${args?.query}\n(Connect Tavily API for real results)` }],
      };
    case 'navigate':
      return {
        content: [{ type: 'text', text: `Navigating to: ${args?.url}` }],
      };
    case 'scrape_page':
      return {
        content: [{ type: 'text', text: `Scraping: ${args?.url}` }],
      };
    case 'take_screenshot':
      return {
        content: [{ type: 'text', text: 'Screenshot captured (Playwright required for real screenshots)' }],
      };
    case 'bookmark_manager':
      return {
        content: [{ type: 'text', text: `Bookmark action: ${args?.action}` }],
      };
    case 'page_summarizer':
      return {
        content: [{ type: 'text', text: `Summarizing: ${args?.url}` }],
      };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Use stderr for logging — stdout is reserved for MCP protocol messages (stdio transport)
  console.error('ZENO MCP Server running on stdio');
}

main().catch(console.error);
