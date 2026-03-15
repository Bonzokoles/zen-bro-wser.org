# TASK 02 — Implementacja ClaudeProvider (brakujące metody)

**Agent:** `TypeScript MCP Server Expert`  
**Skills:** `#typescript-mcp-server-generator`  
**Priorytet:** 🔴 BLOKER BUILDU — wykonaj po TASK_01  
**Szacowany czas:** ~1h  
**Status:** ⬜ DO ZROBIENIA

---

## PROMPT DO WKLEJENIA

```
@typescript-mcp-server-generator Zaimplementuj brakujące metody w ClaudeProvider ZENO Browser.

## Problem

mcpService.ts wywołuje 4 metody na providerze AI, ale ClaudeProvider ich nie ma.
To powoduje 13 błędów TypeScript które blokują build.

## Plik do edycji

`ZENO_WEB_CORE_APP/src/active/services/aiProviders/claude.ts`

## Wzorzec

Przeczytaj najpierw:
- `ZENO_WEB_CORE_APP/src/active/services/aiProviders/gemini.ts` — wzorzec implementacji
- `ZENO_WEB_CORE_APP/src/active/services/mcpService.ts` — jak metody są wywoływane

## Wymagane metody do dodania w ClaudeProvider

### 1. testConnection(): Promise<boolean>
Wyślij minimalny request do Claude API, zwróć true jeśli odpowiedź OK, false jeśli błąd.
Model: claude-3-haiku-20240307 (najtańszy)

### 2. executeMCPCommand(command: string, tools: MCPTool[]): Promise<MCPResponse>
Prześlij command jako user message do Claude z tools jako context.
Zwróć MCPResponse z polami: success, result lub error.

### 3. analyzeWebContent(url: string, content: string): Promise<string>
Prześlij URL i content jako prompt do Claude.
Zwróć analizę jako string.

### 4. clearChatHistory(): void
Wyczyść historię czatu (this.chatHistory = [] lub równoważne pole).

## Ważne

- Zainstalowany SDK: @anthropic-ai/sdk (już w package.json)
- Każda metoda musi mieć try/catch z `const err = error as Error`
- Zachowaj istniejący kod ClaudeProvider — tylko DODAJ metody

## Napraw też w mcpService.ts

Usuń zduplikowany eksport na końcu pliku:
`export type { ChatMessage, MCPResponse, MCPTool, MCPSession, MCPServiceConfig };`
(linia ~327 i ~408) — typy są już eksportowane wcześniej w pliku — to powoduje 10 duplikatów

## Weryfikacja

`cd ZENO_WEB_CORE_APP && npm run type-check`
Cel: 0 błędów w mcpService.ts i claude.ts

#typescript-mcp-server-generator
```

---

## Oczekiwany wynik

- `claude.ts` — 4 nowe metody zaimplementowane
- `mcpService.ts` — usunięte duplikaty eksportów (10 błędów usuniętych)
- Łącznie: 13 błędów TS usuniętych

## Po zakończeniu = napisz SKONCZONE_BONZO!
