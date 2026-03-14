import * as React from 'react';
import { useState, useRef } from 'react';
import Terminal, { TerminalOutput, ColorMode } from 'react-terminal-ui';
import './TerminalPanel.css';

export const TerminalPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<any[]>([
    <TerminalOutput key="0">Welcome to ZENO Terminal (v0.2.0)</TerminalOutput>,
    <TerminalOutput key="1">Type 'help' for available commands</TerminalOutput>,
  ]);
  const [commandHistory, setCommandHistory] = useState<{ command: string; timestamp: Date }[]>([]);

  // Function to safely interact with Electron IPC
  const electronAPI = (typeof window !== 'undefined') ? (window as any).electronAPI : undefined;

  const executeCommand = async (input: string) => {
    setCommandHistory(prev => [...prev, { command: input, timestamp: new Date() }]);

    setLines(prev => [
      ...prev,
      <TerminalOutput key={`cmd-${Date.now()}`}>
        <span style={{ color: '#00d4ff' }}>$ {input}</span>
      </TerminalOutput>,
    ]);

    const args = input.trim().split(' ');
    const cmd = args[0]?.toLowerCase();
    const commandArgs = args.slice(1);
    
    let output = '';

    try {
      switch (cmd) {
        case 'help':
          output = getHelpText();
          break;
        case 'clear':
          setLines([<TerminalOutput key="0">ZENO Terminal cleared</TerminalOutput>]);
          return;
        case 'history':
          output = commandHistory.map((c, i) => `${i + 1}  ${c.command}`).join('\n');
          break;
        case 'search':
          const query = commandArgs.join(' ');
          if (!query) output = 'Usage: search <query>';
          else if (electronAPI && electronAPI.invoke) {
            output = 'Searching (Tavily)...';
            // Placeholder: actually trigger search IPC
            const res = await electronAPI.invoke('crawler:search', query);
            output = `Search done. Found ${res?.results?.length || 0} results.`;
          } else {
            output = 'Electron API not available.';
          }
          break;
        case 'crawl':
          const url = commandArgs[0];
          if (!url) output = 'Usage: crawl <url>';
          else if (electronAPI && electronAPI.invoke) {
            output = `Crawling ${url}...`;
            const extracted = await electronAPI.invoke('crawler:extract', url);
            output = `Crawl successful! Title: ${extracted?.title || 'Unknown'}\nLinks found: ${extracted?.links?.length || 0}`;
          } else {
            output = 'Electron API not available.';
          }
          break;
        case 'library':
          const action = commandArgs[0];
          const param = commandArgs.slice(1).join(' ');
          if (!action) {
            output = 'Usage: library <add|search> <path|query>';
          } else if (action === 'add') {
             if (electronAPI?.invoke) {
               const idx = await electronAPI.invoke('library:index-file', param);
               output = `Indexed! Doc ID: ${idx.id}`;
             } else output = 'API not available.';
          } else if (action === 'search') {
             if (electronAPI?.invoke) {
               const res = await electronAPI.invoke('library:search', { query: param });
               output = `Library search found ${res?.length || 0} chunks.`;
             } else output = 'API not available.';
          } else {
             output = 'Unknown library action.';
          }
          break;
        case 'mcp':
          const mcpAction = commandArgs[0];
          if (!mcpAction) {
            output = 'Usage: mcp <connect|list|call> [args]';
          } else if (mcpAction === 'connect') {
             if (electronAPI?.invoke) {
                output = 'Connecting MCP...';
                const command = commandArgs[1];
                const mcpArgs = commandArgs.slice(2);
                if (!command) {
                   output = 'Usage: mcp connect <command> [args...] (e.g. mcp connect npx -y @modelcontextprotocol/server-postgres)';
                } else {
                   const config = {
                     id: `srv-${Date.now()}`,
                     name: command,
                     command,
                     args: mcpArgs
                   };
                   const tools = await electronAPI.invoke('mcp:connect', config);
                   output = `Connected! ${tools?.length || 0} tools available. Server ID: ${config.id}`;
                }
             } else output = 'API not available.';
          } else if (mcpAction === 'list') {
             if (electronAPI?.invoke) {
                const tools = await electronAPI.invoke('mcp:list-tools');
                output = `Available MCP Tools: \n` + tools.map((t: any) => `- [${t.serverId}] ${t.name}: ${t.description}`).join('\n');
             } else output = 'API not available.';
          } else {
             output = 'Unknown MCP action.';
          }
          break;
        case 'tunnel':
          const tunnelAction = commandArgs[0];
          if (!tunnelAction) {
             output = 'Usage: tunnel <start|stop|status|metrics>';
          } else if (tunnelAction === 'start') {
             output = 'Starting tunnel daemon...';
             if (electronAPI?.invoke) {
                const ok = await electronAPI.invoke('tunnel:start');
                output = ok ? '✅ Cloudflare tunnel started.' : '❌ Failed to start Cloudflare tunnel. See console.';
             }
          } else if (tunnelAction === 'stop') {
             if (electronAPI?.invoke) {
                await electronAPI.invoke('tunnel:stop');
                output = '🛑 Cloudflare tunnel stopped.';
             }
          } else if (tunnelAction === 'status') {
             if (electronAPI?.invoke) {
                const statuses = await electronAPI.invoke('tunnel:status');
                output = 'Active Routes:\n' + statuses.map((s: any) => `- ${s.hostname} -> ${s.service} [${s.status}]`).join('\n');
             }
          } else if (tunnelAction === 'metrics') {
             if (electronAPI?.invoke) {
                const m = await electronAPI.invoke('tunnel:metrics');
                output = `Tunnel Metrics: \nTotal Routes: ${m.totalRoutes}\nActive: ${m.activeRoutes}\nDisconnected: ${m.disconnectedRoutes}\nFailed: ${m.failedRoutes}`;
             }
          } else {
            output = 'Unknown tunnel action.';
          }
          break;
        case 'echo':
          output = commandArgs.join(' ');
          break;
        default:
          output = `Unknown command: ${cmd}\nType 'help' for available commands.`;
      }
    } catch (e: any) {
      output = `❌ Error executing '${cmd}': ${e.message}`;
    }

    if (output) {
      setLines(prev => [
        ...prev,
        <TerminalOutput key={`out-${Date.now()}`}>
          <span style={{ color: '#00ff88', whiteSpace: 'pre-wrap' }}>{output}</span>
        </TerminalOutput>,
      ]);
    }
  };

  const getHelpText = () => {
    return `ZENO Terminal Commands:

SEARCH & CRAWLING:
  search <query>              - Deep web search (via Tavily)
  crawl <url>                 - Scrape page context & links

LOCAL KNOWLEDGE BASE:
  library add <absolute_path> - Index local PDF or text file
  library search <query>      - Semantic search in local files

AGENT PROTOCOLS (MCP):
  mcp connect <cmd> [args]    - Spin up an MCP server via stdio
  mcp list                    - List all available tools
  mcp call <id> <tool> [args] - Execute a specific tool

CLOUDFLARE WEBTUNNELS:
  tunnel start                - Start the cloudflared daemon
  tunnel stop                 - Stop the daemon
  tunnel status               - View route connection statuses
  tunnel metrics              - View route analytics

UTILITIES:
  help                        - Show this help
  clear                       - Clear terminal
  history                     - Show command history
  echo <text>                 - Echo text`;
  };

  return (
    <div className={`terminal-panel ${isOpen ? 'open' : 'closed'}`}>
      <button
        className="terminal-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Terminal"
      >
        {isOpen ? '▼ ZENO Terminal' : '▲ ZENO Terminal'}
      </button>

      {isOpen && (
        <div className="terminal-container">
          <Terminal
            name="ZENO OSINT Dashboard"
            colorMode={ColorMode.Dark}
            onInput={executeCommand}
          >
            {lines}
          </Terminal>
        </div>
      )}
    </div>
  );
};
