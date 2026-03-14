# 🔐 Przewodnik Integracji Zabezpieczeń

Ten dokument opisuje jak zintegrować nowe systemy zabezpieczeń z ZENO Browser.

---

## 📦 Nowe Moduły

### 1. License Manager (`src/services/security/licenseManager.ts`)
- Weryfikacja licencji online/offline
- Machine ID binding (fingerprinting)
- Szyfrowanie licencji w localStorage
- Okresowa walidacja (24h)

### 2. Bookmark Manager (`src/services/storage/bookmarkManager.ts`)
- Foldery i zagnieżdżone foldery
- Sortowanie i filtrowanie
- Import/Export (JSON + HTML Netscape format)
- Statystyki użycia

### 3. Anti-Tamper (`src/services/security/antiTamper.ts`)
- Wykrywanie DevTools
- Blokowanie debuggera
- Monitoring podejrzanej aktywności
- Code protection helpers

---

## 🚀 Szybki Start

### 1. Instalacja Dependencies

```bash
cd ZENO_WEB_CORE_APP
npm install
```

To zainstaluje `crypto-js` i `@types/crypto-js` automatycznie.

---

### 2. Integracja License Manager

#### W głównym komponencie (Browser.tsx lub App.tsx):

```typescript
import { licenseManager, getLicensePlan } from '@/services/security/licenseManager';
import { useEffect, useState } from 'react';

function App() {
  const [plan, setPlan] = useState<'free' | 'monthly' | 'yearly' | 'lifetime'>('free');
  const [isLicenseValid, setIsLicenseValid] = useState(false);

  useEffect(() => {
    // Sprawdź licencję przy starcie
    async function checkLicense() {
      const validation = await licenseManager.validateLicense();
      setIsLicenseValid(validation.isValid);
      setPlan(getLicensePlan());

      if (!validation.isValid && validation.error) {
        console.warn('License issue:', validation.error);
        // Możesz wyświetlić modal z prośbą o zakup/odnowienie
      }
    }

    checkLicense();
  }, []);

  return (
    <div>
      {/* Conditional rendering based on plan */}
      {plan === 'free' && <UpgradeBanner />}

      {/* Premium features */}
      {(plan === 'monthly' || plan === 'yearly' || plan === 'lifetime') && (
        <PremiumFeatures />
      )}
    </div>
  );
}
```

#### Aktywacja licencji (po zakupie):

```typescript
import { licenseManager } from '@/services/security/licenseManager';

async function activateLicense(licenseKey: string, email: string) {
  const result = await licenseManager.activateLicense(licenseKey, email);

  if (result.isValid) {
    console.log('✅ License activated!');
    console.log('Features:', result.features);
    // Reload app lub przekieruj do dashboard
    window.location.href = '/dashboard';
  } else {
    console.error('❌ Activation failed:', result.error);
    alert(`Activation failed: ${result.error}`);
  }
}
```

#### Sprawdzanie dostępu do feature:

```typescript
import { licenseManager } from '@/services/security/licenseManager';

async function useAIFeature() {
  const hasAccess = await licenseManager.hasFeature('ai_assistant');

  if (!hasAccess) {
    alert('This feature requires a Pro plan. Please upgrade!');
    return;
  }

  // Kontynuuj z AI feature
  runAIAssistant();
}
```

---

### 3. Integracja Bookmark Manager

#### Import i podstawowe użycie:

```typescript
import { bookmarkManager } from '@/services/storage/bookmarkManager';

// === FOLDERY ===

// Utwórz folder
const workFolder = bookmarkManager.createFolder('Work', undefined, '#3b82f6', '💼');

// Pobierz foldery
const folders = bookmarkManager.getFolders(); // root folders
const subfolders = bookmarkManager.getFolders('folder_work'); // subfoldery

// Aktualizuj folder
bookmarkManager.updateFolder('folder_work', {
  name: 'Work Projects',
  color: '#10b981',
});

// Usuń folder (przenieś bookmarki)
bookmarkManager.deleteFolder('folder_old', 'folder_work'); // przenieś do Work
bookmarkManager.deleteFolder('folder_trash'); // usuń wraz z bookmarkami

// === BOOKMARKI ===

// Dodaj bookmark
const bookmark = bookmarkManager.addBookmark({
  title: 'GitHub',
  url: 'https://github.com',
  favicon: '🐙',
  folderId: 'folder_work',
  tags: ['development', 'git', 'code'],
  notes: 'My projects and repos',
});

// Pobierz bookmarki
const allBookmarks = bookmarkManager.getAllBookmarks();
const workBookmarks = bookmarkManager.getBookmarksByFolder('folder_work');

// Wyszukaj
const results = bookmarkManager.searchBookmarks('github');

// Sortuj
const sorted = bookmarkManager.sortBookmarks(allBookmarks, 'visits'); // 'title' | 'date' | 'visits' | 'url'

// Aktualizuj bookmark
bookmarkManager.updateBookmark('bookmark_123', {
  title: 'New Title',
  tags: ['updated', 'tag'],
});

// Przenieś bookmark
bookmarkManager.moveBookmark('bookmark_123', 'folder_personal');

// Zwiększ licznik odwiedzin (track popularity)
bookmarkManager.incrementVisitCount('bookmark_123');

// Usuń bookmark
bookmarkManager.deleteBookmark('bookmark_123');

// === IMPORT/EXPORT ===

// Export do JSON
const jsonData = bookmarkManager.exportToJSON();
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'zeno-bookmarks.json';
a.click();

// Export do HTML (Netscape format - kompatybilny z Chrome, Firefox)
const htmlData = bookmarkManager.exportToHTML();
const htmlBlob = new Blob([htmlData], { type: 'text/html' });
// ... podobnie jak JSON

// Import z JSON
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const text = await file.text();
  const result = bookmarkManager.importFromJSON(text);

  if (result.success) {
    console.log(`✅ Imported ${result.imported} bookmarks`);
  } else {
    console.error('❌ Import failed:', result.error);
  }
});

// === STATYSTYKI ===

const stats = bookmarkManager.getStats();
console.log('Total bookmarks:', stats.totalBookmarks);
console.log('Most visited:', stats.mostVisited);
console.log('Recently added:', stats.recentlyAdded);
console.log('By folder:', stats.byFolder);
```

---

### 4. Integracja Anti-Tamper (Opcjonalne)

#### Automatyczna inicjalizacja:

```typescript
// W main.tsx lub index.tsx
import { antiTamper } from '@/services/security/antiTamper';

// Anti-tamper automatycznie się inicjalizuje przy imporcie
// Nie musisz nic robić!

// Opcjonalnie: wyłącz przy unmount
window.addEventListener('beforeunload', () => {
  antiTamper.destroy();
});
```

#### Code Protection Helpers:

```typescript
import { CodeProtection } from '@/services/security/antiTamper';

// Ukryj API key
const obfuscated = CodeProtection.obfuscateAPIKey('sk-1234567890abcdef');
console.log(obfuscated); // "MTIzNDU2Nzg=|OTBhYmNkZWY="

// Odkoduj
const original = CodeProtection.deobfuscateAPIKey(obfuscated);
console.log(original); // "sk-1234567890abcdef"

// Zaszyfruj wrażliwy string
const encrypted = CodeProtection.encryptString('secret_data', 'my_key');

// Odszyfruj
const decrypted = CodeProtection.decryptString(encrypted, 'my_key');
```

---

## 🛡️ Najlepsze Praktyki

### 1. **Environment Variables**

Utwórz `.env.local` (NIE commituj tego pliku!):

```env
# License Manager
VITE_LICENSE_KEY=ZENO_BROWSER_2025_YOUR_SECRET_KEY_HERE

# API Endpoints
VITE_LICENSE_API=https://zeno-browser-api.stolarnia-ams.workers.dev/api/license

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 2. **Warunkowe Wyświetlanie Features**

```typescript
import { getLicensePlan } from '@/services/security/licenseManager';

function FeatureGate({ requiredPlan, children }) {
  const currentPlan = getLicensePlan();

  const planHierarchy = {
    free: 0,
    monthly: 1,
    yearly: 2,
    lifetime: 3,
  };

  if (planHierarchy[currentPlan] >= planHierarchy[requiredPlan]) {
    return <>{children}</>;
  }

  return (
    <div className="upgrade-prompt">
      <p>This feature requires {requiredPlan} plan</p>
      <button onClick={() => window.location.href = '/pricing'}>
        Upgrade Now
      </button>
    </div>
  );
}

// Użycie:
<FeatureGate requiredPlan="monthly">
  <AIAssistant />
</FeatureGate>
```

### 3. **Graceful Degradation**

```typescript
// Jeśli licencja jest invalid, nie blokuj całej app
// Zamiast tego, wyłącz tylko premium features

async function initApp() {
  const validation = await licenseManager.validateLicense();

  if (!validation.isValid) {
    // Free plan - disable premium
    disablePremiumFeatures();
    showUpgradeBanner();
  } else {
    // Pro plan - enable all
    enableAllFeatures();
  }
}
```

---

## 📊 Dashboard Licencji (Przykład UI)

```tsx
import { licenseManager } from '@/services/security/licenseManager';
import { useState, useEffect } from 'react';

function LicenseDashboard() {
  const [license, setLicense] = useState(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    async function load() {
      const info = licenseManager.getLicenseInfo();
      const validation = await licenseManager.validateLicense();

      setLicense(info);
      setIsValid(validation.isValid);
    }
    load();
  }, []);

  if (!license) {
    return <div>Free Plan - <a href="/pricing">Upgrade to Pro</a></div>;
  }

  return (
    <div className="license-dashboard">
      <h2>License Information</h2>

      <div className="info-grid">
        <div>
          <strong>Plan:</strong>
          <span className={`badge ${license.plan}`}>{license.plan}</span>
        </div>

        <div>
          <strong>Email:</strong>
          <span>{license.email}</span>
        </div>

        <div>
          <strong>Status:</strong>
          <span className={isValid ? 'valid' : 'invalid'}>
            {isValid ? '✅ Active' : '❌ Invalid'}
          </span>
        </div>

        {license.expiresAt && (
          <div>
            <strong>Expires:</strong>
            <span>{new Date(license.expiresAt).toLocaleDateString()}</span>
          </div>
        )}

        <div>
          <strong>Features:</strong>
          <ul>
            {license.features.map(f => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={async () => {
          if (confirm('Are you sure you want to deactivate this license?')) {
            await licenseManager.deactivateLicense();
            window.location.reload();
          }
        }}
        className="btn-danger"
      >
        Deactivate License
      </button>
    </div>
  );
}
```

---

## 🧪 Testing

### Test License Activation:

```typescript
// Test w development
import { licenseManager } from '@/services/security/licenseManager';

// Mock license dla testów
const testLicense = {
  userId: 'test_user_123',
  email: 'test@example.com',
  plan: 'yearly',
  activatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  machineId: 'test_machine',
  features: ['ai_assistant', 'unlimited_tabs', 'api_access'],
  signature: 'test_signature',
};

// Zapisz test license (tylko development!)
localStorage.setItem('zeno_license', JSON.stringify(testLicense));
```

---

## 🚨 Troubleshooting

### Problem: "License bound to different machine"
**Przyczyna:** MachineId się zmienił (reinstalacja systemu, zmiana hardware)
**Rozwiązanie:**
```typescript
// Allow re-activation na nowej maszynie
await licenseManager.deactivateLicense();
await licenseManager.activateLicense(licenseKey, email);
```

### Problem: "Cannot verify license (no network)"
**Przyczyna:** Brak internetu + minęło 7 dni od ostatniej walidacji
**Rozwiązanie:**
```typescript
// User musi połączyć się z internetem aby zweryfikować
// LUB przedłuż offline grace period do 30 dni
```

### Problem: Anti-tamper blokuje DevTools nawet w development
**Rozwiązanie:**
```typescript
// Wyłącz anti-tamper w development
if (import.meta.env.DEV) {
  // Nie importuj antiTamper
} else {
  import('@/services/security/antiTamper');
}
```

---

## 📝 Checklist Przed Produkcją

- [ ] Zmień `VITE_LICENSE_KEY` na silny, unikalny klucz
- [ ] Skonfiguruj production API endpoint
- [ ] Przetestuj aktywację licencji end-to-end
- [ ] Przetestuj deaktywację i re-aktywację
- [ ] Przetestuj offline validation (disconnect internet)
- [ ] Przetestuj bookmark import/export
- [ ] Przetestuj na różnych przeglądarkach (Chrome, Firefox, Safari)
- [ ] Dodaj proper error handling z user-friendly messages
- [ ] Dodaj logging do Sentry/LogRocket dla błędów licencji
- [ ] Utwórz support email flow dla problemów z licencją

---

## 📞 Support

Jeśli masz pytania lub problemy z integracją:
- Email: JimBoZen@proton.me
- Docs: Sprawdź `PAYMENT_SYSTEM_PROPOSAL.md`

---

**Gotowy do wdrożenia zabezpieczeń! 🚀**
