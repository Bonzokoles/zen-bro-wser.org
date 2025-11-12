# Version Control System - Quick Start

## 🎯 Główna Zasada

**NIGDY NIE EDYTUJ `src/original/` BEZPOŚREDNIO!**

Zawsze pracuj w `src/working/`, testuj, waliduj, i dopiero wtedy merguj do `original/`.

---

## 📋 Setup (Jednorazowy)

### 1. Zainstaluj zależności

```bash
cd ZENO_WEB_CORE_APP
npm install
```

### 2. Utwórz strukturę katalogów

```bash
mkdir -p src/original src/working src/active src/backups
```

### 3. Przenieś obecny kod do `original/`

```bash
# Jeśli masz kod w src/components, src/services, etc.
mv src/components src/original/
mv src/services src/original/
mv src/utils src/original/

# Utwórz active/ symlinks (na Windows używamy kopii)
npm run dev:use-original components
npm run dev:use-original services
npm run dev:use-original utils
```

### 4. Zaktualizuj importy

W całym kodzie zmień:
```typescript
// STARE:
import { Browser } from './components/Browser';
import { mcpService } from './services/mcpService';

// NOWE:
import { Browser } from './active/components/Browser';
import { mcpService } from './active/services/mcpService';
```

---

## 🚀 Podstawowy Workflow

### Krok 1: Zacznij pracę nad plikiem

```bash
npm run dev:copy components/Browser.tsx
```

**Co się dzieje:**
- Kopiuje `src/original/components/Browser.tsx` → `src/working/components/Browser.tsx`
- Tworzy plik metadata: `Browser.tsx.meta.json`
- Dodaje header "WORKING VERSION" do pliku

---

### Krok 2: Przełącz się na wersję roboczą

```bash
npm run dev:use-working components/Browser.tsx
```

**Co się dzieje:**
- Kopiuje/linkuje `src/working/` → `src/active/`
- Aplikacja używa teraz wersji roboczej

---

### Krok 3: Edytuj plik

```typescript
// src/working/components/Browser.tsx

/*
 * WORKING VERSION
 * Original: src/original/components/Browser.tsx
 * Started: 2025-01-15
 * Status: IN_PROGRESS
 *
 * Changes:
 * - (Add your changes here)
 */

export function Browser() {
  // TWOJE ZMIANY TUTAJ
}
```

**Dokumentuj zmiany** w pliku `.meta.json`:

```json
{
  "changes": [
    "Added tab grouping feature",
    "Improved error handling"
  ],
  "status": "in_progress"
}
```

---

### Krok 4: Testuj

```bash
npm run test:working
npm run dev  # Sprawdź w przeglądarce
```

---

### Krok 5: Waliduj przed merge

```bash
npm run validate:working components/Browser.tsx
```

**Sprawdza:**
- ✅ TypeScript compilation
- ✅ Tests pass
- ✅ Metadata filled out
- ✅ Linting

Jeśli wszystko OK:
```
✅ VALIDATION PASSED
Ready to merge
```

---

### Krok 6: Merge do original

```bash
npm run merge:to-original components/Browser.tsx
```

**Co się dzieje:**
1. Tworzy backup oryginalnego pliku
2. Sprawdza status walidacji
3. Kopiuje working → original
4. Usuwa header "WORKING VERSION"
5. Aktualizuje CHANGELOG.md
6. Czyści working version
7. Przełącza active/ → original/

---

### Krok 7: Commituj

```bash
git add .
git commit -m "[ORIGINAL] components/Browser: Added tab grouping feature"
git push
```

---

## 🔧 Pomocne Komendy

### Porównaj wersje

```bash
npm run diff components/Browser.tsx
```

Pokazuje:
- Różnice w liniach kodu
- Różnice w rozmiarze
- Metadata
- Git diff

---

### Rollback do backupu

```bash
# Najnowszy backup
npm run rollback components/Browser.tsx --latest

# Konkretny backup
npm run rollback components/Browser.tsx --backup=1704998400000

# Interaktywny wybór
npm run rollback components/Browser.tsx
```

---

### Wróć do original (bez merge)

```bash
npm run dev:use-original components/Browser.tsx
```

Przełącza `active/` z powrotem na `original/` bez mergowania zmian.

---

## 📝 Przykład: Pełny Workflow

```bash
# 1. Zacznij pracę
npm run dev:copy components/Browser.tsx

# 2. Przełącz na working
npm run dev:use-working components/Browser.tsx

# 3. Edytuj plik
code src/working/components/Browser.tsx

# 4. Testuj
npm run dev
npm run test:working

# 5. Zobacz różnice
npm run diff components/Browser.tsx

# 6. Waliduj
npm run validate:working components/Browser.tsx

# 7. Merge
npm run merge:to-original components/Browser.tsx

# 8. Commit
git add .
git commit -m "[ORIGINAL] components/Browser: Feature X"
```

---

## ⚠️ Najczęstsze Błędy

### ❌ Edycja original/ bezpośrednio

```bash
# ZŁE:
code src/original/components/Browser.tsx

# DOBRE:
npm run dev:copy components/Browser.tsx
code src/working/components/Browser.tsx
```

---

### ❌ Merge bez walidacji

```bash
# ZŁE:
npm run merge:to-original components/Browser.tsx

# DOBRE:
npm run validate:working components/Browser.tsx
npm run merge:to-original components/Browser.tsx
```

---

### ❌ Brak dokumentacji zmian

```json
// ZŁE:
{
  "changes": []
}

// DOBRE:
{
  "changes": [
    "Fixed bug in tab switching",
    "Added keyboard shortcuts"
  ]
}
```

---

## 💡 Pro Tips

### 1. Pracuj nad wieloma plikami jednocześnie

```bash
npm run dev:copy components/Browser.tsx
npm run dev:copy services/mcpService.ts

npm run dev:use-working components/Browser.tsx
npm run dev:use-working services/mcpService.ts
```

---

### 2. Zobacz wszystkie working versions

```bash
ls src/working/
```

---

### 3. Zobacz wszystkie backupy

```bash
ls src/backups/
```

---

### 4. Automatyzuj z git hooks

Dodaj do `.git/hooks/pre-commit`:
```bash
#!/bin/bash

# Check if any original/ files were modified directly
if git diff --cached --name-only | grep "src/original/"; then
  echo "❌ ERROR: Direct modification of src/original/ detected!"
  echo "   Use: npm run dev:copy <file>"
  exit 1
fi
```

---

## 🆘 Awaryjne Procedury

### Przypadkowo edytowałem original/

```bash
# 1. Nie commituj!
git checkout src/original/components/Browser.tsx

# 2. Zacznij od nowa
npm run dev:copy components/Browser.tsx
```

---

### Working version zepsuty

```bash
# 1. Usuń working
rm src/working/components/Browser.tsx
rm src/working/components/Browser.tsx.meta.json

# 2. Zacznij od nowa
npm run dev:copy components/Browser.tsx
```

---

### Merge poszedł źle

```bash
# Rollback do ostatniego backupu
npm run rollback components/Browser.tsx --latest
```

---

## ✅ Checklist przed Merge

- [ ] Wszystkie zmiany udokumentowane w `.meta.json`
- [ ] TypeScript kompiluje się bez błędów
- [ ] Testy przechodzą
- [ ] Aplikacja działa w przeglądarce
- [ ] Kod sprawdzony przez `npm run diff`
- [ ] Validation passed: `npm run validate:working`

---

## 🎓 Dalsze Informacje

Zobacz pełną dokumentację: `docs/core/VERSION_CONTROL.md`
