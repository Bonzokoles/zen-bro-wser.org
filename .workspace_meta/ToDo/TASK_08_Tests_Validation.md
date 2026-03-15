# TASK 08 — Testy i Walidacja pełnego buildu

**Agent:** `Debug Mode Instructions`  
**Skills:** `#javascript-typescript-jest`  
**Priorytet:** 🔴 Krytyczny — ostatni krok przed commitem  
**Szacowany czas:** ~1.5h  
**Status:** ⬜ DO ZROBIENIA

---

> ⚠️ Wykonaj dopiero po TASK_01 + TASK_02 + TASK_03 + TASK_06 + TASK_07

---

## PROMPT DO WKLEJENIA

```
@javascript-typescript-jest Przeprowadź pełną walidację ZENO Browser po zakończeniu portowania komponentów.
Każdy krok musi zakończyć się sukcesem zanim przejdziesz do następnego.

## ETAP 1 — TypeScript: zero błędów

```powershell
cd U:\WWW_Zen_BRo_wser_org\ZENO_WEB_CORE_APP
npm run type-check
```

**Oczekiwane:** 0 błędów TS.  
**Jeśli błędy:** Napraw zanim przejdziesz dalej (wróć do TASK_01–03).

## ETAP 2 — Lint: zero ostrzeżeń w zmienionych plikach

```powershell
npm run lint
```

**Oczekiwane:** Brak błędów lint w:
- `src/active/components/LocalLibrarySearch.tsx`
- `src/active/components/MusicPlayer.tsx`
- `src/active/services/aiProviders/claude.ts`
- `src/active/services/mcpService.ts`
- `src/active/services/aiProviders/gemini.ts`
- `src/active/components/AddressBar.tsx` (nowy)
- `src/active/components/TabBar.tsx` (nowy)

## ETAP 3 — Unit testy

```powershell
npm run test:unit
```

**Oczekiwane:** Wszystkie testy zielone.  
**Jeśli testy brakuje dla nowych komponentów** → dopisz minimalne testy:

### Test useWindowManager (jeśli stworzony w TASK_06):

```typescript
// src/active/hooks/__tests__/useWindowManager.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useWindowManager } from '../useWindowManager';

describe('useWindowManager', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWindowManager());
    expect(result.current.windows).toEqual([]);
  });

  it('should add window', () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => {
      result.current.openWindow({ id: 'test', title: 'Test', component: 'TestComp' });
    });
    expect(result.current.windows).toHaveLength(1);
  });

  it('should remove window', () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => {
      result.current.openWindow({ id: 'w1', title: 'W1', component: 'TestComp' });
      result.current.closeWindow('w1');
    });
    expect(result.current.windows).toHaveLength(0);
  });
});
```

## ETAP 4 — Build produkcyjny Astro

```powershell
npm run build
```

**Oczekiwane:** Kompilacja bez błędów.

## ETAP 5 — Dev server

```powershell
npm run dev:astro
```

Otwórz localhost:4378 i sprawdź:
- [ ] Strona ładuje się bez błędów w konsoli
- [ ] Komponenty są widoczne
- [ ] Chat panel działa (model: Gemini lub OpenRouter — NIE Claude)
- [ ] Zakładki działają poprawnie

## ETAP 6 — Electron (jeśli TASK_05 był wykonany)

```powershell
npm run dev
```

**Oczekiwane:** Okno Electron otwiera się z UI na localhost:4378.

## ETAP 7 — Root diagnostyka (bonus)

```powershell
cd U:\WWW_Zen_BRo_wser_org
npm run type-check
npm run lint
```

Sprawdź czy ROOT projekt (src/) też nie ma regresji.

## RAPORT KOŃCOWY

Po zakończeniu podaj:
1. [ ] TypeScript: 0 błędów ✅/❌
2. [ ] Lint: 0 błędów ✅/❌
3. [ ] Testy: X/Y zaliczonych ✅/❌
4. [ ] Build: sukces ✅/❌
5. [ ] Dev server: działa ✅/❌
6. [ ] Electron: działa ✅/❌

#javascript-typescript-jest
```

---

## Oczekiwany wynik

- 0 błędów TS w całym `ZENO_WEB_CORE_APP/`
- 0 błędów lint w zmienionych plikach
- Wszystkie istniejące testy przechodzą
- Build produkcyjny kompiluje się
- Dev server odpowiada na :4378

## Po zakończeniu → ALL_GOOD_BRO!!!
