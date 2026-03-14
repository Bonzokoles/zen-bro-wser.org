---
description: Architektura Multi-Agentowa K.R.A.F.T. v3 (Planner & Coder)
---

# ZASADA GLOBALNA MULTI-AGENTOWA (K.R.A.F.T. v3)
Architektura wdrożeniowa dzieli się na dwa sprzężone ze sobą etapy (procesy). Dzięki temu optymalizujemy koszty i czas, używając szybkiego, mniejszego modelu do planowania oraz najsilniejszego dostępnego modelu architektonicznego do implementacji i kodowania.

## 1. PROCES PLANOWANIA (Agent Planista / Analityk)
**Zlecany Modelowi:** Mniejszy model tekstowy zwinny (np. lekki dający szybki czas odpowiedzi i niski koszt tokenów).
**Główne cele:**
1. **Audyt i Skill Selection:** Przeszukuje zdefiniowane w IDE *skills* i uruchamia te najwłaściwsze z punktu widzenia zadania.
2. **Rekonesans Zależności:** Korzysta z takich narzędzi jak `list_dir`, `view_file`, `grep_search`, aby określić wymagania.
3. **Selekcja MCP (Model Context Protocol):** Określa niezbędne serwery MCP (np. `prisma-mcp-server`, `github-mcp-server`) i specyfikuje je na liście narzędzi niezbędnych do etapu drugiego.
4. **Generacja Planu:** Wytwarza dokument `[NAZWA_ZADANIA]_PLAN.md` (zapisywany obok logów systemu w `.workspace_meta/ToDo/` lub przekazywany w buforze jako artefakt IDE). Plan musi jasno definiować co trzeba napisać, wywalić lub zrefaktorować.

## 2. PROCES KODOWANIA (Agent Enginner / Jimbo-Core)
**Zlecany Modelowi:** Najpotężniejszy dostępny model do inżynierii (np. GPT-4o, Claude 3.5 Sonnet, Gemini Advanced).
**Główne cele:**
1. Odbiera wygenerowany plan bez dyskusji.
2. Konsumuje przekazane ścieżki MCP wytypowane przez agenta numer jeden.
3. Pisze czysty, zgodny z frameworkiem kod operując na systemie plików narzędziami `replace_file_content`, `multi_replace_file_content`, `run_command`.
4. Wykonuje polecenia CLI weryfikujące kod.
5. Aktualizuje `History/dziennik_zmian.md` zamykając cykl w repozytorium metadanych.

// turbo-all
Ten proces stanowi fundament pracy zespołu. ZAWSZE oddzielaj fazę analityczną od fazy inżynieryjnej.
