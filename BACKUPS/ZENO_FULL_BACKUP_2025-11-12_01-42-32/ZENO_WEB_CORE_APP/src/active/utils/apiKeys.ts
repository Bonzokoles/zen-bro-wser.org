export type ProviderKey = 'gemini' | 'openrouter' | 'claude' | 'llama' | 'huggingface';

const STORAGE_KEY = 'mcp_provider_keys';

const ENV_DEFAULTS: Record<ProviderKey, string> = {
  gemini: import.meta.env.VITE_GEMINI_API_KEY ?? '',
  openrouter: import.meta.env.VITE_OPENROUTER_API_KEY ?? '',
  claude: import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
  llama: import.meta.env.VITE_LLAMA_API_KEY ?? '',
  huggingface: import.meta.env.VITE_HUGGINGFACE_API_KEY ?? ''
};

const isBrowser = typeof window !== 'undefined';

function readStoredKeys(): Partial<Record<ProviderKey, string>> {
  if (!isBrowser) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Partial<Record<ProviderKey, string>>;
    return parsed;
  } catch (error) {
    console.warn('[mcp] Failed to parse stored provider keys:', error);
    return {};
  }
}

function persistStoredKeys(map: Partial<Record<ProviderKey, string>>): void {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.warn('[mcp] Failed to persist provider keys:', error);
  }
}

export function getEnvDefaults(): Record<ProviderKey, string> {
  return { ...ENV_DEFAULTS };
}

export function getProviderKey(provider: ProviderKey): string {
  const stored = readStoredKeys();
  const storedValue = stored[provider];
  if (storedValue && typeof storedValue === 'string') {
    return storedValue;
  }

  return ENV_DEFAULTS[provider] ?? '';
}

export function setProviderKey(provider: ProviderKey, value: string): void {
  if (!isBrowser) {
    return;
  }

  const stored = readStoredKeys();

  if (!value) {
    delete stored[provider];
  } else {
    stored[provider] = value;
  }

  persistStoredKeys(stored);
}

export function clearProviderKeys(): void {
  if (!isBrowser) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
