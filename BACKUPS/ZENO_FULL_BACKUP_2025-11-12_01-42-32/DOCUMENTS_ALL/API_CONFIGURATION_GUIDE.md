# ­čöĹ API Configuration Guide - ZENO Browser

Kompletny przewodnik konfiguracji kluczy API dla ZENO Browser

---

## ­čôő Spis Tre┼Ťci

1. [Problem: Aplikacja Pyta o Klucze](#problem-aplikacja-pyta-o-klucze)
2. [Jak Dzia┼éa System Konfiguracji](#jak-dzia┼éa-system-konfiguracji)
3. [Development Setup (Lokalnie)](#development-setup-lokalnie)
4. [Production Setup (Cloudflare)](#production-setup-cloudflare)
5. [Gdzie Uzyska─ç Klucze API](#gdzie-uzyska─ç-klucze-api)
6. [Testowanie Konfiguracji](#testowanie-konfiguracji)
7. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## ÔŁô Problem: Aplikacja Pyta o Klucze

### Dlaczego aplikacja pyta o klucze mimo ┼╝e mam .env?

**Odpowied┼║:** Masz prawdopodobnie plik `.env.example` (szablon), a nie `.env` (rzeczywisty plik konfiguracji)

### Jak to dzia┼éa w ZENO Browser?

```
1. Aplikacja szuka kluczy API w tej kolejno┼Ťci:
   ÔöťÔöÇ localStorage (przegl─ůdarka) ÔćÉ tu AdminPanel zapisuje klucze
   ÔööÔöÇ import.meta.env.VITE_* ÔćÉ ┼éadowane z pliku .env

2. Je┼Ťli nie znajdzie Ôćĺ pyta u┼╝ytkownika o klucze
```

---

## ­čĆŚ´ŞĆ Jak Dzia┼éa System Konfiguracji

### 1. Development (npm run dev)
```
Plik: ZENO_WEB_CORE_APP/.env
  Ôćô
Astro/Vite ┼éaduje zmienne
  Ôćô
import.meta.env.VITE_* dost─Öpne w aplikacji
  Ôćô
Komponenty u┼╝ywaj─ů getProviderKey() z src/utils/apiKeys.ts
```

### 2. Production (Cloudflare Pages)
```
Cloudflare Dashboard Ôćĺ Environment Variables
  Ôćô
Zmienne dost─Öpne podczas build & runtime
  Ôćô
import.meta.env.* i process.env.* w API routes
  Ôćô
Aplikacja dzia┼éa bez lokalnego pliku .env
```

### 3. đčĐÇđÁĐäĐľđ║ĐüđŞ Zmiennych

| Prefix | Dost─Öpno┼Ť─ç | U┼╝ycie |
|--------|-----------|---------|
| `VITE_*` | Ôťů Client-side (przegl─ůdarka) | React components, MCP tools |
| Brak prefix | ­čöĺ Server-side tylko | API routes, Astro pages |

**Przyk┼éad:**
```typescript
// ÔŁî ┼╣LE - nie zadzia┼éa w komponencie React
const key = import.meta.env.CLOUDFLARE_API_TOKEN

// Ôťů DOBRZE - w API route (server-side)
const key = import.meta.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN

// Ôťů DOBRZE - w komponencie React (client-side)
const key = import.meta.env.VITE_GEMINI_API_KEY
```

---

## ­čĺ╗ Development Setup (Lokalnie)

### Krok 1: Sprawd┼║ czy masz plik .env

```bash
cd ZENO_WEB_CORE_APP
ls -la | grep .env
```

**Je┼Ťli widzisz tylko `.env.example`** Ôćĺ Musisz stworzy─ç `.env`:

```bash
# Ju┼╝ stworzy┼éem dla Ciebie plik .env!
# Jest w: ZENO_WEB_CORE_APP/.env
```

### Krok 2: Wype┼énij klucze API

Otw├│rz plik `.env` i wype┼énij:

```env
# NAJPIERW TO (MUST HAVE):
CLOUDFLARE_API_TOKEN=twoj-token-tutaj

# POTEM TO (RECOMMENDED - darmowe):
VITE_TMDB_API_KEY=twoj-klucz-tutaj
VITE_GEMINI_API_KEY=twoj-klucz-tutaj

# OPCJONALNIE (p┼éatne lub alternatywy):
VITE_KAGI_API_TOKEN=
VITE_TAVILY_API_KEY=
```

### Krok 3: Restart serwera dev

```bash
# Zatrzymaj serwer (Ctrl+C)
# Uruchom ponownie:
npm run dev
```

**WA┼╗NE:** Astro/Vite ┼éaduje `.env` tylko przy starcie! Musisz restartowa─ç po ka┼╝dej zmianie.

### Krok 4: Weryfikacja

Otw├│rz konsol─Ö przegl─ůdarki (F12) i wpisz:

```javascript
console.log(import.meta.env)
```

Powiniene┼Ť zobaczy─ç Twoje zmienne z przedrostkiem `VITE_`.

---

## Ôśü´ŞĆ Production Setup (Cloudflare)

### Metoda 1: Cloudflare Dashboard (Recommended)

1. **Zaloguj si─Ö do Cloudflare:**
   - https://dash.cloudflare.com

2. **Znajd┼║ swoj─ů aplikacj─Ö:**
   - Pages Ôćĺ wybierz `zen-bro-wser` (lub Twoja nazwa)

3. **Dodaj zmienne:**
   - Settings Ôćĺ Environment Variables
   - Kliknij: "Add variable"

4. **Skopiuj zmienne z .env:**
   ```
   Variable name: CLOUDFLARE_API_TOKEN
   Value: [wklej sw├│j token]
   Environment: Production (lub Both)
   ```

5. **Dodaj wszystkie potrzebne:**
   - `CLOUDFLARE_API_TOKEN` (MUST)
   - `CLOUDFLARE_ACCOUNT_ID` (ju┼╝ ustawiony)
   - `VITE_TMDB_API_KEY` (opcjonalne)
   - `VITE_GEMINI_API_KEY` (opcjonalne)
   - itd.

6. **Redeploy:**
   ```bash
   git push origin main
   ```

### Metoda 2: wrangler CLI (Advanced)

```bash
# Zainstaluj Wrangler
npm install -g wrangler

# Zaloguj si─Ö
wrangler login

# Dodaj zmienne
wrangler pages project create zen-bro-wser --production-branch=main

# Ustaw zmienne
wrangler pages deployment create \
  --env=production \
  --var CLOUDFLARE_API_TOKEN=xxx \
  --var VITE_TMDB_API_KEY=yyy
```

---

## ­čöĹ Gdzie Uzyska─ç Klucze API

### 1´ŞĆÔâú Cloudflare Workers AI (MUST HAVE)

**CLOUDFLARE_API_TOKEN**

1. Otw├│rz: https://dash.cloudflare.com/profile/api-tokens
2. Kliknij: **"Create Token"**
3. U┼╝yj template: **"Edit Cloudflare Workers"**
4. Lub custom:
   - Account > Cloudflare Workers > **Edit**
   - Account > Workers AI > **Edit**
5. Kliknij: **"Continue to summary"**
6. Kliknij: **"Create Token"**
7. **SKOPIUJ TOKEN** (poka┼╝─ů tylko raz!)

**CLOUDFLARE_ACCOUNT_ID**

1. Otw├│rz: https://dash.cloudflare.com
2. Prawy panel Ôćĺ **Account ID**
3. Kliknij "Click to copy"

---

### 2´ŞĆÔâú TMDB - The Movie Database (FREE)

**VITE_TMDB_API_KEY**

1. Zarejestruj si─Ö: https://www.themoviedb.org/signup
2. Zaloguj si─Ö i przejd┼║ do: https://www.themoviedb.org/settings/api
3. Kliknij: **"Request an API Key"**
4. Wybierz: **"Developer"**
5. Wype┼énij formularz (mo┼╝esz poda─ç http://localhost:4366)
6. Zaakceptuj warunki
7. Skopiuj **"API Key (v3 auth)"**

**Limity:**
- Ôťů 1000 requests/dzie┼ä
- Ôťů 50 requests/sekund─Ö

---

### 3´ŞĆÔâú Kagi Search (PAID)

**VITE_KAGI_API_TOKEN**

1. Zarejestruj si─Ö: https://kagi.com
2. Wybierz plan (minimum $5/month dla API)
3. Przejd┼║ do: https://kagi.com/settings?p=api
4. Kliknij: **"Create new token"**
5. Skopiuj **"Personal Access Token"**

**Pricing:**
- ­čĺ░ $0.005 per search
- ­čĺ░ 100 searches = $0.50

---

### 4´ŞĆÔâú Google Gemini (FREE tier)

**VITE_GEMINI_API_KEY**

1. Otw├│rz: https://makersuite.google.com/app/apikey
2. Zaloguj si─Ö kontem Google
3. Kliknij: **"Get API key"** lub **"Create API key"**
4. Wybierz project lub stw├│rz nowy
5. Skopiuj API key

**Free tier:**
- Ôťů 60 requests/minute
- Ôťů Gemini 1.5 Flash (darmowy)

---

### 5´ŞĆÔâú Anthropic Claude (PAID)

**VITE_ANTHROPIC_API_KEY**

1. Zarejestruj si─Ö: https://console.anthropic.com
2. Przejd┼║ do: https://console.anthropic.com/settings/keys
3. Kliknij: **"Create Key"**
4. Nazwij klucz (np. "ZENO Browser")
5. Skopiuj klucz

**Pricing:**
- ­čĺ░ Claude 3.5 Sonnet: $3 / 1M input tokens
- ­čĺ░ $5 credit na start (czasami)

---

### 6´ŞĆÔâú Tavily Search (FREE trial)

**VITE_TAVILY_API_KEY**

1. Zarejestruj si─Ö: https://tavily.com
2. Dashboard Ôćĺ API Keys
3. Skopiuj "API Key"

**Free tier:**
- Ôťů 1000 requests/month

---

### 7´ŞĆÔâú OpenRouter (PAY-AS-YOU-GO)

**VITE_OPENROUTER_API_KEY**

1. Zarejestruj si─Ö: https://openrouter.ai
2. Dashboard Ôćĺ Keys: https://openrouter.ai/keys
3. Kliknij: **"Create Key"**
4. Skopiuj klucz

**Pricing:**
- ­čĺ░ Per model (od $0.0001 do $30 / 1M tokens)
- ­čĺ░ Dost─Öp do 100+ modeli AI

---

## ­čž¬ Testowanie Konfiguracji

### Test 1: Sprawd┼║ czy zmienne s─ů za┼éadowane

**W terminalu:**
```bash
cd ZENO_WEB_CORE_APP
npm run dev
```

**W konsoli przegl─ůdarki (F12):**
```javascript
// Sprawd┼║ wszystkie zmienne
console.log('All env:', import.meta.env)

// Sprawd┼║ konkretn─ů
console.log('TMDB Key:', import.meta.env.VITE_TMDB_API_KEY)
console.log('Gemini Key:', import.meta.env.VITE_GEMINI_API_KEY)
```

**Oczekiwany wynik:**
- Powinny pokaza─ç Twoje klucze (je┼Ťli s─ů w .env)
- Je┼Ťli `undefined` Ôćĺ klucz nie jest w .env lub brak przedrostka VITE_

---

### Test 2: Test AI Assistant

1. Otw├│rz: http://localhost:4366
2. Kliknij: Quick Chat Bar (prawy dolny r├│g)
3. Wpisz: "Hello, test AI"
4. Wy┼Ťlij

**Oczekiwany wynik:**
- Ôťů Dostaniesz odpowied┼║ od AI
- ÔŁî Error "Cloudflare credentials not configured" Ôćĺ brak CLOUDFLARE_API_TOKEN

---

### Test 3: Test MCP Tools

1. Otw├│rz komponent Browser (je┼Ťli masz)
2. Przejd┼║ do MCP Console
3. Spr├│buj:
   ```
   movie_search: Inception
   ```

**Oczekiwany wynik:**
- Ôťů Lista film├│w z TMDB
- ÔŁî Error Ôćĺ brak VITE_TMDB_API_KEY

---

### Test 4: Test Admin Panel

1. Otw├│rz: http://localhost:4366/admin-ai
2. Zaloguj si─Ö has┼éem: `#HAOS1977#`
3. Sprawd┼║ czy mo┼╝esz zapisa─ç ustawienia Cloudflare

**Oczekiwany wynik:**
- Ôťů Panel si─Ö otwiera
- Ôťů Mo┼╝esz zapisa─ç Account ID i API Token
- Ôä╣´ŞĆ Te klucze zapisuj─ů si─Ö w localStorage przegl─ůdarki

---

## ÔŁô FAQ & Troubleshooting

### Q1: Mam .env ale aplikacja nadal pyta o klucze?

**A:** Sprawd┼║:

1. **Czy restartowa┼ée┼Ť serwer dev?**
   ```bash
   # Ctrl+C aby zatrzyma─ç
   npm run dev # Uruchom ponownie
   ```

2. **Czy zmienne maj─ů prefix VITE_?**
   ```env
   # ÔŁî ┼╣LE (dla client-side)
   GEMINI_API_KEY=xxx

   # Ôťů DOBRZE (dla client-side)
   VITE_GEMINI_API_KEY=xxx
   ```

3. **Czy plik nazywa si─Ö dok┼éadnie `.env`?**
   ```bash
   ls -la ZENO_WEB_CORE_APP/.env
   # Nie .env.example, nie .env.local, tylko .env
   ```

---

### Q2: Zmienne dzia┼éaj─ů lokalnie, ale nie na Cloudflare?

**A:** Musisz doda─ç zmienne w Cloudflare Dashboard:

1. Pages Ôćĺ Tw├│j projekt Ôćĺ Settings Ôćĺ Environment Variables
2. Dodaj wszystkie zmienne z Twojego `.env`
3. Kliknij "Save"
4. Redeploy: `git push origin main`

**Cloudflare NIE ma dost─Öpu do Twojego pliku .env!**

---

### Q3: Czy mog─Ö u┼╝y─ç Postman do testowania API?

**A:** TAK! Mo┼╝esz testowa─ç API endpoints bezpo┼Ťrednio.

**Przyk┼éad - Test Cloudflare Workers AI:**

```
POST https://api.cloudflare.com/client/v4/accounts/7f490d58a478c6baccb0ae01ea1d87c3/ai/run/@cf/meta/llama-3.2-3b-instruct

Headers:
Authorization: Bearer YOUR_CLOUDFLARE_API_TOKEN
Content-Type: application/json

Body (JSON):
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ]
}
```

**Przyk┼éad - Test TMDB:**

```
GET https://api.themoviedb.org/3/search/movie?query=Inception&api_key=YOUR_TMDB_API_KEY
```

**Przyk┼éad - Test ZENO API Assistant:**

```
POST http://localhost:4366/api/ai-assistant

Headers:
Content-Type: application/json

Body:
{
  "prompt": "What is ZENO Browser?",
  "model": "llama-3.2-3b"
}
```

---

### Q4: Czy aplikacja webowa mo┼╝e czyta─ç pliki z mojego komputera?

**A:**

**Development (npm run dev):** Ôťů TAK
- Astro/Vite ┼éaduje `.env` z dysku podczas build
- Zmienne s─ů "wkompilowane" do aplikacji

**Production (Cloudflare Pages):** ÔŁî NIE
- Aplikacja jest hostowana na serwerach Cloudflare
- Nie ma dost─Öpu do Twoich lokalnych plik├│w
- Musisz ustawi─ç zmienne w Cloudflare Dashboard

**Bezpiecze┼ästwo:**
- Klucze API w `.env` s─ů TYLKO dla development
- W production u┼╝ywaj Cloudflare Environment Variables
- NIGDY nie commituj `.env` do Git (jest w .gitignore)

---

### Q5: localStorage vs .env - jaka r├│┼╝nica?

| Feature | localStorage | .env |
|---------|-------------|------|
| Lokalizacja | Przegl─ůdarka (client-side) | Plik na dysku |
| Bezpiecze┼ästwo | ÔÜá´ŞĆ Mniej bezpieczne (dost─Öpne w dev tools) | Ôťů Bezpieczniejsze (nie w przegl─ůdarce) |
| Setup | Admin Panel Ôćĺ wpisz klucze | Edytuj plik `.env` |
| Persistence | Tylko w tej przegl─ůdarce | Dla ca┼éej aplikacji |
| Production | Nie przenosi si─Ö | Musisz doda─ç do Cloudflare |

**Rekomendacja:**
- **Development:** U┼╝ywaj `.env` (wygodniejsze)
- **Production:** Cloudflare Dashboard (konieczne)
- **LocalStorage:** Tylko do testowania lub tymczasowych kluczy

---

### Q6: Jak bezpiecznie przechowywa─ç klucze API?

**Best Practices:**

1. Ôťů **NIE commituj `.env` do Git**
   - Jest w `.gitignore`
   - Sprawd┼║: `cat ZENO_WEB_CORE_APP/.gitignore | grep .env`

2. Ôťů **U┼╝ywaj r├│┼╝nych kluczy dla dev/prod**
   - Development: klucze w `.env`
   - Production: klucze w Cloudflare Dashboard

3. Ôťů **Ogranicz uprawnienia token├│w**
   - Cloudflare: tylko "Workers AI Edit"
   - TMDB: tylko read access
   - Nie dawaj pe┼énych uprawnie┼ä

4. Ôťů **Rotuj klucze regularnie**
   - Co 3-6 miesi─Öcy zmie┼ä API tokens
   - Natychmiast je┼Ťli podejrzewasz leak

5. ÔŁî **NIGDY:**
   - Nie wklejaj kluczy w kodzie (hardcoded)
   - Nie commituj do Git
   - Nie udost─Öpniaj publicznie
   - Nie wysy┼éaj przez email/chat

---

### Q7: Rate limiting - ile request├│w mog─Ö zrobi─ç?

| Service | Free Tier Limit | Paid Limit |
|---------|----------------|------------|
| **Cloudflare Workers AI** | 10,000 neurons/day | Unlimited ($0.011/1000) |
| **TMDB** | 1000 req/day | 1000 req/day (te┼╝ free) |
| **Gemini** | 60 req/min | 1000 req/min |
| **Kagi** | N/A (p┼éatne) | $0.005/search |
| **Tavily** | 1000 req/month | $100/month (50k req) |
| **Semantic Scholar** | Unlimited (recommended 100 req/5min) | Unlimited |
| **arXiv** | Unlimited (recommended 1 req/3s) | Unlimited |

**Jak unika─ç limit├│w:**
- Implementuj cache (zapisuj odpowiedzi)
- Debouncing (czekaj przed kolejnym requestem)
- Batch requests (grupuj zapytania)
- Monitoruj u┼╝ycie w dashboardach

---

## ­čôŁ Quick Reference

### Struktura Plik├│w

```
ZENO_WEB_CORE_APP/
ÔöťÔöÇÔöÇ .env                    ÔćÉ Twoje klucze API (NIE commituj!)
ÔöťÔöÇÔöÇ .env.example            ÔćÉ Szablon (commitowany do Git)
ÔöťÔöÇÔöÇ src/
Ôöé   ÔöťÔöÇÔöÇ utils/apiKeys.ts    ÔćÉ System ┼éadowania kluczy
Ôöé   ÔöťÔöÇÔöÇ components/
Ôöé   Ôöé   ÔööÔöÇÔöÇ AdminPanel.tsx  ÔćÉ UI do zarz─ůdzania kluczami
Ôöé   ÔöťÔöÇÔöÇ pages/
Ôöé   Ôöé   ÔööÔöÇÔöÇ api/
Ôöé   Ôöé       ÔööÔöÇÔöÇ ai-assistant.ts  ÔćÉ API endpoint (server-side)
Ôöé   ÔööÔöÇÔöÇ services/
Ôöé       ÔööÔöÇÔöÇ mcpService.ts   ÔćÉ MCP tools
ÔööÔöÇÔöÇ astro.config.mjs        ÔćÉ Konfiguracja Astro
```

### Wa┼╝ne Pliki

- **`.env`** - Twoje lokalne klucze API
- **`src/utils/apiKeys.ts`** - Logika ┼éadowania kluczy
- **`src/components/AdminPanel.tsx`** - UI do zarz─ůdzania (localStorage)
- **`src/pages/api/ai-assistant.ts`** - Server-side proxy dla Cloudflare AI

---

## ­čćś Potrzebujesz Pomocy?

1. **Sprawd┼║ logs:**
   ```bash
   npm run dev
   # Zobacz czy s─ů b┼é─Ödy przy starcie
   ```

2. **Sprawd┼║ konsol─Ö przegl─ůdarki (F12):**
   ```javascript
   console.log(import.meta.env)
   ```

3. **Test API bezpo┼Ťrednio:**
   - U┼╝yj Postman/Insomnia
   - Sprawd┼║ czy klucze dzia┼éaj─ů poza aplikacj─ů

4. **GitHub Issues:**
   - https://github.com/Bonzokoles/zen-bro-wser.org/issues

---

**Wersja:** 1.0.0
**Data:** 2025-01-04
**Autor:** Claude AI + Bonzokoles

**Zobacz tak┼╝e:**
- `MCP_TOOLS_GUIDE.md` - Przewodnik po narz─Ödziach MCP
- `AI_ASSISTANT_README.md` - Dokumentacja AI Assistant
- `.env` - Tw├│j plik konfiguracji (wype┼énij klucze!)
