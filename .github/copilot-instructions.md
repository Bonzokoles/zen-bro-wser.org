# ZENO Browser - AI Coding Agent Instructions

## Project Overview

**ZENO Browser** is an AI-powered browser project combining a web/desktop app with a custom search engine:

1. **AI-powered browser** (Astro + React + Electron) with multi-model AI integration
2. **Hybrid AI models** - API-based (Gemini, OpenRouter, Claude) + containerized Polish-language models
3. **CAYD Search Engine** - custom retro web search (port 6040), integrated at `/api/cayd`

**Key Technologies:** Astro 5.17.1, React 18.3.1, TypeScript 5.9.3, Tailwind CSS 3.4.18, Electron 27.0.0

**Polish-language containerized models:** Gemma 2B (port 11434), Phi-3 Nano (port 11435) — terminal support only

## Critical Workflow: Version Control System

**NEVER EDIT `src/original/` DIRECTLY!** This project uses a three-folder system:

- `src/original/` - Production code (read-only, except via merge)
- `src/working/` - Development copies (edit here)
- `src/active/` - Symlinked/copied version used by app

### Standard Development Workflow

```bash
# 1. Copy file to working
npm run dev:copy components/Browser.tsx

# 2. Switch app to use working version
npm run dev:use-working components/Browser.tsx

# 3. Edit file (adds WORKING VERSION header)
# Edit: src/working/components/Browser.tsx

# 4. Document changes in .meta.json
# Update: changes[], status: "in_progress"

# 5. Validate before merge
npm run validate:working components/Browser.tsx

# 6. Merge when validated
npm run merge:to-original components/Browser.tsx

# 7. Commit with prefix
git commit -m "[ORIGINAL] components/Browser: Description"
```

**Validation checklist:**

- TypeScript compiles
- Tests pass
- Changes documented in `.meta.json`
- `status: "validated"` in metadata

**Emergency rollback:**

```bash
npm run rollback components/Browser.tsx --latest
```

## Architecture: Three Interconnected Systems

### 1. ZENO_WEB_CORE_APP (Browser UI)

**Location:** `ZENO_WEB_CORE_APP/`

Astro-based browser with:

- Multi-tab management
- AI chat integration (Gemini ✅, OpenRouter 8 models ✅, Claude ⚠️ placeholder)
- MCP (Model Context Protocol) — 6 tools defined in `mcpService.ts`, 1/6 implemented
- Tavily search integration
- Admin panel, orchestrator, CloudflareTunnel panel

**File structure:**

```
ZENO_WEB_CORE_APP/src/
├── original/    # Production code (read-only)
├── working/     # Development copies (edit here)
├── active/      # Active version (symlinked)
├── components/  # Browser.tsx, ChatPanel, MCPToolsPanel, TabBar, IframeWindowManager…
├── services/    # mcpService.ts, toolExecutionService, aiProviders/{gemini,openrouter,claude}
├── pages/       # index.astro, admin.astro, orchestrator.astro, api/ (API routes)
├── layouts/, content/, styles/, types/, utils/, config/
└── consts.ts
```

**TypeScript alias:** `@/` → `src/`

**Import pattern:** Always import from `active/`:

```typescript
// CORRECT
import { Browser } from "./active/components/Browser";
import { mcpService } from "./active/services/mcpService";

// WRONG - never import from original/working directly
import { Browser } from "./original/components/Browser";
```

**Hybrid AI Integration:**

API-based models:

- **Gemini**: `@google/generative-ai` ✅ fully implemented
- **OpenRouter**: Multi-model proxy (8 models) ✅ fully implemented
- **Claude**: `@anthropic-ai/sdk` ⚠️ placeholder only — needs implementation

Containerized models (Polish language support, terminal only):

- **Gemma 2B**: `google/gemma:2b` (port 11434) — terminal support only
- **Phi-3 Nano**: `mcr.microsoft.com/phi-3:nano` (port 11435) — ultra-lightweight

### 2. CAYD Search Engine

**Location:** `CAYD_SEARCH_ENG/` — custom retro search engine (based on Wiby, GPL v2)

- Runs on port 6040 (Express API)
- Integrated via Astro proxy: `/api/cayd` → `http://localhost:6040`
- Source code: C/Golang crawler + PHP frontend

### 3. Electron Desktop App

**Location:** `src-electron/` (main.ts, preload.ts, mcp-server/core/)

- Built separately: `npm run build:full` or `npm run dist`
- IPC bridge between Electron main and renderer
- Polyfills for Node/browser compat in `main.ts`

## Development Commands

### Root (Astro + Electron concurrently)

```bash
npm run dev              # Astro (localhost:4378) + Electron
npm run dev:astro        # Astro only — port 4378
npm run dev:electron     # Electron only (dev mode)
npm run build            # Astro production build
npm run build:full       # Astro + Electron build
npm run dist             # Create distributable installers
npm run type-check       # TypeScript validation
npm run lint             # ESLint on src/ and src-electron/
npm run lint:fix         # Auto-fix lint issues
npm run test:unit        # Jest + coverage
npm run test:e2e         # Playwright E2E tests
```

### Version Control Scripts (run from ZENO_WEB_CORE_APP/)

```bash
npm run dev:copy <path>              # Copy original → working
npm run dev:use-working <path>       # Switch to working version
npm run dev:use-original <path>      # Switch to original version
npm run validate:working <path>      # Validate before merge
npm run merge:to-original <path>     # Merge working → original
npm run diff <path>                  # Compare versions
npm run rollback <path> --latest     # Restore from backup
npm run test:working                 # Vitest on working versions
```

### System Startup

```bash
# From system_startup/ directory
start_main_app.bat          # Launch browser app (port 4378)
start_zeno_with_cayd.bat    # Start ZENO + CAYD search (port 6040)
run_dev_tools.bat           # Development tools + version control
start_buch_agent.bat        # Show available AI models (Gemma, Phi)
```

## Code Conventions

### File Headers

Working versions automatically get headers:

```typescript
/*
 * WORKING VERSION
 * Original: src/original/components/Browser.tsx
 * Started: 2025-01-15
 * Status: IN_PROGRESS
 *
 * Changes:
 * - Added tab grouping feature
 * - Improved error handling
 */
```

### Error Handling

Use structured errors (planned enhancement):

```typescript
// src/utils/error-handler.ts
throw new AppError(
  "Rate limit exceeded",
  "RATE_LIMIT",
  "Too many requests. Please wait.",
  { retryAfter: 60 },
);
```

### AI Provider Pattern

```typescript
// Lazy load providers
const provider = await (selectedProvider === "gemini"
  ? import("./aiProviders/gemini")
  : import("./aiProviders/openrouter"));
```

## Current State & Priorities

**Status:** ~60% complete, functional prototype

**Critical fixes needed (do first):**

1. **API key security** - Move from localStorage to backend proxy (XSS risk)
2. **Complete MCP tools** - 5/6 tools defined but not implemented (`content_analysis`, `bookmark_manager`, `page_summarizer`, `link_extractor`, `web_navigation`)
3. **Add Claude provider** - `@anthropic-ai/sdk` installed, only placeholder code

**Quick wins** (1-2 days each):

- Toast notifications (use react-hot-toast)
- Keyboard shortcuts (`useKeyboardShortcuts` hook)
- Better error handling (AppError class)
- Loading skeletons (TabSkeleton, ChatSkeleton)
- Smart URL parsing (`parseInput` function)

**Roadmap:**

- **Month 1-2:** Security fixes, complete tools, testing suite
- **Month 3-4:** Electron desktop app polish, state management (Zustand)
- **Month 5-6:** Extension system, multi-agent orchestration
- **Month 7-8:** Knowledge base with vector search

See `DOCUMENTS_ALL/DEVELOPMENT_PLAN.md` for full roadmap.

## Key Files to Reference

- `DOCUMENTS_ALL/VERSION_CONTROL_QUICKSTART.md` - Complete workflow guide
- `DOCUMENTS_ALL/DEVELOPMENT_PLAN.md` - Detailed roadmap & architecture
- `DOCUMENTS_ALL/QUICK_IMPROVEMENTS.md` - Low-hanging fruit improvements
- `docs/README.md` - Full documentation index

## Testing & Quality

**Before any merge:**

```bash
npm run validate:working <path>  # Must pass!
```

**Validation checks:**

- TypeScript compilation
- Unit tests pass
- Metadata complete
- Linting passes

**Test commands:**

```bash
npm run test:unit    # Jest + coverage (root)
npm run test:e2e     # Playwright E2E (root)
npm run test:working # Vitest on working versions (ZENO_WEB_CORE_APP)
```

**After edits, run Codacy analysis:**

```bash
# Automatically triggered per .github/instructions/codacy.instructions.md
```

## Common Pitfalls

❌ **Never do:**

- Edit `src/original/` directly
- Merge without validation
- Commit without `[ORIGINAL]` prefix after merge
- Import from `original/` or `working/` (use `active/`)

✅ **Always do:**

- Use version control workflow
- Document changes in `.meta.json`
- Test working version before merge
- Create backups (automatic via merge script)

## Integration Points

**AI Providers:**

- Gemini: `@google/generative-ai`
- OpenRouter: Multi-model proxy (8 models)
- Claude: Planned, use `@anthropic-ai/sdk`

**Search:**

- Tavily API for web search
- CAYD engine (`localhost:6040`) via proxy at `/api/cayd`

**MCP Tools:**

- Defined in `mcpService.ts`
- Execute via `ToolExecutionService`
- 1/6 implemented: `web_search` ✅, rest are stubs

**Containerized Models (Podman/Docker):**

- Gemma 2B: port 11434 — `docker-compose.yml`
- Phi-3 Nano: port 11435 — `docker-compose.yml`

**Multi-language support:**

- i18n configured: en, pl, de, es, fr
- See `astro.config.mjs`

## Questions to Clarify

When encountering ambiguous requirements, consider:

1. Does this change belong in `original/` (production) or should I use the workflow?
2. Is this a browser feature or API integration change?
3. Should this be a quick improvement or part of the larger roadmap?
4. Does this require a new AI model integration or modification of existing API providers?

Always prefer the version control workflow over direct edits, and reference the roadmap before starting large features.
