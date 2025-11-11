/**
 * License Manager - System weryfikacji licencji
 * Zabezpieczenia przed kopiowaniem i nieautoryzowanym użyciem
 */

import CryptoJS from 'crypto-js';

// Klucz szyfrowania - W PRODUKCJI PRZENIESĆ DO ENV I OBFUSKOWAĆ!
const ENCRYPTION_KEY = import.meta.env.VITE_LICENSE_KEY || 'ZENO_BROWSER_2025_SECURE_KEY';
const LICENSE_API = 'https://zeno-browser-api.stolarnia-ams.workers.dev/api/license';

export interface License {
  userId: string;
  email: string;
  plan: 'free' | 'monthly' | 'yearly' | 'lifetime';
  activatedAt: string;
  expiresAt: string | null; // null = lifetime
  machineId: string;
  features: string[];
  signature: string;
}

export interface LicenseValidation {
  isValid: boolean;
  license?: License;
  error?: string;
  remainingDays?: number;
  features: string[];
}

class LicenseManager {
  private license: License | null = null;
  private machineId: string = '';
  private validationInterval: number | null = null;

  constructor() {
    this.machineId = this.generateMachineId();
    this.loadLicense();
    this.startPeriodicValidation();
  }

  /**
   * Generowanie unikalnego ID maszyny (fingerprint)
   * Łączy wiele parametrów przeglądarki dla większej dokładności
   */
  private generateMachineId(): string {
    if (typeof window === 'undefined') return 'server';

    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.hardwareConcurrency || 0,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      // Canvas fingerprint (bardziej unikalny)
      this.getCanvasFingerprint(),
      // WebGL fingerprint
      this.getWebGLFingerprint(),
    ];

    const fingerprint = components.join('|');
    return CryptoJS.SHA256(fingerprint).toString();
  }

  /**
   * Canvas fingerprinting - bardzo trudny do podrobienia
   */
  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-canvas';

      canvas.width = 200;
      canvas.height = 50;

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('ZENO Browser 🚀', 2, 15);

      return canvas.toDataURL();
    } catch {
      return 'canvas-error';
    }
  }

  /**
   * WebGL fingerprinting
   */
  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';

      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'no-debug-info';

      const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      return `${vendor}|${renderer}`;
    } catch {
      return 'webgl-error';
    }
  }

  /**
   * Ładowanie licencji z localStorage
   */
  private loadLicense(): void {
    try {
      const encrypted = localStorage.getItem('zeno_license');
      if (!encrypted) {
        this.license = null;
        return;
      }

      // Deszyfrowanie
      const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      this.license = JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to load license:', error);
      this.license = null;
    }
  }

  /**
   * Zapisywanie licencji do localStorage (zaszyfrowane)
   */
  private saveLicense(license: License): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(license),
        ENCRYPTION_KEY
      ).toString();

      localStorage.setItem('zeno_license', encrypted);
      this.license = license;
    } catch (error) {
      console.error('Failed to save license:', error);
    }
  }

  /**
   * Aktywacja licencji z kluczem
   */
  async activateLicense(licenseKey: string, email: string): Promise<LicenseValidation> {
    try {
      const response = await fetch(`${LICENSE_API}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey,
          email,
          machineId: this.machineId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        return {
          isValid: false,
          error: data.error || 'License activation failed',
          features: [],
        };
      }

      // Zapisz licencję
      this.saveLicense(data.license);

      return {
        isValid: true,
        license: data.license,
        features: data.license.features,
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message || 'Network error during activation',
        features: [],
      };
    }
  }

  /**
   * Walidacja licencji (online + offline)
   */
  async validateLicense(): Promise<LicenseValidation> {
    // Brak licencji = free plan
    if (!this.license) {
      return {
        isValid: true,
        features: ['basic_browsing', 'limited_tabs'],
        error: 'No license (Free Plan)',
      };
    }

    // Sprawdź czy nie wygasła (offline check)
    if (this.license.expiresAt) {
      const expiresAt = new Date(this.license.expiresAt);
      const now = new Date();

      if (now > expiresAt) {
        return {
          isValid: false,
          error: 'License expired',
          features: [],
        };
      }

      const remainingMs = expiresAt.getTime() - now.getTime();
      const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

      // Ostrzeżenie 7 dni przed wygaśnięciem
      if (remainingDays <= 7 && remainingDays > 0) {
        console.warn(`⚠️ License expires in ${remainingDays} days!`);
      }
    }

    // Sprawdź machineId (anty-kopiowanie)
    if (this.license.machineId !== this.machineId) {
      return {
        isValid: false,
        error: 'License bound to different machine',
        features: [],
      };
    }

    // Weryfikacja online (co 24h)
    try {
      const response = await fetch(`${LICENSE_API}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.license.userId,
          machineId: this.machineId,
          signature: this.license.signature,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        // Jeśli online verification failuje, użyj offline przez 7 dni
        const lastValidation = localStorage.getItem('zeno_last_validation');
        if (lastValidation) {
          const lastDate = new Date(lastValidation);
          const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSince < 7) {
            console.warn('⚠️ Using offline license validation');
            return {
              isValid: true,
              license: this.license,
              features: this.license.features,
            };
          }
        }

        return {
          isValid: false,
          error: data.error || 'Online verification failed',
          features: [],
        };
      }

      // Zapisz czas ostatniej walidacji
      localStorage.setItem('zeno_last_validation', new Date().toISOString());

      return {
        isValid: true,
        license: this.license,
        features: this.license.features,
      };
    } catch (error) {
      // Błąd sieci - użyj offline validation przez 7 dni
      const lastValidation = localStorage.getItem('zeno_last_validation');
      if (lastValidation) {
        const lastDate = new Date(lastValidation);
        const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSince < 7) {
          console.warn('⚠️ Network error - using offline license validation');
          return {
            isValid: true,
            license: this.license,
            features: this.license.features,
          };
        }
      }

      return {
        isValid: false,
        error: 'Cannot verify license (no network)',
        features: [],
      };
    }
  }

  /**
   * Sprawdź czy feature jest dostępny
   */
  async hasFeature(feature: string): Promise<boolean> {
    const validation = await this.validateLicense();
    return validation.features.includes(feature);
  }

  /**
   * Pobierz informacje o licencji
   */
  getLicenseInfo(): License | null {
    return this.license;
  }

  /**
   * Deaktywuj licencję
   */
  async deactivateLicense(): Promise<void> {
    if (!this.license) return;

    try {
      await fetch(`${LICENSE_API}/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.license.userId,
          machineId: this.machineId,
        }),
      });
    } catch (error) {
      console.error('Failed to deactivate license:', error);
    }

    localStorage.removeItem('zeno_license');
    localStorage.removeItem('zeno_last_validation');
    this.license = null;
  }

  /**
   * Periodyczna walidacja (co 24h)
   */
  private startPeriodicValidation(): void {
    if (typeof window === 'undefined') return;

    // Walidacja przy starcie
    this.validateLicense().then(result => {
      if (!result.isValid) {
        console.warn('⚠️ License validation failed:', result.error);
        this.showLicenseWarning(result.error || 'Invalid license');
      }
    });

    // Walidacja co 24h
    this.validationInterval = window.setInterval(() => {
      this.validateLicense();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Wyświetl ostrzeżenie o licencji
   */
  private showLicenseWarning(message: string): void {
    // TODO: Integracja z systemem powiadomień
    console.warn('🔐 License Warning:', message);
  }

  /**
   * Zatrzymaj walidację
   */
  destroy(): void {
    if (this.validationInterval !== null) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
  }
}

// Export singleton
export const licenseManager = new LicenseManager();

// Funkcje pomocnicze
export async function requireFeature(feature: string): Promise<boolean> {
  const hasAccess = await licenseManager.hasFeature(feature);

  if (!hasAccess) {
    throw new Error(`Feature "${feature}" requires a premium license`);
  }

  return true;
}

export function getLicensePlan(): 'free' | 'monthly' | 'yearly' | 'lifetime' {
  const license = licenseManager.getLicenseInfo();
  return license?.plan || 'free';
}
