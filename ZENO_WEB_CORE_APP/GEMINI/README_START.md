# 🚀 ZENON_BRO - Quick Start Guide

## Uruchamianie

### Opcja 1: Skrót na pulpicie ⭐
Kliknij dwukrotnie: **🚀 ZENON Browser** na pulpicie

### Opcja 2: Pliki BAT w folderze
- `START_ZENON.bat` - uruchamia w przeglądarce (localhost:5173)
- `START_ZENON_ELECTRON.bat` - uruchamia jako aplikację desktop

### Opcja 3: Manualnie
```bash
cd zenon-browser
npm install        # tylko pierwszym razem
npm run dev        # przeglądarka
# LUB
npm run electron   # aplikacja desktop
```

## Co zostało dodane?

### ⭐ Zakładki (20 linków w 4 kategoriach):

**🔍 Alternative Search (5)**
- Marginalia Search - stare, tekstowe strony
- Wiby - retro internet z lat 90
- Old'aVista - archiwa starych stron
- Stract - wyszukiwarka z filtrami Optics
- Mojeek - prywatna, niezależna wyszukiwarka

**🎬 Film Database (4)**
- Letterboxd - społecznościowy dziennik filmowy
- TMDb - otwarta baza filmów
- JustWatch - gdzie streamować filmy
- AllMovie - klasyczna baza filmowa

**💼 Business Intelligence (4)**
- AlphaSense - AI research dla firm
- PitchBook - private market intelligence
- CB Insights - tech market analysis
- Crunchbase - startup funding data

**🤖 HuggingFace Spaces (5)**
- Miragic Speed-Painting - AI video generation
- Granite 4.0 WebGPU - IBM LLM w przeglądarce
- Hunyuan3D 2.1 - generacja 3D (Tencent)
- AgentFlow Project - trainable agentic framework
- AgentFlow Paper - research paper

## Jak używać zakładek?

1. Uruchom ZENON Browser
2. Kliknij **⭐ Bookmarks** w toolbar (lewa góra)
3. Wybierz kategorię
4. Kliknij zakładkę → otwiera się w aktywnej karcie

## Lokalizacja plików

```
ZENON_BRO/
├── START_ZENON.bat              ← Uruchom to!
├── START_ZENON_ELECTRON.bat     ← Wersja desktop
├── create_desktop_shortcut.vbs  ← Tworzenie skrótu
├── BOOKMARKS_CHANGELOG.md       ← Historia zmian
└── zenon-browser/
    ├── src/
    │   ├── data/
    │   │   └── bookmarks.json   ← Zakładki (możesz edytować!)
    │   └── components/
    │       └── Bookmarks/
    │           └── index.jsx     ← Komponent bookmarków
    └── package.json
```

## Dodawanie własnych zakładek

Edytuj plik: `zenon-browser/src/data/bookmarks.json`

Format:
```json
{
  "name": "🎯 Twoja Kategoria",
  "bookmarks": [
    {
      "title": "Nazwa",
      "url": "https://...",
      "description": "Opis"
    }
  ]
}
```

## Troubleshooting

**Problem:** Skrót nie działa
**Rozwiązanie:** Uruchom `create_desktop_shortcut.vbs` ponownie

**Problem:** Błąd "npm not found"
**Rozwiązanie:** Zainstaluj Node.js z nodejs.org

**Problem:** Port 5173 zajęty
**Rozwiązanie:** Zmień port w `vite.config.js` lub zamknij inne Vite

## Kontakt
Pytania? → Bonzo wie co robić 😎
