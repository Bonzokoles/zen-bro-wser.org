# 🌍 Translation API - Cloudflare Workers AI

## Model: M2M100-1.2B
Mały, szybki model tłumaczący wspierający 100+ języków.

---

## 🚀 Endpoints

### GET `/api/translate`

Prosta translacja przez URL parameters.

**Parametry:**
- `text` (required) - Tekst do przetłumaczenia
- `source` (optional) - Język źródłowy (default: `en`)
- `target` (optional) - Język docelowy (default: `pl`)

**Przykład:**
```bash
# English → Polish
curl "https://zeno-browser.pages.dev/api/translate?text=Hello&source=en&target=pl"

# German → English
curl "https://zeno-browser.pages.dev/api/translate?text=Guten%20Tag&source=de&target=en"
```

**Response:**
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

### POST `/api/translate`

Bardziej zaawansowana translacja z JSON body.

**Body:**
```json
{
  "text": "Hello, how are you?",
  "source": "en",
  "target": "pl"
}
```

**Batch translation:**
```json
{
  "text": ["Hello", "Goodbye", "Thank you"],
  "source": "en",
  "target": "pl",
  "batch": true
}
```

**Response (batch):**
```json
{
  "success": true,
  "translations": [
    { "original": "Hello", "translated": "Cześć" },
    { "original": "Goodbye", "translated": "Do widzenia" },
    { "original": "Thank you", "translated": "Dziękuję" }
  ],
  "count": 3
}
```

---

## 🌐 Wspierane języki

### Główne języki:
- `en` - English (Angielski)
- `pl` - Polish (Polski)
- `de` - German (Niemiecki)
- `es` - Spanish (Hiszpański)
- `fr` - French (Francuski)
- `it` - Italian (Włoski)
- `pt` - Portuguese (Portugalski)
- `ru` - Russian (Rosyjski)
- `ja` - Japanese (Japoński)
- `zh` - Chinese (Chiński)
- `ko` - Korean (Koreański)
- `ar` - Arabic (Arabski)
- `hi` - Hindi (Hindi)
- `tr` - Turkish (Turecki)
- `nl` - Dutch (Holenderski)
- `sv` - Swedish (Szwedzki)
- `no` - Norwegian (Norweski)
- `da` - Danish (Duński)
- `fi` - Finnish (Fiński)
- `cs` - Czech (Czeski)

**+ 80 innych języków**

Pełna lista: https://huggingface.co/facebook/m2m100_1.2B

---

## 💡 Użycie w kodzie

### JavaScript/TypeScript

```typescript
// GET request
const response = await fetch(
  `/api/translate?text=${encodeURIComponent('Hello')}&source=en&target=pl`
);
const data = await response.json();
console.log(data.translated); // "Cześć"

// POST request
const response = await fetch('/api/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello, how are you?',
    source: 'en',
    target: 'pl'
  })
});
const data = await response.json();
console.log(data.translated);
```

### React Component

```tsx
import { useState } from 'react';

function Translator() {
  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);

  const translate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          source: 'en',
          target: 'pl'
        })
      });
      const data = await response.json();
      setTranslated(data.translated);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to translate..."
      />
      <button onClick={translate} disabled={loading}>
        {loading ? 'Translating...' : 'Translate'}
      </button>
      {translated && <p>Translation: {translated}</p>}
    </div>
  );
}
```

### Astro Component

```astro
---
// src/pages/translate-demo.astro
const { AI } = Astro.locals.runtime.env;

let translated = '';
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  const text = formData.get('text');
  
  const result = await AI.run("@cf/meta/m2m100-1.2b", {
    text: text,
    source_lang: 'en',
    target_lang: 'pl'
  });
  
  translated = result.translated_text;
}
---

<html>
  <body>
    <form method="POST">
      <input type="text" name="text" placeholder="Enter text..." />
      <button type="submit">Translate</button>
    </form>
    {translated && <p>Translation: {translated}</p>}
  </body>
</html>
```

---

## ⚡ Performance

- **Latency:** ~100-300ms (zależy od długości tekstu)
- **Cache:** 1 godzina (dla GET requests)
- **Rate limit:** Brak (Cloudflare Workers AI)
- **Cost:** FREE (Workers AI Free tier: 10,000 requests/day)

---

## 🔧 Konfiguracja

### 1. Cloudflare Dashboard

Wejdź na: https://dash.cloudflare.com/pages → **zeno-browser** → **Settings** → **Functions**

Dodaj binding:
- **Workers AI**
- Variable name: `AI`
- Save

### 2. Test

Sprawdź czy działa:
```bash
curl https://zeno-browser.pages.dev/api/test-bindings
```

Szukaj w response:
```json
{
  "bindings": {
    "ai": {
      "status": "✅ Connected",
      "models": {
        "translation": {
          "model": "@cf/meta/m2m100-1.2b",
          "test": "Hello → Cześć",
          "status": "✅ Working"
        }
      }
    }
  }
}
```

---

## 🐛 Troubleshooting

### Error: "AI binding not configured"
**Rozwiązanie:** Dodaj AI binding w Cloudflare Dashboard (patrz Konfiguracja)

### Error: "Model not found"
**Rozwiązanie:** Sprawdź nazwę modelu - musi być dokładnie: `@cf/meta/m2m100-1.2b`

### Słaba jakość tłumaczenia
**Przyczyna:** M2M100 to mały model (1.2B parametrów) - dobry do szybkich tłumaczeń, ale nie perfekcyjny

**Alternatywy:**
- Google Translate API (lepsze, ale płatne)
- DeepL API (najlepsze, płatne)
- GPT-4 (excellent, droższe)

---

## 📚 Dodatkowe modele AI

Cloudflare Workers AI ma więcej modeli:

### LLM (Chat):
- `@cf/meta/llama-2-7b-chat-int8` - Czat AI
- `@cf/mistral/mistral-7b-instruct-v0.1` - Instrukcje

### Text Generation:
- `@cf/meta/llama-2-7b` - Generowanie tekstu

### Embeddings:
- `@cf/baai/bge-base-en-v1.5` - Text embeddings

### Image:
- `@cf/stabilityai/stable-diffusion-xl-base-1.0` - Generowanie obrazów

Pełna lista: https://developers.cloudflare.com/workers-ai/models/

---

## 🎯 Przykłady użycia

### Multi-language website
```typescript
// Auto-translate content based on user language
const userLang = navigator.language.split('-')[0]; // 'pl', 'de', etc.

if (userLang !== 'en') {
  const translated = await fetch(`/api/translate?text=${content}&target=${userLang}`);
  // Display translated content
}
```

### Chat translation
```typescript
// Translate incoming messages
async function translateMessage(message, targetLang) {
  const response = await fetch('/api/translate', {
    method: 'POST',
    body: JSON.stringify({ text: message, target: targetLang })
  });
  return (await response.json()).translated;
}
```

### Product descriptions
```typescript
// Batch translate product catalog
const products = ['Laptop', 'Mouse', 'Keyboard'];
const response = await fetch('/api/translate', {
  method: 'POST',
  body: JSON.stringify({
    text: products,
    source: 'en',
    target: 'pl',
    batch: true
  })
});
```

---

## ✅ Gotowe!

API translation jest skonfigurowane i gotowe do użycia! 🎉
