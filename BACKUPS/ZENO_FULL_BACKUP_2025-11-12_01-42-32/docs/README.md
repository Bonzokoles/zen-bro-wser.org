# ZENO Browser - Documentation

## 📚 Documentation Structure

### Core Systems
- [Version Control System](./core/VERSION_CONTROL.md) - Original + Working versions
- [Security & API](./core/SECURITY.md) - Backend proxy, API key management
- [MCP Tools](./core/MCP_TOOLS.md) - Complete tool implementations
- [State Management](./core/STATE_MANAGEMENT.md) - Zustand store architecture

### Search & Discovery
- [Thematic Search](./search/THEMATIC_SEARCH.md) - Topic-based search system
- [Old Web Discovery](./search/OLD_WEB.md) - Alternative search engines, old internet
- [Custom Search Paths](./search/CUSTOM_PATHS.md) - User-defined search workflows
- [Non-Sponsored Search](./search/NON_SPONSORED.md) - Ad-free search results

### AI & Agents
- [Agent System](./agents/AGENT_SYSTEM.md) - Multi-agent architecture
- [Worker System](./agents/WORKER_SYSTEM.md) - Background workers
- [Information Gathering](./agents/INFO_GATHERING.md) - Data collection system
- [Anomaly Detection](./agents/ANOMALY_DETECTION.md) - Pattern recognition

### Features
- [Tab Management](./features/TAB_MANAGEMENT.md) - Groups, sessions, workspaces
- [Bookmark System](./features/BOOKMARKS.md) - Advanced bookmarking
- [Reading Mode](./features/READING_MODE.md) - Clean reading experience
- [Download Manager](./features/DOWNLOADS.md) - Download handling
- [Session Manager](./features/SESSIONS.md) - Save/restore sessions
- [Workspace Manager](./features/WORKSPACES.md) - Multiple workspaces

### UI/UX
- [Keyboard Shortcuts](./ui/KEYBOARD_SHORTCUTS.md) - Complete shortcut system
- [Error Handling](./ui/ERROR_HANDLING.md) - User-friendly errors
- [Loading States](./ui/LOADING_STATES.md) - Skeleton loaders
- [Notifications](./ui/NOTIFICATIONS.md) - Toast system

### Quick Wins
- [Quick Improvements](./quick-wins/IMPROVEMENTS.md) - 1-2 day tasks
- [Bug Fixes](./quick-wins/BUG_FIXES.md) - Known issues
- [Performance](./quick-wins/PERFORMANCE.md) - Optimization tips

### Development
- [Setup Guide](./dev/SETUP.md) - Getting started
- [Testing](./dev/TESTING.md) - Test suite
- [CI/CD](./dev/CICD.md) - Deployment pipeline
- [Contributing](./dev/CONTRIBUTING.md) - Contribution guide

### Advanced
- [Extension System](./advanced/EXTENSIONS.md) - Plugin architecture
- [Knowledge Base](./advanced/KNOWLEDGE_BASE.md) - Personal knowledge management
- [Desktop App](./advanced/ELECTRON.md) - Electron wrapper
- [Multi-Agent AI](./advanced/MULTI_AGENT.md) - Agent coordination

## 🚀 Quick Start

1. Read [Version Control System](./core/VERSION_CONTROL.md) first - crucial for safe development
2. Check [Security & API](./core/SECURITY.md) - critical fixes needed
3. Review [Quick Improvements](./quick-wins/IMPROVEMENTS.md) - easy wins
4. Explore [Agent System](./agents/AGENT_SYSTEM.md) - AI capabilities

## 📋 Implementation Priority

### Week 1-2: Critical
- Version control system
- API security (backend proxy)
- Complete MCP tools

### Week 3-4: Core Features
- Agent system foundation
- Thematic search
- Old web discovery

### Month 2: Advanced Features
- Custom search paths
- Worker system
- Information gathering
- Anomaly detection

### Month 3+: Polish
- Extension system
- Knowledge base
- Desktop app
- Advanced AI features

## 🔧 Development Principles

1. **Never destroy working code** - always maintain original version
2. **Test before merge** - working version must pass tests
3. **Document changes** - clear changelog for each modification
4. **Incremental improvements** - small, tested changes
5. **Reversible decisions** - easy rollback capability
