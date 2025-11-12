# Version Control System - Dual Version Development

## Zasada: Nigdy nie niszczymy działającego kodu

Każdy plik/funkcja/komponent istnieje w dwóch wersjach:
- **Original** - stabilna, przetestowana wersja
- **Working** - wersja robocza z nowymi zmianami

## Struktura katalogów

```
src/
├── original/           # Stabilne wersje (NIGDY nie modyfikować bezpośrednio)
│   ├── components/
│   ├── services/
│   └── utils/
├── working/            # Wersje robocze (tutaj pracujemy)
│   ├── components/
│   ├── services/
│   └── utils/
└── active/             # Symlinki do aktywnej wersji
    ├── components/     -> ../original/components (domyślnie)
    ├── services/
    └── utils/
```

## Workflow rozwoju

### 1. Rozpoczęcie pracy nad funkcją

```bash
# Kopiuj z original do working
npm run dev:copy components/Browser.tsx

# Lub dla całego modułu
npm run dev:copy services/mcpService.ts
```

**Skrypt:** `scripts/dev-copy.js`
```javascript
const fs = require('fs-extra');
const path = require('path');

const component = process.argv[2];
const originalPath = path.join('src/original', component);
const workingPath = path.join('src/working', component);

// Kopiuj original -> working
fs.copySync(originalPath, workingPath);

// Dodaj prefix do nazwy pliku
const renamed = workingPath.replace(/\.tsx?$/, '.working$&');
fs.renameSync(workingPath, renamed);

// Utwórz metadane
fs.writeJsonSync(renamed + '.meta.json', {
  originalHash: getFileHash(originalPath),
  copiedAt: new Date().toISOString(),
  author: process.env.USER || 'unknown',
  status: 'in_progress'
});

console.log(`✅ Created working version: ${renamed}`);
```

### 2. Praca nad zmianami

```typescript
// src/working/components/Browser.working.tsx

// METADATA
/*
 * WORKING VERSION
 * Original: src/original/components/Browser.tsx
 * Started: 2025-01-15
 * Changes:
 * - Added tab grouping feature
 * - Improved error handling
 * Status: IN_PROGRESS
 */

export function Browser() {
  // Twoje zmiany tutaj
}
```

### 3. Testowanie wersji roboczej

```bash
# Przełącz na wersję roboczą
npm run dev:use-working components/Browser.tsx

# Uruchom testy
npm run test:working

# Uruchom aplikację
npm run dev
```

**Skrypt:** `scripts/use-working.js`
```javascript
// Aktualizuj symlink active/ -> working/
const component = process.argv[2];
const activePath = path.join('src/active', component);
const workingPath = path.join('../working', component);

fs.removeSync(activePath);
fs.symlinkSync(workingPath, activePath);

console.log(`✅ Now using working version of ${component}`);
```

### 4. Walidacja przed merge

```bash
# Automatyczna walidacja
npm run validate:working components/Browser.tsx
```

**Checks:**
- ✅ Wszystkie testy przechodzą
- ✅ Brak błędów TypeScript
- ✅ Bundle size nie wzrósł >10%
- ✅ Performance nie spadła >5%
- ✅ Dokumentacja zaktualizowana
- ✅ Changelog wypełniony

### 5. Merge do original (gdy wszystko działa)

```bash
# Merge working -> original
npm run merge:to-original components/Browser.tsx
```

**Skrypt:** `scripts/merge-to-original.js`
```javascript
const component = process.argv[2];
const workingPath = path.join('src/working', component);
const originalPath = path.join('src/original', component);
const backupPath = path.join('src/backups',
  component.replace(/\.(tsx?)$/, `.backup-${Date.now()}.$1`)
);

// 1. Backup original
fs.copySync(originalPath, backupPath);

// 2. Sprawdź czy working przeszło walidację
const meta = fs.readJsonSync(workingPath + '.meta.json');
if (meta.status !== 'validated') {
  console.error('❌ Working version not validated!');
  process.exit(1);
}

// 3. Replace original with working
fs.copySync(workingPath, originalPath);

// 4. Aktualizuj changelog
updateChangelog(component, meta.changes);

// 5. Cleanup working version
fs.removeSync(workingPath);
fs.removeSync(workingPath + '.meta.json');

console.log(`✅ Merged to original. Backup: ${backupPath}`);
```

### 6. Rollback (jeśli coś poszło nie tak)

```bash
# Wróć do ostatniego backupu
npm run rollback components/Browser.tsx

# Lub do konkretnego backupu
npm run rollback components/Browser.tsx --backup=1704998400000
```

## Git Integration

### Branch Strategy

```
main                    # Tylko original/ versions
  ├── dev               # Working versions development
  ├── feature/*         # Konkretne feature branches
  └── hotfix/*          # Pilne poprawki
```

### Commit Convention

```
[WORKING] components/Browser: Add tab grouping
[ORIGINAL] components/Browser: Merge tab grouping feature
[ROLLBACK] components/Browser: Revert to backup-1704998400000
[BACKUP] components/Browser: Pre-merge backup
```

### .gitignore

```gitignore
# Working versions (nie commitujemy do main)
src/working/**/*.working.*
src/working/**/*.meta.json

# Backups (lokalne)
src/backups/*

# Active symlinks (auto-generowane)
src/active/
```

## Automated Validation System

### Pre-merge checks

**`.github/workflows/validate-working.yml`**
```yaml
name: Validate Working Version

on:
  pull_request:
    paths:
      - 'src/working/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm run test:working

      - name: Check bundle size
        run: npm run build && npm run size-check

      - name: Performance benchmark
        run: npm run benchmark

      - name: Comment results
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Working version validated'
            })
```

## Version Comparison Tool

```bash
# Porównaj working vs original
npm run diff components/Browser.tsx
```

**Output:**
```diff
File: src/components/Browser.tsx

Lines changed: 45 added, 12 removed, 23 modified
Bundle size: +3.2KB (+2.1%)
Performance: -1.2% (within threshold)

Changes:
+ Added: Tab grouping functionality
+ Added: Error boundary
~ Modified: State management (class -> hooks)
- Removed: Deprecated prop types

Tests:
✅ All 24 tests passing
✅ Coverage: 87% (+2%)

Recommendation: ✅ SAFE TO MERGE
```

## Metadata Files

### .meta.json structure

```json
{
  "originalHash": "a1b2c3d4e5f6",
  "workingHash": "f6e5d4c3b2a1",
  "copiedAt": "2025-01-15T10:30:00Z",
  "modifiedAt": "2025-01-15T14:20:00Z",
  "author": "developer",
  "status": "in_progress | validated | merged | rolled_back",
  "changes": [
    "Added tab grouping feature",
    "Improved error handling",
    "Updated documentation"
  ],
  "tests": {
    "unit": "passed",
    "integration": "passed",
    "e2e": "passed"
  },
  "performance": {
    "bundleSize": "+3.2KB",
    "loadTime": "-1.2%"
  },
  "relatedFiles": [
    "src/components/TabGroups.tsx",
    "src/services/tab-service.ts"
  ]
}
```

## Emergency Procedures

### Krytyczny bug w original

1. **Natychmiastowy rollback**
```bash
npm run emergency:rollback components/Browser.tsx
```

2. **Hotfix branch**
```bash
git checkout -b hotfix/browser-crash
```

3. **Fix w working**
```bash
npm run dev:copy components/Browser.tsx
# Napraw bug
npm run validate:working components/Browser.tsx
npm run merge:to-original components/Browser.tsx
```

4. **Deploy**
```bash
npm run deploy:hotfix
```

### Konflikt mergowania

```bash
# Pokazuje różnice
npm run conflict:resolve components/Browser.tsx

# Wybierz wersję
npm run conflict:use-original   # lub
npm run conflict:use-working    # lub
npm run conflict:manual         # manualna fuzja
```

## Best Practices

### ✅ DO

1. Zawsze kopiuj original -> working przed zmianami
2. Testuj working version przed merge
3. Dokumentuj wszystkie zmiany w .meta.json
4. Używaj walidacji automatycznej
5. Twórz backupy przed merge
6. Commituj tylko original/ do main branch

### ❌ DON'T

1. Nigdy nie edytuj original/ bezpośrednio
2. Nie merguj bez walidacji
3. Nie usuwaj backupów przed 30 dniami
4. Nie commituj working/ do main
5. Nie skipuj testów
6. Nie merguj jeśli CI/CD failed

## Monitoring & Alerts

### Automatic notifications

```javascript
// scripts/monitor.js
const Watcher = require('chokidar').watch;

// Alert gdy ktoś edytuje original/ bezpośrednio
Watcher('src/original/**/*').on('change', (path) => {
  console.error(`⚠️  WARNING: Direct edit to original file: ${path}`);
  sendSlackAlert(`Direct edit detected: ${path}`);

  // Auto-rollback option
  if (process.env.AUTO_PROTECT === 'true') {
    exec(`git checkout ${path}`);
    console.log(`✅ Auto-reverted: ${path}`);
  }
});
```

## Package.json scripts

```json
{
  "scripts": {
    "dev:copy": "node scripts/dev-copy.js",
    "dev:use-working": "node scripts/use-working.js",
    "dev:use-original": "node scripts/use-original.js",
    "validate:working": "node scripts/validate-working.js",
    "merge:to-original": "node scripts/merge-to-original.js",
    "rollback": "node scripts/rollback.js",
    "diff": "node scripts/diff-versions.js",
    "conflict:resolve": "node scripts/resolve-conflict.js",
    "emergency:rollback": "node scripts/emergency-rollback.js",
    "test:working": "vitest --config vitest.working.config.ts",
    "test:original": "vitest --config vitest.original.config.ts"
  }
}
```

## VSCode Integration

### Settings

```json
// .vscode/settings.json
{
  "files.exclude": {
    "src/working/**/*.meta.json": true,
    "src/backups/**": true
  },
  "files.associations": {
    "*.working.tsx": "typescriptreact",
    "*.working.ts": "typescript"
  },
  "editor.rulers": [80, 120],
  "git.ignoredRepositories": ["src/working", "src/backups"]
}
```

### Snippets

```json
// .vscode/snippets.json
{
  "Working Version Header": {
    "prefix": "wv",
    "body": [
      "/*",
      " * WORKING VERSION",
      " * Original: src/original/${1:path}",
      " * Started: ${CURRENT_DATE}",
      " * Changes:",
      " * - ${2:description}",
      " * Status: IN_PROGRESS",
      " */"
    ]
  }
}
```

## Summary

Ten system gwarantuje:
- ✅ Zawsze mamy działającą wersję (original/)
- ✅ Bezpieczne eksperymentowanie (working/)
- ✅ Łatwy rollback (backups/)
- ✅ Automatyczna walidacja (CI/CD)
- ✅ Pełna historia zmian (git + metadata)
- ✅ Zero ryzyka utraty działającego kodu
