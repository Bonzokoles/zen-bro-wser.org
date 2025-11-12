# CAYD Search Engine - Port Allocation

## Reserved Port Range: 6040-6050

Blok 11 portów zarezerwowanych dla systemu CAYD Search Engine.

### Port Configuration

| Port | Service | Status | Description |
|------|---------|--------|-------------|
| **6040** | Main API Server | ✅ **ACTIVE** | Główny serwer Express z endpointami `/api/catalogTree`, `/api/fileContent`, `/api/saveMetadata` |
| **6041** | Search Index Service | 🔄 Reserved | Serwis indeksowania i pełnotekstowego wyszukiwania (Elasticsearch/MeiliSearch) |
| **6042** | Cache Service | 🔄 Reserved | Redis cache dla często używanych wyników |
| **6043** | WebSocket Real-time | 🔄 Reserved | Socket.IO dla real-time updates biblioteki |
| **6044** | File Watcher Service | 🔄 Reserved | Chokidar file watcher z osobnym procesem |
| **6045** | Analytics Service | 🔄 Reserved | Statystyki użycia, najpopularniejsze pliki |
| **6046** | Admin Dashboard | 🔄 Reserved | Panel administracyjny CAYD |
| **6047** | Backup Service | 🔄 Reserved | Automatyczne backupy metadanych |
| **6048** | Preview Service | 🔄 Reserved | Generowanie podglądów PDF/images |
| **6049** | Testing/Development | 🔄 Reserved | Środowisko testowe |
| **6050** | Load Balancer | 🔄 Reserved | Nginx/HAProxy dla skalowania |

## Integration Points

### ZENO_WEB_CORE_APP
- **Current:** Astro API routes proxy to port 6040
- **Files:**
  - `src/pages/api/cayd/catalogTree.ts`
  - `src/pages/api/cayd/fileContent.ts`
  - `src/pages/api/cayd/saveMetadata.ts`

### Future Architecture

```
┌─────────────────────┐
│  ZENO Browser UI    │
│  (Astro + React)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Astro API Proxy    │
│  /api/cayd/*        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│        CAYD Services Layer          │
├─────────────────────────────────────┤
│ 6040: Main API (Express)            │
│ 6041: Search Index (MeiliSearch)    │
│ 6042: Cache (Redis)                 │
│ 6043: WebSocket (Socket.IO)         │
│ 6044: File Watcher (Chokidar)       │
│ 6045: Analytics                     │
│ 6046: Admin Dashboard               │
│ 6047: Backup                        │
│ 6048: Preview Generator             │
│ 6049: Test Environment              │
│ 6050: Load Balancer                 │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  V:/LIBRARIES/      │
│  (Filesystem)       │
└─────────────────────┘
```

## Environment Variables

```bash
# Main API
CAYD_API_PORT=6040
CAYD_API_HOST=localhost

# Search Index
CAYD_SEARCH_PORT=6041
CAYD_SEARCH_ENGINE=meilisearch

# Cache
CAYD_CACHE_PORT=6042
CAYD_CACHE_ENGINE=redis

# WebSocket
CAYD_WEBSOCKET_PORT=6043

# File Watcher
CAYD_WATCHER_PORT=6044

# Analytics
CAYD_ANALYTICS_PORT=6045

# Admin
CAYD_ADMIN_PORT=6046

# Backup
CAYD_BACKUP_PORT=6047

# Preview
CAYD_PREVIEW_PORT=6048

# Testing
CAYD_TEST_PORT=6049

# Load Balancer
CAYD_LB_PORT=6050
```

## Firewall Configuration

```powershell
# Windows Firewall - Allow inbound for CAYD ports
New-NetFirewallRule -DisplayName "CAYD Search Engine (6040-6050)" `
  -Direction Inbound `
  -LocalPort 6040-6050 `
  -Protocol TCP `
  -Action Allow

# Allow outbound
New-NetFirewallRule -DisplayName "CAYD Search Engine Outbound (6040-6050)" `
  -Direction Outbound `
  -LocalPort 6040-6050 `
  -Protocol TCP `
  -Action Allow
```

## Docker Compose Example

```yaml
version: '3.8'

services:
  cayd-api:
    build: ./CAYD_SEARCH_ENG
    ports:
      - "6040:6040"
    environment:
      - PORT=6040
      - LIBRARIES_ROOT=/libraries
    volumes:
      - ./LIBRARIES:/libraries

  cayd-search:
    image: getmeili/meilisearch:latest
    ports:
      - "6041:7700"
    environment:
      - MEILI_HTTP_ADDR=0.0.0.0:7700

  cayd-cache:
    image: redis:alpine
    ports:
      - "6042:6379"

  cayd-websocket:
    build: ./CAYD_SEARCH_ENG/services/websocket
    ports:
      - "6043:6043"

  # ... pozostałe serwisy
```

## Security Notes

- **Localhost Only**: Domyślnie wszystkie porty bindowane tylko do `127.0.0.1`
- **Production**: Użyć Load Balancer (6050) z SSL termination
- **Authentication**: Dodać JWT tokens dla API endpoints
- **Rate Limiting**: Implementować na poziomie Load Balancer

## Monitoring

```bash
# Check all CAYD ports
netstat -an | findstr "604[0-9]"

# PowerShell version
Get-NetTCPConnection | Where-Object { $_.LocalPort -ge 6040 -and $_.LocalPort -le 6050 }
```

## Last Updated
2025-01-15 - Initial port allocation

## Contact
ZENO Browser Team - Stolarnia AMS
