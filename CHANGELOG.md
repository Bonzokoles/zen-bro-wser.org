# Changelog

All notable changes to ZENO Browser will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-03-14

### Added
- **MCP Server** — TypeScript implementation with 6 tools (web_search, navigate, scrape_page, take_screenshot, bookmark_manager, page_summarizer)
- **Browser Extension** — Chrome/Edge Manifest V3 extension with AI integration
- **Terminal Component** — Built-in terminal with MCP commands
- **SandboxWebView** — Modern secure iframe alternative with granular permissions
- **Scraping Integration** — Cheerio, Puppeteer, Playwright, Crawlee, Scrapy bridge
- **Network Service** — HTTP client with CORS proxy support
- **Crawler Service** — HTML parsing and link extraction
- **Workflow Service** — Browser automation task orchestration
- **Security Service** — URL validation and content security
- **Auto-Updater** — Automatic update checking via GitHub Releases
- **Desktop Installers** — NSIS (Windows), DMG (macOS), AppImage (Linux)
- **CI/CD Pipelines** — GitHub Actions for release and docs deployment
- **Docusaurus Website** — Full documentation site
- **Claude Desktop Config** — `.claude-mcp.json` for MCP integration
- **Complete Package** — ZIP archive with all implementation files

### Changed
- Browser component updated with improved tab management
- WebView enhanced with sandbox security attributes
- Package version bumped to 0.2.0

### Security
- All iframes now use `sandbox` attribute for security isolation
- URL validation added to prevent JavaScript protocol injection
- Content Security Policy headers implemented

## [0.1.0] - 2025-11-12

### Added
- Initial release of ZENO Browser
- Astro + React core application
- Multi-tab browser interface
- AI chat integration (Gemini, OpenRouter)
- MCP service definitions
- CAYD knowledge base integration
- Bielik agent system
- Docker/Podman deployment support
- Version control system (original/working/active)
