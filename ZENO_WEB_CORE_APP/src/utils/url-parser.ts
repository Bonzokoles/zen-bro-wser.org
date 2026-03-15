// src/utils/url-parser.ts
export function parseInput(input: string): {
  type: 'url' | 'search';
  value: string;
} {
  const trimmed = input.trim();

  // Direct URL patterns
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('about:')
  ) {
    return { type: 'url', value: trimmed };
  }

  // localhost variations
  if (
    trimmed.startsWith('localhost') ||
    /^127\.0\.0\.1/.test(trimmed) ||
    /^192\.168\./.test(trimmed)
  ) {
    return { type: 'url', value: `http://${trimmed}` };
  }

  // Domain-like patterns
  if (/^[a-z0-9-]+\.[a-z]{2,}/.test(trimmed) && !trimmed.includes(' ')) {
    return { type: 'url', value: `https://${trimmed}` };
  }

  // Everything else is search
  return { type: 'search', value: trimmed };
}

// Generate search URL
export function getSearchUrl(query: string, engine = 'google'): string {
  const engines = {
    google: 'https://www.google.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    bing: 'https://www.bing.com/search?q=',
    brave: 'https://search.brave.com/search?q='
  };

  return (engines as Record<string, string>)[engine] + encodeURIComponent(query);
}
