# 🗺️ PLAN WDROŻENIA NOWEJ ARCHITEKTURY (K.R.A.F.T. v3)
priority: high
created: 2026-03-14T07:15:00

Na podstawie analizy `U:\WWW_Zen_BRo_wser_org\NEWfiles` przygotowanych przez Copilota, opracowano plan migracji i unowocześnienia UI przy zachowaniu tożsamości marki ZENO.

## 1. STRATEGIA MIGRACJI (Desktop-First)
Przechodzimy z czystego web-astro na hybrydowy model Electron + Astro.
- **Katalog NEWfiles** zawiera kompletny szkielet Electrona (`src-electron`) oraz nowoczesne komponenty Reactowe.
- **UI** zostanie zmodernizowane przy użyciu Glassmorphismu, zachowując obecne zasoby (`favicon.ico`, `apple-touch-icon.png`).

## 2. ETAPY WDRAŻANIA

### **Krok 1: Fundament Systemowy (Merge NEWfiles)**
- [ ] **Instalacja zależności:** Przeniesienie `dependencies` i `devDependencies` z `NEWfiles/package.json` do głównego `package.json`.
- [ ] **Konfiguracja Electron:** Skopiowanie `src-electron/`, `tsconfig.electron.json` oraz `electron-builder.config.js` do głównego katalogu.
- [ ] **Most IPC:** Wdrożenie `services/` z `src-electron` (AIGateway, CF Tunnel, Plugin System).

### **Krok 2: Modernizacja UI (Premium Look)**
- [ ] **Nowy Layout:** Wykorzystanie `BrowserUI.tsx` z `NEWfiles` jako nowego rdzenia wizualnego.
- [ ] **Glassmorphism Design:**
    - Transparetne panele boczne (AI Panel, Plugin Explorer).
    - Rozmycie (backdrop-filter) dla paska adresu i kart.
    - Animowana aura (glow) wokół aktywnych narzędzi.
- [ ] **Zachowanie Assets:** Przeniesienie `favicon.ico` i `apple-touch-icon.png` do `public/` nowego UI, by zachować rozpoznawalność marki.

### **Krok 3: Integracja Funkcjonalna (The Bridge)**
- [ ] **AI Gateway:** Połączenie `AIPanel.tsx` z nowym serwisem `AIGateway` (obsługa wielu modeli bez Bielika).
- [ ] **Cloudflare Tunnel:** Podpięcie `CloudflareTunnelPanel.tsx` pod mechanizm `cloudflared` w Electronie.
- [ ] **Tab System:** Wdrożenie zaawansowanego `TabBar.tsx` z obsługą sesji.

### **Krok 4: Weryfikacja i Start**
- [ ] **Build Pipeline:** Konfiguracja `npm run dev` by uruchamiał jednocześnie Vite (frontend) i Electrona (backend).
- [ ] **Testy Integracyjne:** Sprawdzenie, czy renderer Electrona poprawnie wyświetla strony przez nowy Ipmlemented Bridge.

## 3. DESIGN SPECYFIKACJA (Aesthetics)
- **Primary Color:** Indigo Night / Deep Space Blue.
- **Accent:** Electric Cyan (glow efekt).
- **Typography:** Inter / Outfit (Premium Sans).
- **Favicons:** Utrzymujemy obecne pliki `.png` i `.ico`.

---
// turbo-all
Plan gotowy do zatwierdzenia przez Bonzo. Następny ruch: Rozpoczęcie migracji plików systemowych Electrona.
