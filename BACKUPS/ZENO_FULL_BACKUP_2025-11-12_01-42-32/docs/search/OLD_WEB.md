# Old Web Discovery - Docieranie do Starych Miejsc Internetu

## Filozofia

Internet z przed ery SEO, algorytmów i korporacji. Małe strony, osobiste blogi, niezależne forum, archiwa wiedzy.

## Alternatywne Wyszukiwarki

### 1. Marginalia

**Co to:** Wyszukiwarka preferująca małe, niezależne strony bez reklam

```typescript
// src/services/search/engines/marginalia.ts

interface MarginaliaResult {
  url: string;
  title: string;
  description: string;
  quality: 'high' | 'medium' | 'low';
  type: 'personal' | 'educational' | 'community';
  hasAds: boolean;
  lastModified?: Date;
}

class MarginaliaSearchEngine {
  private baseUrl = 'https://search.marginalia.nu/';

  async search(query: string, options?: {
    profile?: 'default' | 'yolo' | 'scholar';
    excludeCommercial?: boolean;
  }): Promise<MarginaliaResult[]> {
    const params = new URLSearchParams({
      query,
      profile: options?.profile || 'default',
      js: '',
      adtech: options?.excludeCommercial ? 'no' : 'default'
    });

    const response = await fetch(`${this.baseUrl}search?${params}`);
    const html = await response.text();

    return this.parseResults(html);
  }

  private parseResults(html: string): MarginaliaResult[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const resultElements = doc.querySelectorAll('.result');

    return Array.from(resultElements).map(el => {
      const titleEl = el.querySelector('.title');
      const urlEl = el.querySelector('.url');
      const descEl = el.querySelector('.description');
      const qualityEl = el.querySelector('.quality');

      return {
        url: urlEl?.textContent?.trim() || '',
        title: titleEl?.textContent?.trim() || '',
        description: descEl?.textContent?.trim() || '',
        quality: this.parseQuality(qualityEl?.textContent || ''),
        type: this.detectType(el),
        hasAds: false, // Marginalia filters these out
        lastModified: this.extractDate(el)
      };
    });
  }

  private parseQuality(text: string): MarginaliaResult['quality'] {
    if (text.includes('high')) return 'high';
    if (text.includes('low')) return 'low';
    return 'medium';
  }

  private detectType(element: Element): MarginaliaResult['type'] {
    const text = element.textContent?.toLowerCase() || '';
    if (text.includes('personal') || text.includes('blog')) return 'personal';
    if (text.includes('edu') || text.includes('research')) return 'educational';
    return 'community';
  }
}
```

### 2. Wiby - Really Old Web

**Co to:** Tylko strony z przed 2000 roku + wygląd stary

```typescript
// src/services/search/engines/wiby.ts

class WibySearchEngine {
  private baseUrl = 'https://wiby.me/';

  async search(query: string): Promise<SearchResult[]> {
    const response = await fetch(`${this.baseUrl}?q=${encodeURIComponent(query)}`);
    const html = await response.text();

    return this.parseResults(html);
  }

  async surprise(): Promise<string> {
    // "Surprise me" button - random old page
    const response = await fetch(`${this.baseUrl}surprise/`);
    return response.url; // Redirects to random page
  }

  private parseResults(html: string): SearchResult[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Wiby has simple HTML structure
    const links = doc.querySelectorAll('a[href^="http"]');

    return Array.from(links).map(link => ({
      url: link.getAttribute('href') || '',
      title: link.textContent?.trim() || '',
      description: this.getNextSibling(link)?.textContent || '',
      era: 'vintage',
      year: this.estimateYear(link.getAttribute('href') || '')
    }));
  }

  private estimateYear(url: string): number {
    // Try to estimate from URL patterns
    // Many old sites have year in domain or path
    const yearMatch = url.match(/19\d{2}|20[0-1]\d/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      if (year < 2005) return year;
    }
    return 1999; // Default to late 90s
  }
}
```

### 3. Old'aVista - Internet Archive Search

```typescript
// src/services/search/engines/oldavista.ts

class OldaVistaEngine {
  private baseUrl = 'https://oldavista.com/';

  async search(query: string, options?: {
    yearRange?: { start: number; end: number };
    domain?: string;
  }): Promise<ArchiveResult[]> {
    // Old'aVista searches Wayback Machine
    return this.searchWayback(query, options);
  }

  private async searchWayback(
    query: string,
    options?: { yearRange?: { start: number; end: number } }
  ): Promise<ArchiveResult[]> {
    const params = new URLSearchParams({
      q: query
    });

    if (options?.yearRange) {
      params.append('from', options.yearRange.start.toString());
      params.append('to', options.yearRange.end.toString());
    }

    const response = await fetch(`${this.baseUrl}search?${params}`);
    const results = await response.json();

    return results.map((r: any) => ({
      url: r.url,
      title: r.title,
      snapshot: r.wayback_url,
      date: new Date(r.timestamp),
      year: new Date(r.timestamp).getFullYear()
    }));
  }
}
```

### 4. Stract - Independent Index

```typescript
// src/services/search/engines/stract.ts

class StratctSearchEngine {
  private baseUrl = 'https://stract.com/';

  async search(query: string, options?: {
    region?: string;
    ranking?: 'standard' | 'discussions' | 'simple';
  }): Promise<SearchResult[]> {
    const params = new URLSearchParams({
      q: query,
      ranking: options?.ranking || 'standard'
    });

    if (options?.region) {
      params.append('region', options.region);
    }

    const response = await fetch(`${this.baseUrl}search?${params}`);
    const data = await response.json();

    return data.results.map((r: any) => ({
      url: r.url,
      title: r.title,
      description: r.snippet,
      rank: r.rank,
      isIndependent: true
    }));
  }
}
```

### 5. Mojeek - Privacy-First

```typescript
// src/services/search/engines/mojeek.ts

class MojeekSearchEngine {
  private baseUrl = 'https://www.mojeek.com/';

  async search(query: string): Promise<SearchResult[]> {
    const response = await fetch(`${this.baseUrl}search?q=${encodeURIComponent(query)}`);
    const html = await response.text();

    return this.parseResults(html);
  }

  private parseResults(html: string): SearchResult[] {
    // Parse Mojeek results
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const results = doc.querySelectorAll('.result');

    return Array.from(results).map(r => ({
      url: r.querySelector('a')?.href || '',
      title: r.querySelector('.title')?.textContent || '',
      description: r.querySelector('.snippet')?.textContent || '',
      privacy: 'no-tracking'
    }));
  }
}
```

## Web Archives Integration

### Internet Archive (Wayback Machine)

```typescript
// src/services/search/wayback.ts

interface WaybackSnapshot {
  url: string;
  timestamp: Date;
  status: number;
  available: boolean;
  archiveUrl: string;
}

class WaybackMachine {
  private baseUrl = 'https://archive.org/wayback/';

  async getSnapshots(url: string, year?: number): Promise<WaybackSnapshot[]> {
    const apiUrl = `${this.baseUrl}available?url=${encodeURIComponent(url)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.archived_snapshots?.closest) {
      return [];
    }

    return [{
      url: url,
      timestamp: new Date(data.archived_snapshots.closest.timestamp),
      status: data.archived_snapshots.closest.status,
      available: data.archived_snapshots.closest.available,
      archiveUrl: data.archived_snapshots.closest.url
    }];
  }

  async searchArchive(query: string, options?: {
    mediatype?: string;
    year?: number;
  }): Promise<ArchiveSearchResult[]> {
    const params = new URLSearchParams({
      q: query,
      output: 'json'
    });

    if (options?.mediatype) {
      params.append('mediatype', options.mediatype);
    }

    if (options?.year) {
      params.append('year', options.year.toString());
    }

    const response = await fetch(`https://archive.org/advancedsearch.php?${params}`);
    const data = await response.json();

    return data.response.docs.map((doc: any) => ({
      identifier: doc.identifier,
      title: doc.title,
      description: doc.description,
      year: doc.year,
      downloads: doc.downloads,
      url: `https://archive.org/details/${doc.identifier}`
    }));
  }

  async viewOldVersion(url: string, date: Date): Promise<string> {
    const timestamp = this.formatWaybackDate(date);
    return `${this.baseUrl}${timestamp}/${url}`;
  }

  private formatWaybackDate(date: Date): string {
    // Format: YYYYMMDDhhmmss
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  async getCalendar(url: string, year: number): Promise<Map<string, number>> {
    // Get all snapshots for a year
    const apiUrl = `https://web.archive.org/__wb/calendarcaptures/2?url=${encodeURIComponent(url)}&date=${year}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    const calendar = new Map<string, number>();

    for (const [date, snapshots] of Object.entries(data.items)) {
      calendar.set(date, (snapshots as any[]).length);
    }

    return calendar;
  }
}
```

## Old Web Directory Browser

```typescript
// src/services/search/old-web-directory.ts

interface WebDirectory {
  name: string;
  url: string;
  categories: Category[];
  era: '90s' | '00s' | '10s';
  alive: boolean;
}

interface Category {
  name: string;
  path: string;
  subcategories: Category[];
  sites: DirectorySite[];
}

interface DirectorySite {
  name: string;
  url: string;
  description: string;
  added: Date;
  lastChecked?: Date;
  status: 'alive' | 'dead' | 'archived';
}

class OldWebDirectory {
  private directories: WebDirectory[] = [];

  constructor() {
    this.loadDirectories();
  }

  private loadDirectories() {
    this.directories = [
      {
        name: 'DMOZ Archive',
        url: 'https://dmoztools.net/',
        categories: [],
        era: '00s',
        alive: true
      },
      {
        name: 'Yahoo! Directory (archived)',
        url: 'https://web.archive.org/web/*/dir.yahoo.com',
        categories: [],
        era: '90s',
        alive: false
      },
      {
        name: 'Best of the Web',
        url: 'https://botw.org/',
        categories: [],
        era: '90s',
        alive: true
      },
      {
        name: 'JoeAnt Directory',
        url: 'https://www.joeant.com/',
        categories: [],
        era: '00s',
        alive: true
      }
    ];
  }

  async browse(directory: WebDirectory, categoryPath?: string): Promise<Category> {
    const url = categoryPath
      ? `${directory.url}${categoryPath}`
      : directory.url;

    const response = await fetch(url);
    const html = await response.text();

    return this.parseCategory(html);
  }

  private parseCategory(html: string): Category {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Generic parsing - adapt per directory
    const category: Category = {
      name: doc.querySelector('h1')?.textContent || '',
      path: window.location.pathname,
      subcategories: [],
      sites: []
    };

    // Parse subcategories
    const subcatElements = doc.querySelectorAll('.subcategory');
    category.subcategories = Array.from(subcatElements).map(el => ({
      name: el.textContent || '',
      path: el.getAttribute('href') || '',
      subcategories: [],
      sites: []
    }));

    // Parse sites
    const siteElements = doc.querySelectorAll('.site');
    category.sites = Array.from(siteElements).map(el => ({
      name: el.querySelector('.title')?.textContent || '',
      url: el.querySelector('a')?.href || '',
      description: el.querySelector('.description')?.textContent || '',
      added: new Date(),
      status: 'alive' as const
    }));

    return category;
  }

  async checkSiteStatus(url: string): Promise<'alive' | 'dead' | 'archived'> {
    try {
      const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
      if (response.ok) return 'alive';
      return 'dead';
    } catch {
      // Check if in archive
      const archived = await this.isInArchive(url);
      return archived ? 'archived' : 'dead';
    }
  }

  private async isInArchive(url: string): Promise<boolean> {
    const wayback = new WaybackMachine();
    const snapshots = await wayback.getSnapshots(url);
    return snapshots.length > 0;
  }
}
```

## Gopher Protocol Support

```typescript
// src/services/search/gopher.ts

// Gopher - pre-WWW protocol from 1991

class GopherClient {
  async browse(url: string): Promise<GopherMenu> {
    // Gopher uses port 70 by default
    const gopherUrl = new URL(url);
    const host = gopherUrl.hostname;
    const port = gopherUrl.port || '70';
    const path = gopherUrl.pathname;

    // Modern browsers don't support gopher://
    // Use HTTP proxy
    const proxyUrl = `https://gopher.floodgap.com/gopher/gw?a=${host}:${port}${path}`;

    const response = await fetch(proxyUrl);
    const text = await response.text();

    return this.parseGopherMenu(text);
  }

  private parseGopherMenu(text: string): GopherMenu {
    const lines = text.split('\n');
    const items: GopherItem[] = [];

    for (const line of lines) {
      if (!line) continue;

      const type = line[0];
      const parts = line.slice(1).split('\t');

      items.push({
        type: this.parseItemType(type),
        display: parts[0] || '',
        selector: parts[1] || '',
        host: parts[2] || '',
        port: parseInt(parts[3] || '70')
      });
    }

    return { items };
  }

  private parseItemType(char: string): string {
    const types: Record<string, string> = {
      '0': 'text',
      '1': 'directory',
      '3': 'error',
      '7': 'search',
      '9': 'binary',
      'g': 'gif',
      'I': 'image',
      'h': 'html'
    };

    return types[char] || 'unknown';
  }
}
```

## Gemini Protocol (Modern Alternative to HTTP)

```typescript
// src/services/search/gemini.ts

// Gemini - minimal internet protocol (2019)
// gemini://domain.com/path

class GeminiClient {
  async fetch(url: string): Promise<GeminiResponse> {
    // Gemini uses TLS on port 1965
    // Browser can't do raw TCP, use proxy

    const proxyUrl = `https://portal.mozz.us/gemini/${url.replace('gemini://', '')}`;

    const response = await fetch(proxyUrl);
    const text = await response.text();

    return this.parseGemini(text);
  }

  private parseGemini(text: string): GeminiResponse {
    const lines = text.split('\n');
    const content: GeminiContent[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('# ')) {
        content.push({ type: 'h1', text: line.slice(2) });
      } else if (line.startsWith('## ')) {
        content.push({ type: 'h2', text: line.slice(3) });
      } else if (line.startsWith('### ')) {
        content.push({ type: 'h3', text: line.slice(4) });
      } else if (line.startsWith('=> ')) {
        const parts = line.slice(3).split(' ', 2);
        content.push({
          type: 'link',
          url: parts[0],
          text: parts[1] || parts[0]
        });
      } else if (line.startsWith('* ')) {
        content.push({ type: 'list', text: line.slice(2) });
      } else if (line.startsWith('> ')) {
        content.push({ type: 'quote', text: line.slice(2) });
      } else if (line.startsWith('```')) {
        // Code block
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        content.push({ type: 'code', text: codeLines.join('\n') });
      } else {
        content.push({ type: 'text', text: line });
      }
    }

    return { content };
  }
}
```

## Aggregated Old Web Search

```typescript
// src/services/search/old-web-aggregator.ts

class OldWebSearchAggregator {
  private engines = {
    marginalia: new MarginaliaSearchEngine(),
    wiby: new WibySearchEngine(),
    oldavista: new OldaVistaEngine(),
    stract: new StratctSearchEngine(),
    mojeek: new MojeekSearchEngine()
  };

  async search(query: string, options?: {
    engines?: (keyof typeof this.engines)[];
    vintage?: boolean;        // Prefer old content
    noAds?: boolean;          // Exclude commercial sites
    yearRange?: { start: number; end: number };
  }): Promise<OldWebSearchResults> {
    const selectedEngines = options?.engines || Object.keys(this.engines);

    const searches = selectedEngines.map(engine =>
      this.searchEngine(engine, query, options)
    );

    const results = await Promise.all(searches);
    const combined = results.flat();

    // Filter and rank
    let filtered = combined;

    if (options?.vintage) {
      filtered = filtered.filter(r => r.year && r.year < 2010);
    }

    if (options?.noAds) {
      filtered = filtered.filter(r => !r.hasAds);
    }

    if (options?.yearRange) {
      filtered = filtered.filter(r =>
        r.year &&
        r.year >= options.yearRange!.start &&
        r.year <= options.yearRange!.end
      );
    }

    // Deduplicate and rank
    const deduped = this.deduplicateResults(filtered);
    const ranked = this.rankByOldWebScore(deduped);

    return {
      query,
      results: ranked,
      stats: {
        totalResults: ranked.length,
        enginesUsed: selectedEngines.length,
        avgYear: this.calculateAvgYear(ranked),
        independentSites: ranked.filter(r => r.isIndependent).length
      }
    };
  }

  private async searchEngine(
    engineName: string,
    query: string,
    options?: any
  ): Promise<SearchResult[]> {
    const engine = this.engines[engineName as keyof typeof this.engines];

    try {
      return await engine.search(query, options);
    } catch (error) {
      console.error(`Error searching ${engineName}:`, error);
      return [];
    }
  }

  private rankByOldWebScore(results: SearchResult[]): SearchResult[] {
    return results.map(r => ({
      ...r,
      oldWebScore: this.calculateOldWebScore(r)
    })).sort((a, b) => (b.oldWebScore || 0) - (a.oldWebScore || 0));
  }

  private calculateOldWebScore(result: SearchResult): number {
    let score = 0;

    // Prefer older content
    if (result.year) {
      if (result.year < 2000) score += 50;
      else if (result.year < 2005) score += 30;
      else if (result.year < 2010) score += 10;
    }

    // Boost independent sites
    if (result.isIndependent) score += 20;

    // Boost no-ads sites
    if (!result.hasAds) score += 15;

    // Boost personal/community sites
    if (result.type === 'personal') score += 15;
    if (result.type === 'community') score += 10;

    // Penalize commercial
    if (result.type === 'commercial') score -= 20;

    return score;
  }
}
```

## UI Component

```typescript
// src/components/OldWebSearch.tsx

function OldWebSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OldWebSearchResults | null>(null);
  const [filters, setFilters] = useState({
    vintage: false,
    noAds: true,
    yearRange: { start: 1990, end: 2025 }
  });

  const aggregator = new OldWebSearchAggregator();

  const handleSearch = async () => {
    const searchResults = await aggregator.search(query, filters);
    setResults(searchResults);
  };

  return (
    <div className="old-web-search">
      <div className="search-header retro-style">
        <h1>🕸️ Old Web Discovery</h1>
        <p>Find the independent, ad-free, human web</p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the old web..."
        className="retro-input"
      />

      <div className="filters">
        <label>
          <input
            type="checkbox"
            checked={filters.vintage}
            onChange={(e) => setFilters({
              ...filters,
              vintage: e.target.checked
            })}
          />
          Vintage only (pre-2010)
        </label>

        <label>
          <input
            type="checkbox"
            checked={filters.noAds}
            onChange={(e) => setFilters({
              ...filters,
              noAds: e.target.checked
            })}
          />
          No commercial sites
        </label>

        <div className="year-range">
          <input
            type="number"
            value={filters.yearRange.start}
            onChange={(e) => setFilters({
              ...filters,
              yearRange: { ...filters.yearRange, start: parseInt(e.target.value) }
            })}
          />
          -
          <input
            type="number"
            value={filters.yearRange.end}
            onChange={(e) => setFilters({
              ...filters,
              yearRange: { ...filters.yearRange, end: parseInt(e.target.value) }
            })}
          />
        </div>
      </div>

      <button onClick={handleSearch} className="retro-button">
        Search
      </button>

      {results && (
        <div className="results">
          <div className="stats">
            Found {results.stats.totalResults} results
            • Avg year: {results.stats.avgYear}
            • Independent: {results.stats.independentSites}
          </div>

          {results.results.map(result => (
            <div key={result.url} className="old-web-result">
              <a href={result.url} className="result-title">
                {result.title}
              </a>

              <div className="result-meta">
                {result.year && <span className="year">{result.year}</span>}
                {result.type && <span className="type">{result.type}</span>}
                {!result.hasAds && <span className="badge">Ad-free</span>}
                {result.isIndependent && <span className="badge">Independent</span>}
              </div>

              <p className="result-description">{result.description}</p>

              <div className="result-url">{result.url}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Random Discovery Features

```typescript
// "I'm feeling nostalgic" button
async function randomOldPage(): Promise<string> {
  const wiby = new WibySearchEngine();
  return await wiby.surprise();
}

// Time machine - same query across years
async function timeTravel(query: string, years: number[]): Promise<Map<number, SearchResult[]>> {
  const wayback = new WaybackMachine();
  const results = new Map<number, SearchResult[]>();

  for (const year of years) {
    const yearResults = await wayback.searchArchive(query, { year });
    results.set(year, yearResults);
  }

  return results;
}
```
