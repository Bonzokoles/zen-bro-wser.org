# 📁 Widget System - Dokumentacja

## 📚 Spis Plików

### 🔧 Przewodniki Techniczne

#### **[WIDGET_GUIDE.md](./WIDGET_GUIDE.md)**
Kompletny przewodnik dla developerów tworzących nowe widgety.

**Zawartość:**
- Architektura systemu widżetów
- Jak stworzyć nowy widget (krok po kroku)
- System skórek (4 motywy: modern, classic, minimal, retro)
- Przykłady widżetów (Clock, Shortcuts, MusicPlayer)
- Integracja z Browser.tsx
- Najlepsze praktyki
- Checklisty i debugging tips
- FAQ dla developerów

**Dla kogo:** Programiści dodający nowe widgety do systemu

---

### 👤 Instrukcje Użytkownika

#### **[SHORTCUTS_INSTRUKCJA.md](./SHORTCUTS_INSTRUKCJA.md)**
Pełna instrukcja obsługi ShortcutsWidget dla końcowych użytkowników.

**Zawartość:**
- Jak edytować linki (dodawanie/usuwanie/edycja)
- Tajny link "PErso_na.cc" z kodem PIN
- Zmiana kodu PIN (domyślnie 6498)
- Przywracanie domyślnych ustawień
- Przykłady użycia (Social Media, Dev Tools, Google Services)
- FAQ - najczęstsze pytania
- Rozwiązywanie problemów
- Wskazówki Pro

**Dla kogo:** Użytkownicy konfigurujący swoje skróty

---

### 📝 Historia Zmian

#### **[SHORTCUTS_CHANGELOG.md](./SHORTCUTS_CHANGELOG.md)**
Changelog i quick reference dla ShortcutsWidget.

**Zawartość:**
- Nowe funkcje (Listopad 2025)
- Domyślne ustawienia
- Szybki start
- Instrukcje dla developerów (zmiana URL, PIN, domyślnych linków)
- localStorage keys
- Przykłady presetów
- Known issues
- Future ideas

**Dla kogo:** Deweloperzy i użytkownicy potrzebujący szybkiego odniesienia

---

## 🎯 Szybki Dostęp

### Dla Użytkowników
1. **Chcę skonfigurować moje linki** → [SHORTCUTS_INSTRUKCJA.md](./SHORTCUTS_INSTRUKCJA.md)
2. **Jak odblokować tajny link?** → [SHORTCUTS_INSTRUKCJA.md](./SHORTCUTS_INSTRUKCJA.md#-tajny-link---secret-feature)
3. **Zgubiłem kod PIN** → [SHORTCUTS_INSTRUKCJA.md](./SHORTCUTS_INSTRUKCJA.md#odzyskanie-zapomnianego-pin)

### Dla Developerów
1. **Chcę stworzyć nowy widget** → [WIDGET_GUIDE.md](./WIDGET_GUIDE.md#jak-stworzyć-nowy-widget)
2. **Jak działa system skórek?** → [WIDGET_GUIDE.md](./WIDGET_GUIDE.md#system-skórek-skins)
3. **Przykłady kodu** → [WIDGET_GUIDE.md](./WIDGET_GUIDE.md#przykłady-widżetów)
4. **Checklist tworzenia widgetu** → [WIDGET_GUIDE.md](./WIDGET_GUIDE.md#checklisty)

---

## 🚀 Quick Start

### Dla Użytkownika
```
1. Kliknij 🎨 Widgets w toolbarze przeglądarki
2. Widget Skrótów otworzy się automatycznie
3. Kliknij ✏️ Edytuj aby dodać swoje linki
4. Wpisz 6498 na klawiaturze aby odblokować tajny link
```

### Dla Developera
```bash
# 1. Skopiuj szablon
cp src/components/widgets/WIDGET_TEMPLATE.tsx src/components/widgets/MyWidget.tsx

# 2. Edytuj widget
code src/components/widgets/MyWidget.tsx

# 3. Dodaj do Browser.tsx
# - Import: import MyWidget from './widgets/MyWidget';
# - State: const [isMyWidgetOpen, setIsMyWidgetOpen] = useState(false);
# - Render: {isMyWidgetOpen && <MyWidget onClose={() => setIsMyWidgetOpen(false)} />}

# 4. Testuj
npm run dev
```

---

## 📊 System Widżetów - Przegląd

### Dostępne Widżety

| Widget | Plik | Opis | Funkcje |
|--------|------|------|---------|
| **ClockWidget** | `ClockWidget.tsx` | Zegar czasu rzeczywistego | Godzina, data, sekundy |
| **ShortcutsWidget** | `ShortcutsWidget.tsx` | Edytowalne skróty | Dodawanie/usuwanie linków, tajny PIN |
| **MusicPlayerWidget** | `MusicPlayerWidget.tsx` | Webamp player | MP3 playback, playlista |

### Wspólne Funkcje (WidgetContainer)

Wszystkie widgety dziedziczą:
- ✅ Drag & drop (przeciąganie)
- ✅ Minimize/maximize (─ / ▢)
- ✅ Close (✕)
- ✅ Skin selector (4 motywy)
- ✅ Always-on-top (z-index 10000)
- ✅ Zapisywanie pozycji (localStorage)

### System Skórek

| Skin | Kolor | Opis |
|------|-------|------|
| **Modern** | Biały | Minimalistyczny, jasny |
| **Classic** | Zielony | Matrix-style, retro terminal |
| **Minimal** | Subtelny biały | Bardzo delikatny, niewidoczny |
| **Retro** | Żółty | Cyberpunk, neon |

---

## 🔧 Dla Developerów

### Struktura Plików
```
src/components/widgets/
├── WidgetContainer.tsx       # Core - uniwersalny kontener
├── ClockWidget.tsx           # Widget zegara
├── ShortcutsWidget.tsx       # Widget skrótów (edytowalny + PIN)
├── MusicPlayerWidget.tsx     # Webamp music player
└── WIDGET_TEMPLATE.tsx       # Szablon do kopiowania
```

### Dodawanie Nowego Widgetu

**4 kroki:**
1. Skopiuj `WIDGET_TEMPLATE.tsx`
2. Zdefiniuj Props i state
3. Użyj `WidgetContainer` jako wrappera
4. Dodaj do `Browser.tsx`

**Szczegóły:** [WIDGET_GUIDE.md - Jak Stworzyć Nowy Widget](./WIDGET_GUIDE.md#jak-stworzyć-nowy-widget)

### localStorage Keys

| Key | Zawartość | Format |
|-----|-----------|--------|
| `widget-{id}-position` | Pozycja widgetu | `{x: number, y: number}` |
| `widget-shortcuts` | Lista linków | `Shortcut[]` (JSON) |
| `widget-shortcuts-pin` | Kod PIN | `string` (4 cyfry) |

### TypeScript Typy

```typescript
// Skórki
type WidgetSkin = 'modern' | 'classic' | 'minimal' | 'retro';

// Temat
interface WidgetTheme {
  bg: string;      // rgba background
  text: string;    // rgba text
  border: string;  // rgba border
  accent: string;  // rgba accent
}

// Link (ShortcutsWidget)
interface Shortcut {
  icon: string;
  label: string;
  url: string;
}
```

---

## 🐛 Zgłaszanie Błędów

**Znalazłeś bug?**
1. Sprawdź [WIDGET_GUIDE.md - FAQ](./WIDGET_GUIDE.md#faq)
2. Sprawdź [SHORTCUTS_INSTRUKCJA.md - Rozwiązywanie Problemów](./SHORTCUTS_INSTRUKCJA.md#-rozwiązywanie-problemów)
3. Otwórz issue na GitHub

**Masz pomysł na nowy widget?**
- Sprawdź [WIDGET_GUIDE.md - Przykładowe Pomysły](./WIDGET_GUIDE.md#przykładowe-pomysły-na-widżety)
- Otwórz GitHub Discussion

---

## 📖 Dodatkowa Dokumentacja

### W Folderze Głównym
- `README.md` - Główny README projektu
- `DEVELOPMENT_PLAN.md` - Plan rozwoju
- `VERSION_CONTROL_QUICKSTART.md` - System kontroli wersji

### W Folderze docs/
- `docs/README.md` - Główny indeks dokumentacji
- `docs/core/` - Dokumentacja core systemu
- `docs/agents/` - Dokumentacja systemu agentów

---

## 📞 Kontakt i Wsparcie

**Dokumentacja:** Ten folder  
**Kod źródłowy:** `src/components/widgets/`  
**Issues:** GitHub Issues  
**Dyskusje:** GitHub Discussions

---

**Ostatnia aktualizacja:** 8 listopada 2025  
**Wersja systemu widżetów:** 2.0.0  
**Autor:** ZENO Development Team

---

**Happy Widget Building! 🎨✨**
