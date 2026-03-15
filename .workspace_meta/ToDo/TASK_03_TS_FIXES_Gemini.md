# TASK 03 — Naprawa błędów TS: gemini.ts

**Agent:** `Expert React Frontend Engineer`  
**Skills:** `#refactor`  
**Priorytet:** 🔴 BLOKER BUILDU — wykonaj po TASK_02  
**Szacowany czas:** ~30min  
**Status:** ⬜ DO ZROBIENIA

---

## PROMPT DO WKLEJENIA

```
@refactor Napraw błędy TypeScript w gemini.ts — ZENO Browser.
Tylko minimalne zmiany, bez refaktoryzacji.

## Plik do edycji

`ZENO_WEB_CORE_APP/src/active/services/aiProviders/gemini.ts`

## Błędy do naprawy

### 1. error: unknown — wszystkie catch bloki (linie ~81, ~128, ~160, ~185)

Wzorzec naprawy dla KAŻDEGO catch bloku w tym pliku:
```typescript
// PRZED:
} catch (error) {
  throw new Error(`Gemini API error: ${error.message}`);

// PO:
} catch (error) {
  const err = error as Error;
  throw new Error(`Gemini API error: ${err.message}`);
}
```

Przy logach console.error zmień:
```typescript
// PRZED:
console.error('Gemini connection test failed:', error.message || error);
// PO:
const err = error as Error;
console.error('Gemini connection test failed:', err.message || err);
```

### 2. config.model optional (linia ~39)
```typescript
// PRZED:
model: this.config.model,
// PO:
model: this.config.model ?? 'gemini-1.5-flash',
```

## Weryfikacja

`cd ZENO_WEB_CORE_APP && npm run type-check`
Cel: 0 błędów w gemini.ts (5 błędów do usunięcia)

#refactor
```

---

## Oczekiwany wynik

- `gemini.ts` — 0 błędów (5 błędów usuniętych)

## Po zakończeniu → SKONCZYLEM_BONZO!!!