# TASK 06 — Port SUB-APP → ROOT (FloatingWindow / useWindowManager / FeatureDock)

**Agent:** `Expert React Frontend Engineer`  
**Skills:** `#refactor` `#web-coder`  
**Priorytet:** 🟠 Wysoki — główna zmiana UI  
**Szacowany czas:** ~2-3h  
**Status:** ⬜ DO ZROBIENIA

---

> ⚠️ Wykonaj po TASK_03 (czysty build TS) i TASK_04 (wiesz co portować)

---

## PROMPT DO WKLEJENIA

```
@web-coder Przenieś nowe komponenty z SUB-APP do ROOT w projekcie ZENO Browser.
Używaj version control workflow: dev:copy → edytuj → validate → merge.
Pracuj w ZENO_WEB_CORE_APP/ jako katalogu roboczym.


## Kolejność portowania (ważna — zależności w dół)

### KROK 1 — FloatingWindow.tsx

Weryfikacja stanu:
- SUB-APP: `ZENO_WEB_CORE_APP/src/active/components/FloatingWindow.tsx`
- ROOT:    `src/active/components/FloatingWindow.tsx` (sprawdź czy istnieje)

Jeśli ROOT nie ma FloatingWindow lub SUB-APP jest nowszy — skopiuj.
Upewnij się że props zawierają:
```typescript
interface FloatingWindowProps {
  children?: React.ReactNode;
  icon?: string;
  zIndex?: number;
  url?: string;
  title: string;
  onClose: () => void;
}
```

Naprawa windowState comparison (jeśli TASK_01 nie naprawił):
```typescript
const isResizable = windowState === 'normal' || windowState === 'pip';
style={isResizable ? { width, height, left, top } : {}}
```

### KROK 2 — useWindowManager.ts (NOWY HOOK)

Ścieżka docelowa: `ZENO_WEB_CORE_APP/src/active/hooks/useWindowManager.ts`
(lub `src/active/hooks/useWindowManager.ts` jeśli root tego potrzebuje)

Stwórz hook:
```typescript
export type WindowType = 'chat' | 'music' | 'download' | 'library' | 'mcp' | 'reader';

interface WindowConfig {
  type: WindowType;
  title: string;
  url?: string;
  embedded?: boolean;
}

export function useWindowManager() {
  const [windows, setWindows] = React.useState<WindowConfig[]>([]);

  const openWindow = (type: WindowType, config?: Partial<WindowConfig>) =>
    setWindows(prev => [...prev.filter(w => w.type !== type), { type, title: type, ...config }]);

  const closeWindow = (type: WindowType) =>
    setWindows(prev => prev.filter(w => w.type !== type));

  const postMessage = (type: WindowType, message: unknown) =>
    window.postMessage({ target: type, payload: message }, '*');

  return { windows, openWindow, closeWindow, postMessage };
}
```

### KROK 3 — FeatureDock.tsx (NOWY KOMPONENT)

Ścieżka: `ZENO_WEB_CORE_APP/src/active/components/FeatureDock.tsx` 
Zastępuje: `BrowserBottomNav.tsx` (jeśli istnieje w ROOT)

```typescript
interface FeatureDockProps {
  onOpenWindow: (type: WindowType) => void;
}
```

Przyciski doków (7 ikon, max border-radius 2px zgodnie ze styleguide):
- 💬 Chat
- 🎵 Music
- ⬇️ Downloads
- 📚 Library
- 🔧 MCP Console  
- 📖 Reader
- 🔍 OmniSearch

Styl: dark background, ikony, minimalistyczny — pasuje do ZENO Browser aesthetic.

### KROK 4 — ChatPanel.tsx + OllamaChatbot.tsx — embedded prop

Dla obu plików dodaj prop `embedded?: boolean`.
Jeśli `embedded={true}` → renderuj bez: nagłówka, ramki zewnętrznej, box-shadow.
Dzięki temu Chat można osadzić jako content wewnątrz FloatingWindow.

### KROK 5 — Browser.tsx — podłącz WindowManager + FeatureDock

Plik: `ZENO_WEB_CORE_APP/src/working/components/Browser.tsx`  

```typescript
import { useWindowManager, WindowType } from '../hooks/useWindowManager';
import { FeatureDock } from './FeatureDock';
import { FloatingWindow } from './FloatingWindow';
import { ChatPanel } from './ChatPanel';
// ... inne komponenty do osadzenia

const { windows, openWindow, closeWindow } = useWindowManager();
```

W JSX podmień BrowserBottomNav na FeatureDock:
```tsx
<FeatureDock onOpenWindow={openWindow} />
{windows.map(w => (
  <FloatingWindow key={w.type} title={w.title} onClose={() => closeWindow(w.type)}>
    {w.type === 'chat' && <ChatPanel embedded />}
    {w.type === 'music' && <MusicPlayer embedded />}
    {/* ... */}
  </FloatingWindow>
))}
```

## Po każdym KROKU

```powershell
cd ZENO_WEB_CORE_APP
npm run type-check
```

Aby użyć workflow version control:
```powershell
npm run dev:use-working components/Browser.tsx
npm run validate:working components/Browser.tsx
npm run merge:to-original components/Browser.tsx
```

#refactor
#web-coder
```

---

## Oczekiwany wynik

- `useWindowManager.ts` — nowy hook gotowy
- `FeatureDock.tsx` — nowy komponent zastępujący BrowserBottomNav
- `FloatingWindow.tsx` — poprawne props w obu lokalizacjach
- `Browser.tsx` — podłączony WindowManager + FeatureDock

## Po zakończeniu → KONIEC SZEFCIU!!!
