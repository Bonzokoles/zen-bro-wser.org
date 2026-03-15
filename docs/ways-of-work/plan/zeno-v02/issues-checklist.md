# ZENO Browser v0.2.0 — Issues Checklist

> **GitHub Issues:** https://github.com/Bonzokoles/zen-bro-wser.org/issues

## Legenda
- 🔴 P0 — Krytyczne, blokuje inne taski
- 🟠 P1 — Ważne, core functionality
- 🟢 P2 — Infrastruktura, release

---

## 🔴 EPIC 1 — Security Core (P0) → [#15](https://github.com/Bonzokoles/zen-bro-wser.org/issues/15)

- [ ] [**#21**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/21) 🔴 [Story 1.1] SandboxWebView zastępuje iframe w Browser.tsx
  - Deps: none
  - Files: `ZENO_WEB_CORE_APP/src/active/components/SandboxWebView.tsx`, `Browser.tsx`
  - Tests: `tests/unit/security.test.ts`

- [ ] [**#22**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/22) 🔴 [Story 1.2] CSP Header Service — `generateCSP(domain)`
  - Deps: none
  - Files: `ZENO_WEB_CORE_APP/src/active/services/security.ts`
  - Tests: XSS vector tests

- [ ] [**#23**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/23) 🔴 [Story 1.3] Network Proxy + SSRF Protection
  - Deps: none
  - Files: `ZENO_WEB_CORE_APP/src/active/services/network.ts`
  - Tests: `tests/unit/network.test.ts`

- [ ] [**#24**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/24) 🔴 [Enabler 1.4] API Keys → CF Pages Secrets (usuń localStorage)
  - Deps: #21
  - Files: `src/active/services/aiProviders/*`, `.dev.vars`, API routes
  - Tests: grep audit — 0 localStorage API key refs

---

## 🟠 EPIC 2 — MCP Server (P0) → [#16](https://github.com/Bonzokoles/zen-bro-wser.org/issues/16)

- [ ] [**#25**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/25) 🔴 [Enabler 2.1] MCP Server Bootstrap — standalone, health check
  - Deps: Epic 1 (#15)
  - Files: `mcp-server/src/index.ts`, `.claude-mcp.json`
  - Tests: health endpoint 200

- [ ] [**#26**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/26) 🟠 [Story 2.2] MCP Tool: `content_analysis`
  - Deps: #25
  - Files: `mcp-server/src/tools/content_analysis.ts`
  - Tests: mock DOM → structured output

- [ ] [**#27**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/27) 🟠 [Story 2.3] MCP Tool: `web_navigation`
  - Deps: #25, #21
  - Files: `mcp-server/src/tools/web_navigation.ts`
  - Tests: navigation + sandbox verify

- [ ] [**#28**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/28) 🟠 [Story 2.4] MCP Tool: `page_summarizer`
  - Deps: #25, #26
  - Files: `mcp-server/src/tools/page_summarizer.ts`
  - Tests: summary ≤ 3 sentences

- [ ] [**#29**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/29) 🟠 [Story 2.5] MCP Tool: `link_extractor`
  - Deps: #25
  - Files: `mcp-server/src/tools/link_extractor.ts`
  - Tests: dedup, filter mailto/blob

- [ ] [**#30**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/30) 🟠 [Story 2.6] MCP Tool: `bookmark_manager` (D1 CRUD)
  - Deps: #25
  - Files: `mcp-server/src/tools/bookmark_manager.ts`
  - Tests: create → read → delete cycle

---

## 🟡 EPIC 3 — Crawler & Scraping (P1) → [#17](https://github.com/Bonzokoles/zen-bro-wser.org/issues/17)

- [ ] [**#31**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/31) 🟠 [Story 3.1] Crawlee Queue — depth limit, robots.txt, rate limit
  - Deps: #22, #23
  - Files: `scraping/crawlee/crawler.ts`
  - Tests: `tests/unit/crawler.test.ts`

- [ ] [**#32**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/32) 🟠 [Story 3.2] Cheerio HTML Parser → structured data
  - Deps: none
  - Files: `scraping/cheerio/parser.ts`
  - Tests: malformed HTML fixtures

- [ ] [**#33**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/33) 🟠 [Story 3.3] Playwright Plugin — JS-rendered SPA scraping
  - Deps: #32
  - Files: `scraping/playwright/scraper.ts`
  - Tests: SPA page → content extracted

- [ ] [**#34**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/34) 🟠 [Story 3.4] CAYD Feed — crawler results → CAYD index
  - Deps: #31, CAYD running on :6040
  - Files: `scraping/crawlee/cayd-feed.ts`, `CAYD_SEARCH_ENG/`
  - Tests: crawl → search → result visible

---

## 🟢 EPIC 4 — Browser Extension (P1) → [#18](https://github.com/Bonzokoles/zen-bro-wser.org/issues/18)

- [ ] [**#35**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/35) 🟠 [Story 4.1] Content Script — context gathering
  - Deps: none
  - Files: `browser-extension/content.js`
  - Tests: inject on page, message sent

- [ ] [**#36**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/36) 🟠 [Story 4.2] Background Service Worker (MV3)
  - Deps: #35
  - Files: `browser-extension/background.js`
  - Tests: bridge to ZENO API

- [ ] [**#37**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/37) 🟠 [Story 4.3] Popup UI — search + AI chat
  - Deps: #36
  - Files: `browser-extension/popup.html`, `popup.js`
  - Tests: response ≤ 2s

- [ ] [**#38**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/38) 🟠 [Story 4.4] Manifest v3 Audit — minimal permissions
  - Deps: #35, #36, #37
  - Files: `browser-extension/manifest.json`
  - Tests: Chrome install without errors

---

## 🔵 EPIC 5 — Terminal & Workflow (P1) → [#19](https://github.com/Bonzokoles/zen-bro-wser.org/issues/19)

- [ ] [**#39**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/39) 🟠 [Story 5.1] Terminal w Browser.tsx (sidebar button, FloatingWindow)
  - Deps: #21
  - Files: `ZENO_WEB_CORE_APP/src/active/components/Terminal.tsx`, `Browser.tsx`
  - Tests: open/close, history, ANSI colors

- [ ] [**#40**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/40) 🟠 [Story 5.2] MCP Commands z terminala (`mcp:search`, `mcp:summarize`)
  - Deps: #25, #39
  - Files: `Terminal.tsx`, `mcp-server/src/`
  - Tests: command → MCP call → result in terminal

- [ ] [**#41**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/41) 🟠 [Story 5.3] Workflow Engine — chainable actions
  - Deps: #25, #31
  - Files: `ZENO_WEB_CORE_APP/src/active/services/workflow.ts`
  - Tests: 3-step chain passes E2E

---

## ⚪ EPIC 6 — Release & Infra (P2) → [#20](https://github.com/Bonzokoles/zen-bro-wser.org/issues/20)

- [ ] [**#42**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/42) 🟢 [Story 6.1] Electron Auto-Updater (GitHub Releases)
  - Deps: #39
  - Files: `src-electron/services/auto-updater.ts`, `electron-builder.yml`
  - Tests: version check mock

- [ ] [**#43**](https://github.com/Bonzokoles/zen-bro-wser.org/issues/43) 🟢 [Story 6.2] Build Scripts + CI/CD Pipeline
  - Deps: all above
  - Files: `scripts/build-*.js`, `.github/workflows/release.yml`
  - Tests: full pipeline green

---

## Podsumowanie

| Epic | Issues | Priority | Status |
|------|--------|----------|--------|
| [Security Core #15](https://github.com/Bonzokoles/zen-bro-wser.org/issues/15) | #21–#24 | P0 | 🔲 Not started |
| [MCP Server #16](https://github.com/Bonzokoles/zen-bro-wser.org/issues/16) | #25–#30 | P0 | 🔲 Not started |
| [Crawler & Scraping #17](https://github.com/Bonzokoles/zen-bro-wser.org/issues/17) | #31–#34 | P1 | 🔲 Not started |
| [Browser Extension #18](https://github.com/Bonzokoles/zen-bro-wser.org/issues/18) | #35–#38 | P1 | 🔲 Not started |
| [Terminal & Workflow #19](https://github.com/Bonzokoles/zen-bro-wser.org/issues/19) | #39–#41 | P1 | 🔲 Not started |
| [Release & Infra #20](https://github.com/Bonzokoles/zen-bro-wser.org/issues/20) | #42–#43 | P2 | 🔲 Not started |

**Razem: 23 stories + 6 epików = 29 GitHub Issues**
