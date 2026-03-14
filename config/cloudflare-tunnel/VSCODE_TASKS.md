# 🎯 VS Code Tasks - Zen Browser + Cloudflare Tunnel

Wszystkie zadania dostępne w VS Code przez: **Terminal → Run Task** (Ctrl+Shift+P)

## 📋 Dostępne Zadania

### 🌐 Cloudflare Tunnel

| Task | Opis | Częstotliwość |
|------|------|---------------|
| `Zen Browser: Setup Cloudflare Tunnel` | Pierwsza konfiguracja tunelu | Tylko raz |
| `Zen Browser: Start Cloudflare Tunnel` | Uruchom tunel (tryb normalny) | Przed każdą pracą |
| `Zen Browser: Start Tunnel (Debug Mode)` | Uruchom z verbose logs | Gdy są problemy |
| `Zen Browser: Stop Cloudflare Tunnel` | Zatrzymaj tunel i procesy | Po zakończeniu pracy |

### 🚀 Development Stack

| Task | Opis | Port |
|------|------|------|
| `Zen Browser: Start Astro Frontend` | Vite dev server | 5173 |
| `Zen Browser: Start Cloudflare Workers` | Wrangler dev (API) | 8787 |
| `Zen Browser: Start Full Stack + Tunnel` | **Uruchom wszystko** | - |

### 🔧 Główny Workspace (The Yellow Hub)

| Task | Opis |
|------|------|
| `Dashboard: Start Backend` | Bun backend (port 3880) |
| `Dashboard: Start Frontend` | Dashboard frontend |
| `API: Start Gateway` | FastAPI Gateway (port 3885) |
| `Podman: Start All` | Wszystkie kontenery |
| `Git: Pull All Repos` | Update wszystkich submodules |

---

## 🎬 Typowy Workflow

### 1️⃣ Pierwszy raz (Setup)

```
1. Terminal → Run Task
2. Wybierz: "Zen Browser: Setup Cloudflare Tunnel"
3. Postępuj zgodnie z instrukcjami (login, DNS, etc.)
```

### 2️⃣ Codzienne użycie

**Opcja A: Wszystko jednym kliknięciem** ⭐ Rekomendowane
```
Terminal → Run Task → "Zen Browser: Start Full Stack + Tunnel"
```

**Opcja B: Krok po kroku**
```
1. "Zen Browser: Start Astro Frontend"     (Terminal 1)
2. "Zen Browser: Start Cloudflare Workers" (Terminal 2)
3. "Zen Browser: Start Cloudflare Tunnel"  (Terminal 3)
```

### 3️⃣ Zatrzymanie

```
Terminal → Run Task → "Zen Browser: Stop Cloudflare Tunnel"
```

---

## 🔍 Weryfikacja

### Sprawdź czy wszystko działa:

**Lokalne endpointy:**
- ✅ http://localhost:5173 (Astro Frontend)
- ✅ http://localhost:8787 (Cloudflare Workers)

**Publiczne (przez tunel):**
- ✅ https://zeno-app.zen-bro-wser.org
- ✅ https://api.zen-bro-wser.org

**Diagnostyka:**
```powershell
cd zen-bro-wser.org/config/cloudflare-tunnel
.\test-tunnel.ps1 -Detailed
```

---

## 🐛 Troubleshooting w VS Code

### Problem: Task nie startuje

**Sprawdź:**
1. Output panel → wybierz "Tasks" z dropdown
2. Szukaj błędów czerwonych

**Rozwiązanie:**
- Sprawdź czy ścieżki w `.vscode/tasks.json` są poprawne
- Upewnij się że bun/node/wrangler są w PATH

### Problem: "Access Denied" przy uruchamianiu tunelu

**Rozwiązanie:**
```powershell
# Uruchom VS Code jako Administrator (tylko raz)
# Lub:
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

### Problem: Tunel działa, ale 502 Bad Gateway

**Sprawdź:**
```powershell
# W PowerShell:
curl http://localhost:5173  # Frontend powinien odpowiadać
curl http://localhost:8787  # Workers API powinno odpowiadać
```

**Jeśli nie działają:**
- Uruchom odpowiednie taski ("Start Astro Frontend", "Start Cloudflare Workers")
- Sprawdź czy nie ma konfliktów portów

---

## 📊 Monitoring w VS Code

### Terminale

VS Code automatycznie utworzy dedykowane terminale dla każdego taska:
- 📘 `Task - Zen Browser: Start Astro Frontend`
- 📙 `Task - Zen Browser: Start Cloudflare Workers`
- 📗 `Task - Zen Browser: Start Cloudflare Tunnel`

### Logi live

Kliknij na terminal aby zobaczyć live logs:
```
[Astro] 🚀 Server started on http://localhost:5173
[Workers] ⛅️ wrangler 3.x.x
[Tunnel] 🌐 Connection registered connIndex=0
```

---

## ⚙️ Customizacja

### Zmień porty

Edytuj `.vscode/tasks.json`:
```jsonc
{
  "label": "Zen Browser: Start Astro Frontend",
  "command": "bun",
  "args": ["dev", "--port", "3000"],  // Zmień tutaj
  ...
}
```

### Dodaj własny task

```jsonc
{
  "label": "Mój Custom Task",
  "type": "shell",
  "command": "powershell",
  "args": ["-File", "${workspaceFolder}/moj-skrypt.ps1"],
  "problemMatcher": []
}
```

---

## 🎓 Skróty Klawiszowe (Opcjonalne)

Dodaj do `.vscode/keybindings.json`:

```jsonc
[
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.tasks.runTask",
    "args": "Zen Browser: Start Full Stack + Tunnel"
  },
  {
    "key": "ctrl+shift+q",
    "command": "workbench.action.tasks.runTask",
    "args": "Zen Browser: Stop Cloudflare Tunnel"
  }
]
```

**Użycie:**
- `Ctrl+Shift+T` → Start wszystkiego
- `Ctrl+Shift+Q` → Stop tunelu

---

## 📚 Dodatkowe Zasoby

- 📖 [VS Code Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
- 🔌 [Cloudflare Tunnel Guide](config/cloudflare-tunnel/README.md)
- 🚀 [Project README](README.md)

---

**Status:** ✅ Configured | **Ostatnia aktualizacja:** 28.01.2026
