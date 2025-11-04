/**
 * Przykład użycia komponentów i serwisów
 * 
 * 1. SiteSearch Component - wyszukiwarka React
 * 2. IframeTestService - automatyczne testy
 * 3. Integracja wszystkich części
 */

// ============================================
// PRZYKŁAD 1: React SiteSearch Component
// ============================================

/**
 * Użycie w iframe-tester.astro lub innym komponencie React
 */

import React from 'react';
import { SiteSearch } from '../components/iframe/SiteSearch';
import { PostMessageService } from '../services/iframe/postMessageService';

function IframeTesterApp() {
  const [currentIframe, setCurrentIframe] = React.useState<HTMLIFrameElement | null>(null);
  const [postMessageService, setPostMessageService] = React.useState<PostMessageService | null>(null);

  const handleSelectSite = (site: any) => {
    console.log('Selected site:', site);
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = site.url;
    iframe.sandbox = site.sandbox || 'allow-scripts';
    iframe.style.cssText = 'width: 100%; height: 600px;';
    
    // Clear previous iframe
    const container = document.getElementById('iframe-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(iframe);
    }
    
    // Setup PostMessage service
    const service = new PostMessageService(iframe, '*');
    
    service.on('LOAD_COMPLETE', (payload) => {
      console.log('✅ Iframe loaded:', payload);
    });
    
    service.on('TEXT_SELECTION', (payload) => {
      console.log('📝 Text selected:', payload.text);
    });
    
    setCurrentIframe(iframe);
    setPostMessageService(service);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
      {/* Sidebar with search */}
      <div>
        <h2>Wyszukiwarka Stron</h2>
        <SiteSearch onSelectSite={handleSelectSite} />
      </div>

      {/* Main content */}
      <div>
        <h2>Podgląd Iframe</h2>
        <div id="iframe-container"></div>
      </div>
    </div>
  );
}

// ============================================
// PRZYKŁAD 2: IframeTestService - Automatyczne testy
// ============================================

/**
 * Test pojedynczej strony
 */
import { iframeTestService } from '../services/iframe/iframeTestService';

async function testSingleSite() {
  const result = await iframeTestService.testSite(
    '1',
    'Wikipedia',
    'https://en.wikipedia.org/wiki/Main_Page',
    'allow-same-origin allow-scripts'
  );

  console.log('Test result:', result);
  // {
  //   id: 'test_...',
  //   success: true,
  //   loadTime: 1234,
  //   timestamp: 1699...,
  //   httpStatus: 200,
  //   retries: 0
  // }
}

/**
 * Test wielu stron z progress callback
 */
async function testMultipleSites() {
  const sites = [
    { id: '1', name: 'Wikipedia', url: 'https://en.wikipedia.org', sandbox: 'allow-scripts' },
    { id: '2', name: 'GitHub', url: 'https://github.com', sandbox: 'allow-scripts' },
    { id: '3', name: 'CodePen', url: 'https://codepen.io', sandbox: 'allow-scripts' },
  ];

  const results = await iframeTestService.testSites(
    sites,
    (current, total) => {
      console.log(`Progress: ${current}/${total}`);
    }
  );

  console.log('All results:', results);
}

/**
 * Pobierz statystyki testów
 */
function getTestStatistics() {
  const stats = iframeTestService.getStatistics();
  
  console.log('Statistics:', stats);
  // {
  //   total: 10,
  //   successful: 8,
  //   failed: 2,
  //   successRate: 80,
  //   avgLoadTime: 1456,
  //   errorBreakdown: {
  //     'CORS': 1,
  //     'TIMEOUT': 1
  //   }
  // }
}

// ============================================
// PRZYKŁAD 3: Pełna integracja
// ============================================

/**
 * Kompletny przykład: Wyszukaj → Test → Pokaż wyniki
 */

class IframeTesterWithTests {
  private testService = iframeTestService;
  
  async searchAndTest(query: string) {
    // 1. Wyszukaj strony
    const response = await fetch(`/api/iframe/sites?q=${query}`);
    const { data: sites } = await response.json();
    
    console.log(`Znaleziono ${sites.length} stron dla: "${query}"`);
    
    // 2. Przetestuj wszystkie
    const results = await this.testService.testSites(sites, (current, total) => {
      console.log(`Testowanie ${current}/${total}...`);
    });
    
    // 3. Pokaż wyniki
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('✅ Successful:', successful.length);
    console.log('❌ Failed:', failed.length);
    
    // 4. Pokaż najszybsze
    const fastest = [...successful].sort((a, b) => a.loadTime - b.loadTime)[0];
    if (fastest) {
      console.log('🚀 Fastest:', fastest.siteName, `(${fastest.loadTime}ms)`);
    }
    
    // 5. Pokaż błędy
    if (failed.length > 0) {
      console.log('Errors:');
      failed.forEach(f => {
        console.log(`- ${f.siteName}: ${f.errorType} - ${f.errorMessage}`);
      });
    }
    
    return results;
  }
}

// Użycie
const tester = new IframeTesterWithTests();
tester.searchAndTest('documentation');

// ============================================
// PRZYKŁAD 4: React Component z testami
// ============================================

function SiteSearchWithTests() {
  const [testResults, setTestResults] = React.useState<any[]>([]);
  const [testing, setTesting] = React.useState(false);

  const handleSelectSite = async (site: any) => {
    setTesting(true);
    
    // Test strony przed załadowaniem
    const result = await iframeTestService.testSite(
      site.id,
      site.name,
      site.url,
      site.sandbox
    );
    
    setTestResults(prev => [...prev, result]);
    setTesting(false);
    
    if (result.success) {
      console.log(`✅ ${site.name} loaded in ${result.loadTime}ms`);
      // Załaduj iframe...
    } else {
      console.error(`❌ ${site.name} failed: ${result.errorType}`);
      alert(`Failed to load: ${result.errorMessage}`);
    }
  };

  return (
    <div>
      <SiteSearch onSelectSite={handleSelectSite} />
      
      {testing && <div>🧪 Testing site...</div>}
      
      {testResults.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Test Results</h3>
          <ul>
            {testResults.map((result, idx) => (
              <li key={idx}>
                {result.success ? '✅' : '❌'} {result.siteName} - {result.loadTime}ms
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================
// PRZYKŁAD 5: Test w konsoli przeglądarki
// ============================================

/**
 * Otwórz http://localhost:4366/iframe-tester
 * Wklej w Console:
 */

// Test 1: Wyszukaj strony
fetch('/api/iframe/sites?q=code')
  .then(r => r.json())
  .then(d => console.table(d.data));

// Test 2: Przetestuj stronę
import { iframeTestService } from './services/iframe/iframeTestService';

iframeTestService.testSite(
  '1',
  'Wikipedia',
  'https://en.wikipedia.org',
  'allow-scripts'
).then(console.log);

// Test 3: Batch test
const sites = [
  { id: '1', name: 'Wikipedia', url: 'https://en.wikipedia.org' },
  { id: '2', name: 'GitHub', url: 'https://github.com' }
];

iframeTestService.testSites(sites).then(results => {
  console.log('Results:', results);
  console.log('Stats:', iframeTestService.getStatistics());
});

export {};
