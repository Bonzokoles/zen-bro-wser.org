import React, { useState, useEffect } from 'react';

const BACKGROUNDS = [
  { id: 'none',       label: 'Brak (CSS domyślne)', icon: '🌑', preview: null },
  { id: 'signals',    label: 'Signals Wireframe',    icon: '📡', preview: '/backgrounds/signals/' },
  { id: 'datatunnel', label: 'Data Tunnel',          icon: '🌀', preview: '/backgrounds/datatunnel/' },
] as const;

type BgId = typeof BACKGROUNDS[number]['id'];

const STORAGE_KEY = 'zeno-background-id';

function getStoredBg(): BgId {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && BACKGROUNDS.some(b => b.id === v)) return v as BgId;
  } catch { /* noop */ }
  return 'none';
}

export function applyBackground(id: BgId) {
  const el = document.getElementById('zeno-bg-iframe') as HTMLIFrameElement | null;
  const effects = document.querySelector('.background-effects') as HTMLElement | null;

  if (id === 'none') {
    if (el) el.style.display = 'none';
    if (effects) effects.style.display = '';
  } else {
    const bg = BACKGROUNDS.find(b => b.id === id);
    if (!bg?.preview) return;
    if (effects) effects.style.display = 'none';
    if (el) {
      el.src = bg.preview;
      el.style.display = 'block';
    } else {
      // Create iframe dynamically if not present
      const iframe = document.createElement('iframe');
      iframe.id = 'zeno-bg-iframe';
      iframe.src = bg.preview;
      iframe.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:none;z-index:-1;pointer-events:none;';
      document.body.prepend(iframe);
    }
  }
  try { localStorage.setItem(STORAGE_KEY, id); } catch { /* noop */ }
}

interface BackgroundPickerProps {
  onClose: () => void;
}

export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({ onClose }) => {
  const [active, setActive] = useState<BgId>(getStoredBg);

  useEffect(() => {
    applyBackground(active);
  }, [active]);

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900 text-slate-200 h-full overflow-auto">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Wybierz tło</h3>
      <div className="flex flex-col gap-2">
        {BACKGROUNDS.map(bg => (
          <button
            key={bg.id}
            onClick={() => setActive(bg.id)}
            className={[
              'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all',
              active === bg.id
                ? 'border-indigo-500 bg-indigo-900/40 shadow-lg shadow-indigo-500/20'
                : 'border-slate-700 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-800',
            ].join(' ')}
          >
            <span className="text-2xl">{bg.icon}</span>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{bg.label}</span>
              {bg.preview && (
                <span className="text-xs text-slate-500">{bg.preview}</span>
              )}
            </div>
            {active === bg.id && (
              <span className="ml-auto text-indigo-400 text-lg">✓</span>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-600 mt-2">Tła interaktywne z Three.js. Wybór zapisywany w localStorage.</p>
    </div>
  );
};

export default BackgroundPicker;
