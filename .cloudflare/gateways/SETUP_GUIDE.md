# Zen Browser - Infrastructure Setup Guide

## 🚀 Szybki Start

Ze względu na problemy z kodowaniem w PowerShell, poniżej znajdziesz **działające rozwiązania**.

---

## 📋 Opcja 1: Użyj gotowego skryptu (ZALECANE)

### Plik: `C:\Users\Bonzo2\clawd\FIXED_SETUP.ps1`

Skrypt został zapisany w lokalizacji:
```
C:\Users\Bonzo2\clawd\FIXED_SETUP.ps1
```

### Jak użyć:

```powershell
# Opcja A: Uruchom bezpośrednio z lokalizacji
Copy-Item "C:\Users\Bonzo2\clawd\FIXED_SETUP.ps1" "U:\The_yellow_hub\zen-bro-wser.org\.cloudflare\gateways\setup-simple.ps1"
cd U:\The_yellow_hub\zen-bro-wser.org\.cloudflare\gateways
.\setup-simple.ps1

# Opcja B: Uruchom z obecnej lokalizacji
cd C:\Users\Bonzo2\clawd
.\FIXED_SETUP.ps1
```

---

## 🔧 Opcja 2: Ręczne komendy (BEZ SKRYPTU)

Jeśli skrypt nadal nie działa, uruchom komendy **jedna po drugiej**:

### 1. D1 Database
```powershell
cd U:\The_yellow_hub\zen-bro-wser.org\.cloudflare\gateways
npx wrangler d1 create zen-browser-db
```

### 2. KV Namespaces (3x)
```powershell
npx wrangler kv:namespace create CACHE
npx wrangler kv:namespace create SESSIONS
npx wrangler kv:namespace create METRICS
```

### 3. R2 Bucket
```powershell
npx wrangler r2 bucket create zen-static-assets
```

### 4. Vectorize Index
```powershell
npx wrangler vectorize create zen-rag-index --dimensions=768 --metric=cosine
```

### 5. Secrets (opcjonalnie)
```powershell
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put JWT_SECRET
```

---

## 📝 Zawartość działającego skryptu

```powershell
# Setup Script - Cloudflare Infrastructure
# Run: .\setup-infrastructure.ps1

Write-Host "Zen Browser Gateway Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# 1. D1 Database
Write-Host "Creating D1 Database..." -ForegroundColor Yellow
try {
    npx wrangler d1 create zen-browser-db 2>&1 | Out-Null
    Write-Host "D1 Database created" -ForegroundColor Green
} catch {
    Write-Host "D1 already exists" -ForegroundColor Yellow
}

# 2. KV Namespaces  
Write-Host "Creating KV Namespaces..." -ForegroundColor Yellow
@("CACHE", "SESSIONS", "METRICS") | ForEach-Object {
    try {
        npx wrangler kv:namespace create $_ 2>&1 | Out-Null
        Write-Host "KV $_ created" -ForegroundColor Green
    } catch {
        Write-Host "KV $_ already exists" -ForegroundColor Yellow
    }
}

# 3. R2 Bucket
Write-Host "Creating R2 Bucket..." -ForegroundColor Yellow
try {
    npx wrangler r2 bucket create zen-static-assets 2>&1 | Out-Null
    Write-Host "R2 Bucket created" -ForegroundColor Green
} catch {
    Write-Host "R2 already exists" -ForegroundColor Yellow
}

# 4. Vectorize
Write-Host "Creating Vectorize Index..." -ForegroundColor Yellow
try {
    npx wrangler vectorize create zen-rag-index --dimensions=768 --metric=cosine 2>&1 | Out-Null
    Write-Host "Vectorize created" -ForegroundColor Green
} catch {
    Write-Host "Vectorize already exists" -ForegroundColor Yellow
}

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Set secrets:" -ForegroundColor White
Write-Host "   npx wrangler secret put OPENROUTER_API_KEY" -ForegroundColor Gray
Write-Host "   npx wrangler secret put JWT_SECRET" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy workers:" -ForegroundColor White
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env api-gateway" -ForegroundColor Gray
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env deepseek-gateway" -ForegroundColor Gray
```

---

## 🛠️ Troubleshooting

### Problem: "The ampersand (&) character is not allowed"
**Rozwiązanie:** Usuń wszystkie `&` z tekstów w skrypcie lub użyj opcji 2 (ręczne komendy).

### Problem: "The string is missing the terminator"
**Rozwiązanie:** Skrypt ma uszkodzone cudzysłowy. Użyj ręcznych komend lub skopiuj skrypt z `FIXED_SETUP.ps1`.

### Problem: "ExecutionPolicy"
**Rozwiązanie:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
```

### Problem: "Encoding issues" (dziwne znaki)
**Rozwiązanie:** Upewnij się że plik jest zapisany w kodowaniu **UTF-8 with BOM** (nie UTF-8 plain).

---

## 📦 Co zostanie utworzone

Po uruchomieniu setupu będziesz mieć:

| Zasób | Nazwa | Opis |
|-------|-------|------|
| **D1 Database** | `zen-browser-db` | Baza SQL dla użytkowników, dokumentów, metryk |
| **KV Namespace** | `CACHE` | Cache dla odpowiedzi API |
| **KV Namespace** | `SESSIONS` | Sesje użytkowników |
| **KV Namespace** | `METRICS` | Metryki i statystyki |
| **R2 Bucket** | `zen-static-assets` | Pliki statyczne (CSS, JS, obrazy) |
| **Vectorize Index** | `zen-rag-index` | Indeks wektorowy dla RAG (768 wymiarów) |

---

## 🚀 Deployment Workers

Po setupie infrastruktury, deployuj workers:

```powershell
# Local Gateways
npx wrangler deploy --config wrangler.gateways.toml --env api-gateway
npx wrangler deploy --config wrangler.gateways.toml --env static-gateway
npx wrangler deploy --config wrangler.gateways.toml --env auth-gateway
npx wrangler deploy --config wrangler.gateways.toml --env metrics-gateway

# AI Gateways
npx wrangler deploy --config wrangler.gateways.toml --env deepseek-gateway
npx wrangler deploy --config wrangler.gateways.toml --env mcp-gateway
npx wrangler deploy --config wrangler.gateways.toml --env rag-gateway
```

---

## 🌐 Endpoints

Po deploymencie:

| Endpoint | URL |
|----------|-----|
| API Gateway | `api.zen-bro-wser.org` |
| Static CDN | `static.zen-bro-wser.org` |
| Auth | `auth.zen-bro-wser.org` |
| Metrics | `metrics.zen-bro-wser.org` |
| AI | `ai.zen-bro-wser.org` |
| RAG | `rag.zen-bro-wser.org` |

---

## 📍 Lokalizacja plików

```
U:\The_yellow_hub\zen-bro-wser.org\.cloudflare\gateways\
├── local/
│   ├── api-gateway.ts
│   ├── auth-gateway.ts
│   ├── metrics-gateway.ts
│   └── static-gateway.ts
├── ai/
│   ├── deepseek-gateway.ts
│   ├── mcp-gateway.ts
│   └── rag-gateway.ts
└── wrangler.gateways.toml
```

---

## ✅ Checklist

- [ ] D1 Database utworzona
- [ ] KV Namespaces utworzone (3x)
- [ ] R2 Bucket utworzony
- [ ] Vectorize Index utworzony
- [ ] Secrets ustawione (OPENROUTER_API_KEY, JWT_SECRET)
- [ ] wrangler.gateways.toml zaktualizowany z ID
- [ ] Workers zdeployowane

---

**Pro Tip:** Jeśli coś już istnieje, wrangler po prostu pokaże warning - możesz bezpiecznie uruchamiać komendy wielokrotnie.

---

*Ostatnia aktualizacja: 2025-02-01*
*Status: Working Setup Guide*
