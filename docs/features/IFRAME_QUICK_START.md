# 🚀 Quick Start: Iframe w ZENO Browser

**Szybki start w 5 minut!**

---

## 📦 Co dostałeś?

W tym repozytorium znajdziesz **kompletny system do zarządzania iframe**:

1. **IFRAME_GUIDE.md** - Kompleksowy przewodnik (50+ stron)
2. **IframeWindowManager.tsx** - Multi-window manager z drag & drop
3. **IframeBuilder.tsx** - Visual builder (generuje kod)
4. Gotowe komponenty: YouTube, InternetArchive, Elfsight, SiteSearch

---

## ⚡ Szybkie Przykłady

### 1. Prosty Iframe (1 minuta)

```tsx
// W dowolnym komponencie React
<iframe
  src="https://example.com"
  width="100%"
  height="600"
  frameBorder="0"
  allowFullScreen
  style={{ border: 'none', borderRadius: '8px' }}
/>
```

### 2. YouTube Video (2 minuty)

```tsx
import { YouTubePlayer } from './components/iframe/YouTubePlayer';

<YouTubePlayer
  videoId="dQw4w9WgXcQ"
  onPlay={() => console.log('Odtwarzanie!')}
/>
```

### 3. Multi-Window Manager (3 minuty)

```tsx
import { IframeWindowManager } from './components/IframeWindowManager';

function App() {
  return <IframeWindowManager maxWindows={10} />;
}
```

**Gotowe!** Masz działający window manager z:
- Drag & drop okien
- Minimize/maximize/close
- Keyboard shortcuts (Ctrl+N, Ctrl+W)
- Save/restore layouts

### 4. Visual Builder (0 minut - UI!)

```tsx
import { IframeBuilder } from './components/IframeBuilder';

function App() {
  return <IframeBuilder />;
}
```

**Visual builder** pozwala tworzyć iframe przez UI:
- Konfiguruj wszystkie opcje przez checkboxy
- Live preview
- Generate kod (HTML/React/JSON)
- Export/Import konfiguracji

---

## 🎯 Use Cases

### Use Case 1: Dodaj Nową Stronę do ZENO Browser

**Cel:** Dodać nową stronę do quick links w WelcomePage

**Krok 1:** Edytuj `WelcomePage.tsx`

```tsx
const sites = [
  // ... istniejące strony
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    url: 'https://pl.wikipedia.org',
    category: 'edukacja',
    description: 'Wolna encyklopedia',
    icon: '📚',
    iframeAllowed: true
  }
];
```

**Krok 2:** Test - otwórz WelcomePage i kliknij nowy link

**Gotowe!** Strona otwiera się w nowej zakładce.

---

### Use Case 2: Stwórz Dashboard z Multiple Iframe

**Cel:** Dashboard z 4 iframe (analytics, calendar, tasks, chat)

```tsx
// Dashboard.tsx
import React from 'react';

const Dashboard = () => {
  const widgets = [
    { title: 'Analytics', url: 'https://analytics.example.com', height: 400 },
    { title: 'Calendar', url: 'https://calendar.example.com', height: 400 },
    { title: 'Tasks', url: 'https://tasks.example.com', height: 400 },
    { title: 'Chat', url: 'https://chat.example.com', height: 400 }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '16px',
      padding: '16px'
    }}>
      {widgets.map(widget => (
        <div key={widget.title} style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            fontWeight: 'bold'
          }}>
            {widget.title}
          </div>
          <iframe
            src={widget.url}
            width="100%"
            height={widget.height}
            frameBorder="0"
          />
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
```

**Użycie:**
```tsx
import Dashboard from './Dashboard';

<Dashboard />
```

---

### Use Case 3: Floating Window dla Kalkulatora

**Cel:** Przycisk który otwiera kalkulator w floating window

```tsx
import React, { useState } from 'react';
import FloatingWindow from './FloatingWindow';

export const CalculatorButton = () => {
  const [showCalc, setShowCalc] = useState(false);

  return (
    <>
      <button onClick={() => setShowCalc(true)}>
        🧮 Kalkulator
      </button>

      {showCalc && (
        <FloatingWindow
          title="Kalkulator"
          initialPosition={{ x: 200, y: 100 }}
          initialSize={{ width: 400, height: 500 }}
          onClose={() => setShowCalc(false)}
        >
          <iframe
            src="https://calculator.com"
            width="100%"
            height="100%"
            frameBorder="0"
          />
        </FloatingWindow>
      )}
    </>
  );
};
```

---

## 🔧 Integracja z ZENO Browser

### Gdzie umieścić pliki?

```
ZENO_WEB_CORE_APP/
├── src/
│   ├── components/
│   │   ├── IframeWindowManager.tsx  ✅ NOWY
│   │   ├── IframeBuilder.tsx        ✅ NOWY
│   │   ├── Browser.tsx              (istniejący)
│   │   ├── FloatingWindow.tsx       (istniejący)
│   │   └── iframe/
│   │       ├── YouTubePlayer.tsx     (istniejący)
│   │       ├── InternetArchivePlayer.tsx (istniejący)
│   │       ├── ElfsightMovieWidget.tsx (istniejący)
│   │       └── SiteSearch.tsx        (istniejący)
│   └── pages/
│       ├── iframe-demo.astro         ✅ NOWY - demo page
│       └── iframe-builder.astro      ✅ NOWY - builder page
```

### Dodaj Route do Builder

**Stwórz:** `src/pages/iframe-builder.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import IframeBuilder from '../components/IframeBuilder';
---

<Layout title="Iframe Builder">
  <IframeBuilder client:load />
</Layout>
```

**Dostęp:** `http://localhost:4378/iframe-builder`

### Dodaj Route do Window Manager

**Stwórz:** `src/pages/iframe-manager.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import IframeWindowManager from '../components/IframeWindowManager';
---

<Layout title="Iframe Window Manager">
  <IframeWindowManager client:load />
</Layout>
```

**Dostęp:** `http://localhost:4378/iframe-manager`

---

## 🎨 Customizacja

### Zmień Kolory w Window Manager

```tsx
// W IframeWindowManager.tsx, znajdź gradient:
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// Zmień na swoje kolory:
background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)'
```

### Dodaj Własne Szablony do Builder

```tsx
// W IframeBuilder.tsx, dodaj do TEMPLATES:
{
  id: 'my-template',
  name: 'Mój Szablon',
  description: 'Custom template dla moich potrzeb',
  config: {
    width: '100%',
    height: 800,
    // ... twoje ustawienia
  }
}
```

### Zmień Max Windows w Manager

```tsx
<IframeWindowManager
  maxWindows={20}  // Było: 10
  enableSaveLayout={true}
  enableKeyboardShortcuts={true}
/>
```

---

## 🔒 Bezpieczeństwo

### Quick Security Checklist

Przed osadzeniem iframe sprawdź:

- [ ] URL jest HTTPS (nie HTTP)
- [ ] Dodaj `sandbox` dla untrusted content
- [ ] Ograniczaj `allow` permissions do minimum
- [ ] Nigdy nie używaj `allow-same-origin` + `allow-scripts` jednocześnie dla untrusted content
- [ ] Sprawdź czy strona pozwala na iframe (X-Frame-Options)

### Przykład Bezpiecznego Iframe

```tsx
<iframe
  src="https://untrusted-site.com"
  sandbox="allow-scripts"  // Tylko JavaScript, bez same-origin
  allow="fullscreen"       // Tylko fullscreen, nic więcej
  width="100%"
  height="600"
  frameBorder="0"
/>
```

---

## 🐛 Troubleshooting

### Problem: Iframe jest pusty

**Przyczyna:** X-Frame-Options: DENY

**Rozwiązanie:**
```tsx
// Sprawdź czy strona pozwala na iframe
const checkIframe = async (url) => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const xFrame = res.headers.get('x-frame-options');
    console.log('X-Frame-Options:', xFrame);

    if (xFrame?.toLowerCase() === 'deny') {
      alert('Ta strona nie może być w iframe!');
      // Otwórz w nowej karcie
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Problem: Iframe ładuje się wolno

**Rozwiązanie:** Lazy loading

```tsx
<iframe
  src={url}
  loading="lazy"  // ładuje tylko gdy widoczne
/>
```

### Problem: Nie mogę kontrolować iframe

**Przyczyna:** Cross-origin restrictions

**Rozwiązanie:** postMessage API

```tsx
// Parent
iframeRef.current.contentWindow.postMessage({
  type: 'COMMAND',
  action: 'play'
}, 'https://iframe-url.com');

// W iframe (jeśli masz kontrolę nad kodem)
window.addEventListener('message', (event) => {
  if (event.origin === 'https://parent-domain.com') {
    // Handle command
  }
});
```

---

## 📚 Więcej Zasobów

- **Pełny Przewodnik:** `IFRAME_GUIDE.md` (50+ stron)
- **Komponenty Gotowe:**
  - `YouTubePlayer.tsx`
  - `InternetArchivePlayer.tsx`
  - `ElfsightMovieWidget.tsx`
  - `SiteSearch.tsx`
- **Dokumentacja MDN:** https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe

---

## 💡 Pro Tips

### Tip 1: Użyj Aspect Ratio dla Responsive Iframe

```tsx
<div style={{
  position: 'relative',
  width: '100%',
  aspectRatio: '16/9'
}}>
  <iframe
    src={url}
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%'
    }}
  />
</div>
```

### Tip 2: Loading State

```tsx
const [loading, setLoading] = useState(true);

<>
  {loading && <div>Ładowanie...</div>}
  <iframe
    src={url}
    onLoad={() => setLoading(false)}
    style={{ display: loading ? 'none' : 'block' }}
  />
</>
```

### Tip 3: Keyboard Shortcuts w Window Manager

Już wbudowane!
- `Ctrl+N` - Nowe okno
- `Ctrl+W` - Zamknij okno
- `Ctrl+Tab` - Przełącz okna
- `Ctrl+M` - Minimalizuj okno

### Tip 4: Save Custom Layouts

Window Manager automatycznie zapisuje layout do localStorage!
Restart przeglądarki = twoje okna wracają.

---

## 🎉 Gotowe!

Masz teraz:
- ✅ Kompletny przewodnik (`IFRAME_GUIDE.md`)
- ✅ Window Manager z drag & drop
- ✅ Visual Builder (generate code)
- ✅ Gotowe komponenty (YouTube, etc.)
- ✅ Quick Start examples

**Następny krok:** Otwórz `http://localhost:4378/iframe-builder` i zacznij tworzyć!

---

**Data:** 2025-11-10
**Autor:** Claude Code Assistant
**Wersja:** 1.0

**Happy iframe-ing! 🚀**
