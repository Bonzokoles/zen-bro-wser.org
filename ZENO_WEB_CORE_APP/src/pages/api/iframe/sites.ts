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
  },
  {
    id: '24',
    name: 'Wikiless (Wikipedia Mirror)',
    url: 'https://wikiless.org',
    category: 'documentation',
    description: 'Privacy-friendly Wikipedia mirror',
    sandbox: 'allow-scripts allow-same-origin',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-03-01T10:00:00Z',
    testCount: 234,
    tags: ['wiki', 'privacy', 'mirror', 'knowledge']
  },
  {
    id: '25',
    name: 'HTTPBin',
    url: 'https://httpbin.org',
    category: 'tools',
    description: 'HTTP request & response testing service',
    sandbox: 'allow-scripts allow-same-origin',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-03-02T11:30:00Z',
    testCount: 567,
    tags: ['api', 'testing', 'http', 'debugging']
  },
  {
    id: '26',
    name: 'RegExr',
    url: 'https://regexr.com',
    category: 'tools',
    description: 'Learn, build, & test Regular Expressions',
    sandbox: 'allow-scripts allow-same-origin',
    height: '650px',
    iframeAllowed: true,
    addedAt: '2025-03-03T14:00:00Z',
    testCount: 432,
    tags: ['regex', 'testing', 'learning', 'tool']
  },
  {
    id: '27',
    name: 'JSON Placeholder',
    url: 'https://jsonplaceholder.typicode.com',
    category: 'tools',
    description: 'Free fake API for testing and prototyping',
    sandbox: 'allow-scripts allow-same-origin',
    height: '500px',
    iframeAllowed: true,
    addedAt: '2025-03-04T09:15:00Z',
    testCount: 789,
    tags: ['api', 'json', 'testing', 'mock']
  },
  {
    id: '28',
    name: 'Can I Use',
    url: 'https://caniuse.com',
    category: 'documentation',
    description: 'Browser support tables for web technologies',
    sandbox: 'allow-scripts allow-same-origin',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-03-05T12:45:00Z',
    testCount: 654,
    tags: ['browser', 'compatibility', 'css', 'javascript']
  },
  {
    id: '29',
    name: 'DevDocs',
    url: 'https://devdocs.io',
    category: 'documentation',
    description: 'All-in-one API documentation browser',
    sandbox: 'allow-scripts allow-same-origin',
    height: '750px',
    iframeAllowed: true,
    addedAt: '2025-03-06T15:20:00Z',
    testCount: 891,
    tags: ['docs', 'api', 'reference', 'developer']
  },
  {
    id: '30',
    name: 'W3Schools',
    url: 'https://www.w3schools.com',
    category: 'documentation',
    description: 'Learn web development with tutorials',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-03-07T10:00:00Z',
    testCount: 1234,
    tags: ['learning', 'tutorial', 'html', 'css', 'javascript']
  },
  {
    id: '31',
    name: 'CSS-Tricks',
    url: 'https://css-tricks.com',
    category: 'documentation',
    description: 'Tips, tricks, and techniques on CSS',
    sandbox: 'allow-scripts allow-same-origin',
    height: '650px',
    iframeAllowed: true,
    addedAt: '2025-03-08T13:30:00Z',
    testCount: 567,
    tags: ['css', 'design', 'tutorial', 'frontend']
  },
  {
    id: '32',
    name: 'Smashing Magazine',
    url: 'https://www.smashingmagazine.com',
    category: 'documentation',
    description: 'Web design and development articles',
    sandbox: 'allow-scripts allow-same-origin',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-03-09T11:00:00Z',
    testCount: 445,
    tags: ['design', 'development', 'articles', 'ux']
  },
  {
    id: '33',
    name: 'Smithsonian Open Access',
    url: 'https://www.si.edu/openaccess',
    category: 'art-culture',
    description: 'Millions of images from Smithsonian museums',
    sandbox: 'allow-scripts allow-same-origin',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-03-10T14:30:00Z',
    testCount: 678,
    tags: ['museum', 'art', 'images', 'open-access']
  },
  {
    id: '34',
    name: 'Met Museum Collection',
    url: 'https://www.metmuseum.org/art/collection',
    category: 'art-culture',
    description: 'Metropolitan Museum of Art collection',
    sandbox: 'allow-scripts allow-same-origin',
    height: '750px',
    iframeAllowed: true,
    addedAt: '2025-03-11T09:45:00Z',
    testCount: 789,
    tags: ['museum', 'art', 'collection', 'met']
  },
  {
    id: '35',
    name: 'Rijksmuseum',
    url: 'https://www.rijksmuseum.nl/en',
    category: 'art-culture',
    description: 'Dutch national museum of art and history',
    sandbox: 'allow-scripts allow-same-origin',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-03-12T12:00:00Z',
    testCount: 523,
    tags: ['museum', 'art', 'history', 'netherlands']
  },
  {
    id: '36',
    name: 'Glitch',
    url: 'https://glitch.com',
    category: 'playground',
    description: 'Build fast, full-stack web apps in browser',
    sandbox: 'allow-scripts allow-forms allow-popups',
    height: '650px',
    iframeAllowed: true,
    addedAt: '2025-03-13T15:20:00Z',
    testCount: 934,
    tags: ['ide', 'nodejs', 'fullstack', 'collaboration']
  },
  {
    id: '37',
    name: 'Observable',
    url: 'https://observablehq.com',
    category: 'playground',
    description: 'JavaScript notebooks for data visualization',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-03-14T10:30:00Z',
    testCount: 567,
    tags: ['data-viz', 'javascript', 'notebook', 'd3']
  },
  {
    id: '38',
    name: 'Codewars',
    url: 'https://www.codewars.com',
    category: 'playground',
    description: 'Improve skills by training on coding challenges',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: '650px',
    iframeAllowed: true,
    addedAt: '2025-03-15T13:00:00Z',
    testCount: 1123,
    tags: ['coding', 'challenges', 'practice', 'kata']
  },
  {
    id: '39',
    name: 'LeetCode Playground',
    url: 'https://leetcode.com/playground',
    category: 'playground',
    description: 'Practice coding interview problems',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-03-16T11:45:00Z',
    testCount: 2345,
    tags: ['leetcode', 'interview', 'algorithms', 'practice']
  },
  {
    id: '40',
    name: 'RunKit',
    url: 'https://runkit.com',
    category: 'playground',
    description: 'Node.js playground with npm packages',
    sandbox: 'allow-scripts allow-same-origin',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-03-17T14:15:00Z',
    testCount: 678,
    tags: ['nodejs', 'npm', 'playground', 'repl']
  },
  {
    id: '41',
    name: 'Postman Echo',
    url: 'https://postman-echo.com',
    category: 'tools',
    description: 'Service for testing HTTP requests',
    sandbox: 'allow-scripts allow-same-origin',
    height: '550px',
    iframeAllowed: true,
    addedAt: '2025-03-18T09:30:00Z',
    testCount: 456,
    tags: ['api', 'testing', 'http', 'postman']
  },
  {
    id: '42',
    name: 'Reqres',
    url: 'https://reqres.in',
    category: 'tools',
    description: 'Hosted REST-API ready to respond',
    sandbox: 'allow-scripts allow-same-origin',
    height: '500px',
    iframeAllowed: true,
    addedAt: '2025-03-19T12:00:00Z',
    testCount: 789,
    tags: ['api', 'rest', 'testing', 'mock']
  },
  {
    id: '43',
    name: 'ExtendsClass REST Client',
    url: 'https://extendsclass.com/rest-client-online.html',
    category: 'tools',
    description: 'Online REST API testing tool',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: '650px',
    iframeAllowed: true,
    addedAt: '2025-03-20T15:30:00Z',
    testCount: 345,
    tags: ['rest', 'api', 'testing', 'client']
  },
  {
    id: '44',
    name: 'Hoppscotch',
    url: 'https://hoppscotch.io',
    category: 'tools',
    description: 'Open source API development ecosystem',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-03-21T10:45:00Z',
    testCount: 1234,
    tags: ['api', 'testing', 'graphql', 'websocket']
  },
  {
    id: '45',
    name: 'Compiler Explorer (Godbolt)',
    url: 'https://godbolt.org',
    category: 'playground',
    description: 'Explore compiler output for C/C++/Rust',
    sandbox: 'allow-scripts allow-same-origin',
    height: '750px',
    iframeAllowed: true,
    addedAt: '2025-03-22T13:20:00Z',
    testCount: 567,
    tags: ['compiler', 'c++', 'rust', 'assembly']
  },
  {
    id: '46',
    name: 'SQL Fiddle',
    url: 'http://sqlfiddle.com',
    category: 'playground',
    description: 'Test SQL queries in different databases',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-03-23T11:00:00Z',
    testCount: 678,
    tags: ['sql', 'database', 'testing', 'query']
  },
  {
    id: '47',
    name: 'DB Fiddle',
    url: 'https://www.db-fiddle.com',
    category: 'playground',
    description: 'Online SQL database playground',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: '650px',
    iframeAllowed: true,
    addedAt: '2025-03-24T14:30:00Z',
    testCount: 543,
    tags: ['sql', 'postgres', 'mysql', 'playground']
  },
  {
    id: '48',
    name: 'Python Tutor',
    url: 'https://pythontutor.com',
    category: 'playground',
    description: 'Visualize Python code execution',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-03-25T09:15:00Z',
    testCount: 891,
    tags: ['python', 'visualization', 'learning', 'debugging']
  },
  {
    id: '49',
    name: 'Regex101',
    url: 'https://regex101.com',
    category: 'tools',
    description: 'Build, test, and debug regex patterns',
    sandbox: 'allow-scripts allow-same-origin',
    height: '650px',
    iframeAllowed: true,
    addedAt: '2025-03-26T12:45:00Z',
    testCount: 1456,
    tags: ['regex', 'testing', 'debugging', 'tool']
  },
  {
    id: '50',
    name: 'Carbon (Code Images)',
    url: 'https://carbon.now.sh',
    category: 'tools',
    description: 'Create beautiful images of source code',
    sandbox: 'allow-scripts allow-same-origin',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-03-27T15:00:00Z',
    testCount: 789,
    tags: ['screenshot', 'code', 'design', 'sharing']
  },
  {
    id: '51',
    name: 'Diff Checker',
    url: 'https://www.diffchecker.com',
    category: 'tools',
    description: 'Compare text differences online',
    sandbox: 'allow-scripts allow-same-origin allow-forms',
    height: '650px',
    iframeAllowed: true,
    addedAt: '2025-03-28T10:30:00Z',
    testCount: 567,
    tags: ['diff', 'compare', 'text', 'tool']
  },
  {
    id: '52',
    name: 'JWT.io',
    url: 'https://jwt.io',
    category: 'tools',
    description: 'Decode, verify and generate JWT tokens',
    sandbox: 'allow-scripts allow-same-origin',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-03-29T13:15:00Z',
    testCount: 1123,
    tags: ['jwt', 'token', 'auth', 'decode']
  },
  {
    id: '53',
    name: 'Epoch Converter',
    url: 'https://www.epochconverter.com',
    category: 'tools',
    description: 'Convert Unix timestamps to human dates',
    sandbox: 'allow-scripts allow-same-origin',
    height: '550px',
    iframeAllowed: true,
    addedAt: '2025-03-30T11:45:00Z',
    testCount: 345,
    tags: ['time', 'unix', 'timestamp', 'converter']
  },
  {
    id: '54',
    name: 'Filman.cc',
    url: 'https://filman.cc',
    category: 'polish-vod',
    description: 'Polski serwis VOD z filmami i serialami',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-01T10:00:00Z',
    testCount: 1567,
    tags: ['vod', 'filmy', 'seriale', 'polski', 'streaming']
  },
  {
    id: '55',
    name: 'Vizjer.pl',
    url: 'https://vizjer.pl',
    category: 'polish-vod',
    description: 'Platforma streamingowa z polskimi filmami',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-02T11:30:00Z',
    testCount: 1234,
    tags: ['vod', 'streaming', 'polski', 'filmy']
  },
  {
    id: '56',
    name: 'ekino-tv.pl',
    url: 'https://ekino-tv.pl',
    category: 'polish-vod',
    description: 'Kino online - filmy i seriale za darmo',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-03T14:00:00Z',
    testCount: 987,
    tags: ['vod', 'kino', 'online', 'polski', 'free']
  },
  {
    id: '57',
    name: 'Zerknij.tv',
    url: 'https://zerknij.tv',
    category: 'polish-vod',
    description: 'Streamingowy serwis filmowy',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-04T09:15:00Z',
    testCount: 876,
    tags: ['streaming', 'filmy', 'seriale', 'polski']
  },
  {
    id: '58',
    name: 'Zaluknij.cc',
    url: 'https://zaluknij.cc',
    category: 'polish-vod',
    description: 'Portal z filmami i serialami online',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-05T12:45:00Z',
    testCount: 765,
    tags: ['vod', 'filmy', 'online', 'polski']
  },
  {
    id: '59',
    name: 'Filser.cc',
    url: 'https://filser.cc',
    category: 'polish-vod',
    description: 'Serwis z darmowymi filmami i serialami',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-06T15:20:00Z',
    testCount: 654,
    tags: ['filmy', 'seriale', 'free', 'polski', 'vod']
  },
  {
    id: '60',
    name: 'nc.g47',
    url: 'https://nc.g47.eu',
    category: 'polish-vod',
    description: 'Portal filmowy z szerokim wyborem treści',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-07T10:30:00Z',
    testCount: 543,
    tags: ['vod', 'filmy', 'streaming', 'polski']
  },
  {
    id: '61',
    name: 'f-cechy-th.pl',
    url: 'https://f-cechy-th.pl',
    category: 'polish-vod',
    description: 'Platforma z filmami tematycznymi',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-08T13:00:00Z',
    testCount: 432,
    tags: ['filmy', 'tematyczne', 'polski', 'vod']
  },
  {
    id: '62',
    name: 'zerion.cc',
    url: 'https://zerion.cc',
    category: 'polish-vod',
    description: 'Serwis streamingowy z bogatą biblioteką',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-09T11:45:00Z',
    testCount: 789,
    tags: ['streaming', 'vod', 'filmy', 'polski']
  },
  {
    id: '63',
    name: 'playz.cc',
    url: 'https://playz.cc',
    category: 'polish-vod',
    description: 'Portal z filmami i serialami do obejrzenia online',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-10T14:30:00Z',
    testCount: 678,
    tags: ['vod', 'play', 'filmy', 'seriale', 'polski']
  },
  {
    id: '64',
    name: 'filevids.cc',
    url: 'https://filevids.cc',
    category: 'polish-vod',
    description: 'Hosting wideo z filmami i serialami',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-11T09:00:00Z',
    testCount: 567,
    tags: ['video', 'hosting', 'filmy', 'polski']
  },
  {
    id: '65',
    name: 'Zenu.cc',
    url: 'https://zenu.cc',
    category: 'polish-vod',
    description: 'Platforma VOD z polskimi produkcjami',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-12T12:15:00Z',
    testCount: 456,
    tags: ['vod', 'polski', 'produkcje', 'filmy']
  },
  {
    id: '66',
    name: 'Filmowo.club',
    url: 'https://filmowo.club',
    category: 'polish-vod',
    description: 'Klub miłośników filmów - streaming online',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-13T15:45:00Z',
    testCount: 890,
    tags: ['filmy', 'klub', 'streaming', 'polski', 'community']
  },
  {
    id: '67',
    name: 'CDA.pl',
    url: 'https://www.cda.pl',
    category: 'polish-vod',
    description: 'Największy polski portal z wideo - CDA (Cały Dzień Anime)',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-14T10:00:00Z',
    testCount: 5678,
    tags: ['cda', 'wideo', 'filmy', 'seriale', 'polski', 'popular']
  },
  {
    id: '68',
    name: 'Freedisc.pl',
    url: 'https://freedisc.pl',
    category: 'polish-vod',
    description: 'Darmowy hosting plików wideo i filmów',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-15T13:30:00Z',
    testCount: 2345,
    tags: ['free', 'hosting', 'wideo', 'filmy', 'polski']
  },
  {
    id: '69',
    name: 'Zaq2.com',
    url: 'https://zaq2.com',
    category: 'polish-vod',
    description: 'Portal streamingowy z filmami i serialami',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '700px',
    iframeAllowed: true,
    addedAt: '2025-04-16T11:00:00Z',
    testCount: 1890,
    tags: ['streaming', 'filmy', 'seriale', 'polski', 'vod']
  },
  {
    id: '70',
    name: 'Vimeo',
    url: 'https://vimeo.com',
    category: 'video',
    description: 'High-quality video hosting and streaming platform',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-04-17T14:15:00Z',
    testCount: 3456,
    tags: ['video', 'hosting', 'professional', 'streaming', 'hd']
  },
  {
    id: '71',
    name: 'Dailymotion',
    url: 'https://www.dailymotion.com',
    category: 'video',
    description: 'International video sharing platform',
    sandbox: 'allow-scripts allow-same-origin allow-fullscreen',
    height: '600px',
    iframeAllowed: true,
    addedAt: '2025-04-18T09:30:00Z',
    testCount: 2789,
    tags: ['video', 'sharing', 'international', 'streaming']
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
