# 🎨 ShortcutsWidget - Changelog

## ✨ Nowe Funkcje (Listopad 2025)

### 🔧 Edytowalne Linki
- ✏️ **Tryb edycji** - włączany przyciskiem
- ➕ **Dodawanie linków** - emoji + nazwa + URL
- 🗑️ **Usuwanie linków** - czerwony przycisk X
- ✏️ **Edycja linków** - inline editing każdego pola
- 💾 **Auto-zapis** - wszystko w localStorage
- 🔄 **Reset** - przywracanie domyślnych linków

### 🔐 Tajny Link "PErso_na.cc"
- 🎯 **4-cyfrowy PIN** - wpisywany na klawiaturze
- 👁️ **Niewidoczny** - link ukryty dopóki nie wpiszesz PIN
- ⏱️ **Auto-hide** - znika po 30 sekundach
- 🔑 **Zmiana PIN** - w trybie edycji
- ✨ **Animacja** - pulsujący gradient

## 📋 Domyślne Ustawienia

**Linki domyślne:**
- 🔍 Google → https://google.com
- 🐙 GitHub → https://github.com
- 📺 YouTube → https://youtube.com
- 🎨 ChatGPT → https://chat.openai.com

**Tajny link:**
- 🔐 PErso_na.cc → https://persona.cc
- PIN: `6498`

## 🚀 Jak Używać

### Szybki start:
```
1. Kliknij 🎨 Widgets w toolbarze
2. Widget Skrótów otworzy się automatycznie
3. Kliknij dowolny link aby otworzyć
```

### Edycja:
```
1. Kliknij ✏️ Edytuj
2. Dodaj/usuń/edytuj linki
3. Kliknij ✓ Zakończ Edycję
```

### Secret PIN:
```
1. Widget otwarty (dowolny tryb)
2. Wpisz na klawiaturze: 6-4-9-8
3. Pojawi się 🔐 PErso_na.cc
4. Kliknij aby otworzyć
```

## 📚 Dokumentacja

- **SHORTCUTS_INSTRUKCJA.md** - Pełna instrukcja dla użytkownika
- **WIDGET_GUIDE.md** - Przewodnik techniczny dla developerów

## 🔧 Dla Developerów

### Zmiana URL tajnego linku:
```typescript
// Edytuj: src/components/widgets/ShortcutsWidget.tsx
const SECRET_LINK = {
    icon: '🔐',
    label: 'PErso_na.cc',
    url: 'https://twoj-link.com'  // ← Zmień tutaj
};
```

### Zmiana domyślnych linków:
```typescript
const DEFAULT_SHORTCUTS: Shortcut[] = [
    { icon: '🔍', label: 'Google', url: 'https://google.com' },
    // Dodaj swoje...
];
```

### Zmiana domyślnego PIN:
```typescript
const [secretPin, setSecretPin] = useState<string>(() => {
    return localStorage.getItem('widget-shortcuts-pin') || '1234'; // ← Zmień
});
```

## 💾 localStorage Keys

- `widget-shortcuts` - Lista linków (JSON array)
- `widget-shortcuts-pin` - Kod PIN (string 4 cyfry)
- `widget-shortcuts-position` - Pozycja widgetu (JSON {x, y})

## 🎯 Przykłady Użycia

### Social Media Pack:
```javascript
[
  { icon: '🐦', label: 'Twitter', url: 'https://twitter.com' },
  { icon: '📘', label: 'Facebook', url: 'https://facebook.com' },
  { icon: '📷', label: 'Instagram', url: 'https://instagram.com' },
  { icon: '💼', label: 'LinkedIn', url: 'https://linkedin.com' }
]
```

### Dev Tools Pack:
```javascript
[
  { icon: '📚', label: 'Stack Overflow', url: 'https://stackoverflow.com' },
  { icon: '📦', label: 'NPM', url: 'https://npmjs.com' },
  { icon: '🎨', label: 'CodePen', url: 'https://codepen.io' },
  { icon: '🔧', label: 'DevDocs', url: 'https://devdocs.io' }
]
```

## 🐛 Known Issues

- [ ] Wszystkie instancje widgetu dzielą tę samą listę linków
- [ ] Brak drag & drop do reorderowania linków
- [ ] PIN przechowywany jako plain text (tylko obfuskacja, nie security!)

## 🔮 Future Ideas

- [ ] Import/Export linków (JSON)
- [ ] Kategoryzacja linków z folderami
- [ ] Drag & drop reordering
- [ ] Multiple secret links z różnymi PINs
- [ ] Ikonki favicon zamiast emoji
- [ ] Keyboard shortcuts (Ctrl+1, Ctrl+2...)
- [ ] Search/filter linków

---

**Wersja:** 2.0.0  
**Data:** 8 listopada 2025  
**Autor:** ZENO Development Team
