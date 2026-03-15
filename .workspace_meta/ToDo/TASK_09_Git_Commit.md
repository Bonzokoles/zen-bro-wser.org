# TASK 09 — Git Commit (po każdej fazie)

**Agent:** dowolny  
**Skills:** `#git-commit` `#conventional-commit`  
**Priorytet:** 🟢 Niski — opcjonalny, ale rekomendowany  
**Szacowany czas:** ~10 min na commit  
**Status:** ⬜ DO ZROBIENIA

---

> ✅ Wykonaj po każdej zakończonej fazie (lub wszystko jednym commitem po TASK_08)

---

## PROMPT DO WKLEJENIA

```
Stwórz git commit dla wszystkich zmian z portowania komponentów ZENO Browser.

## Sprawdź co zostało zmienione

```powershell
cd U:\WWW_Zen_BRo_wser_org
git status
git diff --stat
```

## Zasady commitów tego projektu

- Po merge do `original/`: prefix `[ORIGINAL]`
- Po merge do `working/`:  prefix `[WORKING]`
- Format: Conventional Commits

## Przykładowe commity dla TASK_01–08

```
feat(types): fix TypeScript compilation — zero errors in ZENO_WEB_CORE_APP

fix(claude): implement missing ClaudeProvider methods (testConnection, executeMCPCommand, analyzeWebContent, clearChatHistory)

fix(gemini): handle error:unknown type in chat handler

fix(components): add missing useState/useEffect imports in LocalLibrarySearch and MusicPlayer

feat(hooks): add useWindowManager hook for floating window state

feat(components): port FeatureDock component from NEWfiles

feat(components): integrate AddressBar, TabBar, SecurityMonitor, AIPanel from NEWfiles

test(hooks): add unit tests for useWindowManager
```

## Instrukcja stagowania

Grupuj logicznie:
```powershell
# Tylko TS fixy
git add ZENO_WEB_CORE_APP/src/active/services/aiProviders/claude.ts
git add ZENO_WEB_CORE_APP/src/active/services/aiProviders/gemini.ts
git add ZENO_WEB_CORE_APP/src/active/services/mcpService.ts
git commit -m "fix(types): resolve 20 TypeScript build-blocking errors"

# Nowe komponenty
git add ZENO_WEB_CORE_APP/src/active/components/AddressBar.tsx
git add ZENO_WEB_CORE_APP/src/active/components/TabBar.tsx
git add ZENO_WEB_CORE_APP/src/active/components/SecurityMonitor.tsx
git add ZENO_WEB_CORE_APP/src/active/components/AIPanel.tsx
git commit -m "feat(components): integrate NEWfiles components into ZENO_WEB_CORE_APP"

# Hooks
git add ZENO_WEB_CORE_APP/src/active/hooks/
git commit -m "feat(hooks): add useWindowManager and FeatureDock from NEWfiles"
```

## Sprawdź przed pushem

```powershell
git log --oneline -10
```

Użyj skill `#git-commit` do wygenerowania optymalnego commit message na podstawie `git diff`.

#git-commit
#conventional-commit
```

---

## Strategia commit (skrócona)

Jeśli wolisz jeden zbiorczy commit:

```bash
git add ZENO_WEB_CORE_APP/src/active/
git add ZENO_WEB_CORE_APP/src/working/
git commit -m "feat(zeno): port NEWfiles components + fix 20 TS errors [ORIGINAL]

- fix: LocalLibrarySearch, MusicPlayer missing hooks
- fix: ClaudeProvider 4 missing methods
- fix: gemini.ts error:unknown type
- feat: useWindowManager hook
- feat: FeatureDock, AddressBar, TabBar, SecurityMonitor, AIPanel
- test: useWindowManager unit tests
"
```
