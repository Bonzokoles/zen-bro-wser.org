# 🌐 Cloudflare Tunnel Setup - Zen Browser

**Data:** 28.01.2026  
**Cel:** Bezpieczne wystawienie lokalnych serwisów zen-bro-wser.org na publiczne domeny przez Cloudflare Tunnel

---

## 📋 Przegląd Architektury

Cloudflare Tunnel (cloudflared) tworzy bezpieczne połączenie między twoimi lokalnymi serwisami a Cloudflare edge, bez potrzeby otwierania portów w firewall.

### Serwisy do wystawienia:

```
localhost:5173  → zeno-app.zen-bro-wser.org      (Astro Frontend)
localhost:8787  → api.zen-bro-wser.org           (Cloudflare Workers Dev)
localhost:3000  → cayd.zen-bro-wser.org          (CAYD Search Engine)
localhost:8080  → proxy.zen-bro-wser.org         (Iframe Proxy)
localhost:5432  → db-admin.zen-bro-wser.org      (pgAdmin/DB Tools)
```

---

## 🚀 Instalacja Cloudflared

### Windows (PowerShell jako Administrator):

```powershell
# Metoda 1: Winget (Rekomendowana)
winget install Cloudflare.cloudflared

# Metoda 2: Bezpośrednie pobranie
$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
Invoke-WebRequest -Uri $url -OutFile "$env:ProgramFiles\cloudflared\cloudflared.exe"

# Dodaj do PATH (jeśli metoda 2)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:ProgramFiles\cloudflared", "Machine")
```

### Weryfikacja:

```powershell
cloudflared --version
# Oczekiwany output: cloudflared version 2024.x.x
```

---

## 🔑 Konfiguracja Tunelu

### Krok 1: Login do Cloudflare

```powershell
# Otworzy przeglądarkę do autoryzacji
cloudflared tunnel login
```

**Wybierz domenę:** `zen-bro-wser.org` (lub inną jeśli masz)

---

### Krok 2: Tworzenie Tunelu

```powershell
# Przejdź do katalogu konfiguracji
cd U:\The_yellow_hub\zen-bro-wser.org\config\cloudflare-tunnel

# Utwórz tunel o nazwie "zen-browser"
cloudflared tunnel create zen-browser
```

**Output:**
```
Tunnel credentials written to: C:\Users\{USER}\.cloudflared\{TUNNEL_ID}.json
Created tunnel zen-browser with id {TUNNEL_ID}
```

**Zapisz `TUNNEL_ID`** - będzie potrzebny!

---

### Krok 3: Konfiguracja DNS

```powershell
# Utwórz CNAME records dla subdomen
cloudflared tunnel route dns zen-browser zeno-app.zen-bro-wser.org
cloudflared tunnel route dns zen-browser api.zen-bro-wser.org
cloudflared tunnel route dns zen-browser cayd.zen-bro-wser.org
cloudflared tunnel route dns zen-browser proxy.zen-bro-wser.org
cloudflared tunnel route dns zen-browser db-admin.zen-bro-wser.org
```

**Alternatywnie:** Dodaj rekordy ręcznie w Cloudflare Dashboard:
- Typ: `CNAME`
- Name: `zeno-app` (lub inna subdomena)
- Target: `{TUNNEL_ID}.cfargotunnel.com`
- Proxy: ✅ Proxied (pomarańczowa chmurka)

---

### Krok 4: Plik Konfiguracyjny

Stwórz plik `config.yml` w bieżącym katalogu:

```yaml
# U:\The_yellow_hub\zen-bro-wser.org\config\cloudflare-tunnel\config.yml

tunnel: zen-browser
credentials-file: C:\Users\{USER}\.cloudflared\{TUNNEL_ID}.json

# Ingress rules (kolejność ma znaczenie!)
ingress:
  # Astro Frontend (dev server)
  - hostname: zeno-app.zen-bro-wser.org
    service: http://localhost:5173
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # Cloudflare Workers API (local dev)
  - hostname: api.zen-bro-wser.org
    service: http://localhost:8787
    originRequest:
      noTLSVerify: true

  # CAYD Search Engine
  - hostname: cayd.zen-bro-wser.org
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true

  # Iframe Proxy Worker
  - hostname: proxy.zen-bro-wser.org
    service: http://localhost:8080
    originRequest:
      noTLSVerify: true

  # Database Admin (pgAdmin)
  - hostname: db-admin.zen-bro-wser.org
    service: http://localhost:5432
    originRequest:
      noTLSVerify: true
      httpHostHeader: localhost:5432

  # Catch-all (wymagane!)
  - service: http_status:404
```

**⚠️ UWAGA:** Zamień `{USER}` i `{TUNNEL_ID}` na rzeczywiste wartości!

---

## ▶️ Uruchamianie Tunelu

### Tryb Development (interaktywny):

```powershell
cd U:\The_yellow_hub\zen-bro-wser.org\config\cloudflare-tunnel
cloudflared tunnel --config config.yml run zen-browser
```

**Output:**
```
2026-01-28 10:15:32 INF Starting tunnel zen-browser
2026-01-28 10:15:33 INF Connection registered connIndex=0
2026-01-28 10:15:33 INF Connection registered connIndex=1
2026-01-28 10:15:33 INF Connection registered connIndex=2
2026-01-28 10:15:33 INF Connection registered connIndex=3
```

✅ Tunel działa! Sprawdź: `https://zeno-app.zen-bro-wser.org`

---

### Tryb Production (jako usługa Windows):

```powershell
# Zainstaluj jako Windows Service (PowerShell jako Admin)
cloudflared service install

# Wystartuj usługę
Start-Service cloudflared

# Sprawdź status
Get-Service cloudflared

# Logi
cloudflared tail
```

---

## 🔧 Skrypty Pomocnicze

### `start-tunnel.ps1` (szybki start):

```powershell
# U:\The_yellow_hub\zen-bro-wser.org\config\cloudflare-tunnel\start-tunnel.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Startowanie Cloudflare Tunnel: zen-browser" -ForegroundColor Cyan

# Sprawdź czy config.yml istnieje
if (-not (Test-Path ".\config.yml")) {
    Write-Host "❌ Brak pliku config.yml!" -ForegroundColor Red
    exit 1
}

# Uruchom tunel
cloudflared tunnel --config config.yml run zen-browser
```

**Użycie:**
```powershell
cd U:\The_yellow_hub\zen-bro-wser.org\config\cloudflare-tunnel
.\start-tunnel.ps1
```

---

### `stop-tunnel.ps1` (zatrzymanie usługi):

```powershell
# U:\The_yellow_hub\zen-bro-wser.org\config\cloudflare-tunnel\stop-tunnel.ps1

$ErrorActionPreference = "Stop"

Write-Host "🛑 Zatrzymywanie Cloudflare Tunnel..." -ForegroundColor Yellow

# Zatrzymaj usługę jeśli działa
$service = Get-Service cloudflared -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq "Running") {
    Stop-Service cloudflared
    Write-Host "✅ Usługa zatrzymana" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Usługa nie była uruchomiona" -ForegroundColor Gray
}

# Kill wszystkie procesy cloudflared
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Wszystkie procesy cloudflared zakończone" -ForegroundColor Green
```

---

## 🔍 Diagnostyka

### Sprawdzanie statusu tunelu:

```powershell
# Lista wszystkich tuneli
cloudflared tunnel list

# Info o konkretnym tunelu
cloudflared tunnel info zen-browser

# Live logi
cloudflared tunnel --config config.yml run zen-browser --loglevel debug
```

### Testowanie routingu:

```powershell
# Test DNS
nslookup zeno-app.zen-bro-wser.org

# Test HTTP
curl https://zeno-app.zen-bro-wser.org -I

# Test z poziomu cloudflared
cloudflared tunnel ingress validate
cloudflared tunnel ingress rule https://zeno-app.zen-bro-wser.org
```

---

## 🔒 Zabezpieczenia

### Cloudflare Access (opcjonalne):

Dodaj autentykację do wrażliwych serwisów (np. db-admin):

```powershell
# Zainstaluj Cloudflare Access w Dashboard:
# https://one.dash.cloudflare.com/
```

**Konfiguracja:**
1. Applications → Add application
2. Self-hosted
3. Subdomain: `db-admin`, Domain: `zen-bro-wser.org`
4. Identity providers: Google, GitHub, Email OTP
5. Access policy: Allow dla swoich emaili

---

## 📊 Monitoring

### Dashboard:

👉 **Cloudflare Tunnel Dashboard:**  
https://one.dash.cloudflare.com/ → Networks → Tunnels

**Metryki:**
- ✅ Status połączeń (4 connections = zdrowy tunel)
- 📊 Request rate
- 🌍 Edge locations
- ⚠️ Error rate

---

## 🐛 Troubleshooting

### Problem: "tunnel credentials file not found"

**Rozwiązanie:**
```powershell
# Sprawdź ścieżkę credentials
dir C:\Users\$env:USERNAME\.cloudflared\

# Popraw ścieżkę w config.yml
credentials-file: C:\Users\{REAL_USER}\.cloudflared\{TUNNEL_ID}.json
```

---

### Problem: 502 Bad Gateway

**Przyczyny:**
1. ❌ Lokalny serwis nie działa (np. Astro dev server nie wystartowany)
2. ❌ Zły port w `config.yml`
3. ❌ Firewall blokuje localhost

**Rozwiązanie:**
```powershell
# Sprawdź czy serwis działa lokalnie
curl http://localhost:5173

# Sprawdź logi tunelu
cloudflared tunnel --config config.yml run zen-browser --loglevel debug

# Wyłącz firewall dla testu (PowerShell Admin)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

---

### Problem: DNS nie propaguje się

**Rozwiązanie:**
```powershell
# Flush DNS cache
ipconfig /flushdns

# Sprawdź w Cloudflare Dashboard czy CNAME istnieje
# Dashboard → DNS → Records → szukaj subdomeny

# Force propagacja (czasem trwa do 5 min)
```

---

## 📚 Dodatkowe Zasoby

- 📖 **Dokumentacja:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- 🎥 **Tutorial wideo:** https://www.youtube.com/cloudflare
- 💬 **Community:** https://community.cloudflare.com/
- 🐛 **GitHub Issues:** https://github.com/cloudflare/cloudflared/issues

---

## 🎯 Next Steps

Po skonfigurowaniu tunelu:

1. ✅ Zintegruj z VS Code tasks (`.vscode/tasks.json`)
2. ✅ Dodaj health checks dla każdego serwisu
3. ✅ Skonfiguruj Cloudflare Analytics
4. ✅ Ustaw alerty dla downtime (Cloudflare Notifications)
5. ✅ Rozważ Cloudflare Access dla wrażliwych endpointów

---

**Autor:** GitHub Copilot + Bonzo  
**Licencja:** MIT  
**Status:** ✅ Production Ready
