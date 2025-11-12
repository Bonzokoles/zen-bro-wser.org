# Instrukcja Dodawania Przycisków do Sidebara

## Lokalizacja
**Plik**: `src/components/WelcomePage.tsx`  
**Sekcja**: Right Sidebar (od linii ~764)

## Struktura Sidebara

Sidebar jest kontenerem `<div>` z pozycjonowaniem:
- `position: 'fixed'` - przylepiony do ekranu
- `right: '20px'` - 20px od prawej krawędzi
- `top: '50%'` + `transform: 'translateY(-50%)'` - wycentrowany pionowo
- `flexDirection: 'column'` - przyciski ułożone pionowo
- `gap: '12px'` - 12px odstępu między przyciskami
- `zIndex: 1001` - ponad dolnym paskiem nawigacji (1000)

## Dodawanie Nowego Przycisku

### Krok 1: Jeśli przycisk otwiera widget - dodaj state
```tsx
// Na początku komponentu (koło linii 11-13)
const [showNowyWidget, setShowNowyWidget] = useState(false);
```

### Krok 2: Zaimportuj widget (jeśli potrzebny)
```tsx
// Na początku pliku (koło linii 2-4)
import NowyWidget from './widgets/NowyWidget';
```

### Krok 3: Dodaj przycisk do sidebara
Wklej nowy przycisk **między istniejące** w sidebarze (po linii ~764):

```tsx
{/* Nowy Przycisk */}
<button
  onClick={() => setShowNowyWidget(true)} // lub inna akcja
  style={{
    padding: '12px 16px',
    backgroundColor: 'rgba(R, G, B, 0.2)', // Wybierz kolor RGB
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(R, G, B, 0.5)', // Ten sam kolor, wyższa przezroczystość
    borderRadius: '12px',
    color: '#KOLOR_TEKSTU', // Jasny odcień koloru głównego
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(R, G, B, 0.3)',
    minWidth: '160px'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(R, G, B, 0.3)';
    e.currentTarget.style.transform = 'translateX(-5px)';
    e.currentTarget.style.boxShadow = '0 6px 20px rgba(R, G, B, 0.5)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(R, G, B, 0.2)';
    e.currentTarget.style.transform = 'translateX(0)';
    e.currentTarget.style.boxShadow = '0 4px 15px rgba(R, G, B, 0.3)';
  }}
  title="Opis po najechaniu myszką"
>
  <span style={{ fontSize: '16px' }}>🎯</span> {/* Emoji/Ikona */}
  <span>Nazwa</span>
</button>
```

### Krok 4: Jeśli widget - dodaj rendering
Na końcu komponentu, przed `</div>` (koło linii ~920):
```tsx
{showNowyWidget && <NowyWidget onClose={() => setShowNowyWidget(false)} />}
```

## Kolory dla Nowych Przycisków

**Już użyte**:
- 📖 Wikipedia: `rgba(59, 130, 246, 0.2)` - niebieski (#93c5fd)
- 📅 On This Day: `rgba(34, 197, 94, 0.2)` - zielony (#86efac)
- 🎵 Birthday Song: `rgba(236, 72, 153, 0.2)` - różowy (#f9a8d4)
- 📧 Kontakt: `rgba(99, 102, 241, 0.2)` - indygo (#c7d2fe)
- 🕹️ RETRO MODE: `rgba(168, 85, 247, 0.2)` - fioletowy (#e9d5ff)

**Dostępne kolory**:
- 🟡 Żółty: `rgba(234, 179, 8, 0.2)` + `#fde047`
- 🟠 Pomarańczowy: `rgba(249, 115, 22, 0.2)` + `#fdba74`
- 🔴 Czerwony: `rgba(239, 68, 68, 0.2)` + `#fca5a5`
- 🟣 Fiolet ciemny: `rgba(147, 51, 234, 0.2)` + `#d8b4fe`
- 🩵 Cyan: `rgba(6, 182, 212, 0.2)` + `#67e8f9`
- 🩶 Szary: `rgba(156, 163, 175, 0.2)` + `#d1d5db`

## Kolejność Przycisków (od góry)

Aktualna kolejność:
1. 📖 Wikipedia
2. 📅 On This Day
3. 🎵 Birthday Song
4. 📧 Kontakt
5. 🕹️ RETRO MODE

**Zasada**: Najczęściej używane funkcje na górze, akcje systemowe (kontakt, tryby) na dole.

## Przykład: Dodanie Przycisku Kalkulatora

```tsx
// 1. State (koło linii 13)
const [showCalculator, setShowCalculator] = useState(false);

// 2. Import (koło linii 4)
import CalculatorWidget from './widgets/CalculatorWidget';

// 3. Przycisk w sidebarze (po Birthday Song, przed Kontakt)
<button
  onClick={() => setShowCalculator(true)}
  style={{
    padding: '12px 16px',
    backgroundColor: 'rgba(234, 179, 8, 0.2)', // Żółty
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(234, 179, 8, 0.5)',
    borderRadius: '12px',
    color: '#fde047',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(234, 179, 8, 0.3)',
    minWidth: '160px'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.3)';
    e.currentTarget.style.transform = 'translateX(-5px)';
    e.currentTarget.style.boxShadow = '0 6px 20px rgba(234, 179, 8, 0.5)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.2)';
    e.currentTarget.style.transform = 'translateX(0)';
    e.currentTarget.style.boxShadow = '0 4px 15px rgba(234, 179, 8, 0.3)';
  }}
  title="Kalkulator naukowy"
>
  <span style={{ fontSize: '16px' }}>🔢</span>
  <span>Calculator</span>
</button>

// 4. Rendering (przed </div>)
{showCalculator && <CalculatorWidget onClose={() => setShowCalculator(false)} />}
```

## Uwagi Techniczne

### Responsywność
Sidebar automatycznie centruje się pionowo dzięki:
```tsx
top: '50%',
transform: 'translateY(-50%)'
```

### Z-Index
- Sidebar: `1001`
- Dolny pasek nawigacji: `1000`
- Widgety powinny mieć `zIndex >= 1002`

### Hover Efekty
Wszystkie przyciski mają:
- **Hover**: Przesunięcie w lewo o 5px (`translateX(-5px)`)
- **Hover**: Jaśniejsze tło (0.2 → 0.3 alpha)
- **Hover**: Silniejszy cień (0.3 → 0.5 alpha)

### Min Width
`minWidth: '160px'` zapewnia jednolity rozmiar wszystkich przycisków.

## Testowanie

Po dodaniu przycisku:
```bash
cd ZENO_WEB_CORE_APP
npm run dev
```

Sprawdź:
- ✅ Przycisk widoczny na prawej krawędzi
- ✅ Hover efekt działa
- ✅ Kliknięcie otwiera widget/wykonuje akcję
- ✅ Nie nachodzi na dolny pasek (gap 70px od dołu)
- ✅ Wszystkie przyciski mają 12px odstępu

## Commit Convention

```bash
git add src/components/WelcomePage.tsx
git commit -m "[FEATURE] Sidebar: Dodano przycisk [NAZWA]"
git push origin main
```

## Portowanie do RETRO

Po dodaniu do WelcomePage, skopiuj ten sam przycisk do:
- **Plik**: `ZENO_RETRO_APP/src/App.tsx`
- **Sekcja**: Retro Sidebar (jeśli istnieje)
- **Style**: Dopasuj do retro motywu (Windows 95 look)
