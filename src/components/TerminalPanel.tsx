/**
 * TerminalPanel - Integrated terminal console for ZENO Browser
 * Uses react-terminal-ui for rendering; communicates via window.electronAPI
 */

import React, { useState, useCallback } from 'react';
import Terminal, { TerminalOutput, ColorMode } from 'react-terminal-ui';
import './TerminalPanel.css';

interface TerminalPanelProps {
  browserManager?: any;
  crawlerService?: any;
  networkManager?: any;
}

type LineEl = React.ReactElement;

const HELP_TEXT = `
Available commands:
  navigate <url>           Navigate to URL
  click <selector>         Click element
  type <selector> <text>   Type into element
  screenshot               Take screenshot
  extract <selector>       Extract text by selector
  crawl <url> [maxPages]   Start web crawler
  crawl-status <id>        Check crawl status
  network-status           Show network info
  info                     Browser/system info
  clear                    Clear terminal
  history                  Show command history
  echo <text>              Echo text
  help                     Show this help
`.trim();

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  browserManager,
  crawlerService,
  networkManager,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<LineEl[]>([
    <TerminalOutput key="welcome-0">Welcome to ZENO Terminal v1.0</TerminalOutput>,
    <TerminalOutput key="welcome-1">Type 'help' for available commands</TerminalOutput>,
  ]);
  const [history, setHistory] = useState<string[]>([]);

  const appendLine = useCallback((text: string, color = '#00ff88') => {
    setLines(prev => [
      ...prev,
      <TerminalOutput key={`line-${Date.now()}-${Math.random()}`}>
        <span style={{ color }}>{text}</span>
      </TerminalOutput>,
    ]);
  }, []);

  const executeCommand = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setHistory(prev => [...prev, trimmed]);

    // Echo the command
    setLines(prev => [
      ...prev,
      <TerminalOutput key={`cmd-${Date.now()}`}>
        <span style={{ color: '#00d4ff' }}>$ {trimmed}</span>
      </TerminalOutput>,
    ]);

    const [cmd, ...args] = trimmed.split(' ');
    let output = '';

    try {
      switch (cmd.toLowerCase()) {
        case 'navigate': {
          const url = args[0];
          if (!url) { output = 'Usage: navigate <url>'; break; }
          if (browserManager?.navigate) await browserManager.navigate(url);
          output = `✅ Navigating to ${url}`;
          break;
        }
        case 'click': {
          const sel = args[0];
          if (!sel) { output = 'Usage: click <selector>'; break; }
          if (browserManager?.click) await browserManager.click(sel);
          output = `✅ Clicked: ${sel}`;
          break;
        }
        case 'type': {
          const [sel, ...textParts] = args;
          const text = textParts.join(' ');
          if (!sel || !text) { output = 'Usage: type <selector> <text>'; break; }
          if (browserManager?.type) await browserManager.type(sel, text);
          output = `✅ Typed "${text}" into ${sel}`;
          break;
        }
        case 'screenshot': {
          if (browserManager?.screenshot) await browserManager.screenshot();
          output = '✅ Screenshot captured';
          break;
        }
        case 'extract': {
          const sel = args[0];
          if (!sel) { output = 'Usage: extract <selector>'; break; }
          const data = browserManager?.extractText ? await browserManager.extractText(sel) : null;
          output = data ? JSON.stringify(data) : `Extract: ${sel}`;
          break;
        }
        case 'crawl': {
          const [startUrl, maxStr] = args;
          if (!startUrl) { output = 'Usage: crawl <url> [maxPages]'; break; }
          const maxPages = parseInt(maxStr ?? '10', 10);
          if (crawlerService?.startCrawl) {
            await crawlerService.startCrawl({ startUrls: [startUrl], maxPages });
          }
          output = `✅ Crawl started: ${startUrl} (max ${maxPages} pages)`;
          break;
        }
        case 'crawl-status': {
          const id = args[0];
          if (!id) { output = 'Usage: crawl-status <id>'; break; }
          const status = crawlerService?.getStatus ? await crawlerService.getStatus(id) : 'unavailable';
          output = `Crawl ${id}: ${JSON.stringify(status)}`;
          break;
        }
        case 'network-status': {
          const status = networkManager?.getStatus ? await networkManager.getStatus() : 'unavailable';
          output = JSON.stringify(status, null, 2);
          break;
        }
        case 'info': {
          const api = (window as any).electronAPI;
          const sys = api?.system?.getInfo ? await api.system.getInfo() : {};
          output = JSON.stringify(sys, null, 2);
          break;
        }
        case 'help':
          output = HELP_TEXT;
          break;
        case 'clear':
          setLines([<TerminalOutput key="cleared">ZENO Terminal cleared</TerminalOutput>]);
          return;
        case 'history':
          output = history.join('\n') || '(empty)';
          break;
        case 'echo':
          output = args.join(' ');
          break;
        default:
          output = `Unknown command: ${cmd}\nType 'help' for available commands`;
      }
    } catch (err: any) {
      output = `❌ Error: ${err.message}`;
    }

    appendLine(output);
  }, [appendLine, browserManager, crawlerService, networkManager, history]);

  return (
    <div className={`terminal-panel ${isOpen ? 'terminal-panel--open' : ''}`}>
      <button
        className="terminal-panel__toggle"
        onClick={() => setIsOpen(o => !o)}
        title="Toggle Terminal"
      >
        {isOpen ? '▼ Terminal' : '▲ Terminal'}
      </button>

      {isOpen && (
        <div className="terminal-panel__body">
          <Terminal
            name="ZENO Terminal"
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

export default TerminalPanel;
