/*
 * Admin Sites API
 * CRUD operations for site management
 * 
 * Endpoints:
 * GET    /api/admin/sites       - List all sites (full data)
 * POST   /api/admin/sites       - Create new site
 * PUT    /api/admin/sites/:id   - Update existing site
 * DELETE /api/admin/sites/:id   - Delete site
 */

import type { APIRoute } from 'astro';

// Site interface (matches existing)
interface Site {
  id: string;
  name: string;
  url: string;
  category?: string;
  description?: string;
  sandbox?: string;
  height?: number;
  iframeAllowed?: boolean;
  addedAt?: string;
  testCount?: number;
  tags?: string[];
}

// Mock database (shared with /api/iframe/sites)
const mockSites: Site[] = [
  {
    id: '1',
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org',
    category: 'reference',
    description: 'Free encyclopedia',
    sandbox: 'allow-same-origin allow-scripts',
    height: 600,
    iframeAllowed: true,
    addedAt: '2025-01-01T10:00:00Z',
    testCount: 245,
    tags: ['encyclopedia', 'reference', 'wiki'],
  },
  {
    id: '2',
    name: 'CodePen',
    url: 'https://codepen.io',
    category: 'development',
    description: 'Online code editor and playground',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: 500,
    iframeAllowed: true,
    addedAt: '2025-01-05T14:30:00Z',
    testCount: 189,
    tags: ['coding', 'playground', 'html', 'css', 'javascript'],
  },
  {
    id: '3',
    name: 'JSFiddle',
    url: 'https://jsfiddle.net',
    category: 'development',
    description: 'Test and share JavaScript, HTML, CSS code',
    sandbox: 'allow-scripts allow-same-origin',
    height: 500,
    iframeAllowed: true,
    addedAt: '2025-01-10T09:15:00Z',
    testCount: 167,
    tags: ['javascript', 'testing', 'fiddle'],
  },
  {
    id: '4',
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    category: 'documentation',
    description: 'Web technology documentation',
    sandbox: 'allow-same-origin allow-scripts',
    height: 700,
    iframeAllowed: false,
    addedAt: '2025-01-12T16:45:00Z',
    testCount: 98,
    tags: ['documentation', 'web', 'mdn'],
  },
  {
    id: '5',
    name: 'StackBlitz',
    url: 'https://stackblitz.com',
    category: 'development',
    description: 'Instant fullstack web IDE',
    sandbox: 'allow-scripts allow-same-origin allow-forms allow-modals',
    height: 600,
    iframeAllowed: true,
    addedAt: '2025-01-20T11:00:00Z',
    testCount: 156,
    tags: ['ide', 'vscode', 'nodejs'],
  },
  {
    id: '6',
    name: 'Repl.it',
    url: 'https://replit.com',
    category: 'development',
    description: 'Collaborative browser-based IDE',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: 550,
    iframeAllowed: true,
    addedAt: '2025-01-22T13:20:00Z',
    testCount: 134,
    tags: ['ide', 'collaborative', 'multi-language'],
  },
  {
    id: '7',
    name: 'GitHub',
    url: 'https://github.com',
    category: 'development',
    description: 'Version control and collaboration',
    sandbox: 'allow-scripts allow-same-origin',
    height: 800,
    iframeAllowed: false,
    addedAt: '2025-01-25T08:30:00Z',
    testCount: 201,
    tags: ['git', 'version-control', 'collaboration'],
  },
  {
    id: '8',
    name: 'CodeSandbox',
    url: 'https://codesandbox.io',
    category: 'development',
    description: 'Online code editor for rapid web development',
    sandbox: 'allow-scripts allow-same-origin allow-forms allow-modals',
    height: 600,
    iframeAllowed: true,
    addedAt: '2025-01-28T15:00:00Z',
    testCount: 178,
    tags: ['react', 'sandbox', 'templates'],
  },
  {
    id: '9',
    name: 'Google Arts & Culture',
    url: 'https://artsandculture.google.com',
    category: 'art-culture',
    description: 'Kolekcja dzieł sztuki iAPI kultury',
    sandbox: 'allow-scripts allow-same-origin',
    height: 700,
    iframeAllowed: true,
    addedAt: '2025-02-01T10:00:00Z',
    testCount: 312,
    tags: ['art', 'culture', 'museum', 'api', 'collection'],
  },
  {
    id: '10',
    name: 'Art UK',
    url: 'https://artuk.org',
    category: 'art-culture',
    description: 'Kolekcja brytyjskiej sztuki',
    sandbox: 'allow-scripts allow-same-origin',
    height: 650,
    iframeAllowed: true,
    addedAt: '2025-02-03T11:30:00Z',
    testCount: 156,
    tags: ['art', 'uk', 'collection', 'gallery'],
  },
  {
    id: '11',
    name: 'Europeana',
    url: 'https://www.europeana.eu',
    category: 'art-culture',
    description: 'Platforma europejskiego dziedzictwa kulturowego',
    sandbox: 'allow-scripts allow-same-origin',
    height: 700,
    iframeAllowed: true,
    addedAt: '2025-02-05T14:00:00Z',
    testCount: 289,
    tags: ['culture', 'heritage', 'europe', 'platform'],
  },
  {
    id: '12',
    name: 'RKD',
    url: 'https://rkd.nl/en/collection/digital-collection',
    category: 'art-culture',
    description: 'Niderlandzka baza danych artystycznych',
    sandbox: 'allow-scripts allow-same-origin',
    height: 650,
    iframeAllowed: true,
    addedAt: '2025-02-07T09:45:00Z',
    testCount: 134,
    tags: ['art', 'netherlands', 'database', 'collection'],
  },
  {
    id: '13',
    name: 'Digital Art Archive',
    url: 'https://digitalartarchive.at/home/',
    category: 'digital-art',
    description: 'Archiwum sztuki cyfrowej',
    sandbox: 'allow-scripts allow-same-origin',
    height: 600,
    iframeAllowed: true,
    addedAt: '2025-02-10T12:00:00Z',
    testCount: 98,
    tags: ['digital-art', 'archive', 'contemporary'],
  },
  {
    id: '14',
    name: 'Univ. of Edinburgh Library',
    url: 'https://library.ed.ac.uk/subject-guides/art-design/internet',
    category: 'architecture',
    description: 'Zasoby online z architektury i designu',
    sandbox: 'allow-scripts allow-same-origin',
    height: 700,
    iframeAllowed: true,
    addedAt: '2025-02-12T10:30:00Z',
    testCount: 87,
    tags: ['architecture', 'design', 'resources', 'education'],
  },
  {
    id: '15',
    name: 'Internet Archive',
    url: 'https://archive.org',
    category: 'media',
    description: 'Multimedialne archiwum internetowe',
    sandbox: 'allow-scripts allow-same-origin',
    height: 750,
    iframeAllowed: true,
    addedAt: '2025-02-15T15:30:00Z',
    testCount: 445,
    tags: ['archive', 'multimedia', 'books', 'films', 'music'],
  },
  {
    id: '16',
    name: 'NYPL Digital Collections',
    url: 'https://digitalcollections.nypl.org',
    category: 'media',
    description: 'Biblioteka cyfrowa New York Public Library',
    sandbox: 'allow-scripts allow-same-origin',
    height: 700,
    iframeAllowed: true,
    addedAt: '2025-02-18T11:00:00Z',
    testCount: 267,
    tags: ['library', 'digital', 'collections', 'nypl'],
  },
  {
    id: '17',
    name: 'Research Catalogue',
    url: 'https://www.researchcatalogue.net',
    category: 'research',
    description: 'Platforma artystycznych badań naukowych',
    sandbox: 'allow-scripts allow-same-origin',
    height: 650,
    iframeAllowed: true,
    addedAt: '2025-02-20T13:45:00Z',
    testCount: 112,
    tags: ['research', 'academic', 'art', 'publications'],
  },
  {
    id: '18',
    name: 'Internet Archive - Moving Images',
    url: 'https://archive.org/details/movies',
    category: 'video',
    description: 'Ogromna kolekcja darmowych filmów i dokumentów z iframe embed',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: 600,
    iframeAllowed: true,
    addedAt: '2025-02-22T10:00:00Z',
    testCount: 523,
    tags: ['video', 'archive', 'movies', 'embed', 'free'],
  },
  {
    id: '19',
    name: 'YouTube Player API',
    url: 'https://developers.google.com/youtube/iframe_api_reference',
    category: 'video',
    description: 'Uniwersalny iframe player z pełną kontrolą API',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen allow-autoplay',
    height: 500,
    iframeAllowed: true,
    addedAt: '2025-02-23T11:30:00Z',
    testCount: 892,
    tags: ['youtube', 'video', 'player', 'api', 'embed'],
  },
  {
    id: '20',
    name: 'VdoCipher HTML5 Player',
    url: 'https://www.vdocipher.com/blog/html5-video-player-for-your-website/',
    category: 'video',
    description: 'Bezpieczny player z DRM i zaawansowaną ochroną',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen allow-encrypted-media',
    height: 550,
    iframeAllowed: true,
    addedAt: '2025-02-24T14:00:00Z',
    testCount: 234,
    tags: ['video', 'player', 'drm', 'security', 'html5'],
  },
  {
    id: '21',
    name: 'Elfsight Movie Widget',
    url: 'https://elfsight.com/movie-widget/iframe/',
    category: 'video',
    description: 'Darmowy widget i iframe player do embedowania filmów',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: 500,
    iframeAllowed: true,
    addedAt: '2025-02-25T09:30:00Z',
    testCount: 167,
    tags: ['widget', 'embed', 'free', 'player', 'iframe'],
  },
  {
    id: '22',
    name: 'Viostream Responsive Player',
    url: 'https://help.viostream.com/frequently-asked-questions/how-do-i-make-an-iframe-embed-responsive',
    category: 'video',
    description: 'Responsywny player z konfiguracją różnych aspektów',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: 550,
    iframeAllowed: true,
    addedAt: '2025-02-26T12:00:00Z',
    testCount: 189,
    tags: ['responsive', 'player', 'video', 'adaptive'],
  },
  {
    id: '23',
    name: 'Archive.org Video Player',
    url: 'https://blog.archive.org/2012/01/14/new-off-site-videoaudio-embed-codes/',
    category: 'video',
    description: 'Nowoczesny player z playlist, napisami i pełnym ekranem',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: 600,
    iframeAllowed: true,
    addedAt: '2025-02-27T15:30:00Z',
    testCount: 445,
    tags: ['archive', 'player', 'playlist', 'subtitles', 'fullscreen'],
  },
];

// GET - List all sites
export const GET: APIRoute = async ({ request }) => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        data: mockSites,
        count: mockSites.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch sites',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST - Create new site
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || !body.url) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Name and URL are required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create new site
    const newSite: Site = {
      id: String(Date.now()),
      name: body.name,
      url: body.url,
      category: body.category,
      description: body.description,
      sandbox: body.sandbox,
      height: body.height,
      iframeAllowed: body.iframeAllowed || false,
      addedAt: new Date().toISOString(),
      testCount: 0,
      tags: body.tags || [],
    };

    mockSites.push(newSite);

    return new Response(
      JSON.stringify({
        success: true,
        data: newSite,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to create site',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// PUT - Update site
export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const siteId = new URL(request.url).pathname.split('/').pop();
    const body = await request.json();

    const siteIndex = mockSites.findIndex((s) => s.id === siteId);

    if (siteIndex === -1) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Site not found',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update site
    mockSites[siteIndex] = {
      ...mockSites[siteIndex],
      ...body,
      id: siteId, // Preserve ID
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: mockSites[siteIndex],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to update site',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// DELETE - Delete site
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const siteId = new URL(request.url).pathname.split('/').pop();
    const siteIndex = mockSites.findIndex((s) => s.id === siteId);

    if (siteIndex === -1) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Site not found',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    mockSites.splice(siteIndex, 1);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Site deleted successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to delete site',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
