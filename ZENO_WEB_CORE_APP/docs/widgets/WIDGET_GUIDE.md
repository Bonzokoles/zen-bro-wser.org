# 🎨 ZENO Widget System - Przewodnik Tworzenia Widżetów

## Spis Treści
1. [Wprowadzenie](#wprowadzenie)
2. [Architektura Systemu](#architektura-systemu)
3. [ShortcutsWidget - Instrukcja Obsługi](#shortcutswidget---instrukcja-obsługi)
4. [Jak Stworzyć Nowy Widget](#jak-stworzyć-nowy-widget)
5. [System Skórek (Skins)](#system-skórek-skins)
6. [Przykłady Widżetów](#przykłady-widżetów)
7. [Integracja z Browser.tsx](#integracja-z-browsertsx)
8. [Najlepsze Praktyki](#najlepsze-praktyki)

---

## Wprowadzenie

System widżetów ZENO to modularny framework inspirowany Rainmeter, umożliwiający tworzenie floating panels z:
- ✅ Przeciąganiem (drag & drop)
- ✅ Minimalizacją/maksymalizacją
- ✅ Zamykaniem (close)
- ✅ Wyborem skórek (4 motywy)
- ✅ Always-on-top (z-index 10000)
- ✅ Zapamiętywaniem pozycji (localStorage)
- ✅ **NOWE:** Edycja linków w ShortcutsWidget
- ✅ **NOWE:** Tajny link z 4-cyfrowym kodem PIN

---

## ShortcutsWidget - Instrukcja Obsługi

### 🔗 Podstawowe Funkcje

**ShortcutsWidget** to konfigurowalny panel szybkich linków z:
- Edycją/dodawaniem/usuwaniem linków
- Zapisem w localStorage
- Tajnym linkiem "PErso_na.cc" odblokowywanym kodem PIN

### 📝 Jak Edytować Linki

1. **Otwórz tryb edycji:**
   - Kliknij przycisk `✏️ Edytuj` w górnej części widgetu
   - Widget przełączy się w tryb edycji (tytuł zmieni się na "✏️ Edycja Skrótów")

2. **Edytuj istniejący link:**
   - Kliknij przycisk `✏️` obok wybranego linku
   - Pojawią się 3 pola tekstowe:
     * **Emoji** - ikona (np. 🔥, 🎨, 💻)
     * **Nazwa** - etykieta wyświetlana (np. "Twitter")
     * **URL** - pełny adres (np. "https://twitter.com")
   - Wpisz zmiany w polach
   - Zmiany zapisują się automatycznie podczas wpisywania

3. **Usuń link:**
   - W trybie edycji kliknij czerwony przycisk `✕` obok linku
   - Link zostanie natychmiast usunięty

4. **Dodaj nowy link:**
   - Przewiń w dół widgetu (w trybie edycji)
   - Znajdź sekcję "➕ Dodaj Nowy:"
   - Wypełnij 3 pola:
     * **Emoji** - wybierz emoji (np. 🌐)
     * **Nazwa** - wpisz nazwę (np. "Wikipedia")
     * **URL** - wpisz adres (np. "https://wikipedia.org")
   - Kliknij przycisk `✓ Dodaj`
   - Nowy link pojawi się na liście

5. **Zakończ edycję:**
   - Kliknij przycisk `✓ Zakończ Edycję`
   - Widget wróci do normalnego trybu
   - Wszystkie zmiany zapisane w localStorage

### 🔐 Tajny Link - PErso_na.cc

**Jak działa system PIN:**

Widget zawiera ukryty link "PErso_na.cc", który pojawia się tylko po wpisaniu prawidłowego 4-cyfrowego kodu PIN na klawiaturze.

**Domyślny PIN:** `6498`

**Jak odblokować tajny link:**

1. **Upewnij się, że widget jest otwarty** (nie musi być w trybie edycji)
2. **Wpisz kod PIN na klawiaturze:** `6` → `4` → `9` → `8`
   - Nie musisz klikać w żadne pole
   - Cyfry wpisuj jedna po drugiej (max 2 sekundy przerwy)
   - System sprawdza ostatnie 4 wpisane cyfry
3. **Jeśli PIN poprawny:**
   - Pojawi się przycisk z tajnym linkiem: `🔐 PErso_na.cc`
   - Link ma specjalną animację (pulsowanie)
   - Link jest widoczny przez 30 sekund, potem znika
   - Aby ponownie zobaczyć - wpisz PIN jeszcze raz
4. **Kliknij przycisk** aby otworzyć tajny link

**Jak zmienić kod PIN:**

1. Włącz tryb edycji (`✏️ Edytuj`)
2. Przewiń w dół do sekcji ustawień
3. Kliknij przycisk `🔐 Zmień PIN (6498)`
4. Wpisz nowy 4-cyfrowy PIN w oknie dialogowym
5. Potwierdź - nowy PIN zostanie zapisany
6. **WAŻNE:** Zapamiętaj nowy PIN! Jest przechowywany w localStorage.

**Jak zmienić URL tajnego linku:**

Edytuj plik `src/components/widgets/ShortcutsWidget.tsx`:

```typescript
const SECRET_LINK = {
    icon: '🔐',
    label: 'PErso_na.cc',
    url: 'https://persona.cc'  // ← ZMIEŃ TEN LINK
};
```

Możesz też zmienić nazwę i emoji:
```typescript
const SECRET_LINK = {
    icon: '🎯',                    // Twoje emoji
    label: 'Moja Tajna Strona',   // Twoja nazwa
    url: 'https://example.com'    // Twój URL
};
```

### 🔄 Przywracanie Domyślnych Ustawień

W trybie edycji znajdziesz przycisk `🔄 Przywróć Domyślne`:
- Resetuje listę linków do początkowych wartości:
  * 🔍 Google
  * 🐙 GitHub
  * 📺 YouTube
  * 🎨 ChatGPT
- **NIE** resetuje kodu PIN (PIN pozostaje bez zmian)
- Pojawi się okno potwierdzenia przed resetem

### 💾 Automatyczny Zapis

Wszystkie zmiany są automatycznie zapisywane w localStorage:
- **Lista linków:** `widget-shortcuts`
- **Kod PIN:** `widget-shortcuts-pin`

Dane pozostają po:
- Odświeżeniu strony (F5)
- Zamknięciu i ponownym otwarciu przeglądarki
- Zamknięciu i ponownym otwarciu widgetu

**Czyszczenie danych:**
Aby wyczyścić zapisane dane, otwórz konsolę przeglądarki (F12) i wpisz:
```javascript
localStorage.removeItem('widget-shortcuts');      // Usuwa linki
localStorage.removeItem('widget-shortcuts-pin');  // Usuwa PIN
```

### 🎯 Przykładowe Użycia

**Scenariusz 1: Dodanie linku do Twittera**
```
1. Kliknij "✏️ Edytuj"
2. Przewiń w dół do "➕ Dodaj Nowy:"
3. Emoji: 🐦
4. Nazwa: Twitter
5. URL: https://twitter.com
6. Kliknij "✓ Dodaj"
7. Kliknij "✓ Zakończ Edycję"
```

**Scenariusz 2: Zmiana domyślnego Google na DuckDuckGo**
```
1. Kliknij "✏️ Edytuj"
2. Przy linku "🔍 Google" kliknij "✏️"
3. Zmień nazwę: "DuckDuckGo"
4. Zmień URL: "https://duckduckgo.com"
5. Emoji możesz zostawić lub zmienić na 🦆
6. Kliknij "✓ Zakończ Edycję"
```

**Scenariusz 3: Zmiana PIN na własny (np. 1234)**
```
1. Kliknij "✏️ Edytuj"
2. Przewiń w dół
3. Kliknij "🔐 Zmień PIN (6498)"
4. W oknie wpisz: 1234
5. Kliknij OK
6. Od teraz tajny link odblokuje się kodem: 1234
```

**Scenariusz 4: Testowanie tajnego linku**
```
1. Zakończ tryb edycji (jeśli aktywny)
2. Wpisz na klawiaturze: 6-4-9-8 (lub swój PIN)
3. Pojawi się przycisk "🔐 PErso_na.cc"
4. Kliknij go aby otworzyć tajny link
5. Link zniknie po 30 sekundach
```

### ⚠️ Najczęstsze Problemy

**Problem:** "Wpisuję PIN ale nic się nie dzieje"
- **Rozwiązanie:** 
  * Upewnij się że widget jest otwarty
  * Wpisuj cyfry szybko (max 2 sekundy przerwy)
  * Sprawdź czy nie masz innego pola tekstowego w fokusie
  * Sprawdź w trybie edycji jaki masz ustawiony PIN

**Problem:** "Straciłem swój PIN"
- **Rozwiązanie:**
  * Otwórz konsolę (F12)
  * Wpisz: `localStorage.getItem('widget-shortcuts-pin')`
  * Wyświetli się twój PIN
  * Lub po prostu usuń: `localStorage.removeItem('widget-shortcuts-pin')` i użyj domyślnego 6498

**Problem:** "Po odświeżeniu strony linki zniknęły"
- **Rozwiązanie:**
  * Sprawdź czy localStorage nie jest zablokowany przez przeglądarkę
  * Sprawdź tryb prywatny/incognito (nie zapisuje localStorage)
  * Otwórz konsolę i sprawdź: `localStorage.getItem('widget-shortcuts')`

---

## Architektura Systemu

### Struktura Plików
```
src/components/widgets/
├── WidgetContainer.tsx       # Uniwersalny kontener (core)
├── ClockWidget.tsx           # Przykład: Zegar
├── ShortcutsWidget.tsx       # Przykład: Skróty
├── MusicPlayerWidget.tsx     # Przykład: Music Player
└── WIDGET_TEMPLATE.tsx       # Szablon do kopiowania
```

### WidgetContainer.tsx - Core System

**Kluczowe komponenty:**
- `WidgetSkin` type: 'modern' | 'classic' | 'minimal' | 'retro'
- `WidgetTheme` interface: { bg, text, border, accent }
- `WIDGET_SKINS` object: Definicje wszystkich skórek
- `WidgetContainer` component: Uniwersalny wrapper

**Dostępne skórki:**
```typescript
WIDGET_SKINS = {
    modern: {
        bg: 'rgba(0, 0, 0, 0.1)',           // Czarne tło 10%
        text: 'rgba(255, 255, 255, 0.35)',  // Białe napisy 35%
        border: 'rgba(255, 255, 255, 0.15)', // Białe ramki 15%
        accent: 'rgba(255, 255, 255, 0.9)'   // Jasny akcent
    },
    classic: {
        bg: 'rgba(0, 0, 0, 0.1)',
        text: 'rgba(0, 255, 0, 0.35)',      // Zielony Matrix style
        border: 'rgba(0, 255, 0, 0.15)',
        accent: 'rgba(0, 255, 0, 0.9)'
    },
    minimal: {
        bg: 'rgba(0, 0, 0, 0.1)',
        text: 'rgba(255, 255, 255, 0.25)',  // Subtelniejszy
        border: 'rgba(255, 255, 255, 0.15)',
        accent: 'rgba(255, 255, 255, 0.9)'
    },
    retro: {
        bg: 'rgba(0, 0, 0, 0.1)',
        text: 'rgba(255, 255, 0, 0.35)',    // Żółty cyberpunk
        border: 'rgba(255, 255, 0, 0.15)',
        accent: 'rgba(255, 255, 0, 0.9)'
    }
}
```

---

## Jak Stworzyć Nowy Widget

### Krok 1: Skopiuj Szablon

```bash
cp src/components/widgets/WIDGET_TEMPLATE.tsx src/components/widgets/MojWidgetWidget.tsx
```

### Krok 2: Zdefiniuj Props

```typescript
import React, { useState } from 'react';
import WidgetContainer, { WIDGET_SKINS } from './WidgetContainer';
import type { WidgetSkin } from './WidgetContainer';

interface MojWidgetProps {
    onClose: () => void;
    initialSkin?: WidgetSkin;
    initialPosition?: { x: number; y: number };
}

const MojWidget: React.FC<MojWidgetProps> = ({
    onClose,
    initialSkin = 'modern',
    initialPosition = { x: 100, y: 100 }
}) => {
    const [skin, setSkin] = useState<WidgetSkin>(initialSkin);
    const theme = WIDGET_SKINS[skin];
    
    // Twój state i logika tutaj
    
    return (
        <WidgetContainer
            id="moj-widget"              // Unikalne ID (dla localStorage)
            title="📌 Mój Widget"        // Tytuł w headerze
            skin={skin}
            initialPosition={initialPosition}
            onClose={onClose}
            onSkinChange={setSkin}       // Opcjonalne - wyłącz jeśli nie potrzeba
            width={300}                   // Szerokość w px
            height={200}                  // Wysokość w px
        >
            {/* TWOJA ZAWARTOŚĆ WIDGETU */}
            <div style={{ padding: '16px', color: theme.text }}>
                <h3 style={{ color: theme.accent }}>Tytuł</h3>
                <p>Zawartość widgetu...</p>
            </div>
        </WidgetContainer>
    );
};

export default MojWidget;
```

### Krok 3: Użyj Theme Variables

```typescript
const theme = WIDGET_SKINS[skin];

// Używaj w stylach:
<div style={{
    background: theme.bg,       // Tło
    color: theme.text,          // Tekst główny
    border: `1px solid ${theme.border}`,  // Ramki
}}>
    <h1 style={{ color: theme.accent }}>Tytuł</h1>  {/* Akcent */}
</div>
```

### Krok 4: Dodaj do Browser.tsx

```typescript
// 1. Import
import MojWidget from './widgets/MojWidget';

// 2. State
const [isMojWidgetOpen, setIsMojWidgetOpen] = useState(false);

// 3. Przycisk (opcjonalnie)
<button onClick={() => setIsMojWidgetOpen(true)}>
    Otwórz Mój Widget
</button>

// 4. Renderowanie
{isMojWidgetOpen && (
    <MojWidget 
        onClose={() => setIsMojWidgetOpen(false)}
        initialSkin="modern"
        initialPosition={{ x: 200, y: 200 }}
    />
)}
```

---

## System Skórek (Skins)

### Automatyczne Funkcje WidgetContainer

Każdy widget dziedziczący z `WidgetContainer` automatycznie otrzymuje:

1. **Header z kontrolkami:**
   - Tytuł widgetu
   - Dropdown wyboru skórki (jeśli `onSkinChange` podane)
   - Przycisk minimize: `─`
   - Przycisk close: `✕`

2. **Drag & Drop:**
   - Przeciągnij za header aby przenieść
   - Kursor zmienia się na `grab`/`grabbing`

3. **Minimize:**
   - Kliknięcie `─` minimalizuje do samego headera
   - Kliknięcie `▢` przywraca pełny widok
   - Zawartość ukrywana gdy zminimalizowany

4. **Persistence:**
   - Pozycja zapisywana do `localStorage` automatycznie
   - Klucz: `widget-{id}-position`

### Jak Wyłączyć Skin Selector

Jeśli widget nie potrzebuje wyboru skórki, po prostu nie podawaj `onSkinChange`:

```typescript
<WidgetContainer
    id="simple-widget"
    title="Prosty Widget"
    skin={skin}
    initialPosition={initialPosition}
    onClose={onClose}
    // onSkinChange={setSkin}  // <-- Zakomentuj lub usuń
    width={200}
    height={150}
>
```

---

## Przykłady Widżetów

### 1. ClockWidget - Zegar Czasu Rzeczywistego

```typescript
const ClockWidget: React.FC<ClockWidgetProps> = ({ onClose, initialSkin = 'modern', initialPosition = { x: 50, y: 50 } }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [skin, setSkin] = useState<WidgetSkin>(initialSkin);
    const theme = WIDGET_SKINS[skin];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <WidgetContainer id="clock" title="🕐 Zegar" skin={skin} /* ... */>
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', color: theme.accent }}>
                    {currentTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.35 }}>
                    {currentTime.toLocaleDateString('pl-PL', { weekday: 'long' })}
                </div>
            </div>
        </WidgetContainer>
    );
};
```

**Kluczowe elementy:**
- `useState` dla czasu
- `useEffect` z `setInterval` dla aktualizacji
- `clearInterval` w cleanup
- Użycie `theme.accent` dla głównego czasu

### 2. ShortcutsWidget - Przyciski Quick Access

```typescript
const ShortcutsWidget: React.FC<ShortcutsWidgetProps> = ({ /* ... */ }) => {
    const [skin, setSkin] = useState<WidgetSkin>(initialSkin);
    const theme = WIDGET_SKINS[skin];

    const shortcuts = [
        { icon: '🔍', label: 'Google', url: 'https://google.com' },
        { icon: '🐙', label: 'GitHub', url: 'https://github.com' },
        { icon: '💾', label: 'Lokalny', action: () => alert('Electron feature') }
    ];

    return (
        <WidgetContainer id="shortcuts" title="🔗 Skróty" /* ... */>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {shortcuts.map((shortcut, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();  // Ważne! Blokuj drag
                            shortcut.url ? window.open(shortcut.url, '_blank') : shortcut.action?.();
                        }}
                        style={{
                            background: 'rgba(0, 0, 0, 0.1)',
                            border: `1px solid ${theme.border}`,
                            color: theme.text,
                            /* ... */
                        }}
                    >
                        {shortcut.icon} {shortcut.label}
                    </button>
                ))}
            </div>
        </WidgetContainer>
    );
};
```

**Kluczowe elementy:**
- Array `shortcuts` dla danych
- `e.stopPropagation()` w onClick - **KRYTYCZNE** aby nie aktywować drag
- `window.open()` dla linków zewnętrznych
- Dynamiczne renderowanie z `map()`

### 3. MusicPlayerWidget - Webamp Integration

```typescript
const MusicPlayerWidget: React.FC<MusicPlayerWidgetProps> = ({ /* ... */ }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const webampRef = useRef<Webamp | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (!containerRef.current || isMinimized) return;

        const initWebamp = async () => {
            const webamp = new Webamp({
                initialTracks: DEMO_TRACKS,
                enableHotkeys: true,
                zIndex: 10000,
            });
            await webamp.renderWhenReady(containerRef.current);
            webampRef.current = webamp;
        };

        initWebamp();
        return () => webampRef.current?.dispose();
    }, [isMinimized]);

    return (
        <WidgetContainer id="music-player" title="🎵 Music Player" /* ... */>
            {!isMinimized && <div ref={containerRef} style={{ padding: '10px' }} />}
        </WidgetContainer>
    );
};
```

**Kluczowe elementy:**
- `useRef` dla DOM reference i Webamp instance
- Warunkowe renderowanie przy minimize
- Cleanup z `dispose()` w useEffect return
- External library integration (Webamp)

---

## Integracja z Browser.tsx

### Pełny Workflow

```typescript
// ============= BROWSER.TSX =============

// 1. IMPORT WIDŻETU
import ClockWidget from './widgets/ClockWidget';
import ShortcutsWidget from './widgets/ShortcutsWidget';
import MojNowyWidget from './widgets/MojNowyWidget';

// 2. DODAJ STATE
const Browser: React.FC = () => {
    const [isClockWidgetOpen, setIsClockWidgetOpen] = useState(false);
    const [isShortcutsWidgetOpen, setIsShortcutsWidgetOpen] = useState(false);
    const [isMojNowyWidgetOpen, setIsMojNowyWidgetOpen] = useState(false);
    
    // ... reszta state'ów

    // 3. OPCJONALNIE: Przycisk uruchamiający
    <button onClick={() => {
        setIsClockWidgetOpen(true);
        setIsShortcutsWidgetOpen(true);
        setIsMojNowyWidgetOpen(true);
    }}>
        🎨 Otwórz Widżety
    </button>

    // 4. RENDERUJ WIDŻETY (przed zamykającym </div> Browser)
    return (
        <div>
            {/* ... główna zawartość Browser ... */}
            
            {/* WIDŻETY - zawsze na końcu przed </div> */}
            {isClockWidgetOpen && (
                <ClockWidget 
                    onClose={() => setIsClockWidgetOpen(false)}
                    initialSkin="modern"
                    initialPosition={{ x: 50, y: 50 }}
                />
            )}
            
            {isShortcutsWidgetOpen && (
                <ShortcutsWidget 
                    onClose={() => setIsShortcutsWidgetOpen(false)}
                    initialSkin="classic"
                    initialPosition={{ x: 50, y: 250 }}
                />
            )}
            
            {isMojNowyWidgetOpen && (
                <MojNowyWidget 
                    onClose={() => setIsMojNowyWidgetOpen(false)}
                    initialSkin="retro"
                    initialPosition={{ x: 400, y: 100 }}
                />
            )}
        </div>
    );
};
```

### Grupowe Uruchamianie

Jeśli masz jeden przycisk do uruchomienia wielu widżetów:

```typescript
const openAllWidgets = () => {
    setIsClockWidgetOpen(true);
    setIsShortcutsWidgetOpen(true);
    setIsMusicWidgetOpen(true);
    // ... inne widżety
};

<button onClick={openAllWidgets}>🎨 Widgets</button>
```

---

## Najlepsze Praktyki

### 1. Naming Convention
- Pliki: `{Nazwa}Widget.tsx` (np. `WeatherWidget.tsx`)
- Component: `{Nazwa}Widget` (np. `const WeatherWidget: React.FC`)
- Props interface: `{Nazwa}WidgetProps`
- ID w WidgetContainer: kebab-case (np. `id="weather-widget"`)

### 2. Performance

**❌ NIE rób:**
```typescript
// Inline function w każdym renderze
<WidgetContainer onSkinChange={(s) => setSkin(s)}>
```

**✅ ZRÓB:**
```typescript
// Referencja do istniejącej funkcji
<WidgetContainer onSkinChange={setSkin}>
```

### 3. Event Handling

**ZAWSZE** używaj `e.stopPropagation()` w elementach interaktywnych wewnątrz widgetu:

```typescript
<button onClick={(e) => {
    e.stopPropagation();  // Blokuj drag!
    handleAction();
}}>
```

Bez tego kliknięcie przycisku aktywuje drag widgetu.

### 4. Cleanup

Zawsze cleanuj timery, subscriptions, itp.:

```typescript
useEffect(() => {
    const timer = setInterval(() => {/* ... */}, 1000);
    
    // CLEANUP
    return () => clearInterval(timer);
}, []);
```

### 5. Pozycje Domyślne

Wybieraj pozycje `initialPosition` tak, aby widżety nie nachodziły:

```typescript
// Dobre rozmieszczenie:
ClockWidget:      { x: 50,  y: 50 }   // Lewy górny
ShortcutsWidget:  { x: 50,  y: 250 }  // Lewy środkowy
MusicWidget:      { x: 50,  y: 450 }  // Lewy dolny
WeatherWidget:    { x: 350, y: 50 }   // Prawy górny
```

### 6. Rozmiary

Standardowe szerokości dla spójności:

- **Małe widżety:** 200-250px (notatki, przyciski)
- **Średnie widżety:** 280-320px (zegar, pogoda)
- **Duże widżety:** 400-600px (music player, feeds)

### 7. Accessibility

Dodaj `title` do przycisków:

```typescript
<button 
    onClick={handleClick}
    title="Opis akcji"  // Tooltip
>
    Kliknij
</button>
```

---

## Checklisty

### ✅ Checklist: Tworzenie Nowego Widgetu

- [ ] Skopiować `WIDGET_TEMPLATE.tsx`
- [ ] Zmienić nazwę pliku na `{Nazwa}Widget.tsx`
- [ ] Zaktualizować interface name: `{Nazwa}WidgetProps`
- [ ] Ustawić unikalne `id` w WidgetContainer
- [ ] Dodać sensowny `title` z emoji
- [ ] Zdefiniować `width` i `height`
- [ ] Użyć `theme.bg`, `theme.text`, `theme.border`, `theme.accent`
- [ ] Dodać `e.stopPropagation()` w onClick handlers
- [ ] Zaimportować w `Browser.tsx`
- [ ] Dodać state: `const [is{Nazwa}Open, setIs{Nazwa}Open]`
- [ ] Renderować z conditional: `{is{Nazwa}Open && <{Nazwa}Widget />}`
- [ ] Przetestować wszystkie 4 skórki
- [ ] Przetestować minimize/maximize
- [ ] Przetestować drag & drop
- [ ] Sprawdzić czy pozycja się zapisuje (localStorage)

### ✅ Checklist: Debug Widgetu

Jeśli widget nie działa:

- [ ] Sprawdź console errors (TypeScript)
- [ ] Upewnij się że import ścieżka poprawna
- [ ] Sprawdź czy `WIDGET_SKINS` zaimportowany
- [ ] Verify `type WidgetSkin` import
- [ ] Czy `onClose` przekazany do WidgetContainer?
- [ ] Czy unikalne `id` użyte?
- [ ] Czy `e.stopPropagation()` w onClick?
- [ ] Czy cleanup w useEffect (jeśli używasz)?
- [ ] Sprawdź z-index conflicts (powinno być 10000)
- [ ] Testuj w różnych przeglądarkach

---

## Rozszerzanie Systemu

### Dodanie Nowej Skórki

Edytuj `src/components/widgets/WidgetContainer.tsx`:

```typescript
export type WidgetSkin = 'modern' | 'classic' | 'minimal' | 'retro' | 'nova';  // Dodaj 'nova'

export const WIDGET_SKINS: Record<WidgetSkin, WidgetTheme> = {
    // ... istniejące skórki
    nova: {
        bg: 'rgba(138, 43, 226, 0.1)',      // Fioletowe tło
        text: 'rgba(255, 182, 193, 0.35)',  // Różowe napisy
        border: 'rgba(255, 105, 180, 0.15)', // Różowe ramki
        accent: 'rgba(255, 20, 147, 0.9)'    // Deep pink akcent
    }
};
```

Następnie dodaj opcję w dropdown (w WidgetContainer):

```typescript
<select ...>
    <option value="modern">Modern</option>
    <option value="classic">Classic</option>
    <option value="minimal">Minimal</option>
    <option value="retro">Retro</option>
    <option value="nova">Nova</option>  {/* Nowa opcja */}
</select>
```

### Dodanie Globalnych Ustawień

Dla zaawansowanych opcji (np. domyślna skórka dla wszystkich):

```typescript
// src/config/widgetSettings.ts
export const WIDGET_SETTINGS = {
    defaultSkin: 'modern' as WidgetSkin,
    savePositions: true,
    alwaysOnTop: true,
    defaultOpacity: 0.95
};

// Użycie w widgecie:
import { WIDGET_SETTINGS } from '../config/widgetSettings';

const [skin, setSkin] = useState<WidgetSkin>(initialSkin || WIDGET_SETTINGS.defaultSkin);
```

---

## FAQ

**Q: Czy mogę użyć widgetu poza Browser.tsx?**  
A: Tak! Importuj w dowolnym komponencie React i renderuj warunkowo.

**Q: Jak zablokować drag gdy użytkownik interaktuje z elementem?**  
A: Użyj `e.stopPropagation()` w onClick/onChange handlerze.

**Q: Czy pozycja widgetu się zapisze po odświeżeniu strony?**  
A: Tak, automatycznie zapisywana do localStorage jako `widget-{id}-position`.

**Q: Jak zmienić domyślną skórkę?**  
A: W komponencie widgetu zmień `initialSkin = 'modern'` na wybraną.

**Q: Czy mogę mieć widget bez skin selectora?**  
A: Tak, nie przekazuj `onSkinChange` do WidgetContainer.

**Q: Jak zrobić widget tylko do odczytu (no minimize/close)?**  
A: Trzeba by zmodyfikować WidgetContainer - aktualnie zawsze ma kontrolki.

**Q: Maksymalna liczba widżetów?**  
A: Brak limitu, ale wydajność może spaść przy >20 aktywnych.

---

## Przykładowe Pomysły na Widżety

🚀 **Gotowe do implementacji:**
- 🌡️ **WeatherWidget** - pogoda z API (OpenWeather)
- 📊 **SystemMonitorWidget** - CPU/RAM usage (jeśli Electron)
- 📝 **NotesWidget** - sticky notes z localStorage
- 📅 **CalendarWidget** - mini kalendarz
- 🎯 **TodoWidget** - quick todo list
- 📰 **RSSFeedWidget** - news reader
- 💱 **CryptoWidget** - crypto prices live
- 🎮 **GameWidget** - mini-game (snake, tetris)
- 🔊 **VolumeWidget** - system volume control
- 🌐 **TranslatorWidget** - quick translations

---

## Wsparcie i Rozwój

**Autor:** ZENO Browser Development Team  
**Data:** Listopad 2025  
**Wersja:** 1.0.0  

**Zgłaszanie błędów:** Otwórz issue na GitHub  
**Feature requests:** Dyskusje na GitHub Discussions

---

**Happy Widget Building! 🎨✨**
