import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info' | 'success';
  content: string;
  timestamp: Date;
}

const COMMANDS: Record<string, (args: string[]) => string> = {
  help: () => `Available commands:
  help          - Show this help
  clear         - Clear terminal
  version       - Show ZENO version
  status        - Check ZENO services status
  mcp list      - List MCP tools
  navigate <url>- Navigate browser to URL
  search <query>- Search the web
  history       - Show command history
  echo <text>   - Echo text`,
  version: () => 'ZENO Browser v0.2.0 - AI-Powered Browser with MCP Integration',
  status: () => `ZENO Services Status:
  ✓ Browser Core    - Running
  ✓ MCP Server      - Running  
  ✓ AI Provider     - Active
  ✓ Search Engine   - Ready
  ✓ Sandbox Engine  - Active`,
  mcp: (args) => {
    if (args[0] === 'list') {
      return `MCP Tools (6):
  1. web_search       - Search the web
  2. navigate         - Navigate to URL
  3. scrape_page      - Scrape page content
  4. take_screenshot  - Capture screenshot
  5. bookmark_manager - Manage bookmarks
  6. page_summarizer  - Summarize pages`;
    }
    return 'Usage: mcp list';
  },
  echo: (args) => args.join(' '),
};

interface TerminalProps {
  onCommand?: (cmd: string, args: string[]) => Promise<string> | string;
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({ onCommand, className = '' }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '0',
      type: 'info',
      content: '⚡ ZENO Browser Terminal v0.2.0\nType "help" for available commands.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    setLines((prev) => [...prev, { id: Date.now().toString(), type, content, timestamp: new Date() }]);
  }, []);

  const executeCommand = useCallback(async (cmd: string) => {
    if (!cmd.trim()) return;
    addLine('input', `$ ${cmd}`);
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (command === 'clear') {
      setLines([]);
      return;
    }
    if (command === 'history') {
      addLine('output', history.join('\n'));
      return;
    }

    if (COMMANDS[command]) {
      const result = COMMANDS[command](args);
      addLine('output', result);
    } else if (onCommand) {
      try {
        const result = await onCommand(command, args);
        addLine('output', result);
      } catch (err) {
        addLine('error', `Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } else {
      addLine('error', `Command not found: ${command}. Type "help" for available commands.`);
    }
  }, [addLine, history, onCommand]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setHistory((prev) => [input, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    executeCommand(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIndex);
      setInput(history[newIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? '' : history[newIndex] || '');
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-cyan-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-indigo-400';
      default: return 'text-gray-200';
    }
  };

  return (
    <div
      className={`bg-gray-950 rounded-xl border border-gray-800 flex flex-col font-mono text-sm ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-t-xl border-b border-gray-800">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-gray-400 text-xs">ZENO Terminal</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-48 max-h-96">
        {lines.map((line) => (
          <div key={line.id} className={`whitespace-pre-wrap ${getLineColor(line.type)}`}>
            {line.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center px-4 py-2 border-t border-gray-800">
        <span className="text-green-400 mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-gray-200 outline-none caret-green-400"
          placeholder="Type a command..."
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  );
};

export default Terminal;
