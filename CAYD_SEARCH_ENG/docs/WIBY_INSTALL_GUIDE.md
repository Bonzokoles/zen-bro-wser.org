# CAYD Search Engine - Kompletny przewodnik instalacji

> **Źródło:** Oficjalna dokumentacja Wiby (GPLv2)  
> **Data:** 11 listopada 2025

---

**UWAGA:** Pełna treść instrukcji instalacji znajduje się w pliku źródłowym.  
Dokument został skopiowany z: `DOCUMENTS_ALL/DO_ZROBIENIA/wibyovnbrowser.md`

---

[Pełna treść dokumentacji zostanie dodana po rozpoczęciu implementacji]

## Quick Start Checklist

### Wymagania systemowe
- [ ] Ubuntu 20/22 (lub inna dystrybucja Linux)
- [ ] MySQL 8.0+ lub MariaDB
- [ ] nginx
- [ ] PHP 7.4+ (z php-gd)
- [ ] Golang 1.16+
- [ ] gcc/build-essential
- [ ] libcurl4-openssl-dev, libmysqlclient-dev

### Podstawowa instalacja (1 serwer)
- [ ] Pobrać kod źródłowy Wiby
- [ ] Skompilować: cr, rs, rt
- [ ] Zbudować: 1core (Go)
- [ ] Utworzyć bazy: wiby, wibytemp
- [ ] Skonfigurować nginx (reverse proxy)
- [ ] Utworzyć konto admin
- [ ] Uruchomić usługi

### Zaawansowane (opcjonalne)
- [ ] Replikacja MySQL przez VPN
- [ ] Sharding (ws0-wsX tables)
- [ ] Load balancing (nginx upstream)
- [ ] Monitoring i backup

## Harmonogram implementacji

### Faza 1: Środowisko deweloperskie (1-2 dni)
- Setup VM/VPS z Ubuntu
- Instalacja zależności
- Pobranie kodu źródłowego

### Faza 2: Kompilacja i konfiguracja (2-3 dni)
- Build wszystkich komponentów
- Konfiguracja MySQL
- Konfiguracja nginx

### Faza 3: Testowanie (2-3 dni)
- Test crawlera na małym zestawie stron
- Weryfikacja formularzy webowych
- Test zapytań wyszukiwania

### Faza 4: Integracja z ZENO (3-5 dni)
- API endpoint dla MCP tools
- Adapter dla mcpService
- Testy end-to-end

**Całkowity czas:** ~2-3 tygodnie

---

**Dalsze instrukcje:** Dodaj pliki do folderu `WIBY_SEARCH_ENGINE/` aby kontynuować implementację.
