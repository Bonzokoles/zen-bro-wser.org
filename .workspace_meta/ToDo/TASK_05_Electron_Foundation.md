# TASK 05 — Electron Foundation (jeśli TASK_04 wykaże braki)

**Agent:** `Principal software engineer`  
**Skills:** `#web-coder`  
**Priorytet:** 🟡 Warunkowy — uruchom tylko jeśli TASK_04 potwierdzi braki  
**Szacowany czas:** ~1h  
**Status:** ⬜ DO ZROBIENIA (warunkowo)

---

> ⚠️ **Uruchom ten TASK tylko jeśli TASK_04 wykazał braki w KROKACH 1.1-1.4**  
> Jeśli wszystko jest OK → przejdź bezpośrednio do TASK_06

---

## PROMPT DO WKLEJENIA

```
@web-coder Napraw konfigurację Electron Foundation w ZENO Browser.
Wykonaj tylko KROK 1.1–1.4 z MASTER_REPAIR_PLAN.
Wprowadź minimalne zmiany — tylko to co brakuje wg weryfikacji z TASK_04.

## Kontekst

- Dev port: 4378 (Astro, nie Vite)
- Electron: wersja 27.0.0
- Root: U:\WWW_Zen_BRo_wser_org\
- Plik Electron main: src-electron/main.ts

## KROK 1.1 — Zależności w package.json (root)

Jeśli brakuje któregoś z poniższych — zainstaluj:
```powershell
npm install zustand uuid
npm install -D concurrently wait-on @types/uuid
```

Zależności do sprawdzenia:
- `zustand: ^4.4.1`
- `uuid: ^9.0.0`  
- `concurrently: ^8.2.2`
- `wait-on: ^7.1.0`

## KROK 1.2 — scripts.dev w package.json (root)

Jeśli scripts.dev nie uruchamia Electrona razem z Astro — zmień na:
```json
"dev": "concurrently \"npm run dev:astro\" \"wait-on http://localhost:4378 && electron .\""
```

Upewnij się że `dev:astro` nadal działa samodzielnie.

## KROK 1.3 — src-electron/main.ts createWindow()

Jeśli loadURL/loadFile nie uwzględnia trybu dev — popraw:
```typescript
if (isDev) {
  mainWindow.loadURL('http://localhost:4378');
} else {
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}
```

Port musi być 4378 (nie 5173 ani 3000).

## KROK 1.4 — astro.config.mjs

Sprawdź że server.port = 4378 i nie ma konfliktu z Electron.
Jeśli brakuje:
```javascript
server: {
  port: 4378,
  host: 'localhost'
}
```

## Weryfikacja

```powershell
# Dev server powinien startować:
npm run dev:astro
# → localhost:4378

# Electron powinien startować z UI:
npm run dev
```

#web-coder
```

---

## Oczekiwany wynik

- `npm run dev` uruchamia Astro + Electron razem
- Electron ładuje `http://localhost:4378`

## Po zakończeniu = KONIEC!ZROBIONE!
