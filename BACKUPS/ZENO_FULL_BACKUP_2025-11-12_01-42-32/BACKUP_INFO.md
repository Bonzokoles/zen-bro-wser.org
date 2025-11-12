# ZENO Browser - Full Backup

## Backup Information

**Date:** 2025-11-12 01:42:32  
**Type:** Full Project Backup  
**Size:** 18.23 MB  
**Files:** 683

## Excluded Directories

- `node_modules/` - Dependencies (reinstall via npm install)
- `dist/` - Build artifacts
- `.git/` - Version control (use git clone)
- `BACKUPS/` - Previous backups
- `.astro/` - Astro cache
- `.wrangler/` - Cloudflare Workers cache
- `.cache-bust` - Cache files

## Repository State

**Branch:** main  
**Last Commit:** 4f7655d - [DOCS] Reorganizacja TODO - przeniesiono ukończone do zrobione/

## Project Structure

```
ZENO_web_CORE/
├── .cloudflare/          # API Worker (Cloudflare)
├── BIELIK_THE_whitie/    # Agent System (Cloudflare Workers)
├── CAYD_SEARCH_ENG/      # Search Engine (Express, port 6040-6050)
├── config/               # Central configuration (agents)
├── DOCUMENTS_ALL/        # Documentation
│   └── DO_ZROBIENIA/     # TODO lists
│       └── zrobione/     # Completed tasks
├── ZENO_WEB_CORE_APP/    # Main Astro Application
│   ├── src/
│   │   ├── active/       # Active code version
│   │   ├── original/     # Production baseline
│   │   └── working/      # Development copies
│   └── public/
├── scripts/              # Build and deployment scripts
└── system_startup/       # Startup batch files
```

## Deployment URLs

- **Frontend:** https://zeno-browser.pages.dev
- **BIELIK Agents:** https://zeno-bielik-agents.stolarnia-ams.workers.dev
- **API Worker:** https://zeno-browser-api.stolarnia-ams.workers.dev

## Key Technologies

- **Frontend:** Astro 5.15.4, React 19.2
- **Backend:** Cloudflare Workers, D1, KV
- **Agent System:** TypeScript, OpenAI/Gemini/Claude
- **Search:** CAYD (Express), Tavily API
- **Players:** Webamp (music), YouTube + Archive.org (video)
- **MCP:** 14 servers (astro-docs, Docfork, GitHub, etc.)

## Restore Instructions

### 1. Install Dependencies

```bash
cd ZENO_WEB_CORE_APP
npm install

cd ../BIELIK_THE_whitie
npm install

cd ../CAYD_SEARCH_ENG
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in API keys:
- GEMINI_API_KEY
- OPENAI_API_KEY
- ANTHROPIC_API_KEY (optional)
- TAVILY_API_KEY

### 3. Start Development

```bash
# Frontend (Astro)
cd ZENO_WEB_CORE_APP
npm run dev

# BIELIK Agents (local)
cd BIELIK_THE_whitie
npm start

# CAYD Search (optional)
cd CAYD_SEARCH_ENG
node source/server.js
```

### 4. Deploy to Production

```bash
# Commit changes
git add .
git commit -m "Your message"
git push origin main

# GitHub Actions will auto-deploy to:
# - Cloudflare Pages (Frontend)
# - Cloudflare Workers (BIELIK + API)
```

## Version Control Workflow

**IMPORTANT:** Never edit `src/original/` directly!

1. Copy to working: `npm run dev:copy components/File.tsx`
2. Edit in: `src/working/components/File.tsx`
3. Validate: `npm run validate:working components/File.tsx`
4. Merge: `npm run merge:to-original components/File.tsx`
5. Commit: `git commit -m "[ORIGINAL] components/File: Description"`

See `VERSION_CONTROL_QUICKSTART.md` for details.

## Current Status

### Working Features ✅
- Multi-tab browser with floating windows
- AI Chat (Gemini, OpenRouter 8 models)
- Music Player (Webamp with 7 skins)
- Video Player (YouTube + Internet Archive)
- Library Browser (CAYD integration)
- MCP Tools integration (14 servers)
- Agent System (3 agents: researcher, coder, planner)

### In Progress 🔄
- MCP tool execution
- Library panel draggable positioning
- CAYD Search Engine full integration

### Planned 📋
- Claude AI provider
- Desktop Electron app
- Extension system
- Knowledge base with vector search
- Multi-agent orchestration

## Backup Notes

This backup was created after:
- Reorganizing TODO documentation
- Moving completed tasks to `zrobione/` folder
- Adding VIDEO&AUD.md documentation
- Configuring CAYD ports (6040-6050)
- Verifying all playersy work correctly

## Support

**GitHub:** https://github.com/Bonzokoles/zen-bro-wser.org  
**Contact:** JimBoZen@proton.me

---
*Backup created automatically by ZENO deployment scripts*
