# 🔲 Kompletny Przewodnik: Iframe Windows w ZENO Browser

**Data:** 2025-11-10
**Autor:** Claude Code Assistant
**Dla:** ZENO Browser Development Team

---

## 📑 Spis Treści

1. [Podstawy Iframe](#podstawy-iframe)
2. [Bezpieczeństwo Iframe](#bezpieczeństwo-iframe)
3. [Tworzenie Komponentów Iframe](#tworzenie-komponentów-iframe)
4. [System Okien w ZENO Browser](#system-okien-w-zeno-browser)
5. [Gotowe Komponenty](#gotowe-komponenty)
6. [Praktyczne Przykłady](#praktyczne-przykłady)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 1. Podstawy Iframe

### 1.1 Czym jest Iframe?

**Iframe** (Inline Frame) to element HTML, który pozwala osadzić jedną stronę internetową wewnątrz drugiej.

```html
<iframe
  src="https://example.com"
  width="800"
  height="600"
  frameBorder="0"
  allowFullScreen
></iframe>
```

### 1.2 Kiedy używać Iframe?

✅ **Dobre przypadki użycia:**
- Osadzanie zewnętrznych treści (YouTube, Vimeo)
- Embedowanie dokumentacji (CodePen, JSFiddle)
- Integracja narzędzi (Google Maps, Calendly)
- Sandbox dla untrusted content
- Multi-tab browsing (jak w ZENO)

❌ **Kiedy NIE używać:**
- Dla treści z tej samej domeny (użyj komponentów React)
- Gdy strona blokuje iframe (X-Frame-Options: DENY)
- Dla SEO-critical content (iframe nie jest indeksowane)
- Dla głównej nawigacji strony

### 1.3 Podstawowe Atrybuty

| Atrybut | Opis | Przykład |
|---------|------|----------|
| `src` | URL strony do osadzenia | `src="https://example.com"` |
| `width` | Szerokość (px lub %) | `width="100%"` |
| `height` | Wysokość (px) | `height="600"` |
| `frameBorder` | Obramowanie (0 = brak) | `frameBorder="0"` |
| `allowFullScreen` | Pełny ekran | `allowFullScreen` |
| `sandbox` | Ograniczenia bezpieczeństwa | `sandbox="allow-scripts"` |
| `loading` | Lazy loading | `loading="lazy"` |
| `title` | Accessibility label | `title="YouTube Video"` |
| `allow` | Feature Policy | `allow="camera; microphone"` |

---

## 2. Bezpieczeństwo Iframe

### 2.1 X-Frame-Options

Niektóre strony blokują osadzanie w iframe przez nagłówek HTTP:

```http
X-Frame-Options: DENY              # Całkowita blokada
X-Frame-Options: SAMEORIGIN        # Tylko ta sama domena
X-Frame-Options: ALLOW-FROM https://example.com  # Tylko określona domena
```

**Rozwiązanie:**
- Sprawdź headers przed osadzeniem (crawler!)
- Użyj proxy jeśli to możliwe
- Alternatywnie: otwórz w nowej karcie

### 2.2 Content Security Policy (CSP)

```http
Content-Security-Policy: frame-ancestors 'none'  # Blokuje iframe
Content-Security-Policy: frame-ancestors 'self'  # Tylko ta sama domena
Content-Security-Policy: frame-ancestors https://trusted.com  # Tylko zaufane
```

### 2.3 Sandbox Attribute

Ogranicza możliwości iframe dla bezpieczeństwa:

```html
<iframe
  src="https://untrusted.com"
  sandbox="allow-scripts allow-same-origin"
></iframe>
```

**Sandbox values:**
- `allow-scripts` - Pozwala na JavaScript
- `allow-same-origin` - Pozwala na dostęp do origin
- `allow-forms` - Pozwala na formularze
- `allow-popups` - Pozwala na popupy
- `allow-modals` - Pozwala na alerty/confirm
- `allow-top-navigation` - Pozwala na zmianę top window location

**UWAGA:** `allow-same-origin` + `allow-scripts` = niebezpieczne! Iframe może modyfikować parent.

### 2.4 Feature Policy (Permissions Policy)

```html
<iframe
  src="https://example.com"
  allow="camera 'none'; microphone 'none'; geolocation 'none'"
></iframe>
```

**Common permissions:**
- `camera` - Kamera
- `microphone` - Mikrofon
- `geolocation` - Lokalizacja
- `payment` - Payment API
- `autoplay` - Autoplay wideo
- `fullscreen` - Pełny ekran
- `encrypted-media` - DRM content

---

## 3. Tworzenie Komponentów Iframe

### 3.1 Prosty Komponent React

```tsx
// SimpleIframe.tsx
import React from 'react';

interface SimpleIframeProps {
  src: string;
  width?: number | string;
  height?: number | string;
  title?: string;
}

export const SimpleIframe: React.FC<SimpleIframeProps> = ({
  src,
  width = '100%',
  height = 600,
  title = 'Iframe Content'
}) => {
  return (
    <iframe
      src={src}
      width={width}
      height={height}
      frameBorder="0"
      allowFullScreen
      title={title}
      style={{ border: 'none', borderRadius: '8px' }}
    />
  );
};

// Użycie:
<SimpleIframe src="https://example.com" height={400} />
```

### 3.2 Komponent z Loading State

```tsx
// IframeWithLoading.tsx
import React, { useState } from 'react';

interface IframeWithLoadingProps {
  src: string;
  width?: number | string;
  height?: number | string;
}

export const IframeWithLoading: React.FC<IframeWithLoadingProps> = ({
  src,
  width = '100%',
  height = 600
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f0f0'
        }}>
          <div className="spinner">Ładowanie...</div>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fee',
          color: '#c33'
        }}>
          ❌ Nie udało się załadować strony
        </div>
      )}

      <iframe
        src={src}
        width={width}
        height={height}
        frameBorder="0"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
        style={{
          display: loading || error ? 'none' : 'block',
          border: 'none'
        }}
      />
    </div>
  );
};
```

### 3.3 Komponent z Kontrolkami

```tsx
// IframeWithControls.tsx
import React, { useState, useRef } from 'react';

interface IframeWithControlsProps {
  initialUrl: string;
  width?: number | string;
  height?: number | string;
}

export const IframeWithControls: React.FC<IframeWithControlsProps> = ({
  initialUrl,
  width = '100%',
  height = 600
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = () => {
    setUrl(inputUrl);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };

  const handleBack = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.history.back();
    }
  };

  const handleForward = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.history.forward();
    }
  };

  return (
    <div style={{ width }}>
      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '8px',
        background: '#f5f5f5',
        borderRadius: '8px 8px 0 0'
      }}>
        <button onClick={handleBack}>⬅️ Wstecz</button>
        <button onClick={handleForward}>➡️ Dalej</button>
        <button onClick={handleRefresh}>🔄 Odśwież</button>
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
          style={{ flex: 1, padding: '4px 8px' }}
          placeholder="Wpisz URL..."
        />
        <button onClick={handleNavigate}>🔍 Idź</button>
      </div>

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={url}
        width={width}
        height={height}
        frameBorder="0"
        allowFullScreen
        style={{ border: 'none', borderRadius: '0 0 8px 8px' }}
      />
    </div>
  );
};
```

### 3.4 Komponent z PostMessage Communication

```tsx
// IframeWithMessaging.tsx
import React, { useEffect, useRef, useState } from 'react';

interface IframeWithMessagingProps {
  src: string;
  onMessage?: (data: any) => void;
}

export const IframeWithMessaging: React.FC<IframeWithMessagingProps> = ({
  src,
  onMessage
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify origin
      if (event.origin !== new URL(src).origin) {
        console.warn('Message from untrusted origin:', event.origin);
        return;
      }

      console.log('Received message:', event.data);
      setMessages(prev => [...prev, event.data]);

      if (onMessage) {
        onMessage(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [src, onMessage]);

  const sendMessage = (data: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(data, new URL(src).origin);
    }
  };

  return (
    <div>
      <iframe
        ref={iframeRef}
        src={src}
        width="100%"
        height="600"
        frameBorder="0"
      />

      <div style={{ marginTop: '16px' }}>
        <button onClick={() => sendMessage({ type: 'PING' })}>
          📤 Wyślij PING
        </button>

        <div style={{ marginTop: '8px', fontSize: '12px' }}>
          <strong>Otrzymane wiadomości:</strong>
          {messages.map((msg, idx) => (
            <div key={idx}>{JSON.stringify(msg)}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 4. System Okien w ZENO Browser

### 4.1 Architektura Multi-Window

ZENO Browser używa systemu floating windows opartego o:

```
Browser.tsx (główny kontener)
├── TabBar.tsx (zarządzanie zakładkami)
├── Toolbar.tsx (kontrolki)
└── WebView.tsx (renderowanie iframe)
    ├── WelcomePage.tsx (strona główna)
    └── FloatingWindow.tsx (okna pływające)
```

### 4.2 Struktura Tab (Zakładka)

```typescript
interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isActive: boolean;
  history: string[];
  historyIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  loading: boolean;
  error?: string;
}
```

### 4.3 Jak Dodać Nową Stronę?

**Metoda 1: Przez WelcomePage (Quick Links)**

Edytuj `WelcomePage.tsx`:

```tsx
const sites = [
  {
    id: 'my-site',
    name: 'Moja Strona',
    url: 'https://my-site.com',
    category: 'narzędzia',
    icon: '🌐'
  },
  // ... więcej stron
];
```

**Metoda 2: Przez API**

```bash
POST /api/iframe/sites
{
  "name": "Moja Strona",
  "url": "https://my-site.com",
  "category": "narzędzia",
  "iframeAllowed": true,
  "description": "Opis mojej strony"
}
```

**Metoda 3: Programowo w Browser.tsx**

```typescript
const handleAddTab = (url: string) => {
  const newTab: Tab = {
    id: Date.now().toString(),
    url,
    title: url,
    isActive: true,
    history: [url],
    historyIndex: 0,
    canGoBack: false,
    canGoForward: false,
    loading: true
  };

  setTabs(prev => [...prev, newTab]);
  setActiveTabId(newTab.id);
};
```

### 4.4 Floating Windows

```tsx
// Przykład użycia FloatingWindow
import FloatingWindow from './FloatingWindow';

<FloatingWindow
  title="Kalkulator"
  initialPosition={{ x: 100, y: 100 }}
  initialSize={{ width: 400, height: 300 }}
  onClose={() => setShowCalculator(false)}
>
  <iframe
    src="https://calculator.com"
    width="100%"
    height="100%"
    frameBorder="0"
  />
</FloatingWindow>
```

---

## 5. Gotowe Komponenty

### 5.1 InternetArchivePlayer

```tsx
import { InternetArchivePlayer } from './components/iframe/InternetArchivePlayer';

<InternetArchivePlayer
  identifier="sample-video-id"
  width={640}
  height={360}
/>
```

**Funkcje:**
- Embed z archive.org
- Full screen support
- Autoplay + encrypted-media

### 5.2 YouTubePlayer

```tsx
import { YouTubePlayer } from './components/iframe/YouTubePlayer';

<YouTubePlayer
  videoId="dQw4w9WgXcQ"
  width={560}
  height={315}
  onReady={() => console.log('Ready!')}
  onPlay={() => console.log('Playing')}
  onPause={() => console.log('Paused')}
  onEnd={() => console.log('Ended')}
/>
```

**Funkcje:**
- YouTube IFrame API integration
- Event callbacks
- Full control (play, pause, stop)

### 5.3 ElfsightMovieWidget

```tsx
import { ElfsightMovieWidget } from './components/iframe/ElfsightMovieWidget';

<ElfsightMovieWidget
  widgetId="your-widget-id"
  width="100%"
  height={450}
/>
```

**Funkcje:**
- Elfsight embedowanie
- No scrolling, czysty UI

### 5.4 SiteSearch

```tsx
import SiteSearch from './components/iframe/SiteSearch';

<SiteSearch
  onSelectSite={(site) => {
    // Otwórz site w nowej zakładce
    handleAddTab(site.url);
  }}
  enableFavorites={true}
  enableHistory={true}
  pageSize={20}
/>
```

**Funkcje:**
- Real-time search z debouncing
- Filtry (kategoria, iframe-allowed, sortowanie)
- Autocomplete suggestions
- Favorites & History (localStorage)
- Pagination + Infinite scroll

---

## 6. Praktyczne Przykłady

### 6.1 Dodanie Nowej Strony do Quick Links

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

**Krok 2:** Dodaj kategorię jeśli nowa:

```tsx
const categories = [
  { id: 'all', name: 'Wszystkie', icon: '🌐' },
  { id: 'edukacja', name: 'Edukacja', icon: '📚' },
  // ...
];
```

**Krok 3:** Test - otwórz WelcomePage i kliknij nowy link

### 6.2 Stworzenie Custom Iframe Window

```tsx
// MyCustomWindow.tsx
import React, { useState } from 'react';
import FloatingWindow from './FloatingWindow';

export const MyCustomWindow: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        🌐 Otwórz Moją Stronę
      </button>

      {isOpen && (
        <FloatingWindow
          title="Moja Custom Strona"
          initialPosition={{ x: 200, y: 100 }}
          initialSize={{ width: 800, height: 600 }}
          onClose={() => setIsOpen(false)}
        >
          <iframe
            src="https://my-custom-site.com"
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin"
            allow="camera; microphone; fullscreen"
          />
        </FloatingWindow>
      )}
    </>
  );
};
```

### 6.3 Multi-Iframe Dashboard

```tsx
// Dashboard.tsx
import React from 'react';

export const Dashboard: React.FC = () => {
  const widgets = [
    { id: 1, title: 'Analytics', url: 'https://analytics.example.com', height: 400 },
    { id: 2, title: 'Calendar', url: 'https://calendar.example.com', height: 400 },
    { id: 3, title: 'Tasks', url: 'https://tasks.example.com', height: 400 },
    { id: 4, title: 'Chat', url: 'https://chat.example.com', height: 400 }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '16px',
      padding: '16px'
    }}>
      {widgets.map(widget => (
        <div key={widget.id} style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold'
          }}>
            {widget.title}
          </div>
          <iframe
            src={widget.url}
            width="100%"
            height={widget.height}
            frameBorder="0"
            style={{ display: 'block' }}
          />
        </div>
      ))}
    </div>
  );
};
```

### 6.4 Tabbed Iframe Viewer

```tsx
// TabbedIframeViewer.tsx
import React, { useState } from 'react';

interface IframeTab {
  id: string;
  title: string;
  url: string;
}

export const TabbedIframeViewer: React.FC = () => {
  const [tabs] = useState<IframeTab[]>([
    { id: '1', title: 'Google', url: 'https://google.com' },
    { id: '2', title: 'GitHub', url: 'https://github.com' },
    { id: '3', title: 'MDN', url: 'https://developer.mozilla.org' }
  ]);

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div>
      {/* Tab Headers */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab.id ? '#4a90e2' : '#f0f0f0',
              color: activeTab === tab.id ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Iframe Content */}
      {tabs.map(tab => (
        <iframe
          key={tab.id}
          src={tab.url}
          width="100%"
          height="600"
          frameBorder="0"
          style={{
            display: activeTab === tab.id ? 'block' : 'none',
            borderRadius: '8px'
          }}
        />
      ))}
    </div>
  );
};
```

---

## 7. Troubleshooting

### Problem 1: Strona się nie ładuje (pusta)

**Możliwe przyczyny:**
1. X-Frame-Options: DENY
2. Content-Security-Policy blokuje
3. Mixed content (HTTPS → HTTP)
4. CORS issue

**Rozwiązania:**
```tsx
// Sprawdź czy strona pozwala na iframe
const checkIframeAllowed = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const xFrameOptions = response.headers.get('x-frame-options');

    if (xFrameOptions &&
        (xFrameOptions.toLowerCase() === 'deny' ||
         xFrameOptions.toLowerCase() === 'sameorigin')) {
      console.error('Iframe blocked by X-Frame-Options:', xFrameOptions);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking iframe:', error);
    return false;
  }
};

// Alternatywnie: otwórz w nowej karcie
<button onClick={() => window.open(url, '_blank')}>
  Otwórz w nowej karcie
</button>
```

### Problem 2: Iframe nie reaguje na zdarzenia

**Przyczyna:** Cross-origin restrictions

**Rozwiązanie:** Użyj postMessage API

```tsx
// W parent window
iframeRef.current.contentWindow.postMessage({
  type: 'COMMAND',
  action: 'play'
}, 'https://iframe-url.com');

// W iframe (kod strony osadzonej)
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://your-parent-domain.com') return;

  if (event.data.type === 'COMMAND') {
    // Handle command
  }
});
```

### Problem 3: Scroll nie działa w iframe

**Rozwiązanie:**

```tsx
<iframe
  src={url}
  scrolling="yes"  // lub "auto"
  style={{
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch' // dla iOS
  }}
/>
```

### Problem 4: Performance issues (wiele iframe)

**Rozwiązania:**

```tsx
// 1. Lazy loading
<iframe
  src={url}
  loading="lazy"  // ładuje tylko gdy widoczne
/>

// 2. Conditional rendering
{isVisible && <iframe src={url} />}

// 3. Virtual scrolling dla wielu iframe
// Użyj react-window lub react-virtualized
```

### Problem 5: Height nie dostosowuje się do contentu

**Rozwiązanie:** Dynamiczne dostosowanie

```tsx
const IframeAutoHeight: React.FC<{ src: string }> = ({ src }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'RESIZE') {
        setHeight(event.data.height);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <iframe ref={iframeRef} src={src} width="100%" height={height} />;
};

// W iframe content (jeśli masz kontrolę):
// window.parent.postMessage({
//   type: 'RESIZE',
//   height: document.body.scrollHeight
// }, '*');
```

---

## 8. Best Practices

### 8.1 Security Checklist

- [ ] Zawsze używaj HTTPS dla iframe src
- [ ] Dodaj `sandbox` attribute dla untrusted content
- [ ] Użyj `allow` attribute aby ograniczyć permissions
- [ ] Weryfikuj origin w postMessage handlers
- [ ] Nigdy nie używaj `allow-same-origin` + `allow-scripts` jednocześnie dla untrusted content
- [ ] Sprawdź X-Frame-Options przed osadzeniem
- [ ] Dodaj `rel="noopener noreferrer"` dla linków otwieranych w nowej karcie

### 8.2 Performance Checklist

- [ ] Używaj `loading="lazy"` dla iframe poza viewport
- [ ] Ograniczaj liczbę jednocześnie załadowanych iframe (max 5-10)
- [ ] Rozważ placeholder image przed załadowaniem iframe
- [ ] Używaj CDN dla często używanych stron
- [ ] Cache iframe content jeśli możliwe
- [ ] Monitoruj memory usage (DevTools)

### 8.3 Accessibility Checklist

- [ ] Zawsze dodaj `title` attribute opisujący content
- [ ] Użyj semantic HTML wokół iframe
- [ ] Dodaj skip links dla keyboard navigation
- [ ] Zapewnij alternatywę dla content (link "Otwórz w nowej karcie")
- [ ] Test z screen readerami

### 8.4 UX Checklist

- [ ] Pokaż loading indicator podczas ładowania
- [ ] Pokaż error message jeśli ładowanie się nie powiodło
- [ ] Dodaj "Otwórz w nowej karcie" button
- [ ] Dodaj "Odśwież" button
- [ ] Responsywny design (mobile-friendly)
- [ ] Dark mode support jeśli możliwe

### 8.5 Code Organization

```
src/
├── components/
│   ├── iframe/
│   │   ├── InternetArchivePlayer.tsx
│   │   ├── YouTubePlayer.tsx
│   │   ├── ElfsightMovieWidget.tsx
│   │   ├── SiteSearch.tsx
│   │   └── IframeWindowManager.tsx  # Nowy - zarządzanie oknami
│   ├── Browser.tsx
│   └── FloatingWindow.tsx
├── types/
│   └── iframe.ts  # TypeScript interfaces
├── utils/
│   ├── iframeHelpers.ts  # Helper functions
│   └── iframeSecurity.ts  # Security checks
└── hooks/
    ├── useIframeMessaging.ts
    └── useIframeResize.ts
```

---

## 9. Zaawansowane Techniki

### 9.1 Iframe Communication (PostMessage)

**Parent → Iframe:**

```tsx
// Parent component
const sendToIframe = (data: any) => {
  const iframe = document.getElementById('myIframe') as HTMLIFrameElement;
  iframe.contentWindow?.postMessage(data, 'https://iframe-domain.com');
};
```

**Iframe → Parent:**

```tsx
// W iframe content
window.parent.postMessage({
  type: 'USER_ACTION',
  payload: 'data'
}, 'https://parent-domain.com');
```

**Dwukierunkowa komunikacja:**

```tsx
const useIframeMessaging = (targetOrigin: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== targetOrigin) return;
      setMessages(prev => [...prev, event.data]);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [targetOrigin]);

  const sendMessage = (data: any) => {
    iframeRef.current?.contentWindow?.postMessage(data, targetOrigin);
  };

  return { messages, sendMessage, iframeRef };
};
```

### 9.2 Iframe Detection & Fallback

```tsx
const IframeWithFallback: React.FC<{ src: string }> = ({ src }) => {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // Sprawdź czy strona blokuje iframe
    const checkAccess = async () => {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        const xFrameOptions = response.headers.get('x-frame-options');

        if (xFrameOptions?.toLowerCase() === 'deny') {
          setBlocked(true);
        }
      } catch (error) {
        console.error('Cannot check iframe access:', error);
      }
    };

    checkAccess();
  }, [src]);

  if (blocked) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>⚠️ Ta strona nie może być wyświetlona w iframe</p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '16px',
            padding: '8px 16px',
            background: '#4a90e2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Otwórz w nowej karcie
        </a>
      </div>
    );
  }

  return <iframe src={src} width="100%" height="600" frameBorder="0" />;
};
```

### 9.3 Responsive Iframe (Aspect Ratio)

```tsx
const ResponsiveIframe: React.FC<{
  src: string;
  aspectRatio?: string
}> = ({
  src,
  aspectRatio = '16/9'
}) => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio,
      overflow: 'hidden',
      borderRadius: '8px'
    }}>
      <iframe
        src={src}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        allowFullScreen
      />
    </div>
  );
};

// Użycie:
<ResponsiveIframe src="https://example.com" aspectRatio="16/9" />
<ResponsiveIframe src="https://example.com" aspectRatio="4/3" />
<ResponsiveIframe src="https://example.com" aspectRatio="1/1" />
```

---

## 10. Narzędzia Developerskie

### 10.1 Iframe Inspector

```tsx
// IframeInspector.tsx - narzędzie developerskie
const IframeInspector: React.FC<{ src: string }> = ({ src }) => {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const inspect = async () => {
      try {
        const response = await fetch(src, { method: 'HEAD' });

        setInfo({
          xFrameOptions: response.headers.get('x-frame-options'),
          csp: response.headers.get('content-security-policy'),
          contentType: response.headers.get('content-type'),
          status: response.status,
          url: response.url
        });
      } catch (error) {
        setInfo({ error: error.message });
      }
    };

    inspect();
  }, [src]);

  return (
    <div style={{
      padding: '16px',
      background: '#f5f5f5',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h4>🔍 Iframe Inspector</h4>
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
};
```

### 10.2 Iframe Sandbox Tester

```tsx
// Test różnych sandbox configurations
const sandboxConfigs = [
  { name: 'No restrictions', value: '' },
  { name: 'Scripts only', value: 'allow-scripts' },
  { name: 'Scripts + Same Origin', value: 'allow-scripts allow-same-origin' },
  { name: 'Full restrictions', value: 'allow-nothing' }
];

const SandboxTester: React.FC<{ src: string }> = ({ src }) => {
  const [config, setConfig] = useState(sandboxConfigs[0].value);

  return (
    <div>
      <select onChange={(e) => setConfig(e.target.value)}>
        {sandboxConfigs.map(cfg => (
          <option key={cfg.name} value={cfg.value}>
            {cfg.name}
          </option>
        ))}
      </select>

      <iframe
        src={src}
        width="100%"
        height="400"
        sandbox={config}
        frameBorder="0"
      />
    </div>
  );
};
```

---

## 11. Migracja do ZENO Browser

### Krok 1: Dodaj swoją stronę do katalogu

```bash
# Używając API
curl -X POST http://localhost:4378/api/iframe/sites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Moja Aplikacja",
    "url": "https://my-app.com",
    "category": "narzędzia",
    "iframeAllowed": true,
    "description": "Opis mojej aplikacji",
    "tags": ["productivity", "tools"]
  }'
```

### Krok 2: Test w ZENO Browser

1. Otwórz ZENO Browser
2. Kliknij WelcomePage
3. Znajdź swoją stronę w kategorii
4. Kliknij - powinna otworzyć się w nowej zakładce

### Krok 3: Optymalizacja dla iframe

Jeśli kontrolujesz stronę, dodaj:

```html
<!-- W <head> twojej strony -->
<meta http-equiv="X-Frame-Options" content="ALLOW-FROM https://zeno-browser.pages.dev">

<!-- Lub w CSP -->
<meta http-equiv="Content-Security-Policy" content="frame-ancestors https://zeno-browser.pages.dev">
```

### Krok 4: Dodaj komunikację (opcjonalnie)

```javascript
// W twojej aplikacji
// Nasłuchuj komunikatów z ZENO
window.addEventListener('message', (event) => {
  if (event.origin === 'https://zeno-browser.pages.dev') {
    console.log('Message from ZENO:', event.data);

    // Odpowiedz
    event.source.postMessage({
      type: 'RESPONSE',
      data: 'OK'
    }, event.origin);
  }
});

// Wyślij wiadomość do ZENO
window.parent.postMessage({
  type: 'APP_READY'
}, 'https://zeno-browser.pages.dev');
```

---

## 12. FAQ

**Q: Czy mogę osadzić każdą stronę w iframe?**
A: Nie. Strony mogą blokować osadzanie przez X-Frame-Options lub CSP. Sprawdź headers przed osadzeniem.

**Q: Jak sprawdzić czy strona pozwala na iframe?**
A: Użyj crawlera lub ręcznie sprawdź headers:
```bash
curl -I https://example.com | grep -i "x-frame-options"
```

**Q: Czy iframe są bezpieczne?**
A: Tak, jeśli używasz `sandbox` attribute i ograniczasz permissions. Nie ufaj untrusted content.

**Q: Jak komunikować się między parent a iframe?**
A: Używaj postMessage API. Pamiętaj o weryfikacji origin!

**Q: Performance iframe vs komponent React?**
A: Iframe = izolacja ale większy overhead. React = szybciej ale mniej bezpieczeństwa. Wybierz według potrzeb.

**Q: Ile iframe mogę mieć na jednej stronie?**
A: Zależy od przeglądarki i zasobów. Recommend: max 5-10 jednocześnie załadowanych.

---

## 13. Zasoby Dodatkowe

### Dokumentacja:
- [MDN: iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
- [MDN: postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [HTML Standard: iframe](https://html.spec.whatwg.org/multipage/iframe-embed-object.html)

### Security:
- [OWASP: iframe Injection](https://owasp.org/www-community/attacks/Content_Spoofing)
- [CSP: frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)

### Narzędzia:
- [Iframe Resizer](https://github.com/davidjbradshaw/iframe-resizer)
- [postmate](https://github.com/dollarshaveclub/postmate) - postMessage helper
- [frame-bus](https://github.com/bignerdranch/frame-bus) - komunikacja iframe

---

## Podsumowanie

Ten przewodnik pokrywa:
✅ Podstawy iframe (atrybuty, security, best practices)
✅ Tworzenie komponentów React z iframe
✅ System okien w ZENO Browser
✅ Gotowe komponenty (YouTube, InternetArchive, etc.)
✅ Praktyczne przykłady i code snippets
✅ Troubleshooting i FAQ
✅ Zaawansowane techniki (postMessage, responsive, fallbacks)

**Next Steps:**
1. Przejrzyj `IframeWindowManager.tsx` (następny plik)
2. Zobacz `IframeBuilder.tsx` (visual builder)
3. Test przykładów w ZENO Browser

---

**Data aktualizacji:** 2025-11-10
**Wersja:** 1.0
**Autor:** Claude Code Assistant
**Licencja:** MIT
