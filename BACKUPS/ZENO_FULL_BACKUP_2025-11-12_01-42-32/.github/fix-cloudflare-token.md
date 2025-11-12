# 🔧 SZYBKA NAPRAWA - Cloudflare API Token

## Problem
```
Authentication error [code: 10000]
A request to the Cloudflare API (/accounts/***/pages/projects/zeno-browser) failed.
```

**Przyczyna:** Token GitHub Secrets nie ma uprawnień do Cloudflare Pages

---

## ⚡ Szybkie Rozwiązanie (2 minuty)

### 1. Utwórz nowy token z PEŁNYMI uprawnieniami

**Otwórz:** https://dash.cloudflare.com/profile/api-tokens

**Kliknij:** "Create Token" → "Get started" przy **"Create Custom Token"**

### 2. Ustaw uprawnienia:

#### Account Permissions:
```
✅ Account Settings → Read
✅ Workers Scripts → Edit  
✅ Cloudflare Pages → Edit     ⭐ TO JEST KLUCZOWE!
✅ Workers KV Storage → Edit
✅ D1 → Edit
```

#### Zone Permissions:
```
✅ Zone → Read
✅ DNS → Read
```

### 3. Account Resources:
```
Include → Specific account
Select: Twoje konto Cloudflare (najprawdopodobniej "Stolarnia.ams@gmail.com's Account")
```

### 4. Zone Resources:
```
Include → All zones
(lub wybierz konkretną domenę jeśli masz)
```

### 5. Utwórz i skopiuj token
- Kliknij **"Continue to summary"**
- Kliknij **"Create Token"**
- **SKOPIUJ TOKEN** (nie będzie ponownie wyświetlony!)

---

## 📋 Zaktualizuj GitHub Secrets

### Krok 1: Wejdź do ustawień repo
**URL:** https://github.com/Bonzokoles/zen-bro-wser.org/settings/secrets/actions

### Krok 2: Zaktualizuj CLOUDFLARE_API_TOKEN
1. Kliknij na **`CLOUDFLARE_API_TOKEN`**
2. Kliknij **"Update secret"**
3. Wklej nowy token
4. Kliknij **"Update secret"**

### Krok 3: Sprawdź CLOUDFLARE_ACCOUNT_ID
Powinien być: `7f490d58a478c6baccb0ae01ea1d87c3`

(Jeśli nie masz, możesz go sprawdzić lokalnie przez `npx wrangler whoami`)

---

## 🧪 Test lokalny (opcjonalnie)

```powershell
# Ustaw zmienne środowiskowe z nowym tokenem
$env:CLOUDFLARE_API_TOKEN = "WKLEJ_NOWY_TOKEN_TUTAJ"
$env:CLOUDFLARE_ACCOUNT_ID = "7f490d58a478c6baccb0ae01ea1d87c3"

# Test 1: Sprawdź czy token działa
npx wrangler whoami

# Test 2: Lista projektów Pages
npx wrangler pages project list

# Powinno pokazać: zeno-browser
```

---

## 🚀 Uruchom ponownie deployment

### Opcja A: Przez interfejs GitHub
1. Wejdź na: https://github.com/Bonzokoles/zen-bro-wser.org/actions
2. Znajdź ostatni nieudany workflow run
3. Kliknij **"Re-run failed jobs"**

### Opcja B: Przez puszkę commita
```powershell
git commit --allow-empty -m "[FIX] Updated Cloudflare API token with Pages permissions"
git push origin main
```

---

## ✅ Oczekiwany rezultat

Po naprawie zobaczysz w logach:

```
✅ Build application - SUCCESS
✅ Deploy to Cloudflare Pages - SUCCESS
   🎉 Deployment complete!
   🔗 https://zeno-browser.pages.dev
   🔗 https://3eaebce.zeno-browser.pages.dev
```

---

## 🐛 Dalej nie działa?

### Sprawdź czy token ma dokładnie te uprawnienia:

```powershell
# Uruchom ten skrypt do weryfikacji
cd .github
.\verify-token.ps1
```

### Lub ręcznie zweryfikuj:
1. https://dash.cloudflare.com/profile/api-tokens
2. Znajdź swój token
3. Kliknij "Edit"
4. Sprawdź czy **"Cloudflare Pages → Edit"** jest zaznaczone ✅

---

## 📞 Potrzebujesz pomocy?

1. Sprawdź logi w GitHub Actions: https://github.com/Bonzokoles/zen-bro-wser.org/actions
2. Zobacz czy projekt istnieje w Cloudflare: https://dash.cloudflare.com/pages
3. Zweryfikuj Account ID: `npx wrangler whoami`

---

## 🎯 Podsumowanie

**Problem:** Token bez uprawnień do Cloudflare Pages  
**Rozwiązanie:** Nowy token z uprawnieniem "Cloudflare Pages → Edit"  
**Czas:** ~2 minuty  
**Efekt:** Działający automatyczny deployment 🚀
