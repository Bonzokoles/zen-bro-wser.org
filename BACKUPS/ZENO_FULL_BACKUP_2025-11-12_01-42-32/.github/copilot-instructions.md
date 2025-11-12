# ZENO Browser - AI Coding Agent Instructions

## Project Overview

**ZENO Browser** is a dual-architecture project combining:
1. **AI-powered browser** (Astro + React) with multi-model AI integration
2. **Modular agent system** (TypeScript/Node) with pluggable AI providers

**Key Technologies:** Astro 5.14.8, React 19.2, TypeScript, Tailwind CSS, Gemini/OpenAI/Claude

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

## Architecture: Two Interconnected Systems

### 1. ZENO_WEB_CORE_APP (Browser)

**Location:** `ZENO_WEB_CORE_APP/`

Astro-based browser with:
- Multi-tab management
- AI chat integration (Gemini, OpenRouter 8 models, Claude planned)
- MCP (Model Context Protocol) tools (6 tools: `web_search`, `content_analysis`, `bookmark_manager`, `page_summarizer`, `link_extractor`, `web_navigation`)
- Tavily search integration

**File structure:**
```
src/
├── original/    # Production code
├── working/     # Development copies  
├── active/      # Active version (symlinked)
├── components/  # React components
├── services/    # Business logic (mcpService, aiProviders)
└── pages/       # Astro pages/routes
```

**Import pattern:** Always import from `active/`:
```typescript
// CORRECT
import { Browser } from './active/components/Browser';
import { mcpService } from './active/services/mcpService';

// WRONG - never import from original/working directly
import { Browser } from './original/components/Browser';
```

### 2. BIELIK_THE_whitie (Agent System)

**Location:** `BIELIK_THE_whitie/`

Modular agent orchestration framework:

**Core concepts:**
- **AgentManager** (`src/core/AgentManager.ts`) - Central orchestrator, loads agents/models/tools
- **BaseAgent** (`src/agents/BaseAgent.ts`) - Base class for all agents
- **Agents** - Specialized entities (researcher, coder, planner) with specific models & tools
- **ModelFactory** - Pluggable provider system (OpenAI, Gemini, Anthropic, local models)
- **ToolFactory** - Functions agents can invoke

**Agent structure:**
```typescript
// src/config/agents.config.ts
{
  id: 'researcher',
  role: 'Expert Researcher',
  systemPrompt: '...',
  modelId: 'gpt-4o',           // from models.config.ts
  toolIds: ['web_search', 'file_write'],
  capabilities: ['web-scraping', 'data-synthesis']
}
```

**Adding a new agent:**
1. Copy template: `src/agents/_template.ts`
2. Define config in `src/config/agents.config.ts`
3. Add to AgentManager via `loadConfig()`

**Business Orchestrator endpoints** (planned):
- `/api/business-orchestrator/route-task` - Main task router
- `/api/business-orchestrator/aggregate-status` - Agent health checks
- `/api/business-orchestrator/decision` - AI-driven decisions
- `/api/business-orchestrator/audit` - Activity logs

## Development Commands

### Browser (ZENO_WEB_CORE_APP)
```bash
cd ZENO_WEB_CORE_APP
npm run dev                    # Start Astro dev server (localhost:4321)
npm run build                  # Production build
npm run test:working           # Test working versions
npm run type-check             # TypeScript validation
```

### Agent System (BIELIK_THE_whitie)
```bash
cd BIELIK_THE_whitie
npm run start                  # Run agent system (tsx src/index.ts)
npm run build                  # Compile TypeScript
```

### Version Control Scripts
```bash
npm run dev:copy <path>              # Copy original → working
npm run dev:use-working <path>       # Switch to working version
npm run dev:use-original <path>      # Switch to original version
npm run validate:working <path>      # Validate before merge
npm run merge:to-original <path>     # Merge working → original
npm run diff <path>                  # Compare versions
npm run rollback <path> --latest     # Restore from backup
```

### System Startup
```bash
# From system_startup/ directory
start_main_app.bat          # Launch browser app
start_bielik_agent.bat      # Launch agent system
run_dev_tools.bat           # Development tools
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
  'Rate limit exceeded',
  'RATE_LIMIT',
  'Too many requests. Please wait.',
  { retryAfter: 60 }
);
```

### AI Provider Pattern
```typescript
// Lazy load providers
const provider = await (selectedProvider === 'gemini'
  ? import('./aiProviders/gemini')
  : import('./aiProviders/openrouter'));
```

## Current State & Priorities

**Status:** ~60% complete, functional prototype

**Critical fixes needed (do first):**
1. **API key security** - Move from localStorage to backend proxy
2. **Complete MCP tools** - 5/6 tools defined but not implemented
3. **Add Claude provider** - Planned but missing

**Quick wins** (1-2 days each):
- Toast notifications (use react-hot-toast)
- Keyboard shortcuts (`useKeyboardShortcuts` hook)
- Better error handling (AppError class)
- Loading skeletons (TabSkeleton, ChatSkeleton)
- Smart URL parsing (`parseInput` function)

**Roadmap:**
- **Month 1-2:** Security fixes, complete tools, testing suite
- **Month 3-4:** Electron desktop app, state management (Zustand)
- **Month 5-6:** Extension system, multi-agent orchestration
- **Month 7-8:** Knowledge base with vector search

See `DEVELOPMENT_PLAN.md` for full roadmap.

## Key Files to Reference

- `VERSION_CONTROL_QUICKSTART.md` - Complete workflow guide
- `DEVELOPMENT_PLAN.md` - Detailed roadmap & architecture
- `QUICK_IMPROVEMENTS.md` - Low-hanging fruit improvements
- `BIELIK_THE_whitie/README.md` - Agent system overview
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

**MCP Tools:**
- Defined in `mcpService.ts`
- Execute via `ToolExecutionService`

**Multi-language support:**
- i18n configured: en, pl, de, es, fr
- See `astro.config.mjs`

## Questions to Clarify

When encountering ambiguous requirements, consider:
1. Does this change belong in `original/` (production) or should I use the workflow?
2. Is this a browser feature (ZENO_WEB_CORE_APP) or agent feature (BIELIK_THE_whitie)?
3. Should this be a quick improvement or part of the larger roadmap?
4. Does this require a new agent or modification of existing tools?

Always prefer the version control workflow over direct edits, and reference the roadmap before starting large features.
