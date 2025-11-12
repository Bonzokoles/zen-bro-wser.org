# 🎯 BONZO MASTERPLAN - ZENBROWSERS & CLOUDFLARE CLEANUP
**Data:** 4 listopada 2025, 19:35  
**Deadline:** 18 listopada 2025 (wykorzystaj $250 Claude Code!)  
**Cel:** Monetyzacja + Porządki + Nowy Revenue Stream

---

## 📊 AKTUALNY STAN (PROBLEM)

### Cloudflare Chaos:
- ❌ **39 Workers** (większość nieużywanych)
- ❌ **5 baz D1** (3 puste, 0 tabel)
- ❌ **17 R2 buckets** (duplikaty, chaos w nazwach)
- ❌ **20 KV namespaces** (3x CACHE, 2x SESSION)

### ZenBrowsers.org:
- ✅ Działa (iframe browser MCP agent)
- ❌ Zero analytics
- ❌ Zero monetyzacji
- ❌ Brak API

**Koszt chaosu:** ~$10-20/mies za nieużywane zasoby + stracony czas

---

## 🚀 PLAN DZIAŁANIA (3 FAZY - 14 DNI)

---

## FAZA 1: QUICK WINS (Dni 1-3) - MONETYZACJA
**Deadline:** 7 listopada 2025  
**Priorytet:** Szybkie pieniądze

### 1.1 ZenBrowsers Analytics (2h)
**Worker:** `zeno-browser-api` (już istnieje!)

```javascript
// Dodaj tracking do istniejącego worker:
const analytics = {
  pageview: async (url, userAgent) => {
    await env.EDGE_CACHE.put(`views:${Date.now()}`, JSON.stringify({
      url, userAgent, ts: Date.now()
    }), { expirationTtl: 86400 * 7 }) // 7 dni w KV
  }
}
```

**Akcje:**
- [ ] Dodaj endpoint `/api/track` do `zeno-browser-api`
- [ ] Frontend: fetch('/api/track', {method: 'POST', body: {url}})
- [ ] Dashboard: `/stats` - top 10 URL, liczba użytkowników
- [ ] **Użyj:** KV `EDGE_CACHE` (już masz!)

**Output:** Wiesz ile osób używa, co oglądają

---

### 1.2 Paywall dla Premium Features (4h)
**Nowy Worker:** `zeno-premium-api`

```javascript
// Stripe checkout + KV session
const isPremium = async (userId) => {
  return await env.MYBONZO_SESSIONS.get(`premium:${userId}`)
}
```

**Pricing:**
- 🆓 Free: 10 iframe loads/dzień
- 💎 Pro ($5/m): 1000 loads/dzień + no watermark
- 🏢 Business ($25/m): unlimited + API access

**Akcje:**
- [ ] Setup Stripe account (30min)
- [ ] Webhook Worker: `/stripe-webhook` → zapisz do KV
- [ ] Frontend: "Upgrade" button → Stripe Checkout
- [ ] Rate limiting w `zeno-browser-api`

**Output:** Revenue stream w 48h

---

### 1.3 Affiliate Links (1h)
**Prosty hack:**

```html
<!-- Dla zablokowanych stron (YouTube, FB) -->
<div class="blocked-notice">
  ⚠️ Ta strona blokuje iframe
  👉 <a href="https://nordvpn.com/bonzo">Odblokuj z NordVPN</a> (affiliate)
</div>
```

**Akcje:**
- [ ] Signup: NordVPN, Surfshark affiliate programs
- [ ] Dodaj linki do zablokowanych stron
- [ ] A/B test: różne CTA

**Output:** Pasywny dochód z failed requests

---

## FAZA 2: CLEANUP CLOUDFLARE (Dni 4-7)
**Deadline:** 11 listopada 2025  
**Priorytet:** Oszczędności + Porządek

### 2.1 Audit & Delete (3h)
**Użyj Claude Code ($250 credits!):**

```bash
# Script: audit-cloudflare.js
# Lista wszystkich Workers + ostatnie deploy
# Usuń jeśli >60 dni nieużywane
```

**Workers do USUNIĘCIA (najpierw backup!):**
```
❌ ai-image-generator (duplikat)
❌ buildmybonzo (stary)
❌ the-build-bonzo (stary)
❌ mybonzo-worker (duplikat mybonzo-main-worker)
❌ generate-image (duplikat)
❌ luc-de-zen-on (???)
❌ astro-blog-starter-template (template, nie produkcja)
```

**Akcje:**
- [ ] Export kodu wszystkich Workers (backup do R2)
- [ ] Usuń 7+ nieużywanych Workers
- [ ] Savings: ~$5-10/mies

---

### 2.2 Konsolidacja KV (2h)
**Problem:** 3x CACHE, 2x SESSION

**Docelowy stan:**
```
✅ EDGE_CACHE (główny cache)
✅ MYBONZO_SESSIONS (sesje + premium users)
✅ MYBONZO_RATE_LIMITS (API limits)
❌ CACHE (usuń → migruj do EDGE_CACHE)
❌ CACHE_preview (usuń)
❌ SESSION (usuń → migruj do MYBONZO_SESSIONS)
❌ SESSION_preview (usuń)
```

**Akcje:**
- [ ] Script: migrate-kv.js (Claude Code!)
- [ ] Update wszystkie Workers używające starych KV
- [ ] Delete 4 KV namespaces
- [ ] Savings: ~$2/mies

---

### 2.3 D1 Cleanup (1h)
**Bazy do SPRAWDZENIA:**

```sql
-- Sprawdź czy FAKTYCZNIE puste:
SELECT COUNT(*) FROM sqlite_master WHERE type='table';
```

**Bazy do USUNIĘCIA:**
- `mybonzo-app-db` (0 tabel, 120KB?)
- `zenonvibesdk-db` (0 tabel, 12KB)
- Może: `zeno-browser-db` (0 tabel, ale świeża - sprawdź czy używana)

**Akcje:**
- [ ] Sprawdź kod Workers czy używają tych DB
- [ ] Usuń 2-3 nieużywane D1
- [ ] Zostaw tylko: `vibesdk-db-bonzo` (600KB, może używana?)

---

### 2.4 R2 Konsolidacja (2h)
**Problem:** 17 buckets, chaos w nazwach

**Docelowy stan:**
```
✅ mybonzo-media (video + images)
✅ mybonzo-storage (główny storage)
✅ mybonzo-cache (CDN cache)
✅ mybonzo-backups (backupy)
❌ mybonzo-media-preview (merge → mybonzo-media/preview/)
❌ mybonzo-blog-content-preview (merge)
❌ mybonzo-temp-storage (usuń po 30 dniach)
❌ vibesdk1 (???)
```

**Akcje:**
- [ ] Merge preview buckets do głównych (folders!)
- [ ] Delete 4-5 buckets
- [ ] Lifecycle policy: auto-delete temp files >30d

---

## FAZA 3: NOWY BIZNES - ZENPROXY (Dni 8-14)
**Deadline:** 18 listopada 2025  
**Priorytet:** Nowy revenue stream

### 3.1 MVP - ZenProxy API (6h)
**Product:** Iframe-proxy-as-a-service

```javascript
// Worker: zenproxy-api
export default {
  async fetch(request, env) {
    const url = new URL(request.url).searchParams.get('url');
    const apiKey = request.headers.get('X-API-Key');
    
    // Rate limit check
    const usage = await env.MYBONZO_RATE_LIMITS.get(`key:${apiKey}`);
    if (usage > limit) return Response.json({error: 'Rate limit'}, {status: 429});
    
    // Fetch & modify headers
    const response = await fetch(url);
    const headers = new Headers(response.headers);
    headers.delete('X-Frame-Options');
    headers.delete('Content-Security-Policy');
    
    return new Response(response.body, { headers });
  }
}
```

**Akcje:**
- [ ] Create Worker: `zenproxy-api`
- [ ] Setup domain: `api.zenbrowsers.org`
- [ ] Rate limiting: KV `MYBONZO_RATE_LIMITS`
- [ ] Docs: `/docs` endpoint (simple HTML)

---

### 3.2 Landing Page (3h)
**Domain:** `proxy.zenbrowsers.org` lub `zenproxy.com` (check availability)

**Sekcje:**
```
Hero: "Embed Any Website. No Restrictions."
Pricing: Free/Pro/Business
Demo: Live iframe test
Docs: API examples
```

**Tech Stack:**
- Astro (masz już template!)
- Deploy: Cloudflare Pages (darmowe)
- Forms: Worker → KV

**Akcje:**
- [ ] Fork: `astro-blog-starter-template` → `zenproxy-landing`
- [ ] Deploy na Pages
- [ ] Connect do `zenproxy-api`

---

### 3.3 Stripe Integration (2h)
**Same as ZenBrowsers paywall**

```javascript
// Webhook endpoint
const handleStripeWebhook = async (event) => {
  if (event.type === 'checkout.session.completed') {
    const apiKey = crypto.randomUUID();
    await env.MYBONZO_SESSIONS.put(`key:${apiKey}`, JSON.stringify({
      plan: 'pro',
      limit: 5000,
      expires: Date.now() + 30*86400000
    }));
    // Email user with API key
  }
}
```

**Akcje:**
- [ ] Stripe webhook Worker
- [ ] Email service (Resend? SendGrid?)
- [ ] Dashboard: `/dashboard` - usage stats

---

### 3.4 Marketing (2h)
**Kanały:**
- 🐦 Twitter: Post w #buildinpublic, #indiehackers
- 🔴 Reddit: r/webdev, r/selfhosted
- 🏢 ProductHunt: Launch post
- 📧 Email: Lista z ZenBrowsers (jeśli masz)

**Content:**
```
"Built ZenProxy in 48h with Claude Code
- Bypass iframe restrictions
- $5/month for 5000 requests
- Open source API
First 100 users: 50% off lifetime"
```

**Akcje:**
- [ ] Twitter thread (5 tweets)
- [ ] Reddit posts (3 subreddits)
- [ ] ProductHunt draft
- [ ] Track w Plausible Analytics

---

## 📈 SUCCESS METRICS

### Week 1 (7 Nov):
- ✅ ZenBrowsers analytics live
- ✅ First paying customer ($5)
- ✅ 10+ Workers deleted

### Week 2 (14 Nov):
- ✅ ZenProxy MVP live
- ✅ 100 visitors na landing
- ✅ MRR: $50+ (10 customers)

### Week 3 (18 Nov):
- ✅ ProductHunt launch
- ✅ $250 Claude Code credits USED
- ✅ Total savings: $15/mies (cleanup)
- ✅ Total revenue: $100/mies (new)

---

## 🛠️ TECH STACK (wykorzystaj to co masz!)

### Frontend:
- Astro (`astro-blog-starter-template`)
- Cloudflare Pages (darmowe)

### Backend:
- Workers (już masz 39... użyj kilku!)
- KV (`EDGE_CACHE`, `MYBONZO_SESSIONS`)
- R2 (do backupów)

### Payments:
- Stripe

### Analytics:
- Plausible (self-hosted na Worker?)
- Lub: własny tracker w KV

### Email:
- Resend (darmowe 3k/mies)

---

## 💰 FINANCIAL PROJECTION

### Koszty (current):
```
Cloudflare Workers: ~$15/mies (za dużo resourceów)
Domain: $12/rok
Stripe: 2.9% + $0.30
```

### Po cleanup:
```
Cloudflare: ~$5/mies
Oszczędność: $10/mies = $120/rok
```

### Revenue (conservative):
```
Month 1: $50 (10 customers × $5)
Month 2: $150 (20 customers, growth 3x)
Month 3: $300 (40 customers)
Month 6: $600-1000 (organic growth + marketing)
```

**Breakeven:** Miesiąc 1  
**Profit Year 1:** $2000-4000 (side hustle level)

---

## ⚠️ RISK MITIGATION

### Risk 1: Cloudflare ToS
**Problem:** Proxy może być wbrew ToS  
**Solution:** Read docs, ask support, może pivot do innego use case

### Risk 2: Zero customers
**Problem:** Nikt nie płaci  
**Solution:** Free tier forever, focus na API devs (B2B > B2C)

### Risk 3: Zabraknie czasu
**Problem:** 14 dni to mało  
**Solution:** Użyj Claude Code ($250!), delegate maksymalnie

---

## 🎯 IMMEDIATE NEXT STEPS (dziś wieczorem!)

### 1. Backup (30min):
```bash
# Export WSZYSTKICH Workers do R2
wrangler deploy list > workers-backup.json
```

### 2. Stripe Setup (30min):
- [ ] Signup Stripe
- [ ] Test mode → get keys
- [ ] Add to .env

### 3. Claude Code Setup (15min):
- [ ] Claim $250 credits (deadline: 18 Nov!)
- [ ] Connect GitHub
- [ ] Test na małym Worker

### 4. Plan Review (15min):
- [ ] Print this doc
- [ ] Daily standup: 10min progress check
- [ ] Update: `/home/claude/PROGRESS.md`

---

## 📞 HELP NEEDED

**Jeśli blokuje:**
- Claude Code issues → check docs.claude.com
- Stripe webhooks → test w localhost (ngrok)
- Marketing → ask in #buildinpublic

**Resources:**
- Cloudflare Docs: developers.cloudflare.com
- Stripe Docs: stripe.com/docs
- Astro Docs: astro.build

---

**START DATE:** 4 listopada 2025, 19:35  
**END DATE:** 18 listopada 2025, 23:59  
**DURATION:** 14 dni (336 godzin)

**LET'S BUILD! 🚀**

---

_Ten plan jest żywy - update codziennie w `/home/claude/PROGRESS.md`_
