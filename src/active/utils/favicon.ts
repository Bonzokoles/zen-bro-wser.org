// src/active/utils/favicon.ts
const faviconCache = new Map<string, string>();

export async function getFavicon(url: string): Promise<string> {
  try {
    const domain = new URL(url).origin;

    // Try common favicon locations first
    const commonPaths = [
      `${domain}/favicon.ico`,
      `${domain}/favicon.svg`,
      `${domain}/favicon.png`,
      `${domain}/apple-touch-icon.png`
    ];

    for (const path of commonPaths) {
      try {
        const response = await fetch(path, { method: 'HEAD' });
        if (response.ok) {
          return path;
        }
      } catch {
        // Ignore fetch errors for non-existent icons
      }
    }

    // If common paths fail, parse the HTML
    const html = await fetch(url).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const iconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]'
    ];

    for (const selector of iconSelectors) {
      const link = doc.querySelector(selector) as HTMLLinkElement;
      if (link?.href) {
        // Resolve relative URLs
        return new URL(link.href, domain).href;
      }
    }

    // Fallback to a reliable service if nothing is found
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (error) {
    console.error(`Failed to get favicon for ${url}:`, error);
    // Provide a default fallback on error
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
  }
}

export async function getCachedFavicon(url: string): Promise<string> {
  try {
    const domain = new URL(url).origin;

    if (faviconCache.has(domain)) {
      return faviconCache.get(domain)!;
    }

    const favicon = await getFavicon(url);
    faviconCache.set(domain, favicon);

    return favicon;
  } catch {
    // Fallback for invalid URLs
    return `https://www.google.com/s2/favicons?domain=example.com&sz=64`;
  }
}
