# LIBRARIES - Lokalna biblioteka metadanych

Katalog do przechowywania plików metadanych (.md, .json) indeksowanych przez CAYD_SEARCH_ENG.

## Struktura

Możesz organizować pliki w dowolnej strukturze podkatalogów, np:

```
LIBRARIES/
├── AI_MODELS/
│   ├── agent1.md
│   └── agent2.json
├── WEB_PAGES/
│   └── retro_sites.md
└── MULTIMEDIA/
    └── music_library.json
```

## Format plików

### Markdown (.md)
Używaj frontmatter YAML dla metadanych:

```markdown
---
title: "Nazwa zasobu"
tags: ["tag1", "tag2"]
url: "https://example.com"
---

Treść opisu...
```

### JSON (.json)
Struktura dowolna, np:

```json
{
  "title": "Nazwa zasobu",
  "tags": ["tag1", "tag2"],
  "url": "https://example.com",
  "description": "Opis..."
}
```

## Automatyczne uzupełnianie

Pliki mogą być dodawane:
- Ręcznie przez API `/api/saveMetadata`
- Automatycznie przez crawlery/agenty
- Z edytora frontendowego (STEP_04)

---

**Data utworzenia:** 11 listopada 2025
