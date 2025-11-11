# CAYD_SEARCH_ENG Project

Projekt modularnej, retro-w stylizowanej przeglądarki/katalogu z wyszukiwarką i playerem multimediów.

## Status: Faza deweloperska

Własna wyszukiwarka internetowa oparta na Wiby (GPLv2) do późniejszej integracji z ZENO Browser.

## Struktura projektu

```
CAYD_SEARCH_ENG/
├── docs/           # Dokumentacja instalacji i konfiguracji
├── source/         # Kod źródłowy (crawler, core server, web interface)
├── config/         # Pliki konfiguracyjne (nginx, MySQL, servers.csv)
├── scripts/        # Skrypty pomocnicze (deployment, backup, monitoring)
└── README.md       # Ten plik
```

## Komponenty do zaimplementowania

### Core Components (C/Golang)
- **cr** (crawler) - Web crawler z obsługą robots.txt
- **rs** (refresh scheduler) - Scheduler odświeżania stron
- **rt** (replication tracker) - Tracker replik MySQL
- **core/1core** (Go) - Główny serwer wyszukiwania

### Web Interface (PHP/HTML)
- `/submit/` - Formularz zgłoszeń publicznych
- `/review/` - Panel moderacji zgłoszeń
- `/accounts/` - Zarządzanie kontami
- `/ban/`, `/bulksubmit/`, `/feedback/`, `/grave/`, `/tags/`, `/json/`

### Database (MySQL/MariaDB)
- Full-text search index (InnoDB)
- Sharding tables (ws0-wsX)
- Replication support

## Następne kroki

1. Pobranie kodu źródłowego Wiby z GitHub
2. Konfiguracja środowiska deweloperskiego
3. Instalacja zależności (MySQL, nginx, PHP, Golang)
4. Kompilacja komponentów
5. Testy lokalne przed integracją z ZENO Browser

## Integracja z ZENO Browser (planowana)

- Zastąpienie/uzupełnienie Tavily API
- Własny indeks dla retro/niche websites
- API endpoint dla ZENO MCP tools
- Human-curated results dla lepszej jakości

## Dokumentacja źródłowa

Zobacz: `docs/WIBY_INSTALL_GUIDE.md` dla pełnej instrukcji instalacji.

---
**Data utworzenia:** 11 listopada 2025  
**Kontakt:** JimBoZen@proton.me  
**Status:** Oczekiwanie na dalsze instrukcje
