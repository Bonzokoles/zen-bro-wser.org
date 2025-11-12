Szczegółowa instrukcja instalacji i rozbudowy systemu wyszukiwania lokalnego i internetowego
1. Instalacja i konfiguracja bazowa
1.1. Lokalny projekt Astro + React
bash
npm create astro@latest
# Wybierz template z obsługą React
cd ZENO_BRO_wser_CORE
npm install
1.2. Backend API do lokalnego katalogu
W katalogu src/pages/api/ dodaj np. localSearch.js:

js
import fs from 'fs';
import path from 'path';
const localRoot = '/mnt/dysk_z_bibliotekami';

export async function get({ url }) {
  const query = url.searchParams.get('q')?.toLowerCase() || '';
  function searchFiles(dir) {
    let results = [];
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        results = results.concat(searchFiles(fullPath));
      } else if (item.isFile() && item.name.toLowerCase().includes(query)) {
        results.push({ path: fullPath, name: item.name });
      }
    }
    return results;
  }
  try {
    const found = query.length ? searchFiles(localRoot) : [];
    return new Response(JSON.stringify(found), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify([]), { status: 500 });
  }
}
1.3. Backend API do wyszukiwania internetowego (SearXNG/metasearch)
Najłatwiej uruchomić własny serwer SearXNG (Docker/VM) lub użyć publicznych endpointów, np. z docker-compose:

bash
git clone https://github.com/searxng/searxng-docker.git
cd searxng-docker
docker-compose up -d
Skonfiguruj endpoint /api/remoteSearch.js w Astro:

js
export async function get({ url }) {
  const q = url.searchParams.get('q');
  if (!q) return new Response(JSON.stringify([]), { status: 400 });
  const res = await fetch('http://localhost:8080/search?q=' + encodeURIComponent(q));
  const results = await res.json();
  return new Response(JSON.stringify(results), { status: 200 });
}
2. Frontend Astro + React
2.1. Komponent wyszukiwarki lokalnej (LocalSearch.jsx)
jsx
import React, { useState } from 'react';

export default function LocalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const search = async () => {
    const res = await fetch(`/api/localSearch?q=${encodeURIComponent(query)}`);
    setResults(await res.json());
  };
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Szukaj w plikach lokalnych" />
      <button onClick={search}>Szukaj</button>
      <ul>
        {results.map(r => <li key={r.path}>{r.name} [{r.path}]</li>)}
      </ul>
    </div>
  );
}
2.2. Komponent wyszukiwarki internetowej (RemoteSearch.jsx)
jsx
import React, { useState } from 'react';

export default function RemoteSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const search = async () => {
    const res = await fetch(`/api/remoteSearch?q=${encodeURIComponent(query)}`);
    setResults(await res.json());
  };
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Szukaj w Internecie" />
      <button onClick={search}>Szukaj</button>
      <ul>
        {results.map((r,i) => <li key={i}>{r.title || r.url}</li>)}
      </ul>
    </div>
  );
}
2.3. Wizualizacja ścieżek i powiązań (PathMap.jsx)
jsx
import React from 'react';
export default function PathMap({ paths }) {
  return (
    <div>
      <h3>Mapa powiązań</h3>
      <ul style={{ fontFamily: 'monospace' }}>
        {paths.map((p, i) => <li key={i}>{p.path}</li>)}
      </ul>
    </div>
  );
}
3. Rozbudowa funkcjonalności
Dodaj fuzzy search/filtrowanie (np. Fuse.js do frontendu lokalnego wyszukiwania).

Rozszerz lokalny backend o obsługę typów plików (md, pdf, json, obrazy) – indexowanie, podgląd.

Dodaj harmonogram zadań do backendu (np. node-cron dla okresowego reindeksowania katalogów).

Wyszukiwanie z proxy/VPN: Uruchamiaj Searxng/remoteScraper przez zewnętrzne proxy lub dynamicznie przypisuj IP do wyjściowych zapytań (integracja z systemem VPN/Proxy Pool).

Dodaj panel monitorowania przepływu danych (Przykład: zliczanie ilości wyników, czas reakcji, wykresy progresu, statusy agenta).

4. Przykładowe uruchomienie
Instalujesz Astro, dołączasz API routes do backendów.

Wdrażasz panel Reactowy z dwoma wyszukiwarkami w src/pages/index.astro.

Lokalna wyszukiwarka działa na plikach i strukturze bibliotek (inny dysk).

Remote search poprzez serwis metasearch/proxy.

Na życzenie możesz dynamicznie przełączać backendy, uruchamiać zapytania przez różne IP, synchronizować wyniki.

