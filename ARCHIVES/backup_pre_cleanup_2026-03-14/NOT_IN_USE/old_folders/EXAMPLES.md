# 📚 Przykłady użycia - ZENO Iframe Tester

## 1. PostMessageService - Komunikacja host ↔ iframe

### Podstawowe użycie

```typescript
// Pobierz iframe z DOM
const iframe = document.getElementById('test-iframe') as HTMLIFrameElement;

// Utwórz serwis komunikacji
const service = new PostMessageService(iframe, '*');

// Wyślij wiadomość PING do iframe
service.sendMessage('PING', { 
  timestamp: Date.now(),
  message: 'Hello from host!' 
});

// Nasłuchuj na odpowiedź PONG
service.on('PONG', (payload) => {
  console.log('Otrzymano PONG:', payload);
});

// Nasłuchuj na LOAD_COMPLETE (iframe się załadował)
service.on('LOAD_COMPLETE', (payload) => {
  console.log('Iframe załadowany:', payload.url, 'w', payload.loadTime, 'ms');
});

// Nasłuchuj na TEXT_SELECTION (użytkownik zaznaczył tekst)
service.on('TEXT_SELECTION', (payload) => {
  console.log('Zaznaczono tekst:', payload.text);
  console.log('Długość:', payload.characters, 'znaków');
});

// Cleanup przy odmontowaniu
service.destroy();
```

### Kod w iframe (strona testowa)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
</head>
<body>
  <h1>Test Iframe Content</h1>
  <p>To jest treść iframe. Zaznacz tekst aby przetestować.</p>

  <script>
    // Nasłuchuj na wiadomości od hosta
    window.addEventListener('message', (event) => {
      console.log('Otrzymano od hosta:', event.data);

      // Odpowiedz na PING
      if (event.data.type === 'PING') {
        event.source.postMessage({
          type: 'PONG',
          payload: { ok: true, timestamp: Date.now() }
        }, '*');
      }
    });

    // Zgłoś że iframe się załadował
    window.addEventListener('load', () => {
      window.parent.postMessage({
        type: 'LOAD_COMPLETE',
        payload: {
          url: window.location.href,
          loadTime: performance.now()
        }
      }, '*');
    });

    // Zgłoś zaznaczenie tekstu
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      const text = selection.toString();
      
      if (text.trim()) {
        window.parent.postMessage({
          type: 'TEXT_SELECTION',
          payload: {
            text: text,
            characters: text.length,
            words: text.trim().split(/\s+/).length
          }
        }, '*');
      }
    });
  </script>
</body>
</html>
```

## 2. Backend API - Zarządzanie stronami

### GET - Lista wszystkich stron

```javascript
// Pobierz wszystkie strony
fetch('/api/iframe/sites')
  .then(res => res.json())
  .then(data => {
    console.log('Strony:', data.data);
    console.log('Liczba:', data.count);
  });

// Wynik:
// {
//   "success": true,
//   "data": [
//     {
//       "id": "1",
//       "name": "Wikipedia",
//       "url": "https://en.wikipedia.org/wiki/Main_Page",
//       "category": "Documentation"
//     },
//     ...
//   ],
//   "count": 4
// }
```

### GET - Wyszukiwanie

```javascript
// Szukaj po nazwie
fetch('/api/iframe/sites?q=wiki')
  .then(res => res.json())
  .then(data => {
    console.log('Znaleziono:', data.data);
  });

// Filtruj po kategorii
fetch('/api/iframe/sites?category=Playground')
  .then(res => res.json())
  .then(data => {
    console.log('Playground sites:', data.data);
  });
```

### POST - Dodaj nową stronę

```javascript
fetch('/api/iframe/sites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'GitHub',
    url: 'https://github.com',
    category: 'Developer',
    description: 'Code hosting platform',
    sandbox: 'allow-same-origin allow-scripts',
    height: '700px'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('Dodano stronę:', data.data);
  });

// Wynik:
// {
//   "success": true,
//   "data": {
//     "id": "5",
//     "name": "GitHub",
//     "url": "https://github.com",
//     ...
//   }
// }
```

### GET - Pobierz pojedynczą stronę

```javascript
fetch('/api/iframe/sites/1')
  .then(res => res.json())
  .then(data => {
    console.log('Strona:', data.data);
  });
```

### PUT - Aktualizuj stronę

```javascript
fetch('/api/iframe/sites/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Wikipedia (Updated)',
    description: 'Free encyclopedia - updated'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('Zaktualizowano:', data.data);
  });
```

### DELETE - Usuń stronę

```javascript
fetch('/api/iframe/sites/1', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(data => {
    console.log('Usunięto:', data.message);
  });
```

## 3. Integracja w UI (iframe-tester.astro)

### Ładowanie stron z API

```typescript
class IframeTesterApp {
  private sites: Site[] = [];

  async loadSites() {
    const response = await fetch('/api/iframe/sites');
    const data = await response.json();
    
    if (data.success) {
      this.sites = data.data;
      this.render();
    }
  }

  async loadSite(site: Site) {
    const iframe = document.createElement('iframe');
    iframe.src = site.url;
    iframe.sandbox = site.sandbox;
    
    // Utwórz PostMessageService dla tego iframe
    const service = new PostMessageService(iframe, '*');
    
    // Nasłuchuj na wydarzenia
    service.on('LOAD_COMPLETE', (payload) => {
      console.log(`${site.name} załadowany w ${payload.loadTime}ms`);
    });
    
    service.on('ERROR', (payload) => {
      console.error(`Błąd w ${site.name}:`, payload);
    });
    
    document.getElementById('iframe-container').appendChild(iframe);
  }
}
```

## 4. Testowanie w konsoli przeglądarki

Otwórz http://localhost:4378/iframe-tester i wklej w konsoli:

```javascript
// Test 1: Pobierz listę stron
fetch('/api/iframe/sites')
  .then(r => r.json())
  .then(d => console.table(d.data));

// Test 2: Szukaj "code"
fetch('/api/iframe/sites?q=code')
  .then(r => r.json())
  .then(d => console.table(d.data));

// Test 3: Dodaj swoją stronę
fetch('/api/iframe/sites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Test Page',
    url: 'https://example.com',
    category: 'Test'
  })
}).then(r => r.json()).then(console.log);

// Test 4: PostMessage do iframe (jeśli iframe jest załadowany)
const iframe = document.querySelector('iframe');
if (iframe && iframe.contentWindow) {
  iframe.contentWindow.postMessage({
    type: 'PING',
    payload: { msg: 'Hello!' }
  }, '*');
}
```

## 5. Przykład kompleksowego testu

```typescript
// Test pełnego cyklu: load → send message → get response
async function testIframe() {
  // 1. Pobierz strony z API
  const sitesResponse = await fetch('/api/iframe/sites');
  const { data: sites } = await sitesResponse.json();
  console.log('Załadowano stron:', sites.length);

  // 2. Utwórz iframe dla pierwszej strony
  const site = sites[0];
  const iframe = document.createElement('iframe');
  iframe.src = site.url;
  iframe.sandbox = site.sandbox;
  
  // 3. Utwórz serwis komunikacji
  const service = new PostMessageService(iframe, '*');
  
  // 4. Czekaj na załadowanie
  await new Promise(resolve => {
    service.on('LOAD_COMPLETE', (payload) => {
      console.log('✅ Iframe załadowany:', payload);
      resolve(null);
    });
    
    document.body.appendChild(iframe);
  });

  // 5. Wyślij PING
  service.sendMessage('PING', { test: true });
  
  // 6. Czekaj na PONG
  service.on('PONG', (payload) => {
    console.log('✅ Otrzymano PONG:', payload);
  });

  console.log('🎉 Test zakończony!');
}

// Uruchom test
testIframe();
```

## 6. Curl examples (testowanie API z terminala)

```bash
# GET - wszystkie strony
curl http://localhost:4378/api/iframe/sites

# GET - wyszukiwanie
curl "http://localhost:4378/api/iframe/sites?q=wiki"

# POST - dodaj stronę
curl -X POST http://localhost:4378/api/iframe/sites \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","url":"https://example.com","category":"Test"}'

# GET - pojedyncza strona
curl http://localhost:4378/api/iframe/sites/1

# PUT - aktualizuj
curl -X PUT http://localhost:4378/api/iframe/sites/1 \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated description"}'

# DELETE - usuń
curl -X DELETE http://localhost:4378/api/iframe/sites/1
```

## 7. Następne kroki

Po opanowaniu podstaw możesz dodać:

1. **Automatyczne testy** - service sprawdzający czas ładowania
2. **Text Selection Service** - zaawansowane zarządzanie zaznaczeniami
3. **Session Management** - zapisywanie stanu testów
4. **Analytics Dashboard** - wizualizacja metryk
5. **Authentication** - kontrola dostępu

Zobacz TODO list dla szczegółów implementacji każdej funkcji! 🚀
