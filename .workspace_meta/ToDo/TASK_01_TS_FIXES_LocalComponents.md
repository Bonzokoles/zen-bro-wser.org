# TASK 01 — Naprawa błędów TS w komponentach lokalnych

**Agent:** `Expert React Frontend Engineer`  
**Skills:** `#`  
**Priorytet:** 🔴 BLOKER BUILDU — wykonaj jako pierwszy  
**Szacowany czas:** ~1.5h  
**Status:** ⬜ DO ZROBIENIA

---

## PROMPT DO WKLEJENIA

```
@review-and-refactor -Napraw wszystkie błędy TypeScript w komponentach ZENO Browser.
NIE refaktoryzuj nic poza wskazanymi plikami.

## Pliki do naprawy

### 1. ZENO_WEB_CORE_APP/src/active/components/LocalLibrarySearch.tsx
Problem: brakujące `useState` — `iframeLoaded`, `setIframeLoaded` są używane ale nie zadeklarowane.
Napraw: dodaj na początku komponentu (przy innych useState):
`const [iframeLoaded, setIframeLoaded] = useState(false);`

### 2. ZENO_WEB_CORE_APP/src/active/components/MusicPlayer.tsx
Problem: brakujące `useState` — `currentSkin`, `setCurrentSkin`, `showSkinSelector`, `setShowSkinSelector`
Napraw: dodaj na początku komponentu:
`const [currentSkin, setCurrentSkin] = useState<string | null>(null);`
`const [showSkinSelector, setShowSkinSelector] = useState(false);`

### 3. ZENO_WEB_CORE_APP/src/active/components/ChatPanel.tsx (linia ~60)
Problem: `content: string | null | undefined` nie pasuje do `content?: string | undefined`
Napraw: 
`content: webContext?.content ?? undefined`

### 4. ZENO_WEB_CORE_APP/src/active/components/FloatingWindow.tsx (linie ~191, ~212)
Problem: błędne porównania windowState — TypeScript wykrywa że typy się nie nakładają
Napraw:
```typescript
// Zastąp porównania windowState w obu miejscach:
const isResizable = windowState === 'normal' || windowState === 'pip';
// użyj isResizable zamiast windowState !== 'maximized' && windowState !== 'minimized'
```

## Weryfikacja po naprawach

Uruchom z katalogu ZENO_WEB_CORE_APP/:
`npm run type-check`

Cel: 0 błędów w tych 4 plikach.

#review-and-refactor
```

---

## Oczekiwany wynik

- `LocalLibrarySearch.tsx` — 0 błędów (3 błędy usunięte)
- `MusicPlayer.tsx` — 0 błędów (7 błędów usuniętych)
- `ChatPanel.tsx` — 0 błędów (1 błąd usunięty)
- `FloatingWindow.tsx` — 0 błędów (2 błędy usunięte)

## Po zakończeniu → Napisz  = SKONCZYONE_SZEFIE!
