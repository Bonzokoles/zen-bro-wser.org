# 🔄 ZENO Browser - System Backupu i Przywracania

System automatycznego tworzenia kopii zapasowych i punktów przywracania dla aplikacji ZENO Browser.

## 📋 Spis treści
- [Szybki start](#szybki-start)
- [Komendy](#komendy)
- [Przykłady użycia](#przykłady-użycia)
- [Harmonogram automatyczny](#harmonogram-automatyczny)
- [Co jest backupowane](#co-jest-backupowane)

## ⚡ Szybki start

### Utworzenie backupu
```powershell
.\backup-restore.ps1 -Action backup
```

### Utworzenie nazwane go backupu
```powershell
.\backup-restore.ps1 -Action backup -BackupName "przed_aktualizacja"
```

### Lista wszystkich backupów
```powershell
.\backup-restore.ps1 -Action list
```

### Przywrócenie z backupu
```powershell
.\backup-restore.ps1 -Action restore -BackupName "przed_aktualizacja"
```

## 📝 Komendy

### 1. Backup (Tworzenie kopii)
```powershell
.\backup-restore.ps1 -Action backup [-BackupName "nazwa"]
```

**Parametry:**
- `-BackupName` (opcjonalny) - Niestandardowa nazwa backupu. Jeśli nie podano, używa `auto_TIMESTAMP`

**Przykłady:**
```powershell
# Automatyczny backup
.\backup-restore.ps1 -Action backup

# Nazwany backup
.\backup-restore.ps1 -Action backup -BackupName "przed_floating_windows"

# Backup przed deploymentem
.\backup-restore.ps1 -Action backup -BackupName "przed_deploy"
```

**Co jest backupowane:**
- ✅ Cały katalog `src/`
- ✅ Katalog `public/`
- ✅ `package.json` i `package-lock.json`
- ✅ `astro.config.mjs`
- ✅ `tailwind.config.js`
- ✅ `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- ✅ `README.md`
- ✅ Metadane git (branch, commit, status)

### 2. Restore (Przywracanie)
```powershell
.\backup-restore.ps1 -Action restore -BackupName "nazwa"
```

**Parametry:**
- `-BackupName` (wymagany) - Nazwa backupu do przywrócenia (można użyć części nazwy)

**Bezpieczeństwo:**
- 🛡️ Tworzy safety backup przed przywróceniem
- ⚠️ Wymaga potwierdzenia (wpisz 'YES')
- 📝 Pokazuje szczegóły backupu przed przywróceniem

**Przykłady:**
```powershell
# Przywróć ostatni backup
.\backup-restore.ps1 -Action restore -BackupName "auto"

# Przywróć konkretny backup
.\backup-restore.ps1 -Action restore -BackupName "przed_floating_windows"

# Przywróć po dacie
.\backup-restore.ps1 -Action restore -BackupName "2025-01-04"
```

### 3. List (Lista backupów)
```powershell
.\backup-restore.ps1 -Action list
```

**Wyświetla:**
- 📅 Data utworzenia
- 💾 Rozmiar backupu
- 📁 Liczba plików
- 🔀 Informacje git (branch, commit)
- 📂 Pełna ścieżka

### 4. Clean (Czyszczenie starych backupów)
```powershell
.\backup-restore.ps1 -Action clean [-KeepLast 10]
```

**Parametry:**
- `-KeepLast` (opcjonalny, domyślnie: 10) - Ile ostatnich automatycznych backupów zachować

**Przykłady:**
```powershell
# Zachowaj 10 ostatnich
.\backup-restore.ps1 -Action clean

# Zachowaj tylko 5 ostatnich
.\backup-restore.ps1 -Action clean -KeepLast 5

# Zachowaj 20 ostatnich
.\backup-restore.ps1 -Action clean -KeepLast 20
```

## 🎯 Przykłady użycia

### Przed ważną zmianą
```powershell
# Utwórz backup przed zmianą
.\backup-restore.ps1 -Action backup -BackupName "przed_refactor"

# Wykonaj zmiany w kodzie
# ... edycja plików ...

# Jeśli coś pójdzie nie tak, przywróć
.\backup-restore.ps1 -Action restore -BackupName "przed_refactor"
```

### Przed deploymentem
```powershell
# Backup przed deploymentem
.\backup-restore.ps1 -Action backup -BackupName "przed_deploy_$(Get-Date -Format 'yyyy-MM-dd')"

# Deploy
npm run build
# ... deploy na Cloudflare ...

# Jeśli deploy się nie udał, przywróć
.\backup-restore.ps1 -Action restore -BackupName "przed_deploy"
```

### Codzienne backupy
```powershell
# Automatyczny backup codziennie
.\backup-restore.ps1 -Action backup

# Wyczyść stare backupy (zachowaj 7 ostatnich)
.\backup-restore.ps1 -Action clean -KeepLast 7
```

### Backup przed aktualizacją dependencies
```powershell
# Backup przed npm update
.\backup-restore.ps1 -Action backup -BackupName "przed_npm_update"

# Aktualizuj dependencies
npm update

# Test aplikacji
npm run build
npm run dev

# Jeśli są problemy, przywróć
.\backup-restore.ps1 -Action restore -BackupName "przed_npm_update"
npm install  # Przywróć dependencies
```

## ⏰ Harmonogram automatyczny

### Automatyczne backupy co godzinę (Windows Task Scheduler)

1. Otwórz **Task Scheduler** (Harmonogram zadań)
2. Kliknij **Create Task** (Utwórz zadanie)
3. **General** tab:
   - Name: `ZENO Browser Hourly Backup`
   - Run whether user is logged on or not
4. **Triggers** tab:
   - New → Daily → Repeat task every: **1 hour** → for a duration of: **Indefinitely**
5. **Actions** tab:
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\backup-restore.ps1" -Action backup`

### Automatyczne czyszczenie raz dziennie

1. **Create Task**: `ZENO Browser Cleanup Old Backups`
2. **Triggers**: Daily at 23:00
3. **Actions**:
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\backup-restore.ps1" -Action clean -KeepLast 10`

### Skrypt dla szybkiego backupu (utwórz backup-now.bat)
```batch
@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0backup-restore.ps1" -Action backup
pause
```

## 📦 Co jest backupowane

### Katalogi
```
src/
├── components/      ✅ Wszystkie komponenty React
├── pages/          ✅ Strony Astro
├── services/       ✅ Serwisy (MCP, AI providers)
├── contexts/       ✅ React contexts
├── hooks/          ✅ Custom hooks
├── stores/         ✅ State management
├── types/          ✅ TypeScript types
├── data/           ✅ Dane statyczne
└── docs/           ✅ Dokumentacja

public/             ✅ Assety publiczne
```

### Pliki konfiguracyjne
```
package.json              ✅ Dependencies
package-lock.json         ✅ Locked versions
astro.config.mjs          ✅ Konfiguracja Astro
tailwind.config.js        ✅ Konfiguracja Tailwind
tsconfig.json             ✅ TypeScript config
tsconfig.app.json         ✅ App-specific TS config
tsconfig.node.json        ✅ Node-specific TS config
README.md                 ✅ Dokumentacja główna
```

### Metadane
Każdy backup zawiera `backup-metadata.json`:
```json
{
  "name": "przed_floating_windows_2025-01-04_15-30-00",
  "timestamp": "2025-01-04_15-30-00",
  "date": "2025-01-04 15:30:00",
  "totalSize": 15728640,
  "totalSizeMB": 15.0,
  "fileCount": 143,
  "gitBranch": "main",
  "gitCommit": "8cbe215",
  "hasUncommittedChanges": false,
  "backupPath": "V:\\PROTO_TYpy\\ZENO_web_CORE\\BACKUPS\\...",
  "appVersion": "ZENO_WEB_CORE_APP v1.0"
}
```

## 🚨 Ważne uwagi

### ❌ Co NIE jest backupowane
- `node_modules/` - Za duże, można odtworzyć przez `npm install`
- `dist/` - Build output, można odtworzyć przez `npm run build`
- `.git/` - Historia git, używaj git do wersjonowania
- `.vscode/` - Ustawienia edytora
- Cache files - Tymczasowe pliki

### ⚠️ Ostrzeżenia
- **Restore nadpisuje pliki** - Zawsze tworzy safety backup, ale bądź ostrożny
- **Dependencies** - Po restore uruchom `npm install` aby zsynchronizować node_modules
- **Git status** - Backup nie zastępuje git commit, używaj obu systemów
- **Rozmiar** - Backupy zajmują ~15-30 MB każdy, regularnie czyść stare

### 💡 Best practices
1. **Przed ważnymi zmianami** - Zawsze twórz nazwany backup
2. **Testuj restore** - Sprawdź czy restore działa na backupie testowym
3. **Używaj git** - Backup to dodatek, nie zamiennik git
4. **Regularne czyszczenie** - Ustaw automatyczne czyszczenie starych backupów
5. **Dokumentuj backupy** - Używaj opisowych nazw dla manualnych backupów

## 📊 Statystyki

### Typowy rozmiar backupu
- Mały projekt: ~5-10 MB
- Średni projekt: ~15-30 MB
- Duży projekt: ~50-100 MB

### Czas operacji
- Backup: ~5-15 sekund
- Restore: ~10-30 sekund
- List: <1 sekunda
- Clean: ~1-5 sekund

## 🔧 Rozwiązywanie problemów

### Problem: "Cannot find backup"
```powershell
# Zobacz wszystkie dostępne backupy
.\backup-restore.ps1 -Action list

# Użyj pełnej lub częściowej nazwy
.\backup-restore.ps1 -Action restore -BackupName "auto_2025-01-04"
```

### Problem: "Access denied" podczas restore
```powershell
# Uruchom PowerShell jako Administrator
# Lub zamknij aplikację (jeśli działa) przed restore
```

### Problem: Backup zajmuje dużo miejsca
```powershell
# Wyczyść stare backupy
.\backup-restore.ps1 -Action clean -KeepLast 5

# Usuń ręcznie folder backupów
Remove-Item "V:\PROTO_TYpy\ZENO_web_CORE\BACKUPS\*" -Recurse -Force
```

## 📞 Support

Jeśli masz problemy z systemem backupu:
1. Sprawdź czy masz uprawnienia do zapisu w folderze BACKUPS
2. Upewnij się że PowerShell może wykonywać skrypty (`Set-ExecutionPolicy RemoteSigned`)
3. Sprawdź logi błędów w PowerShell
4. Utwórz issue na GitHub

## 📄 Licencja

Ten system backupu jest częścią projektu ZENO Browser.
