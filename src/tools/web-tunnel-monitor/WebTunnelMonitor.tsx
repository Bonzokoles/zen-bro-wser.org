import React, { useState, useEffect } from 'react';
import type { SandboxToolProps } from '../_template';

interface TunnelInfo {
  id: string;
  name: string;
  url: string;
  target: string;
  status: 'active' | 'inactive' | 'connecting';
  connectedAt?: string;
  requestsPerMin?: number;
}

const MOCK_TUNNELS: TunnelInfo[] = [
  {
    id: 't1', name: 'zeno-browser-dev',
    url: 'https://zeno-dev.cfargotunnel.com', target: 'localhost:4378',
    status: 'active', connectedAt: '2026-03-15 08:30', requestsPerMin: 12,
  },
  {
    id: 't2', name: 'zeno-api',
    url: 'https://zeno-api.cfargotunnel.com', target: 'localhost:3001',
    status: 'inactive',
  },
  {
    id: 't3', name: 'ollama-bridge',
    url: 'https://zeno-ai.cfargotunnel.com', target: 'localhost:11434',
    status: 'connecting',
  },
];

const STATUS_STYLES = {
  active:     { badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30', dot: 'bg-emerald-400 animate-pulse' },
  inactive:   { badge: 'text-slate-400 bg-slate-400/10 border-slate-500/30',      dot: 'bg-slate-500' },
  connecting: { badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30',   dot: 'bg-yellow-400 animate-pulse' },
};

export const WebTunnelMonitor: React.FC<SandboxToolProps> = () => {
  const [tunnels, setTunnels] = useState<TunnelInfo[]>(MOCK_TUNNELS);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [isMock, setIsMock] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tunnel-status', {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        setTunnels(data.tunnels ?? MOCK_TUNNELS);
        setIsMock(false);
      } else {
        setTunnels(MOCK_TUNNELS);
        setIsMock(true);
      }
    } catch {
      setTunnels(MOCK_TUNNELS);
      setIsMock(true);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => { refresh(); }, []);

  const activeCount = tunnels.filter(t => t.status === 'active').length;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 overflow-auto p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">CF Tunnel Monitor</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMock ? ' Dane demonstracyjne' : ' Live data'}
            {'  '}odświeżono {lastRefresh.toLocaleTimeString('pl-PL')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{activeCount}</div>
            <div className="text-[10px] text-slate-500">aktywne</div>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-xs transition-colors"
          >
            {loading ? '' : ''} Odśwież
          </button>
        </div>
      </div>

      {/* Tunnel list */}
      <div className="flex flex-col gap-2">
        {tunnels.map(t => {
          const s = STATUS_STYLES[t.status];
          return (
            <div key={t.id} className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <span className="font-medium text-sm text-slate-100 truncate">{t.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md border ${s.badge}`}>{t.status}</span>
                  </div>
                  <div className="mt-1.5 text-xs text-slate-500 space-y-0.5 pl-4">
                    <div> <span className="text-slate-400">{t.url}</span></div>
                    <div> <span className="text-slate-400">{t.target}</span></div>
                    {t.connectedAt && <div> od {t.connectedAt}</div>}
                  </div>
                </div>
                {t.requestsPerMin !== undefined && (
                  <div className="text-center shrink-0">
                    <div className="text-lg font-bold text-slate-100">{t.requestsPerMin}</div>
                    <div className="text-[10px] text-slate-500">req/min</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isMock && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-400">
           Daemon <code className="bg-yellow-500/10 px-1 rounded">cloudflared</code> nie wykryty.
          Uruchom <code className="bg-yellow-500/10 px-1 rounded">cloudflared tunnel run</code> lub
          zaimplementuj endpoint <code className="bg-yellow-500/10 px-1 rounded">/api/tunnel-status</code>.
        </div>
      )}
    </div>
  );
};
