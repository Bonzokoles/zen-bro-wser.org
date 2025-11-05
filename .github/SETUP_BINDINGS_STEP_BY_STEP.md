# 🔧 KROK PO KROKU - Cloudflare Bindings Setup

## 📍 Gdzie: Cloudflare Dashboard

🔗 **Link:** https://dash.cloudflare.com

---

## 1️⃣ Wejdź na Dashboard

1. Zaloguj się do Cloudflare
2. Kliknij **"Pages"** w lewym menu
3. Znajdź i kliknij **"zeno-browser"**

---

## 2️⃣ Przejdź do Settings → Functions

1. Kliknij **"Settings"** (górny pasek)
2. Scroll w dół do sekcji **"Functions"**
3. Zobaczysz 3 sekcje:
   - KV namespace bindings
   - D1 database bindings  
   - Workers AI

---

## 3️⃣ Dodaj KV Namespace (SESSION)

### W sekcji "KV namespace bindings":

1. Kliknij **"Add binding"**
2. Wypełnij:
   ```
   Variable name: SESSION
   KV namespace:  [wybierz z dropdown - prawdopodobnie "CACHE"]
   ```
3. Kliknij **"Save"**

**UWAGA:** Jeśli nie masz żadnego KV w dropdown:
- Idź do Workers & Pages → KV
- Kliknij "Create a namespace"
- Name: `zeno-session-storage`
- Wróć do Pages → Settings → Functions i dodaj binding

---

## 4️⃣ Dodaj D1 Database (DB) - OPCJONALNE

### W sekcji "D1 database bindings":

1. Kliknij **"Add binding"**
2. Wypełnij:
   ```
   Variable name: DB
   D1 database:   [wybierz "zeno-browser-db" z dropdown]
   ```
3. Kliknij **"Save"**

**Jeśli nie ma w dropdown:**
- Na razie pomiń - nie jest wymagane do działania translation API

---

## 5️⃣ Dodaj Workers AI (AI) - NAJWAŻNIEJSZE!

### W sekcji "Workers AI":

1. Znajdź checkbox **"Workers AI"**
2. **ZAZNACZ** checkbox ✅
3. W polu "Variable name" wpisz:
   ```
   AI
   ```
4. Kliknij **"Save"**

**To jest KLUCZOWE** dla działania `/api/translate`!

---

## 6️⃣ Verification - Sprawdź czy zapisało się

Po dodaniu wszystkich bindings zobaczysz:

```
✅ KV namespace bindings:
   SESSION → CACHE (lub twój KV)

✅ D1 database bindings:
   DB → zeno-browser-db

✅ Workers AI:
   ✓ Enabled
   Variable name: AI
```

---

## 7️⃣ Re-deploy aplikacji

### Opcja A: Przez Dashboard (najłatwiejsze)
1. Wróć do **"Deployments"** (górny pasek)
2. Znajdź najnowszy deployment
3. Kliknij **"⋯"** (trzy kropki)
4. Kliknij **"Retry deployment"**

### Opcja B: Przez git push (automatyczne)
```powershell
# Już jest zrobione - ostatni push wywołał deployment
# Sprawdź: https://github.com/Bonzokoles/zen-bro-wser.org/actions
```

---

## 8️⃣ Test czy działa

Po re-deploy (około 1 minuta):

### Test 1: Sprawdź wszystkie bindings
```bash
curl https://zeno-browser.pages.dev/api/test-bindings
```

**Oczekiwany output:**
```json
{
  "bindings": {
    "session": {
      "status": "✅ Connected",
      "test": "✅ Read/Write OK"
    },
    "ai": {
      "status": "✅ Connected",
      "models": {
        "translation": {
          "test": "Hello → Cześć",
          "status": "✅ Working"
        }
      }
    }
  }
}
```

### Test 2: Przetestuj tłumaczenie
```bash
curl "https://zeno-browser.pages.dev/api/translate?text=Hello&source=en&target=pl"
```

**Oczekiwany output:**
```json
{
  "success": true,
  "original": "Hello",
  "translated": "Cześć",
  "source": "en",
  "target": "pl",
  "model": "@cf/meta/m2m100-1.2b"
}
```

---

## ✅ GOTOWE!

Jeśli oba testy działają - wszystko jest skonfigurowane poprawnie! 🎉

---

## ❌ Troubleshooting

### "AI binding not configured"
- Wróć do Settings → Functions
- Sprawdź czy Workers AI jest włączony
- Sprawdź czy Variable name = `AI` (wielkie litery!)
- Save i retry deployment

### "SESSION binding not configured"  
- Dodaj KV namespace binding (krok 3)
- Lub stwórz nowy KV jeśli nie masz żadnego

### "MessageChannel error"
- Ten błąd już naprawiliśmy - powinien zniknąć

---

## 📚 Dodatkowe info

**Dokumentacja API:** `ZENO_WEB_CORE_APP/TRANSLATION_API.md`

**Wspierane języki tłumaczenia:**
- en, pl, de, es, fr, it, pt, ru, ja, zh, ko, ar, hi, tr, nl, sv, no, da, fi, cs
- + 80 innych języków

**Koszty:** FREE (Workers AI: 10,000 requests/day)

**Performance:** ~100-300ms per translation
