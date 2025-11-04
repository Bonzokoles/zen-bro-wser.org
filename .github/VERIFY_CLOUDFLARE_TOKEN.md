# Weryfikacja i Naprawa Cloudflare API Token

## Problem: Błąd 7003 - "Could not route to Pages project"

GitHub Actions nie może uzyskać dostępu do projektu Pages `zeno-browser`, mimo że projekt istnieje. To oznacza, że **token API w GitHub Secrets nie ma uprawnień do Cloudflare Pages**.

## Krok 1: Sprawdź obecny token lokalnie

```powershell
# Sprawdź który token jest używany lokalnie (ten działa!)
cat ~/.wrangler/config/default.toml
```

## Krok 2: Utwórz nowy token z pełnymi uprawnieniami

1. Wejdź na: https://dash.cloudflare.com/profile/api-tokens
2. Kliknij **"Create Token"**
3. Użyj szablonu **"Edit Cloudflare Workers"** lub stwórz niestandardowy z uprawnieniami:

### Wymagane uprawnienia:

```
Account:
✅ Account Settings: Read
✅ Workers Scripts: Edit
✅ Cloudflare Pages: Edit  ← WAŻNE! Musi być zaznaczone!
✅ D1: Edit
✅ Workers KV Storage: Edit

Zone:
✅ DNS: Read
✅ Zone: Read
```

### Zakres (Account Resources):

```
Include: Specific account
Account: Stolarnia.ams@gmail.com's Account (7f490d58a478c6baccb0ae01ea1d87c3)
```

4. Kliknij **"Continue to summary"**
5. Kliknij **"Create Token"**
6. **SKOPIUJ TOKEN** (nie będzie ponownie wyświetlony!)

## Krok 3: Zaktualizuj GitHub Secrets

1. Wejdź na: https://github.com/Bonzokoles/zen-bro-wser.org/settings/secrets/actions
2. Kliknij na **`CLOUDFLARE_API_TOKEN`** → **Update**
3. Wklej nowy token
4. Kliknij **"Update secret"**

### Zweryfikuj również:

**`CLOUDFLARE_ACCOUNT_ID`** powinien być:
```
7f490d58a478c6baccb0ae01ea1d87c3
```

## Krok 4: Przetestuj token lokalnie

```powershell
# Zapisz nowy token do zmiennej środowiskowej
$env:CLOUDFLARE_API_TOKEN = "TWOJ_NOWY_TOKEN"
$env:CLOUDFLARE_ACCOUNT_ID = "7f490d58a478c6baccb0ae01ea1d87c3"

# Test 1: Weryfikacja tokenu
npx wrangler whoami

# Test 2: Lista projektów Pages
npx wrangler pages project list

# Test 3: Próba deployu (dry-run nie istnieje, ale zwróci poprawny błąd jeśli token działa)
cd ZENO_WEB_CORE_APP
npx wrangler pages deploy dist --project-name=zeno-browser
```

## Krok 5: Uruchom ponownie GitHub Actions

Po zaktualizowaniu tokenu:

```powershell
# Commitnij dummy change aby wywołać workflow
git commit --allow-empty -m "[TEST] Verify new Cloudflare API token"
git push origin main
```

**LUB** ręcznie w GitHub:
1. Actions → Deploy to Cloudflare → Re-run all jobs

## Krok 6: Monitoruj deployment

```powershell
gh run watch
```

## Oczekiwany wynik po naprawie:

```
✅ Deploy Worker API - SUCCESS
✅ Deploy to Cloudflare Pages - SUCCESS
   Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   URL: https://zeno-browser.pages.dev
```

## Troubleshooting

### Jeśli nadal błąd 7003:
1. Sprawdź czy token ma uprawnienie **"Cloudflare Pages: Edit"**
2. Sprawdź czy Account ID się zgadza
3. Spróbuj utworzyć token z większymi uprawnieniami (np. "API Tokens: Edit")

### Jeśli błąd 9000 (Invalid API Token):
Token wygasł lub jest nieprawidłowy - utwórz nowy

### Jeśli błąd 10000 (Authentication Error):
Account ID jest nieprawidłowy - sprawdź w Dashboard

## Automatyczna weryfikacja

```powershell
# Użyj tego skryptu do weryfikacji:
.\verify-token.ps1
```
