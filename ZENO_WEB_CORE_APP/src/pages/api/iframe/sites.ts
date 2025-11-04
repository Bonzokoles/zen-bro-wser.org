/**
 * API: /api/iframe/sites
 * ADVANCED Backend REST API dla zarządzania stronami testowymi
 * 
 * Endpointy:
 * GET /api/iframe/sites - lista wszystkich stron
 * GET /api/iframe/sites?q=wikipedia - wyszukiwanie (name/description/tags)
 * GET /api/iframe/sites?category=Documentation - filtrowanie po kategorii
 * GET /api/iframe/sites?iframeAllowed=true - tylko iframe-friendly
 * GET /api/iframe/sites?sort=alphabet|added|popular - sortowanie
 * GET /api/iframe/sites?page=1&limit=20 - paginacja
 * POST /api/iframe/sites - dodaj nową stronę
 */

import type { APIRoute } from 'astro';

// ============================================
// MOCK DATABASE
// ============================================

interface Site {
  id: string;
  name: string;
  url: string;
  category?: string;
  description?: string;
  sandbox?: string;
  allow?: string;
  height?: string;
  // NEW FIELDS for ADVANCED search
  iframeAllowed?: boolean;
  addedAt?: string; // ISO 8601
  testCount?: number;
  tags?: string[];
}

const sites: Site[] = [
  {
    id: '1',
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Main_Page',
    category: 'documentation',
    description: 'Free online encyclopedia',
    sandbox: 'allow-same-origin allow-scripts',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-01-10T10:00:00Z',
    testCount: 42,
    tags: ['wiki', 'knowledge', 'public']
  },
  {
    id: '2',
    name: 'CodePen Embed',
    url: 'https://codepen.io/team/codepen/embed/preview/PNaGbb',
    category: 'playground',
    description: 'Interactive code playground',
    sandbox: 'allow-scripts allow-forms allow-popups',
    height: '500px',
    iframeAllowed: true,
    addedAt: '2025-01-15T14:30:00Z',
    testCount: 89,
    tags: ['code', 'editor', 'playground']
  },
  {
    id: '3',
    name: 'JSFiddle',
    url: 'https://jsfiddle.net/',
    category: 'playground',
    description: 'Test JavaScript, HTML, CSS online',
    sandbox: 'allow-scripts allow-forms allow-popups allow-modals',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-01-12T09:15:00Z',
    testCount: 67,
    tags: ['javascript', 'fiddle', 'testing']
  },
  {
    id: '4',
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/',
    category: 'documentation',
    description: 'Web technology documentation',
    sandbox: 'allow-same-origin allow-scripts allow-popups',
    height: '700px',
    iframeAllowed: false,
    addedAt: '2025-01-08T16:45:00Z',
    testCount: 34,
    tags: ['docs', 'mdn', 'reference']
  },
  {
    id: '5',
    name: 'StackBlitz',
    url: 'https://stackblitz.com',
    category: 'playground',
    description: 'Online IDE for web development',
    sandbox: 'allow-scripts allow-forms allow-popups',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-01-20T11:00:00Z',
    testCount: 156,
    tags: ['ide', 'vscode', 'nodejs']
  },
  {
    id: '6',
    name: 'Repl.it',
    url: 'https://replit.com',
    category: 'playground',
    description: 'Collaborative browser-based IDE',
    sandbox: 'allow-scripts allow-forms',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-01-18T13:20:00Z',
    testCount: 121,
    tags: ['repl', 'collaboration', 'multiplayer']
  },
  {
    id: '7',
    name: 'GitHub',
    url: 'https://github.com',
    category: 'tools',
    description: 'Version control and collaboration',
    sandbox: 'allow-same-origin allow-scripts',
    height: '700px',
    iframeAllowed: false,
    addedAt: '2025-01-05T08:00:00Z',
    testCount: 28,
    tags: ['git', 'github', 'vcs']
  },
  {
    id: '8',
    name: 'CodeSandbox',
    url: 'https://codesandbox.io',
    category: 'playground',
    description: 'Instant IDE and prototyping tool',
    sandbox: 'allow-scripts allow-forms allow-popups allow-modals',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-01-22T15:45:00Z',
    testCount: 203,
    tags: ['sandbox', 'react', 'vue']
  },
  {
    id: '9',
    name: 'Google Arts & Culture',
    url: 'https://artsandculture.google.com',
    category: 'art-culture',
    description: 'Kolekcja dzieł sztuki i API kultury',
    sandbox: 'allow-scripts allow-same-origin',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-02-01T10:00:00Z',
    testCount: 312,
    tags: ['art', 'culture', 'museum', 'api', 'collection']
  },
  {
    id: '10',
    name: 'Art UK',
    url: 'https://artuk.org',
    category: 'art-culture',
    description: 'Kolekcja brytyjskiej sztuki',
    sandbox: 'allow-scripts allow-same-origin',
    height: '650px',
    iframeAllowed: true,
    addedAt: '2025-02-03T11:30:00Z',
    testCount: 156,
    tags: ['art', 'uk', 'collection', 'gallery']
  },
  {
    id: '11',
    name: 'Europeana',
    url: 'https://www.europeana.eu',
    category: 'art-culture',
    description: 'Platforma europejskiego dziedzictwa kulturowego',
    sandbox: 'allow-scripts allow-same-origin',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-02-05T14:00:00Z',
    testCount: 289,
    tags: ['culture', 'heritage', 'europe', 'platform']
  },
  {
    id: '12',
    name: 'RKD',
    url: 'https://rkd.nl/en/collection/digital-collection',
    category: 'art-culture',
    description: 'Niderlandzka baza danych artystycznych',
    sandbox: 'allow-scripts allow-same-origin',
    height: '650px',
    iframeAllowed: true,
    addedAt: '2025-02-07T09:45:00Z',
    testCount: 134,
    tags: ['art', 'netherlands', 'database', 'collection']
  },
  {
    id: '13',
    name: 'Digital Art Archive',
    url: 'https://digitalartarchive.at/home/',
    category: 'digital-art',
    description: 'Archiwum sztuki cyfrowej',
    sandbox: 'allow-scripts allow-same-origin',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-02-10T12:00:00Z',
    testCount: 98,
    tags: ['digital-art', 'archive', 'contemporary']
  },
  {
    id: '14',
    name: 'Univ. of Edinburgh Library',
    url: 'https://library.ed.ac.uk/subject-guides/art-design/internet',
    category: 'architecture',
    description: 'Zasoby online z architektury i designu',
    sandbox: 'allow-scripts allow-same-origin',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-02-12T10:30:00Z',
    testCount: 87,
    tags: ['architecture', 'design', 'resources', 'education']
  },
  {
    id: '15',
    name: 'Internet Archive',
    url: 'https://archive.org',
    category: 'media',
    description: 'Multimedialne archiwum internetowe',
    sandbox: 'allow-scripts allow-same-origin',
    height: '750px',
    iframeAllowed: true,
    addedAt: '2025-02-15T15:30:00Z',
    testCount: 445,
    tags: ['archive', 'multimedia', 'books', 'films', 'music']
  },
  {
    id: '16',
    name: 'NYPL Digital Collections',
    url: 'https://digitalcollections.nypl.org',
    category: 'media',
    description: 'Biblioteka cyfrowa New York Public Library',
    sandbox: 'allow-scripts allow-same-origin',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-02-18T11:00:00Z',
    testCount: 267,
    tags: ['library', 'digital', 'collections', 'nypl']
  },
  {
    id: '17',
    name: 'Research Catalogue',
    url: 'https://www.researchcatalogue.net',
    category: 'research',
    description: 'Platforma artystycznych badań naukowych',
    sandbox: 'allow-scripts allow-same-origin',
    height: '650px',
    iframeAllowed: true,
    addedAt: '2025-02-20T13:45:00Z',
    testCount: 112,
    tags: ['research', 'academic', 'art', 'publications']
  },
  {
    id: '18',
    name: 'Internet Archive - Moving Images',
    url: 'https://archive.org/details/movies',
    category: 'video',
    description: 'Ogromna kolekcja darmowych filmów i dokumentów z iframe embed',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-02-22T10:00:00Z',
    testCount: 523,
    tags: ['video', 'archive', 'movies', 'embed', 'free']
  },
  {
    id: '19',
    name: 'YouTube Player API',
    url: 'https://developers.google.com/youtube/iframe_api_reference',
    category: 'video',
    description: 'Uniwersalny iframe player z pełną kontrolą API',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen allow-autoplay',
    height: '500px',
    iframeAllowed: true,
    addedAt: '2025-02-23T11:30:00Z',
    testCount: 892,
    tags: ['youtube', 'video', 'player', 'api', 'embed']
  },
  {
    id: '20',
    name: 'VdoCipher HTML5 Player',
    url: 'https://www.vdocipher.com/blog/html5-video-player-for-your-website/',
    category: 'video',
    description: 'Bezpieczny player z DRM i zaawansowaną ochroną',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen allow-encrypted-media',
    height: '550px',
    iframeAllowed: true,
    addedAt: '2025-02-24T14:00:00Z',
    testCount: 234,
    tags: ['video', 'player', 'drm', 'security', 'html5']
  },
  {
    id: '21',
    name: 'Elfsight Movie Widget',
    url: 'https://elfsight.com/movie-widget/iframe/',
    category: 'video',
    description: 'Darmowy widget i iframe player do embedowania filmów',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '500px',
    iframeAllowed: true,
    addedAt: '2025-02-25T09:30:00Z',
    testCount: 167,
    tags: ['widget', 'embed', 'free', 'player', 'iframe']
  },
  {
    id: '22',
    name: 'Viostream Responsive Player',
    url: 'https://help.viostream.com/frequently-asked-questions/how-do-i-make-an-iframe-embed-responsive',
    category: 'video',
    description: 'Responsywny player z konfiguracją różnych aspektów',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '550px',
    iframeAllowed: true,
    addedAt: '2025-02-26T12:00:00Z',
    testCount: 189,
    tags: ['responsive', 'player', 'video', 'adaptive']
  },
  {
    id: '23',
    name: 'Archive.org Video Player',
    url: 'https://blog.archive.org/2012/01/14/new-off-site-videoaudio-embed-codes/',
    category: 'video',
    description: 'Nowoczesny player z playlist, napisami i pełnym ekranem',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-02-27T15:30:00Z',
    testCount: 445,
    tags: ['archive', 'player', 'playlist', 'subtitles', 'fullscreen']
  }
];

// ============================================
// GET - ADVANCED: Lista stron + wyszukiwanie + filtry + sortowanie + paginacja
// ============================================

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q');
  const category = url.searchParams.get('category');
  const iframeAllowedParam = url.searchParams.get('iframeAllowed');
  const sortParam = url.searchParams.get('sort') || 'alphabet';
  const pageParam = parseInt(url.searchParams.get('page') || '1', 10);
  const limitParam = parseInt(url.searchParams.get('limit') || '20', 10);

  let results = [...sites];

  // 1. WYSZUKIWANIE - po nazwie, opisie, tagach
  if (q) {
    const query = q.toLowerCase();
    results = results.filter(
      s =>
        s.name.toLowerCase().includes(query) ||
        (s.description?.toLowerCase().includes(query) ?? false) ||
        (s.tags?.some((tag) => tag.toLowerCase().includes(query)) ?? false)
    );
  }

  // 2. FILTROWANIE - po kategorii
  if (category) {
    results = results.filter(s => s.category === category);
  }

  // 3. FILTROWANIE - tylko iframe-friendly
  if (iframeAllowedParam === 'true') {
    results = results.filter(s => s.iframeAllowed === true);
  }

  // 4. SORTOWANIE
  if (sortParam === 'alphabet') {
    // Alfabetycznie A-Z
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortParam === 'added') {
    // Po dacie dodania (najnowsze pierwsze)
    results.sort((a, b) => {
      const dateA = new Date(a.addedAt || '').getTime();
      const dateB = new Date(b.addedAt || '').getTime();
      return dateB - dateA;
    });
  } else if (sortParam === 'popular') {
    // Po popularności (testCount descending)
    results.sort((a, b) => (b.testCount || 0) - (a.testCount || 0));
  }

  // 5. PAGINACJA
  const total = results.length;
  const totalPages = Math.ceil(total / limitParam);
  const start = (pageParam - 1) * limitParam;
  const paged = results.slice(start, start + limitParam);

  // 6. ODPOWIEDŹ z metadanymi
  return new Response(JSON.stringify({
    success: true,
    data: paged,
    count: paged.length,
    total: total,
    page: pageParam,
    pages: totalPages
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// ============================================
// POST - Dodaj nową stronę
// ============================================

export const POST: APIRoute = async ({ request }) => {
  const { name, url, category, description, sandbox, height } = await request.json();

  // Walidacja
  if (!name || !url) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Name and URL required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Nowa strona
  const newSite: Site = {
    id: (sites.length + 1).toString(),
    name,
    url,
    category,
    description,
    sandbox: sandbox || 'allow-scripts',
    height: height || '500px',
  };

  sites.push(newSite);

  return new Response(JSON.stringify({
    success: true,
    data: newSite
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
