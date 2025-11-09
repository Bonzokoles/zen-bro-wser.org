# 🔗 Widget Skrótów - Instrukcja dla Użytkownika

## 📌 Co to jest?

Widget Skrótów to konfigurowalny panel szybkich linków do Twoich ulubionych stron. Możesz:
- ✏️ Dodawać własne linki
- 🗑️ Usuwać niepotrzebne
- ✨ Edytować istniejące
- 🔐 Mieć tajny link odblokowywany kodem PIN

---

## 🚀 Szybki Start

### Otwarcie widgetu
1. Kliknij przycisk `🎨 Widgets` na pasku narzędzi
2. Widget Skrótów otworzy się automatycznie (🔗 Skróty)

### Używanie linków
- **Kliknij przycisk z nazwą strony** aby otworzyć w nowej karcie
- Linki domyślne: Google, GitHub, YouTube, ChatGPT

---

## ✏️ Edycja Linków

### Włączenie trybu edycji
```
Kliknij przycisk: ✏️ Edytuj (na górze widgetu)
```

### Dodanie nowego linku
1. W trybie edycji przewiń w dół do sekcji `➕ Dodaj Nowy:`
2. Wypełnij pola:
   - **Emoji**: Wpisz lub wklej emoji (np. 🌐, 🎮, 💼)
     * Windows: `Win + .` (kropka)
     * Mac: `Cmd + Ctrl + Space`
   - **Nazwa**: Wpisz nazwę strony (np. "Facebook")
   - **URL**: Pełny adres (np. "https://facebook.com")
3. Kliknij `✓ Dodaj`
4. Link pojawi się na liście

**Przykład:**
```
Emoji: 📧
Nazwa: Gmail
URL: https://mail.google.com
```

### Edycja istniejącego linku
1. W trybie edycji kliknij `✏️` obok linku
2. Zmień dowolne pole (emoji, nazwa, URL)
3. Zmiany zapisują się automatycznie
4. Kliknij ponownie `✏️` aby zamknąć edycję

### Usunięcie linku
1. W trybie edycji kliknij czerwony przycisk `✕` obok linku
2. Link zostanie natychmiast usunięty (bez potwierdzenia!)

### Zakończenie edycji
```
Kliknij przycisk: ✓ Zakończ Edycję
```
Wszystkie zmiany są automatycznie zapisane.

---

## 🔐 Tajny Link - Secret Feature!

### Co to jest?
Ukryty link, który pojawia się tylko po wpisaniu sekretnego kodu PIN na klawiaturze.

### Domyślne ustawienia
- **Nazwa**: PErso_na.cc
- **Domyślny PIN**: `6498`
- **URL**: https://persona.cc (możesz zmienić w kodzie)

### Jak odblokować?

#### Krok 1: Upewnij się że widget jest otwarty
Widget nie musi być w trybie edycji - może być w normalnym trybie.

#### Krok 2: Wpisz kod PIN na klawiaturze
```
Szybko wpisz cyfry: 6 → 4 → 9 → 8
```

**WAŻNE:**
- ⏱️ Między cyframi max 2 sekundy przerwy
- 🎯 Nie klikaj nigdzie - po prostu pisz cyfry
- 🔢 System sprawdza ostatnie 4 wpisane cyfry

#### Krok 3: Pojawi się tajny link
- Przycisk `🔐 PErso_na.cc` z animacją pulsowania
- Specjalny gradient tła (fioletowo-różowy)

#### Krok 4: Kliknij aby otworzyć
- Link otworzy się w nowej karcie
- Po 30 sekundach przycisk znika
- Aby ponownie zobaczyć - wpisz PIN jeszcze raz

### Zmiana kodu PIN

1. **Włącz tryb edycji** (`✏️ Edytuj`)
2. **Przewiń w dół** do sekcji ustawień
3. **Kliknij** przycisk `🔐 Zmień PIN (6498)`
4. **Wpisz** nowy 4-cyfrowy PIN (np. `1234`)
5. **Potwierdź** - pojawi się komunikat z nowym PIN
6. **ZAPAMIĘTAJ** nowy PIN!

**Przykład:**
```
Stary PIN: 6498
Nowy PIN: 2580
Od teraz wpisz: 2-5-8-0 aby odblokować
```

### Odzyskanie zapomnianego PIN

**Metoda 1: Sprawdź w trybie edycji**
- Włącz tryb edycji
- Przewiń w dół
- PIN widoczny w przycisku: `🔐 Zmień PIN (XXXX)`

**Metoda 2: Konsola przeglądarki**
```javascript
// Otwórz konsolę (F12)
localStorage.getItem('widget-shortcuts-pin')
// Wyświetli: "6498" (lub twój PIN)
```

**Metoda 3: Reset do domyślnego**
```javascript
// Otwórz konsolę (F12)
localStorage.removeItem('widget-shortcuts-pin')
// Od teraz PIN to: 6498
```

---

## 🔄 Przywracanie Domyślnych

### Co się resetuje?
Przywrócenie usuwa wszystkie dodane linki i wraca do:
- 🔍 Google
- 🐙 GitHub
- 📺 YouTube
- 🎨 ChatGPT

**UWAGA:** Kod PIN NIE jest resetowany!

### Jak przywrócić?
1. Włącz tryb edycji
2. Przewiń w dół
3. Kliknij `🔄 Przywróć Domyślne`
4. Potwierdź w oknie dialogowym

---

## 💡 Przykłady Użycia

### Przykład 1: Social Media Panel
```
➕ Dodaj:
🐦 Twitter     → https://twitter.com
📘 Facebook    → https://facebook.com
📷 Instagram   → https://instagram.com
💼 LinkedIn    → https://linkedin.com
```

### Przykład 2: Narzędzia Programisty
```
➕ Dodaj:
📚 Stack Overflow → https://stackoverflow.com
🐱 GitHub Gist    → https://gist.github.com
📦 NPM            → https://npmjs.com
🎨 CodePen        → https://codepen.io
```

### Przykład 3: Usługi Google
```
➕ Dodaj:
📧 Gmail       → https://mail.google.com
📅 Calendar    → https://calendar.google.com
💾 Drive       → https://drive.google.com
📝 Docs        → https://docs.google.com
```

### Przykład 4: Rozrywka
```
➕ Dodaj:
🎬 Netflix     → https://netflix.com
🎵 Spotify     → https://spotify.com
🎮 Steam       → https://store.steampowered.com
📺 Twitch      → https://twitch.tv
```

---

## ❓ FAQ - Najczęstsze Pytania

### ❔ Ile linków mogę dodać?
Teoretycznie bez limitu, ale widget automatycznie dostosowuje wysokość. Powyżej ~10 linków pojawi się scrollbar.

### ❔ Czy linki zapisują się po zamknięciu przeglądarki?
Tak! Wszystko zapisywane w localStorage. Linki pozostają nawet po restarcie komputera.

### ❔ Czy mogę mieć kilka widgetów z różnymi linkami?
Aktualnie wszystkie instancje ShortcutsWidget dzielą tę samą listę linków (localStorage).

### ❔ Co jeśli wpiszę zły URL?
Link może nie zadziałać. Upewnij się że URL zaczyna się od `https://` lub `http://`.

### ❔ Czy mogę usunąć wszystkie linki?
Tak, ale wtedy widget będzie pusty. Użyj `🔄 Przywróć Domyślne` aby przywrócić.

### ❔ Tajny link nie pojawia się po wpisaniu PIN - dlaczego?
Sprawdź:
- ✅ Widget jest otwarty
- ✅ Wpisujesz cyfry szybko (max 2s przerwy)
- ✅ Nie masz aktywnego pola tekstowego
- ✅ Sprawdź aktualny PIN w trybie edycji

### ❔ Jak zmienić URL tajnego linku?
Musisz edytować kod w pliku `ShortcutsWidget.tsx`:
```typescript
const SECRET_LINK = {
    icon: '🔐',
    label: 'Twoja Nazwa',
    url: 'https://twoj-link.com'  // ← Zmień tutaj
};
```

### ❔ Czy PIN jest bezpieczny?
PIN przechowywany jest w localStorage jako zwykły tekst - to zabezpieczenie przed przypadkowym otwarciem, NIE jest to kryptograficzne zabezpieczenie!

---

## 🐛 Rozwiązywanie Problemów

### Problem: "Linki zniknęły po odświeżeniu"
**Przyczyny:**
- Przeglądarka w trybie prywatnym/incognito
- Wyczyszczono localStorage
- Blokada cookies/localStorage przez przeglądarkę

**Rozwiązanie:**
- Nie używaj trybu prywatnego
- Sprawdź ustawienia prywatności przeglądarki
- Dodaj linki ponownie

### Problem: "Nie mogę kliknąć przycisków w trybie edycji"
**Przyczyna:** Normalne przyciski linków są nieaktywne w trybie edycji

**Rozwiązanie:**
- Zakończ edycję przyciskiem `✓ Zakończ Edycję`
- Wtedy możesz klikać linki

### Problem: "Widget nie zapisuje zmian"
**Przyczyna:** Błąd JavaScript lub zablokowany localStorage

**Rozwiązanie:**
1. Otwórz konsolę (F12)
2. Sprawdź czy są błędy (czerwone komunikaty)
3. Spróbuj:
```javascript
localStorage.setItem('test', '123')
localStorage.getItem('test')
```
4. Jeśli działa - przeładuj stronę

### Problem: "Emoji nie wyświetlają się poprawnie"
**Przyczyna:** Brak wsparcia dla niektórych emoji w systemie

**Rozwiązanie:**
- Użyj podstawowych emoji (😀 👍 🔥 ⭐)
- Zaktualizuj system operacyjny
- Zmień emoji na inne

---

## 🎯 Wskazówki Pro

### 💡 Tip 1: Organizuj według kategorii
Pogrupuj linki tematycznie i użyj odpowiednich emoji:
```
📧 Kategoria Mail
📝 Kategoria Notatki
🎨 Kategoria Design
💻 Kategoria Dev Tools
```

### 💡 Tip 2: Skróty klawiaturowe stron
Dodaj bezpośrednie linki do funkcji:
```
Gmail Compose: https://mail.google.com/mail/?view=cm&fs=1&tf=1
GitHub New Repo: https://github.com/new
YouTube Upload: https://www.youtube.com/upload
```

### 💡 Tip 3: Lokalne aplikacje (jeśli Electron)
```
🗂️ Explorer → file:///C:/
📁 Projekty → file:///V:/PROTO_TYpy/
```

### 💡 Tip 4: Użyj kolorowych emoji dla lepszej widoczności
```
🔴 Ważne
🟢 Codzienne
🟡 Narzędzia
🔵 Social
```

---

## 📞 Wsparcie

**Znalazłeś błąd?** Zgłoś na GitHub Issues

**Masz pomysł na funkcję?** Otwórz GitHub Discussion

**Potrzebujesz pomocy?** Sprawdź pełną dokumentację w `WIDGET_GUIDE.md`

---

**Miłego korzystania! 🚀**

_Wersja: 1.0.0 | Data: Listopad 2025_
