# TASK 07 — Integracja NEWfiles komponentów

**Agent:** `Expert React Frontend Engineer`  
**Skills:** `#web-coder` `#review-and-refactor`  
**Priorytet:** 🟠 Wysoki — po portowaniu  
**Szacowany czas:** ~2h  
**Status:** ⬜ DO ZROBIENIA

---

> ⚠️ Wykonaj po TASK_06 (useWindowManager i FeatureDock gotowe)

---

## PROMPT DO WKLEJENIA

```
@web-coder  Zintegruj nowe komponenty z folderu NEWfiles/ do ZENO Browser.
Dla każdego użyj version control workflow: dev:copy → dostosuj → validate → merge.

## Przygotowanie — sprawdź IPC

Przed integracją sprawdź:
```powershell
cat U:\WWW_Zen_BRo_wser_org\src-electron\preload.ts | Select-String "getTabs|getHistory|navigate"
```

## Kolejność integracji

### KROK 1 — AddressBar.tsx

Źródło: `NEWfiles/src/components/AddressBar.tsx`
Cel:    `ZENO_WEB_CORE_APP/src/working/components/AddressBar.tsx`

Dostosuj:
- Zmień importy na ścieżki relatywne projektu (`@/` aliasy)
- Podłącz do istniejącego state zarządzania URL (sprawdź jak Browser.tsx obsługuje currentUrl)
- Upewnij się że onNavigate callback pasuje do istniejącego API

Workflow:
```powershell
cd ZENO_WEB_CORE_APP
npm run dev:copy components/AddressBar.tsx
# Edytuj src/working/components/AddressBar.tsx
npm run validate:working components/AddressBar.tsx
npm run merge:to-original components/AddressBar.tsx
```

### KROK 2 — TabBar.tsx

Źródło: `NEWfiles/src/components/TabBar.tsx`
Cel:    `ZENO_WEB_CORE_APP/src/working/components/TabBar.tsx`

Sprawdź czy `electronAPI.browser.getTabs()` istnieje w preload.ts.
Jeśli TAK → podłącz.
Jeśli NIE → dodaj stub w src-electron/preload.ts:
```typescript
browser: {
  getTabs: () => ipcRenderer.invoke('browser:getTabs'),
  // ...
}
```

### KROK 3 — SecurityMonitor.tsx

Źródło: `NEWfiles/src/components/SecurityMonitor.tsx`
Cel:    `ZENO_WEB_CORE_APP/src/working/components/SecurityMonitor.tsx`

Dostosuj importy. Sprawdź czy potrzebuje danych z Electron IPC.

### KROK 4 — AIPanel.tsx

Źródło: `NEWfiles/src/components/AIPanel.tsx`
Cel:    `ZENO_WEB_CORE_APP/src/working/components/AIPanel.tsx`

Podłącz do istniejącego:
- `GeminiProvider` lub `OpenRouterProvider` (z ZENO_WEB_CORE_APP/src/active/services/aiProviders/)
- NIE do ClaudeProvider (jeszcze w trakcie implementacji)
- Użyj istniejącego mcpService.sendMessage() jako interfejsu

## Po każdym KROKU

```powershell
npm run type-check
```

## Po wszystkich KROKACH

Sprawdź czy Browser.tsx używa nowych komponentów:
- AddressBar zamiast starszego paska adresu
- TabBar zamiast starego managera tabów
- SecurityMonitor gdzieś w layoutcie

#web-coder
#review-and-refactor
```

---

## Oczekiwany wynik

- `AddressBar.tsx` zintegrowany
- `TabBar.tsx` zintegrowany (z IPC jeśli potrzeba)
- `SecurityMonitor.tsx` zintegrowany
- `AIPanel.tsx` zintegrowany z GeminiProvider/OpenRouter

## Po zakończeniu →ZROBIONE!!!
