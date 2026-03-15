import React, { useState, useEffect, useRef } from 'react';
import type { SandboxToolProps } from '../_template';

interface TermLine {
  id: number;
  type: 'cmd' | 'out' | 'err' | 'info';
  text: string;
  ts: string;
}

let lineId = 0;
const getTs = () =>
  new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const TerminalPanel: React.FC<SandboxToolProps> = ({
  onResult,
  sandboxId,
}) => {
  const [lines, setLines] = useState<TermLine[]>([
    { id: lineId++, type: 'info', text: 'ZENO Terminal v1.0    wpisz "help" aby zobaczyć komendy', ts: getTs() },
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { to, type, data } = (e as CustomEvent).detail ?? {};
      if (to === sandboxId || to === 'terminal') {
        addLine('info', ` [${type}]: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
      }
    };
    window.addEventListener('zeno-window-message', handler);
    return () => window.removeEventListener('zeno-window-message', handler);
  }, [sandboxId]);

  const addLine = (type: TermLine['type'], text: string) =>
    setLines(p => [...p, { id: lineId++, type, text, ts: getTs() }]);

  const execCommand = (raw: string) => {
    addLine('cmd', `$ ${raw}`);
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (cmd.startsWith('send-to:')) {
      const targetId = cmd.slice(8).replace(/[^a-zA-Z0-9_\-]/g, ''); // sanitize targetId
      if (!targetId) { addLine('err', 'Nieprawidłowe ID docelowe'); return; }
      // Sanitize data — strip potential event injection patterns
      const raw = args.join(' ').slice(0, 4096); // max 4KB
      const data = raw.replace(/<script[^>]*>.*?<\/script>/gi, '[REMOVED]');
      window.dispatchEvent(
        new CustomEvent('zeno-window-message', {
          detail: { from: sandboxId ?? 'terminal', to: targetId, type: 'result', data },
        })
      );
      if (onResult) onResult(data);
      addLine('out', `→ Wysłano do [${targetId}]: "${data.slice(0, 80)}${data.length > 80 ? '…' : ''}"`)
      return;
    }

    switch (cmd) {
      case 'help':
        addLine('info', ' Komendy ZENO Terminal ');
        addLine('info', '  help                   ta lista               ');
        addLine('info', '  navigate <url>         nawiguj przeglądarką   ');
        addLine('info', '  ai-ask <pytanie>       wyślij do AI Chat      ');
        addLine('info', '  send-to:<id> <dane>    wyślij dane do okna    ');
        addLine('info', '  status                 stan systemu ZENO      ');
        addLine('info', '  clear                  wyczyść ekran          ');
        addLine('info', '');
        break;
      case 'navigate': {
        const url = args.join(' ');
        if (!url) { addLine('err', 'Użycie: navigate <url>'); break; }
        // Security: tylko dozwolone schematy URL
        const allowed = /^(https?:\/\/|about:(welcome|blank|search))/i;
        if (!allowed.test(url)) {
          addLine('err', `Niedozwolony URL: "${url}" — dozwolone: http://, https://, about:`);
          break;
        }
        window.dispatchEvent(new CustomEvent('navigate', { detail: { url } }));
        addLine('out', `→ Nawiguję do: ${url}`);
        break;
      }
      case 'ai-ask': {
        const prompt = args.join(' ');
        if (!prompt) { addLine('err', 'Użycie: ai-ask <pytanie>'); break; }
        window.dispatchEvent(new CustomEvent('zeno-window-message', {
          detail: { from: sandboxId ?? 'terminal', to: 'ai-chat', type: 'ask', data: { prompt } },
        }));
        addLine('out', ` Wysłano do AI Chat: "${prompt}"`);
        break;
      }
      case 'status':
        addLine('info', `ZENO Browser  ${new Date().toLocaleString('pl-PL')}`);
        addLine('info', `sandboxId: ${sandboxId ?? 'n/a'}`);
        addLine('info', `viewport: ${window.innerWidth}${window.innerHeight}px`);
        break;
      case 'clear':
        setLines([{ id: lineId++, type: 'info', text: 'Terminal wyczyszczony.', ts: getTs() }]);
        break;
      default:
        addLine('err', `Nieznana komenda: "${cmd}"    wpisz "help"`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;
    setCmdHistory(p => [raw, ...p.slice(0, 49)]);
    setHistIdx(-1);
    setInput('');
    execCommand(raw);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next);
      setInput(cmdHistory[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : (cmdHistory[next] ?? ''));
    }
  };

  const lineColor: Record<TermLine['type'], string> = {
    cmd:  'text-emerald-400',
    out:  'text-slate-200',
    err:  'text-red-400',
    info: 'text-cyan-400',
  };

  return (
    <div
      className="flex flex-col h-full bg-slate-950 font-mono text-sm overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {lines.map(line => (
          <div key={line.id} className="flex gap-2 leading-5">
            <span className="text-slate-600 text-[10px] shrink-0 pt-px tabular-nums">{line.ts}</span>
            <span className={`${lineColor[line.type]} break-all whitespace-pre-wrap`}>{line.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-slate-800 bg-slate-900 px-3 py-2"
      >
        <span className="text-emerald-400 shrink-0">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-slate-100 outline-none caret-emerald-400 placeholder-slate-600"
          placeholder="wpisz komendę..."
        />
      </form>
    </div>
  );
};
