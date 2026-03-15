# TASK 04 — Weryfikacja DIFF ROOT vs SUB-APP + stan Electron

**Agent:** `Context Architect`  
**Skills:** `#update-implementation-plan`  
**Priorytet:** 🟡 Wysokie — podkład pod TASK_05  
**Szacowany czas:** ~30min  
**Status:** ⬜ DO ZROBIENIA

---

## PROMPT DO WKLEJENIA

```
@update-implementation-plan  Wykonaj weryfikację stanu projektu ZENO Browser — tylko analiza, bez edycji kodu.

## Zadanie 1 — DIFF ROOT vs SUB-APP

Porównaj pliki komponentów między:
- ROOT:    U:\WWW_Zen_BRo_wser_org\src\active\components\
- SUB-APP: U:\WWW_Zen_BRo_wser_org\ZENO_WEB_CORE_APP\src\active\components\

Oraz katalogi hooks/:
- ROOT:    U:\WWW_Zen_BRo_wser_org\src\active\hooks\
- SUB-APP: U:\WWW_Zen_BRo_wser_org\ZENO_WEB_CORE_APP\src\active\hooks\

Dla każdego katalogu listuj:
1. Pliki TYLKO w SUB-APP (kandydaci do portowania do ROOT)
2. Pliki TYLKO w ROOT (mogą być przestarzałe)
3. Pliki w OBU (porównaj datę modyfikacji)

Szczególnie sprawdź czy istnieją:
- hooks/useWindowManager.ts (w SUB-APP i/lub ROOT)
- components/FeatureDock.tsx (w SUB-APP i/lub ROOT)
- components/BrowserBottomNav.tsx (w ROOT — do zastąpienia)
- components/FloatingWindow.tsx — jakie ma props w SUB-APP vs ROOT

## Zadanie 2 — Stan Electron Foundation (FAZA 1 MASTER_REPAIR_PLAN)

Sprawdź komendy:
```powershell
# KROK 1.1 — zależności
cat U:\WWW_Zen_BRo_wser_org\package.json | Select-String "concurrently|zustand|uuid|wait-on|lru-cache"

# KROK 1.2 — scripts.dev
cat U:\WWW_Zen_BRo_wser_org\package.json | Select-String '"dev"'

# KROK 1.3 — main.ts createWindow
cat U:\WWW_Zen_BRo_wser_org\src-electron\main.ts | Select-String "loadURL|loadFile|isDev|localhost"

# KROK 1.4 — port w astro.config.mjs
cat U:\WWW_Zen_BRo_wser_org\astro.config.mjs | Select-String "port|server"
```

## Zadanie 3 — Sprawdź NEWfiles które już są zintegrowane

Porównaj:
- `U:\WWW_Zen_BRo_wser_org\NEWfiles\src\components\` — lista plików
- `U:\WWW_Zen_BRo_wser_org\ZENO_WEB_CORE_APP\src\active\components\` — które już istnieją

## Wynik

Stwórz raport który jasno mówi:
- ✅ co istnieje / ❌ co brakuje / ⚠️ co wymaga uwagi
- Dla FAZY 1: które KROKi (1.1-1.4) są wykonane, które nie

#update-implementation-plan
Zaktualizuj plik:
`U:\WWW_Zen_BRo_wser_org\.workspace_meta\ToDo\IMPLEMENTATION_PLAN_PORT_v2.md`
Uzupełnij wszystkie ❓ w sekcji DIFF i STAN FAZY 1.
```

---

## Oczekiwany wynik

- Wiemy dokładnie co portować w TASK_05
- Wiemy czy FAZA 1 Electron jest potrzebna
- `IMPLEMENTATION_PLAN_PORT_v2.md` zaktualizowany

## Po zakończeniu  - SKONCZONE_BULKA_Z_MASLEM!!
