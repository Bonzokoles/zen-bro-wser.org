# 🚀 ZENO Browser - Quick Deploy Guide

**Czas setup:** ~10 minut  
**Koszt:** Free tier Cloudflare wystarczy

---

## 📋 Wymagania

- [ ] Node.js 18+ 
- [ ] npm lub pnpm
- [ ] Konto Cloudflare (darmowe)
- [ ] Git (opcjonalne)

---

## ⚡ Quick Start (3 kroki)

### **1. Setup Cloudflare** (2 min)

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login
```

### **2. Uruchom Setup Script** (3 min)

```powershell
cd V:\PROTO_TYpy\ZENO_web_CORE\scripts
.\deploy.ps1 -Target setup
```

**Co robi setup:**
1. ✅ Tworzy D1 database
2. ✅ Tworzy KV namespace
3. ✅ Importuje schema (23 strony)
4. ✅ Instrukcje dla API keys

### **3. Deploy!** (5 min)

```powershell
# Deploy wszystko (frontend + backend)
.\deploy.ps1 -Target all

# LUB deploy osobno:
.\deploy.ps1 -Target pages     # tylko frontend
.\deploy.ps1 -Target workers   # tylko backend
```

---

## 🎯 Po Deploy

### **Twoje URLe:**
- 🌐 **Frontend:** https://zeno-browser.pages.dev
- 🔌 **API:** https://zeno-browser-api.workers.dev
- 📊 **Dashboard:** https://dash.cloudflare.com

### **Test API:**
```bash
# Health check
curl https://zeno-browser-api.workers.dev/health

# Get all sites
curl https://zeno-browser-api.workers.dev/api/admin/sites

# Search
curl "https://zeno-browser-api.workers.dev/api/iframe/sites?q=video&category=video"
```

---

## 🔧 Configuration

### **Environment Variables**

**Frontend (Cloudflare Pages):**
```
Dashboard → Pages → zeno-browser → Settings → Environment variables

VITE_API_URL=https://zeno-browser-api.workers.dev
VITE_GEMINI_API_KEY=your-key-here
```

**Backend (Worker Secrets):**
```bash
wrangler secret put GEMINI_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put ANTHROPIC_API_KEY
```

---

## 📁 Pliki Konfiguracyjne

**Gdzie co jest:**
```
V:\PROTO_TYpy\ZENO_web_CORE\
├── zenbrowsers_full_boilerplate/
│   ├── README.md                 # 📖 Pełna dokumentacja
│   ├── backend/
│   │   ├── wrangler.toml         # ⚙️ Worker config
│   │   ├── schema.sql            # 🗄️ Database schema (23 sites)
│   │   ├── src/index.ts          # 🔌 API code
│   │   └── package.json          # 📦 Dependencies
│   └── docker-compose.yml        # 🐳 Local dev (optional)
├── scripts/
│   └── deploy.ps1                # 🚀 Deploy script
└── ZENO_WEB_CORE_APP/
    └── dist/                     # 📦 Build output (auto-generated)
```

---

## 🐛 Troubleshooting

### **Problem: "database_id not found"**
```bash
# Solution: Re-run setup i skopiuj ID
wrangler d1 create zeno-browser-db
# Skopiuj database_id do backend/wrangler.toml
```

### **Problem: "KV namespace not found"**
```bash
# Solution: Create KV
wrangler kv:namespace create CACHE
# Skopiuj id do backend/wrangler.toml
```

### **Problem: "CORS error"**
```typescript
// W src/index.ts sprawdź corsHeaders:
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // ← Twoja domena
};
```

### **Problem: Build fails**
```bash
# Clear cache
cd ZENO_WEB_CORE_APP
Remove-Item -Recurse -Force dist, node_modules/.vite
npm run build
```

---

## 📊 Monitoring

### **Real-time logs:**
```bash
# Worker logs
wrangler tail

# Pages logs
wrangler pages deployment tail
```

### **Dashboard:**
- Workers Analytics: https://dash.cloudflare.com/workers
- Pages Analytics: https://dash.cloudflare.com/pages
- D1 Console: https://dash.cloudflare.com/d1

---

## 🔄 Update Workflow

### **Deploy nowej wersji:**
```bash
# 1. Zmień kod w ZENO_WEB_CORE_APP/
# 2. Build + deploy
cd V:\PROTO_TYpy\ZENO_web_CORE\scripts
.\deploy.ps1 -Target all
```

### **Rollback:**
```bash
# W Cloudflare Dashboard → Pages → Deployments
# Kliknij "Rollback" na poprzednią wersję
```

---

## 💡 Development Tips

### **Local development:**
```bash
# Frontend
cd ZENO_WEB_CORE_APP
npm run dev  # localhost:4378

# Backend (local D1)
cd zenbrowsers_full_boilerplate/backend
wrangler dev  # localhost:8787
```

### **Test przed deploy:**
```bash
# Build lokalny
npm run build

# Preview
wrangler pages dev dist

# Test backend local
wrangler dev --remote
```

---

## 🎉 Success Checklist

Po zakończeniu setup powinieneś mieć:

- [x] ✅ Frontend live na Cloudflare Pages
- [x] ✅ Backend API na Cloudflare Workers
- [x] ✅ D1 Database z 23 stronami
- [x] ✅ KV Cache działający
- [x] ✅ API keys skonfigurowane
- [x] ✅ Custom domain (opcjonalne)

---

## 📚 Więcej Informacji

**Dokumentacja:**
- 📖 Pełny guide: `zenbrowsers_full_boilerplate/README.md`
- 🗺️ Projekt overview: `ZENO_WEB_CORE_APP/PROJECT_STRUCTURE.md`
- 🏗️ Architektura: `ZENO_WEB_CORE_APP/IFRAME_ARCHITECTURE.md`

**External:**
- Cloudflare Pages: https://pages.cloudflare.com
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler
- D1 Database: https://developers.cloudflare.com/d1

---

**Need help?** Open issue: https://github.com/Bonzokoles/zen-bro-wser.org/issues

**Ostatnia aktualizacja:** 2025-11-04  
**Status:** ✅ Ready to deploy
