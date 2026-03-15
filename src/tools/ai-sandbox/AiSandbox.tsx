import React, { useState } from 'react';
import type { SandboxToolProps } from '../_template';

interface ModelDef {
  id: string;
  label: string;
  provider: 'gemini' | 'openrouter';
}

const MODELS: ModelDef[] = [
  { id: 'gemini-1.5-flash',                  label: 'Gemini 1.5 Flash',       provider: 'gemini' },
  { id: 'gemini-1.5-pro',                    label: 'Gemini 1.5 Pro',         provider: 'gemini' },
  { id: 'openai/gpt-4o',                     label: 'GPT-4o',                 provider: 'openrouter' },
  { id: 'anthropic/claude-3-5-sonnet',       label: 'Claude 3.5 Sonnet',      provider: 'openrouter' },
  { id: 'mistralai/mistral-large',           label: 'Mistral Large',          provider: 'openrouter' },
];

const getKey = (provider: 'gemini' | 'openrouter'): string => {
  if (provider === 'gemini')
    return localStorage.getItem('gemini_api_key') ?? (import.meta as any).env?.VITE_GEMINI_API_KEY ?? '';
  return localStorage.getItem('openrouter_api_key') ?? (import.meta as any).env?.VITE_OPENROUTER_API_KEY ?? '';
};

const ALLOWED_GEMINI_MODELS = new Set(MODELS.filter(m => m.provider === 'gemini').map(m => m.id));
const ALLOWED_OR_MODELS    = new Set(MODELS.filter(m => m.provider === 'openrouter').map(m => m.id));

async function callGemini(model: string, system: string, user: string): Promise<string> {
  // Security: whitelist check — model musi być z MODELS, nie z user input
  if (!ALLOWED_GEMINI_MODELS.has(model)) throw new Error(`Niedozwolony model: ${model}`);
  const key = getKey('gemini');
  if (!key) throw new Error('Brak klucza Gemini API — skonfiguruj w Ustawienia');

  // Security: limit prompt size
  const safeUser   = user.slice(0, 32_000);
  const safeSystem = system.slice(0, 8_000);

  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: safeUser }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  };
  if (safeSystem) body.systemInstruction = { parts: [{ text: safeSystem }] };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '(brak odpowiedzi)';
}

async function callOpenRouter(model: string, system: string, user: string): Promise<string> {
  // Security: whitelist check
  if (!ALLOWED_OR_MODELS.has(model)) throw new Error(`Niedozwolony model: ${model}`);
  const key = getKey('openrouter');
  if (!key) throw new Error('Brak klucza OpenRouter API — skonfiguruj w Ustawienia');

  const safeUser   = user.slice(0, 32_000);
  const safeSystem = system.slice(0, 8_000);

  const messages = [
    ...(safeSystem ? [{ role: 'system', content: safeSystem }] : []),
    { role: 'user', content: safeUser },
  ];

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'https://zen-bro-wser.org',
      'X-Title': 'ZENO Browser AI Sandbox',
    },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 4096 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '(brak odpowiedzi)';
}

export const AiSandbox: React.FC<SandboxToolProps> = ({ onResult, sandboxId }) => {
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const modelDef = MODELS.find(m => m.id === selectedModel)!;

  const handleSubmit = async () => {
    if (!userPrompt.trim() || loading) return;
    setLoading(true);
    setError('');
    setOutput('');
    try {
      let result: string;
      if (modelDef.provider === 'gemini') {
        result = await callGemini(selectedModel, systemPrompt, userPrompt);
      } else {
        result = await callOpenRouter(selectedModel, systemPrompt, userPrompt);
      }
      setOutput(result);
      if (onResult) onResult(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Nieznany błąd API');
    } finally {
      setLoading(false);
    }
  };

  const sendToTerminal = () => {
    if (!output) return;
    window.dispatchEvent(new CustomEvent('zeno-window-message', {
      detail: { from: sandboxId ?? 'ai-sandbox', to: 'terminal', type: 'result', data: output },
    }));
    if (onResult) onResult(output);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 overflow-hidden">
      {/* Controls */}
      <div className="flex flex-col gap-2 p-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 shrink-0">Model:</span>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500"
          >
            {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <span className="text-xs px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 shrink-0">
            {modelDef.provider}
          </span>
        </div>
        <textarea
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          placeholder="System prompt (opcjonalny)"
          rows={2}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500 resize-none"
        />
      </div>

      {/* Prompt + output */}
      <div className="flex-1 flex flex-col gap-2 p-3 overflow-hidden min-h-0">
        <textarea
          value={userPrompt}
          onChange={e => setUserPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(); }}
          placeholder="Wpisz prompt (Ctrl+Enter aby wysłać)"
          rows={4}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500 resize-none"
        />
        <div className="flex-1 min-h-0 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <div className="w-6 h-6 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
                <span className="text-xs">Generuję odpowiedź</span>
              </div>
            </div>
          ) : error ? (
            <div className="h-full rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400 overflow-auto">
               {error}
            </div>
          ) : output ? (
            <div className="h-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {output}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm border border-slate-800 rounded-lg">
              Wynik pojawi się tutaj
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-3 pb-3">
        <button
          onClick={handleSubmit}
          disabled={loading || !userPrompt.trim()}
          className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-sm font-medium transition-colors"
        >
          {loading ? ' Generuję' : ' Wyślij prompt'}
        </button>
        {output && (
          <button
            onClick={sendToTerminal}
            title="Wyślij wynik do Terminala"
            className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition-colors whitespace-nowrap"
          >
             Terminal
          </button>
        )}
      </div>
    </div>
  );
};
