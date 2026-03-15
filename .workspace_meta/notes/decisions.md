# Architecture Decision Records

> Dokumentuj tu każdą ważną decyzję techniczną.  
> Format: data → kontekst → decyzja → konsekwencje

---

## Template

### ADR-001: [Tytuł decyzji]
**Data:** YYYY-MM-DD  
**Status:** proposed | accepted | deprecated | superseded  
**Kontekst:** Dlaczego ta decyzja jest potrzebna?  
**Decyzja:** Co zostało zdecydowane?  
**Konsekwencje:** Jakie są skutki tej decyzji?  
**Alternatywy:** Co jeszcze było rozważane?

---

<!-- Dodawaj nowe decyzje poniżej -->

---

### ADR-001: Aktywacja agentów i skills dla ZENO Browser
**Data:** 2026-03-15  
**Status:** accepted  
**Kontekst:** Projekt wymaga specjalistycznych trybów pracy: budowa floating-window UI (React), implementacja narzędzi MCP/AI Gateway (TypeScript), planowanie multi-file zmian, debugowanie. Bez dedykowanych agentów każda sesja zaczyna od zera bez kontekstu.  
**Decyzja:** Zainstalowano 4 agenty i 4 skills do `.github/` (dostępne w całym workspace):

**Agenty (`/.github/agents/`):**
- `expert-react-frontend-engineer` — UI: FloatingWindow, FeatureDock, sandbox panels (React 19.2 + Tailwind)
- `typescript-mcp-expert` — MCP tools, AI Gateway, WebTunnel integration (TS + zod)
- `context-architect` — planowanie zmian multi-file z mapą zależności przed kodowaniem
- `debug` — systematyczne debugowanie (reproduce → root cause → verify → report)

**Skills (`/.github/skills/`):**
- `create-implementation-plan` — generowanie planów wykonawczych z fazami i TASK-IDs
- `breakdown-plan` — Epic→Feature→Story→Task hierarchia (GitHub Issues ready)
- `web-design-reviewer` — wizualna inspekcja UI + poprawki w source code
- `refactor` — chirurgiczny refactoring bez zmiany zachowania

**Konsekwencje:** Agenty aktywuje się przez `@agent-name` w VS Code Chat. Skills przez `#skill-name`. Można dokładać kolejne z `.workspace_meta/.github/` w razie potrzeby.  
**Alternatywy:** Trzymanie agentów tylko w `.workspace_meta/` (nieaktywne) — odrzucone, bo nie są widoczne dla Copilot.
