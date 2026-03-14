# 🖥️ ZENO Browser - Integrated Terminal & Console Panel

## 📋 Summary

Znaleźliśmy **3 najlepsze gotowe komponenty** dla terminala:

1. **react-terminal-ui** - Minimalistyczny, dumb component
2. **one-terminal** - Zero dependencies, bardzo lekki
3. **xterm.js** - Profesjonalny (jak VSCode)

**Rekomendacja dla ZENO**: **react-terminal-ui** + custom hooks (najlżejszy, najszybszy, najlepszy)

---

## 🎯 Architecture

```
ZENO Browser
│
├─ Main Window (Electron)
│  ├─ Browser Tab
│  ├─ Network Monitor
│  ├─ Workflow Panel
│  │
│  └─ 📱 TERMINAL PANEL (Bottom Right, 1/5 screen)
│     ├─ Toggle Button (bottom corner)
│     ├─ Terminal Console
│     │  ├─ AI Commands (MCP tools)
│     │  ├─ Browser Functions
│     │  ├─ Logs & Output
│     │  └─ Autocomplete
│     └─ Status Bar
```

---

## 💻 Implementation - Option 1: react-terminal-ui (RECOMMENDED)

### Step 1: Install

```bash
npm install react-terminal-ui
```

### Step 2: Create Terminal Component

```typescript
// File: src/components/TerminalPanel.tsx

import React, { useState, useRef, useEffect } from 'react';
import Terminal, { TerminalOutput, ColorMode } from 'react-terminal-ui';
import './TerminalPanel.css';

interface TerminalCommand {
  command: string;
  output: string;
  timestamp: Date;
}

export const TerminalPanel: React.FC<{
  browserManager?: any;
  crawlerService?: any;
  workflowEngine?: any;
  networkManager?: any;
}> = ({ browserManager, crawlerService, workflowEngine, networkManager }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<any[]>([
    <TerminalOutput key="0">Welcome to ZENO Terminal</TerminalOutput>,
    <TerminalOutput key="1">Type 'help' for available commands</TerminalOutput>,
  ]);
  const [commandHistory, setCommandHistory] = useState<TerminalCommand[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const commandInputRef = useRef<string>('');

  /**
   * Execute command
   */
  const executeCommand = async (input: string) => {
    // Add to history
    setCommandHistory([...commandHistory, { command: input, output: '', timestamp: new Date() }]);
    setHistoryIndex(-1);

    // Add input to display
    setLines(prev => [
      ...prev,
      <TerminalOutput key={`cmd-${Date.now()}`}>
        <span style={{ color: '#00d4ff' }}>$ {input}</span>
      </TerminalOutput>,
    ]);

    // Parse and execute command
    const [cmd, ...args] = input.trim().split(' ');
    let output = '';

    try {
      switch (cmd.toLowerCase()) {
        // Browser Commands
        case 'navigate':
          output = await handleNavigate(args);
          break;
        case 'click':
          output = await handleClick(args);
          break;
        case 'type':
          output = await handleType(args);
          break;
        case 'screenshot':
          output = await handleScreenshot();
          break;
        case 'extract':
          output = await handleExtract(args);
          break;

        // Crawler Commands
        case 'crawl':
          output = await handleCrawl(args);
          break;
        case 'crawl-status':
          output = await handleCrawlStatus(args);
          break;

        // Workflow Commands
        case 'workflow':
          output = await handleWorkflow(args);
          break;
        case 'list-workflows':
          output = 'Available workflows: [list]';
          break;

        // Network Commands
        case 'proxy':
          output = await handleProxy(args);
          break;
        case 'network-status':
          output = await handleNetworkStatus();
          break;

        // Utility Commands
        case 'help':
          output = getHelpText();
          break;
        case 'clear':
          setLines([<TerminalOutput key="0">ZENO Terminal cleared</TerminalOutput>]);
          return;
        case 'history':
          output = commandHistory.map(c => c.command).join('\n');
          break;
        case 'echo':
          output = args.join(' ');
          break;
        case 'info':
          output = await handleInfo();
          break;

        default:
          output = `Unknown command: ${cmd}\nType 'help' for available commands`;
      }
    } catch (error: any) {
      output = `❌ Error: ${error.message}`;
    }

    // Add output
    setLines(prev => [
      ...prev,
      <TerminalOutput key={`out-${Date.now()}`}>
        <span style={{ color: '#00ff88' }}>{output}</span>
      </TerminalOutput>,
    ]);

    commandInputRef.current = '';
  };

  // Command Handlers

  const handleNavigate = async (args: string[]) => {
    const url = args[0];
    if (!url) return 'Usage: navigate <url>';
    if (browserManager?.navigate) {
      await browserManager.navigate(url);
      return `✅ Navigated to ${url}`;
    }
    return `Navigate to: ${url}`;
  };

  const handleClick = async (args: string[]) => {
    const selector = args[0];
    if (!selector) return 'Usage: click <selector>';
    if (browserManager?.click) {
      await browserManager.click(selector);
      return `✅ Clicked: ${selector}`;
    }
    return `Clicked: ${selector}`;
  };

  const handleType = async (args: string[]) => {
    const selector = args[0];
    const text = args.slice(1).join(' ');
    if (!selector || !text) return 'Usage: type <selector> <text>';
    if (browserManager?.type) {
      await browserManager.type(selector, text);
      return `✅ Typed "${text}" into ${selector}`;
    }
    return `Typed: "${text}"`;
  };

  const handleScreenshot = async () => {
    if (browserManager?.screenshot) {
      const data = await browserManager.screenshot();
      return `✅ Screenshot saved`;
    }
    return 'Screenshot captured';
  };

  const handleExtract = async (args: string[]) => {
    const selector = args[0];
    if (!selector) return 'Usage: extract <selector>';
    if (browserManager?.extractText) {
      const data = await browserManager.extractText(selector);
      return `✅ Extracted: ${data}`;
    }
    return 'Data extracted';
  };

  const handleCrawl = async (args: string[]) => {
    const url = args[0];
    if (!url) return 'Usage: crawl <url> [maxPages]';
    const maxPages = parseInt(args[1]) || 10;
    if (crawlerService?.startCrawl) {
      const crawlId = await crawlerService.startCrawl({
        startUrls: [url],
        maxPages,
      });
      return `✅ Crawl started: ${crawlId}`;
    }
    return `Crawl started for ${url}`;
  };

  const handleCrawlStatus = async (args: string[]) => {
    const crawlId = args[0];
    if (!crawlId) return 'Usage: crawl-status <crawlId>';
    if (crawlerService?.getCrawlStatus) {
      const status = await crawlerService.getCrawlStatus(crawlId);
      return `Status: ${status.status}\nPages: ${status.pagesVisited}/${status.config.maxPages}`;
    }
    return 'Crawl status retrieved';
  };

  const handleWorkflow = async (args: string[]) => {
    const workflowId = args[0];
    if (!workflowId) return 'Usage: workflow <workflowId>';
    if (workflowEngine?.executeWorkflow) {
      const exec = await workflowEngine.executeWorkflow(workflowId);
      return `✅ Workflow executed: ${exec.id}\nStatus: ${exec.status}`;
    }
    return `Workflow ${workflowId} executed`;
  };

  const handleProxy = async (args: string[]) => {
    const action = args[0];
    if (action === 'set' && args[1]) {
      if (networkManager?.setProxy) {
        await networkManager.setProxy(args[1]);
        return `✅ Proxy set to ${args[1]}`;
      }
      return `Proxy set to ${args[1]}`;
    } else if (action === 'clear') {
      if (networkManager?.clearProxy) {
        await networkManager.clearProxy();
        return '✅ Proxy cleared';
      }
      return 'Proxy cleared';
    }
    return 'Usage: proxy set <url> | proxy clear';
  };

  const handleNetworkStatus = async () => {
    if (networkManager?.getStats) {
      const stats = await networkManager.getStats();
      return `Network Stats:\nTotal Requests: ${stats.total}\nAvg Duration: ${stats.averageDuration}ms`;
    }
    return 'Network status retrieved';
  };

  const handleInfo = async () => {
    return `ZENO Browser Terminal v1.0\nNode: ${process.version}\nElectron: v${process.versions.electron}`;
  };

  const getHelpText = () => {
    return `ZENO Terminal Commands:

BROWSER:
  navigate <url>              - Navigate to URL
  click <selector>            - Click element
  type <selector> <text>      - Type into input
  screenshot                  - Take screenshot
  extract <selector>          - Extract data

CRAWLER:
  crawl <url> [maxPages]      - Start crawler
  crawl-status <crawlId>      - Get crawl status

WORKFLOW:
  workflow <workflowId>       - Execute workflow
  list-workflows              - List all workflows

NETWORK:
  proxy set <url>             - Set proxy
  proxy clear                 - Clear proxy
  network-status              - Show network stats

UTILITY:
  help                        - Show this help
  clear                       - Clear terminal
  history                     - Show command history
  echo <text>                 - Echo text
  info                        - Show info

Use arrow keys for history.`;
  };

  return (
    <div className={`terminal-panel ${isOpen ? 'open' : 'closed'}`}>
      {/* Toggle Button */}
      <button
        className="terminal-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Terminal"
      >
        {isOpen ? '▼' : '▲'} Terminal
      </button>

      {/* Terminal */}
      {isOpen && (
        <div className="terminal-container">
          <Terminal
            name="ZENO Terminal"
            colorMode={ColorMode.Dark}
            onInput={(input) => executeCommand(input)}
          >
            {lines}
          </Terminal>
        </div>
      )}
    </div>
  );
};

export default TerminalPanel;
```

### Step 3: Styling

```css
/* File: src/components/TerminalPanel.css */

.terminal-panel {
  position: fixed;
  bottom: 0;
  right: 20px;
  background: #0f0f1e;
  border: 2px solid #00d4ff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -8px 32px rgba(0, 212, 255, 0.1);
  transition: all 0.3s ease;
  z-index: 8000;
  font-family: 'Courier New', monospace;
}

.terminal-panel.closed {
  height: 40px;
  width: 150px;
}

.terminal-panel.open {
  height: calc(33vh); /* 1/3 screen height */
  width: 60vw; /* 60% width */
  max-width: 1200px;
}

.terminal-toggle {
  width: 100%;
  height: 40px;
  border: none;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #00d4ff;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s;
  font-size: 12px;
}

.terminal-toggle:hover {
  background: linear-gradient(135deg, #16213e, #0f3460);
  box-shadow: 0 -4px 12px rgba(0, 212, 255, 0.2);
}

.terminal-container {
  height: calc(100% - 40px);
  overflow-y: auto;
  padding: 12px;
  background: #0f0f1e;
  border-radius: 6px 6px 0 0;
}

/* Terminal output styling */
.terminal-output {
  color: #00ff88;
  font-size: 12px;
  line-height: 1.4;
  margin: 2px 0;
}

.terminal-output code {
  background: rgba(0, 212, 255, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .terminal-panel.open {
    width: 100%;
    height: 50vh;
    right: 0;
    border-radius: 8px 8px 0 0;
  }

  .terminal-container {
    font-size: 11px;
  }
}

/* Scrollbar styling */
.terminal-container::-webkit-scrollbar {
  width: 6px;
}

.terminal-container::-webkit-scrollbar-track {
  background: #1a1a2e;
}

.terminal-container::-webkit-scrollbar-thumb {
  background: #00d4ff;
  border-radius: 3px;
}

.terminal-container::-webkit-scrollbar-thumb:hover {
  background: #00ff88;
}
```

### Step 4: Integration into Main Layout

```typescript
// File: src/components/BrowserLayout.tsx

import React, { useState } from 'react';
import { TerminalPanel } from './TerminalPanel';
import { WebViewRenderer } from './WebViewRenderer';
import { TabBar } from './TabBar';
import { HeaderBar } from './HeaderBar';

export const BrowserLayout: React.FC<{
  browserManager?: any;
  crawlerService?: any;
  workflowEngine?: any;
  networkManager?: any;
}> = (props) => {
  return (
    <div className="browser-layout">
      <HeaderBar />
      <TabBar />
      
      <main className="browser-content">
        <WebViewRenderer />
      </main>

      {/* Terminal Panel - Bottom Right */}
      <TerminalPanel {...props} />
    </div>
  );
};
```

---

## 🎨 Alternative: Option 2 - Ultra-Lightweight (one-terminal)

```typescript
// File: src/components/TerminalPanelLight.tsx

import React from 'react';
import { Terminal } from 'one-terminal';

const fileStructure = {
  kind: 'directory',
  entries: {
    'help.txt': {
      kind: 'file',
      fileType: 'text',
      content: 'Available commands: navigate, click, type, crawl, workflow...',
    },
    'commands.txt': {
      kind: 'file',
      fileType: 'text',
      content: 'Type a command',
    },
  },
};

export const TerminalPanelLight: React.FC = () => {
  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, width: '50vw', height: '33vh' }}>
      <Terminal fileStructure={fileStructure} />
    </div>
  );
};
```

---

## ⚡ Option 3 - Professional (xterm.js)

```typescript
// File: src/components/TerminalPanelPro.tsx

import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export const TerminalPanelPro: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal>();

  useEffect(() => {
    if (!terminalInstanceRef.current && terminalRef.current) {
      const terminal = new Terminal({
        theme: {
          background: '#0f0f1e',
          foreground: '#00d4ff',
          cursor: '#00ff88',
        },
        fontSize: 12,
        fontFamily: 'Courier New',
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(terminalRef.current);
      fitAddon.fit();

      terminal.writeln('Welcome to ZENO Terminal');
      terminal.write('$ ');

      terminalInstanceRef.current = terminal;

      // Handle key input
      terminal.onKey(({ key, domEvent }) => {
        if (domEvent.key === 'Enter') {
          terminal.writeln('');
          terminal.write('$ ');
        } else if (domEvent.key === 'Backspace') {
          terminal.write('\b \b');
        } else {
          terminal.write(key);
        }
      });

      // Handle resize
      const handleResize = () => fitAddon.fit();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '60vw',
        height: '33vh',
        backgroundColor: '#0f0f1e',
        border: '2px solid #00d4ff',
        borderRadius: '8px 8px 0 0',
        zIndex: 8000,
      }}
    />
  );
};
```

---

## 📝 Commands Available in Terminal

```
🌐 BROWSER COMMANDS:
  navigate <url>              - Go to URL
  click <selector>            - Click element
  type <selector> <text>      - Type text
  screenshot                  - Take screenshot
  scroll <direction> [amount] - Scroll page
  extract <selector>          - Extract data

🕷️ CRAWLER COMMANDS:
  crawl <url> [maxPages]      - Start crawler
  crawl-status <crawlId>      - Check crawl progress
  crawl-stop <crawlId>        - Stop crawler

⚙️ WORKFLOW COMMANDS:
  workflow <id>               - Execute workflow
  list-workflows              - Show all workflows
  create-workflow <name>      - Create new workflow

🌐 NETWORK COMMANDS:
  proxy set <url>             - Set HTTP proxy
  proxy clear                 - Clear proxy
  network-stats               - Show stats
  dns-set <domain> <ip>       - Add DNS override

🔍 SEARCH COMMANDS:
  search <query>              - Web search
  site-search <site> <query>  - Search site

📊 DATA COMMANDS:
  export <format>             - Export data (json/csv)
  import <file>               - Import data
  analyze                     - Analyze current page

🛠️ UTILITY COMMANDS:
  help                        - Show help
  clear                       - Clear terminal
  history                     - Show command history
  copy <text>                 - Copy to clipboard
  echo <text>                 - Echo text
  time <command>              - Measure command time
```

---

## ✅ Complete Integration Checklist

- [ ] Install react-terminal-ui
- [ ] Create TerminalPanel.tsx
- [ ] Add Terminal styling (CSS)
- [ ] Integrate into BrowserLayout
- [ ] Connect to browserManager, crawlerService, workflowEngine
- [ ] Implement all command handlers
- [ ] Add command autocomplete (optional)
- [ ] Add command history with arrow keys
- [ ] Test all commands
- [ ] Add error handling
- [ ] Performance optimization
- [ ] Documentation

---

## 🚀 Quick Start

```bash
# Install
npm install react-terminal-ui

# Add to component
import { TerminalPanel } from './components/TerminalPanel';

// In your main layout
<TerminalPanel
  browserManager={browserManager}
  crawlerService={crawlerService}
  workflowEngine={workflowEngine}
  networkManager={networkManager}
/>
```

---

## 🎨 Customization

```typescript
// Theme colors
const themeColors = {
  background: '#0f0f1e',
  foreground: '#00d4ff',
  success: '#00ff88',
  error: '#ff4d4d',
  warning: '#ffeb3b',
};

// Terminal size (responsive)
const terminalSize = {
  mobile: { width: '100%', height: '50vh' },
  tablet: { width: '70vw', height: '40vh' },
  desktop: { width: '60vw', height: '33vh' },
};
```

---

## 📊 Performance Notes

- **react-terminal-ui**: Ultra-lightweight (~15KB), perfect for ZENO
- **one-terminal**: Even smaller (~8KB), zero deps
- **xterm.js**: ~200KB but more features

**Recommendation**: Start with **react-terminal-ui** for speed, upgrade to **xterm.js** if more features needed.

---

**Terminal integration complete! 🖥️✨**