# Instrukcje naprawy WebView.tsx i ujednolicenia stylów

## 🎯 Cel zadania

Napraw plik `src/components/WebView.tsx` który ma błędy składniowe i zduplikowany kod, oraz zastosuj globalne style CSS z `src/styles/global.css` zamiast inline styles.

---

## 📁 Kontekst projektu

**Projekt:** ZENO Browser (Astro + React + TypeScript)  
**Lokalizacja:** `V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\`  
**Problem:** WebView.tsx ma zduplikowany stary kod welcome page, błędy składniowe i używa inline styles zamiast globalnych

---

## 🔴 Błędy do naprawienia

### 1. **WebView.tsx - Zduplikowany kod welcome page**

**Problem:**
- Plik ma stary kod welcome page (około linii 200-740) który powinien być już usunięty
- WelcomePage.tsx został utworzony jako osobny komponent, ale stary kod został w WebView.tsx
- Są zduplikowane bloki `if (isLoading)`, `if (url === 'about:blank')`, `if (iframeError || loadTimeout)`
- Stan `showMoreSites` i `activeTab` w WebView.tsx nie jest już używany (jest w WelcomePage.tsx)

**Błąd kompilacji:**
```
Expected ")" but found "{"
Location: V:/PROTO_TYpy/ZENO_web_CORE/ZENO_WEB_CORE_APP/src/components/WebView.tsx:279:5
```

---

## ✅ Jak powinien wyglądać poprawny WebView.tsx

```typescript
import React, { useState, useEffect, useRef } from 'react';
import WelcomePage from './WelcomePage';

interface WebViewProps {
	url: string;
	isLoading: boolean;
	title: string;
}

const WebView: React.FC<WebViewProps> = ({ url, isLoading, title }) => {
	console.log('WebView props:', { url, isLoading, title });
	const [iframeError, setIframeError] = useState(false);
	const [loadTimeout, setLoadTimeout] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		setIframeError(false);
		setLoadTimeout(false);

		if (url === 'about:welcome' || url === 'about:blank') {
			return;
		}

		// Set timeout to detect X-Frame-Options blocks
		timeoutRef.current = setTimeout(() => {
			try {
				const iframe = iframeRef.current;
				if (iframe && !iframe.contentWindow?.document?.body) {
					setLoadTimeout(true);
				}
			} catch (e) {
				// Cross-origin access error means iframe loaded but we can't access it
				// This is actually OK - the page loaded
			}
		}, 5000);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [url]);
	
	// TYLKO TEN JEDEN BLOK dla about:welcome
	if (url === 'about:welcome') {
		return <WelcomePage />;
	}
	
	// TYLKO TEN JEDEN BLOK dla isLoading
	if (isLoading) {
		return (
			<div className="loading-container">
				<div className="loading-content">
					<div className="spinner"></div>
					<p className="loading-text">Loading...</p>
					<p className="loading-url">{url}</p>
				</div>
			</div>
		);
	}
	
	// TYLKO TEN JEDEN BLOK dla about:blank
	if (url === 'about:blank') {
		return (
			<div className="blank-container">
				<div className="blank-content">
					<div className="blank-icon">📄</div>
					<p className="blank-title">New Tab</p>
					<p className="blank-subtitle">
						Enter a URL or search term to get started
					</p>
				</div>
			</div>
		);
	}
	
	// TYLKO TEN JEDEN BLOK dla error handling
	if (iframeError || loadTimeout) {
		return (
			<div className="error-container">
				<div className="error-content">
					<div className="error-icon">⚠️</div>
					<h3 className="error-title">Nie można wyświetlić tej strony</h3>
					<p className="error-url">{url}</p>
					
					<div className="error-info-box">
						<p className="error-info-text">
							<strong>Zabezpieczenie X-Frame-Options</strong><br />
							Ta strona nie może być wyświetlona w iframe ze względów bezpieczeństwa. 
							Wiele serwisów (Google, Facebook, banki) blokuje osadzanie dla ochrony użytkowników.
						</p>
					</div>
					
					<div className="error-actions">
						<button
							onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
							className="btn-primary"
						>
							🔗 Otwórz w nowej karcie
						</button>
						<button
							onClick={() => {
								setIframeError(false);
								setLoadTimeout(false);
							}}
							className="btn-secondary"
						>
							↻ Spróbuj ponownie
						</button>
					</div>
					
					<p className="error-hint">
						💡 <strong>Wskazówka:</strong> Strony bez ograniczeń (np. example.com, httpbin.org, dokumentacje API) 
						będą działać normalnie w przeglądarce.
					</p>
				</div>
			</div>
		);
	}

	// TYLKO TEN JEDEN return dla iframe
	return (
		<div className="iframe-container">
			{loadTimeout && !iframeError && (
				<div className="timeout-banner">
					⏱️ Strona ładuje się dłużej niż zwykle...
				</div>
			)}
			<iframe
				ref={iframeRef}
				src={url}
				title={title}
				className="browser-iframe"
				onLoad={() => {
					console.log(`Loaded: ${url}`);
					setIframeError(false);
					setLoadTimeout(false);
					if (timeoutRef.current) {
						clearTimeout(timeoutRef.current);
					}
				}}
				onError={() => {
					console.log(`Error loading: ${url}`);
					setIframeError(true);
				}}
				sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
			/>
		</div>
	);
};

export default WebView;
```

---

## 🎨 Dodaj style CSS do global.css

**Lokalizacja:** `src/styles/global.css`

**Dodaj na końcu pliku:**

```css
/* ============================================
   WebView Component Styles
   ============================================ */

/* Loading State */
.loading-container,
.blank-container,
.error-container {
	position: fixed;
	top: 60px;
	left: 0;
	width: 100%;
	height: calc(100% - 60px);
	background-color: var(--bg-secondary);
	z-index: 10;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-content,
.blank-content,
.error-content {
	text-align: center;
	max-width: 600px;
	padding: 20px;
}

/* Spinner Animation */
.spinner {
	width: 64px;
	height: 64px;
	border: 4px solid var(--border-color);
	border-top: 4px solid var(--primary);
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto 16px;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.loading-text {
	color: var(--text-secondary);
	font-size: 18px;
	margin-bottom: 8px;
}

.loading-url {
	color: var(--text-muted);
	font-size: 14px;
	margin-top: 4px;
	word-break: break-all;
}

/* Blank Page */
.blank-icon {
	font-size: 60px;
	margin-bottom: 16px;
}

.blank-title {
	color: var(--text-secondary);
	font-size: 18px;
	margin-bottom: 8px;
}

.blank-subtitle {
	color: var(--text-muted);
	font-size: 14px;
	margin-top: 8px;
}

/* Error State */
.error-icon {
	font-size: 48px;
	margin-bottom: 20px;
}

.error-title {
	color: var(--text-primary);
	font-size: 24px;
	margin-bottom: 16px;
	font-weight: 600;
}

.error-url {
	color: var(--text-secondary);
	font-size: 16px;
	margin-bottom: 16px;
	word-break: break-all;
}

.error-info-box {
	background-color: var(--bg-tertiary);
	padding: 16px;
	border-radius: 8px;
	border-left: 4px solid var(--primary);
	margin-bottom: 24px;
	text-align: left;
}

.error-info-text {
	color: var(--text-secondary);
	font-size: 14px;
	line-height: 1.6;
	margin: 0;
}

.error-info-text strong {
	color: var(--primary-light);
}

.error-actions {
	display: flex;
	gap: 12px;
	justify-content: center;
	margin-bottom: 24px;
}

.error-hint {
	color: var(--text-muted);
	font-size: 12px;
	line-height: 1.5;
}

.error-hint strong {
	font-weight: 600;
}

/* Iframe Container */
.iframe-container {
	position: fixed;
	top: 60px;
	left: 0;
	width: 100%;
	height: calc(100% - 60px);
	background-color: white;
	overflow: auto;
}

.timeout-banner {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	background: linear-gradient(135deg, #f59e0b, #d97706);
	color: white;
	padding: 8px 16px;
	text-align: center;
	font-size: 13px;
	font-weight: 500;
	z-index: 100;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.browser-iframe {
	width: 100%;
	height: 100%;
	border: none;
	display: block;
}

/* Buttons - reuse from global styles or add here */
.btn-primary {
	background: linear-gradient(135deg, var(--primary), var(--primary-dark));
	color: white;
	padding: 12px 24px;
	border-radius: 8px;
	border: none;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 8px;
	transition: all 0.2s;
}

.btn-primary:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
	background-color: var(--bg-elevated);
	color: var(--text-primary);
	padding: 12px 24px;
	border-radius: 8px;
	border: none;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;
}

.btn-secondary:hover {
	background-color: var(--border-color);
}
```

---

## 📋 Checklist wykonania

1. **Backup obecnego pliku:**
   ```powershell
   Copy-Item "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\src\components\WebView.tsx" "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\src\components\WebView.tsx.backup"
   ```

2. **Zastąp całą zawartość WebView.tsx** powyższym poprawnym kodem

3. **Dodaj style CSS do global.css** (na końcu pliku)

4. **Usuń nieużywane state z WebView.tsx:**
   - Usuń linię: `const [showMoreSites, setShowMoreSites] = useState(false);`
   - Usuń linię: `const [activeTab, setActiveTab] = useState<'popular' | 'niche'>('popular');`

5. **Zweryfikuj WelcomePage.tsx:**
   - Sprawdź czy plik `src/components/WelcomePage.tsx` istnieje (414 linii)
   - Sprawdź czy ma kompletny kod z listą 68 stron

6. **Build test:**
   ```powershell
   cd V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP
   npm run build
   ```

7. **Jeśli build się powiedzie, sprawdź funkcjonalność:**
   - `about:welcome` → powinien pokazać WelcomePage z logo i listą stron
   - Kliknięcie "📋 Pełna lista sprawdzonych stron" → modal z 68 stronami w 2 zakładkach
   - Loading state → spinner z tekstem
   - Error state → komunikat X-Frame-Options z przyciskami

---

## 🎯 Dodatkowe ulepszenia (opcjonalne)

### Dodaj CSS Variables do global.css (jeśli jeszcze nie ma):

```css
:root {
	/* Colors */
	--primary: #3b82f6;
	--primary-light: #60a5fa;
	--primary-dark: #2563eb;
	
	/* Backgrounds */
	--bg-primary: #0f172a;
	--bg-secondary: #1e293b;
	--bg-tertiary: #0f172a;
	--bg-elevated: #334155;
	
	/* Text */
	--text-primary: #ffffff;
	--text-secondary: #94a3b8;
	--text-muted: #64748b;
	
	/* Borders */
	--border-color: #475569;
	
	/* Shadows */
	--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
	--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
	--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

---

## ✅ Oczekiwany rezultat

Po wykonaniu tych kroków:

1. ✅ **WebView.tsx kompiluje się bez błędów**
2. ✅ **Brak zduplikowanego kodu**
3. ✅ **Używa globalnych CSS classes zamiast inline styles**
4. ✅ **WelcomePage.tsx działa niezależnie z pełną listą stron**
5. ✅ **Spójny wygląd ze stroną search-demo**
6. ✅ **Build sukces:** `npm run build` działa bez błędów

---

## 🐛 Debugging (jeśli coś nie działa)

### Build error "Expected ')' but found '{'"
- Sprawdź czy nie zostały fragmenty starego kodu (linie 200-740)
- Upewnij się że są TYLKO POJEDYNCZE bloki dla: `if (url === 'about:welcome')`, `if (isLoading)`, `if (url === 'about:blank')`, `if (iframeError || loadTimeout)`, `return (...iframe...)`

### WelcomePage nie pokazuje się
- Sprawdź import: `import WelcomePage from './WelcomePage';`
- Sprawdź czy `src/components/WelcomePage.tsx` istnieje
- Sprawdź console w przeglądarce: `F12` → Console

### Style nie działają
- Sprawdź czy `global.css` jest importowany w `Layout.astro`
- Sprawdź czy CSS variables są zdefiniowane w `:root`

### Modal z listą stron nie otwiera się
- To jest w `WelcomePage.tsx`, nie w `WebView.tsx`
- Sprawdź czy `showMoreSites` state działa w WelcomePage
- Sprawdź console errors

---

## 📚 Pliki do edycji

1. **MUST EDIT:**
   - `src/components/WebView.tsx` - zastąp całą zawartość
   - `src/styles/global.css` - dodaj style na końcu

2. **VERIFY (nie edytuj):**
   - `src/components/WelcomePage.tsx` - powinien mieć 414 linii z kompletnym kodem
   - `src/layouts/Layout.astro` - powinien importować global.css

3. **TEST:**
   - `npm run build` - musi się udać
   - `npm run dev` - sprawdź wizualnie

---

## 🎬 Polecenie dla Claude CLI

```bash
cd V:\PROTO_TYpy\ZENO_web_CORE
claude

# Wklej w CLI:
Przeczytaj plik V:\PROTO_TYpy\ZENO_web_CORE\FIX_WEBVIEW_INSTRUCTIONS.md i wykonaj wszystkie kroki:

1. Zastąp całą zawartość src/components/WebView.tsx poprawnym kodem z instrukcji
2. Dodaj style CSS do src/styles/global.css (na końcu pliku)
3. Zbuduj projekt: npm run build
4. Sprawdź czy build się udał
5. Potwierdź że wszystkie 5 bloków (welcome, loading, blank, error, iframe) są pojedyncze i nie zduplikowane

Ważne: Usuń WSZYSTKIE duplikaty starego kodu welcome page (około linii 200-740). Musi zostać TYLKO import WelcomePage i TYLKO `if (url === 'about:welcome') { return <WelcomePage />; }`

Potwierdzenie sukcesu: Build kończy się bez błędów "Expected ')' but found '{'"
```

---

**Sukces oznacza:** Build działa ✅, WelcomePage pokazuje listę stron ✅, Style są spójne ✅
