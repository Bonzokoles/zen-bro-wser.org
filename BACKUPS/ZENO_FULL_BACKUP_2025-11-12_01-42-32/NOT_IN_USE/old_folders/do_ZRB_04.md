Przygotowałem komplet trzech pełnych plików wraz z krótkimi instrukcjami, które możesz użyć w swoim projekcie.

1. crawler.ts - Node.js crawler do weryfikacji iframe-friendly stron
ts
import axios from 'axios';

interface SiteCheckResult {
  url: string;
  domainExtension: string;
  iframeAllowed: boolean;
}

const urlsToCheck = [
  'https://example.cc',
  'https://example.oi',
  'https://othersite.com'
];

function getDomainExtension(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
  } catch {
    return '';
  }
}

async function checkIframeAllowed(url: string): Promise<boolean> {
  try {
    const res = await axios.head(url, { timeout: 5000 });
    const xFrameOptions = res.headers['x-frame-options'];
    const csp = res.headers['content-security-policy'];

    if (xFrameOptions) {
      const val = xFrameOptions.toLowerCase();
      if (val.includes('deny') || val.includes('sameorigin')) return false;
    }
    if (csp) {
      if (csp.includes('frame-ancestors \'none\'') || csp.includes('frame-ancestors \'self\'')) {
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error(`Error checking iframe for ${url}: ${err.message}`);
    return false;
  }
}

async function crawl() {
  const results: SiteCheckResult[] = [];
  for (const url of urlsToCheck) {
    const domainExtension = getDomainExtension(url);
    if (['.cc','.oi'].includes(domainExtension)) {
      const iframeAllowed = await checkIframeAllowed(url);
      results.push({ url, domainExtension, iframeAllowed });
      console.log(`Checked: ${url} iframeAllowed=${iframeAllowed}`);
    } else {
      console.log(`Skipped (not .cc or .oi): ${url}`);
    }
  }
  return results;
}

crawl().then(results => {
  console.log('Summary:', results);
});
Instrukcje:

Zainstaluj axios (npm install axios)

Umieść ten plik, uzupełnij urlsToCheck o adresy, uruchom node crawler.ts

2. api/sites.ts - Express backend API
ts
import express from 'express';
const router = express.Router();

interface Site {
  id: string;
  url: string;
  domainExtension: string;
  iframeAllowed: boolean;
  description?: string;
  category?: string;
}

const sites: Site[] = [
  { id: '1', url: 'https://example1.cc', domainExtension: '.cc', iframeAllowed: true, description: 'Example CC site', category: 'Education' },
  { id: '2', url: 'https://example2.oi', domainExtension: '.oi', iframeAllowed: false, description: 'Example OI site', category: 'Culture' },
];

router.get('/', (req, res) => {
  const { domainExtension, iframeAllowed, category } = req.query;
  let filtered = sites;

  if (domainExtension) {
    const ext = domainExtension.toString();
    filtered = filtered.filter(site => site.domainExtension === ext);
  }
  if (iframeAllowed !== undefined) {
    const allowed = iframeAllowed.toString().toLowerCase() === 'true';
    filtered = filtered.filter(site => site.iframeAllowed === allowed);
  }
  if (category) {
    filtered = filtered.filter(site => site.category?.toLowerCase() === category.toString().toLowerCase());
  }

  res.json(filtered);
});

export default router;
Instrukcje:

Umieść w katalogu backendu, dodaj do głównego serwera jako app.use('/api/sites', sitesRouter);

Obsługuje filtrowanie po domenie, iframeAllowed i kategorii

3. SiteSearch.tsx - React frontendowy komponent wyszukiwarki
tsx
import React, { useState, useEffect } from 'react';

interface Site {
  id: string;
  url: string;
  domainExtension: string;
  iframeAllowed: boolean;
  description?: string;
  category?: string;
}

export const SiteSearch = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [domainExtension, setDomainExtension] = useState<string>('');
  const [iframeAllowed, setIframeAllowed] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    const fetchSites = async () => {
      const params = new URLSearchParams();
      if(domainExtension) params.append('domainExtension', domainExtension);
      if(iframeAllowed) params.append('iframeAllowed', iframeAllowed);
      if(category) params.append('category', category);

      const res = await fetch(`/api/sites?${params.toString()}`);
      if(res.ok) {
        const data = await res.json();
        setSites(data);
      }
    };
    fetchSites();
  }, [domainExtension, iframeAllowed, category]);

  return (
    <div>
      <h2>Iframe-friendly site search</h2>
      <div>
        <label>Domain:
          <select onChange={e => setDomainExtension(e.target.value)} value={domainExtension}>
            <option value="">all</option>
            <option value=".cc">.cc</option>
            <option value=".oi">.oi</option>
          </select>
        </label>

        <label>Iframe Allowed:
          <select onChange={e => setIframeAllowed(e.target.value)} value={iframeAllowed}>
            <option value="">all</option>
            <option value="true">allowed</option>
            <option value="false">blocked</option>
          </select>
        </label>

        <label>Category:
          <input type="text" onChange={e => setCategory(e.target.value)} value={category} placeholder="culture, education ..." />
        </label>
      </div>

      <ul>
        {sites.map(site => (
          <li key={site.id}>
            <a href={site.url} target="_blank" rel="noopener noreferrer">{site.url}</a> — domain: {site.domainExtension} — iframe: {site.iframeAllowed ? 'Yes' : 'No'}
          </li>
        ))}
      </ul>
    </div>
  );
};
Instrukcje:

Umieść w projekcie React i importuj w miejscu użycia

Dostęp do backendu na /api/sites

