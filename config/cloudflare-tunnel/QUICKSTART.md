# 🌐 Cloudflare Tunnel - Quick Start

## Szybki Start (5 minut)

### 1. Setup (tylko raz):

```powershell
cd U:\The_yellow_hub\zen-bro-wser.org\config\cloudflare-tunnel
.\setup.ps1
```

To automatycznie:
- ✅ Zainstaluje cloudflared (jeśli brak)
- ✅ Zaloguje do Cloudflare
- ✅ Utworzy tunel "zen-browser"
- ✅ Skonfiguruje DNS dla subdomen
- ✅ Wygeneruje config.yml

### 2. Uruchom lokalne serwisy:

**W VS Code:**
- Ctrl+Shift+P → "Tasks: Run Task"
- Wybierz: "Zen Browser: Start Full Stack + Tunnel"

**Lub ręcznie:**

```powershell
# Terminal 1 - Astro Frontend
cd U:\The_yellow_hub\zen-bro-wser.org\ZENO_WEB_CORE_APP
bun dev  # → http://localhost:5173

# Terminal 2 - Cloudflare Workers
cd U:\The_yellow_hub\zen-bro-wser.org\.cloudflare
npx wrangler dev  # → http://localhost:8787

# Terminal 3 - Cloudflare Tunnel
cd U:\The_yellow_hub\zen-bro-wser.org\config\cloudflare-tunnel
.\start-tunnel.ps1
```

### 3. Testuj!

Otwórz w przeglądarce:
- 🌐 https://zeno-app.zen-bro-wser.org (Frontend)
- 🔧 https://api.zen-bro-wser.org (API)
- 🔍 https://cayd.zen-bro-wser.org (Search)
- 🖼️ https://proxy.zen-bro-wser.org (Proxy)

---

## VS Code Tasks

**Terminal → Run Task → wybierz:**

| Task | Opis |
|------|------|
| `Zen Browser: Setup Cloudflare Tunnel` | Pierwsza konfiguracja (tylko raz) |
| `Zen Browser: Start Cloudflare Tunnel` | Uruchom tunel |
| `Zen Browser: Start Tunnel (Debug Mode)` | Uruchom z debug logs |
| `Zen Browser: Stop Cloudflare Tunnel` | Zatrzymaj tunel |
| `Zen Browser: Start Full Stack + Tunnel` | Uruchom wszystko jednym klikiem |

---

## Pliki w tym folderze

```
cloudflare-tunnel/
├── README.md              ← Pełna dokumentacja
├── QUICKSTART.md          ← Ten plik
├── setup.ps1              ← Automatyczny setup
├── start-tunnel.ps1       ← Start tunelu
├── stop-tunnel.ps1        ← Stop tunelu
├── config.yml             ← Konfiguracja (generowana przez setup.ps1)
└── .gitignore             ← Ignorowane pliki
```

---

## Rozwiązywanie problemów

**❌ 502 Bad Gateway**
→ Sprawdź czy lokalny serwis działa: `curl http://localhost:5173`

**❌ cloudflared: command not found**
→ Uruchom: `winget install Cloudflare.cloudflared` (PowerShell Admin)

**❌ DNS nie działa**
→ Poczekaj 2-5 minut na propagację lub `ipconfig /flushdns`

---

## Potrzebujesz pomocy?

📖 **Pełna dokumentacja:** [README.md](README.md)  
🌐 **Cloudflare Docs:** https://developers.cloudflare.com/cloudflare-one/  
💬 **Discord:** https://discord.gg/cloudflaredev

---

**Status:** ✅ Production Ready | **Ostatnia aktualizacja:** 28.01.2026
