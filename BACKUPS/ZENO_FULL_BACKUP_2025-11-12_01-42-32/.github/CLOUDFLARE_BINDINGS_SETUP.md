# 🔧 Cloudflare Pages Bindings Setup

## Problem
Astro z `@astrojs/cloudflare` adapter wymaga KV binding `SESSION` dla sesji użytkownika.

## ✅ Rozwiązanie

### Opcja 1: Dashboard (Najszybsze - 2 minuty)

1. **Wejdź na Dashboard:**
   https://dash.cloudflare.com → Pages → **zeno-browser**

2. **Settings → Functions → KV namespace bindings**
   - Click: **Add binding**
   - Variable name: `SESSION`
   - KV namespace: wybierz `CACHE` (lub stwórz nowy)
   - Click: **Save**

3. **Settings → Functions → D1 database bindings** (opcjonalne)
   - Click: **Add binding**
   - Variable name: `DB`
   - D1 database: wybierz `zeno-browser-db`
   - Click: **Save**

4. **Settings → Functions → AI bindings** (opcjonalne)
   - Enable: **Cloudflare AI**
   - Variable name: `AI`
   - Click: **Save**

5. **Re-deploy:**
   - Wróć do: **Deployments**
   - Click: **Retry deployment** na ostatnim deploymencie

---

### Opcja 2: CLI (Bardziej zaawansowane)

```powershell
cd ZENO_WEB_CORE_APP

# Stwórz KV namespace dla sesji (jeśli nie istnieje)
npx wrangler kv:namespace create SESSION --preview

# Skopiuj ID i wklej do wrangler.toml

# Deploy z bindingami
npx wrangler pages deploy dist --project-name=zeno-browser
```

---

## 🧪 Weryfikacja

Po dodaniu bindingsów, sprawdź czy działają w kodzie:

```typescript
// src/pages/api/test-bindings.ts
export async function GET({ locals }) {
  const { SESSION, DB, AI } = locals.runtime.env;
  
  return new Response(JSON.stringify({
    session: SESSION ? 'KV ✅' : 'KV ❌',
    database: DB ? 'D1 ✅' : 'D1 ❌',
    ai: AI ? 'AI ✅' : 'AI ❌'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

Testuj: `https://zeno-browser.pages.dev/api/test-bindings`

---

## 📊 Dostępne Bindings

| Binding | Typ | Używane do | Status |
|---------|-----|------------|--------|
| `SESSION` | KV | Sesje użytkownika | ⚠️ **Wymagane** |
| `DB` | D1 | Baza danych | 🔵 Opcjonalne |
| `AI` | Cloudflare AI | Modele AI | 🔵 Opcjonalne |
| `CACHE` | KV | Cache API | 🔵 Opcjonalne |

---

## 🔗 Linki

- Dashboard: https://dash.cloudflare.com/pages
- Docs: https://developers.cloudflare.com/pages/functions/bindings/
- KV Docs: https://developers.cloudflare.com/kv/
- D1 Docs: https://developers.cloudflare.com/d1/

---

## ⚡ TL;DR

**Najszybsze rozwiązanie:**
1. Dashboard → Pages → zeno-browser → Settings → Functions
2. Dodaj binding: `SESSION` → wybierz KV `CACHE`
3. Save → Retry deployment

**Gotowe!** 🎉
