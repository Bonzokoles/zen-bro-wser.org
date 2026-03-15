# ZENO Browser — Project Notes

> Aktualny stan projektu, odkrycia, wzorce, ważne konteksty.

---

## Aktualny stan (2026-03-15)

### Architektura
- **Root app** `U:\WWW_Zen_BRo_wser_org\` — Astro 5.17 + React 18 + Tailwind + Cloudflare adapter
- **Sub-app** `ZENO_WEB_CORE_APP/` — starsza kopia, aktywna (`npm run dev` na porcie 4378 dla root, 4380 dla sub-app)
- **Aktywny kod** zawsze w `src/active/components/` i `src/active/hooks/` (NIE w `src/original/` ani `src/working/`)

### Ostatnie zmiany (sesja 2026-03-15)
- `FloatingWindow.tsx` → dodano `children`, `icon`, `zIndex`, `url` opcjonalne
- `useWindowManager.ts` → nowy hook — zarządzanie oknami + postMessage bus
- `FeatureDock.tsx` → nowy komponent, zastępuje BrowserBottomNav (6 primary + 8 more flyout)
- `ChatPanel.tsx`, `OllamaChatbot.tsx` → dodano `embedded` prop (renderowane wewnątrz FloatingWindow)
- `Browser.tsx` → integracja z WindowManager, import FeatureDock zamiast BrowserBottomNav

### Cel projektu (wizja usera)
Przeglądarka z sandboxowymi środowiskami:
- Główna plansza (browser) łączy aplikacje webtunelami (Cloudflare) i AI Gateway
- Floating windows / iframe panels = narzędzia analityczno-badawcze
- Terminal CLI w oknie floating → uruchamianie narzędzi + łączenie wyników
- Sandbox-in-sandbox (iframe w iframe) — plan na przyszłość
- Wyniki zapisywalne lokalnie lub przesyłane do innych narzędzi

### Priorytety do zrobienia
1. **UI refinement** — dopracowanie istniejącego UI, nie radykalna zmiana
2. **Narzędzia jako osobne foldery** — każdy tool w `src/tools/tool-name/` z własnym komponentem
3. **Elementy łączące** — każde narzędzie sprawdzane czy działa w warunkach iframe/sandbox
4. **Terminal panel** jako FloatingWindow z `react-terminal-ui`
5. **Cloudflare WebtTunnels** — daemon controller + route mapping + health dashboard
6. **AI Gateway** — cache, failover, vector memory (ChromaDB/Supabase)

---

## Wzorce projektu

### FloatingWindow z komponentem w środku
```tsx
<FloatingWindow title="AI Chat" icon="🤖" zIndex={win.zIndex} ...>
  <ChatPanel embedded onClose={() => closeWindow(win.id)} ... />
</FloatingWindow>
```

### Nowe narzędzie = osobny folder
```
src/tools/
  terminal-panel/
    TerminalPanel.tsx     ← komponent
    TerminalPanel.test.tsx
    index.ts              ← re-export
  web-tunnel-monitor/
    ...
```

### PostMessage bus (inter-window communication)
```ts
// wysyłanie
sendMessage('ai-chat', 'analyzer', 'analyze', { url, content });
// nasłuchiwanie
window.addEventListener('zeno-window-message', (e: CustomEvent) => { ... });
```

---

## Odkrycia

- `src/active/` w root i `ZENO_WEB_CORE_APP/src/active/` to DWA różne foldery — root jest starszy (~2026-03-14), sub-app jest nowszy z FloatingWindow zmianami
- Build z `npm run build` w root działa na~6s do Cloudflare adapter
- Pre-existing TS errors w: `MusicPlayer`, `MCPConsole`, `LocalLibrarySearch`, `DownloadManager` — nie blokują buildu (continue-on-error: true w CI)
- Dev server root: port 4378, sub-app: port 4380

---

## Zainstalowane agenty i skills (2026-03-15)

### Agenty `.github/agents/`
| Agent | Kiedy używać |
|-------|-------------|
| `expert-react-frontend-engineer` | UI components, hooks, Tailwind styling |
| `typescript-mcp-expert` | MCP tools, AI Gateway, nowe narzędzia TS |
| `context-architect` | Duże zmiany multi-file — najpierw mapa |
| `debug` | Błędy, regresje, stack trace analysis |

### Skills `.github/skills/`
| Skill | Kiedy używać |
|-------|-------------|
| `create-implementation-plan` | Nowa funkcja → najpierw plan |
| `breakdown-plan` | GitHub Issues z Epic→Story hierarchią |
| `web-design-reviewer` | Ocena wizualna UI na działającym serwerze |
| `refactor` | Czyszczenie kodu bez zmiany zachowania |
