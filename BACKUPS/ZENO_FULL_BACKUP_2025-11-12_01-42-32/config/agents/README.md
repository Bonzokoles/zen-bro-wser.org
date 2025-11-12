# Agent Configuration

**Centralna konfiguracja agentów BIELIK**

## Struktura

```
config/agents/
├── agents.config.ts     # Główna konfiguracja agentów
└── README.md           # Ten plik
```

## Użycie

### BIELIK_THE_whitie (Worker)

```typescript
// BIELIK_THE_whitie/src/config/agents.config.ts
export { agents, getAgentById, isValidAgentId } from '../../../config/agents/agents.config';
```

### ZENO_WEB_CORE_APP (Astro API)

```typescript
// ZENO_WEB_CORE_APP/src/pages/api/agents/status.ts
import { agents } from '../../../../../config/agents/agents.config';
```

## Agenci

1. **researcher** - Expert Researcher (gpt-4o)
   - Tools: web_search, file_write
   - Capabilities: web-scraping, data-synthesis, reporting

2. **coder** - Senior Software Engineer (gpt-4o)
   - Tools: file_read, file_write, code_linter, execute_code
   - Capabilities: code-generation, debugging, refactoring

3. **planner** - Project Planner (gemini-1.5-pro)
   - Tools: file_read, file_write
   - Capabilities: task-decomposition, planning, risk-assessment

## Dodawanie nowego agenta

1. Dodaj konfigurację do `agents.config.ts`
2. Commit zmian
3. Deploy BIELIK Worker i Astro app

## Źródło prawdy

**Ten plik jest jedynym źródłem prawdy dla konfiguracji agentów.**

Nie duplikuj konfiguracji w innych miejscach - importuj z tego pliku.
