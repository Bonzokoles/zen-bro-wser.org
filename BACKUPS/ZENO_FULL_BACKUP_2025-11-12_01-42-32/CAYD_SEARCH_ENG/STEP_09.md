Poniżej rozbudowana instrukcja do implementacji systemu integrującego przeglądarkę katalogów, backend API i agentów wyszukiwania wraz z wizualizacją postępu — wszystko w frameworku Astro, który pozwala na renderowanie komponentów React oraz API routes.

Projekt Astro: Integracja katalogu, agentów i UI z wizualizacją
1. Inicjalizacja projektu Astro
bash
npm create astro@latest
# Wybierz template minimal/with react
cd project-folder
npm install
2. Struktura katalogów dla projektu
text
/src
  /components       # UI React Components
    CatalogTree.jsx
    MetadataEditor.jsx
    CrawlProgress.jsx
  /pages
    api/
      catalogTree.js    # API route backend - katalog
      fileContent.js    # API route backend - zawartość pliku
      saveMetadata.js   # API route backend - zapis danych
      socket.js         # Websocket backend endpoint (opcjonalnie)
    index.astro         # Główna strona Astro
3. Implementacja backendu API jako endpointów Astro
3.1. src/pages/api/catalogTree.js
js
import fs from 'fs';
import path from 'path';

const librariesRoot = '/mnt/jimbo_inc/libraries';

function isMetadataFile(filename) {
  return ['.md', '.json'].includes(path.extname(filename));
}

function readMetadataDir(dir) {
  const result = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      result.push({
        type: 'folder',
        name: item.name,
        path: path.relative(librariesRoot, fullPath),
        children: readMetadataDir(fullPath),
      });
    } else if (item.isFile() && isMetadataFile(item.name)) {
      result.push({
        type: 'file',
        name: item.name,
        path: path.relative(librariesRoot, fullPath),
      });
    }
  }
  return result;
}

export async function get({ params, request }) {
  try {
    const tree = readMetadataDir(librariesRoot);
    return new Response(JSON.stringify(tree), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Błąd odczytu katalogu' }), { status: 500 });
  }
}
3.2. src/pages/api/fileContent.js
js
import fs from 'fs';
import path from 'path';

const librariesRoot = '/mnt/jimbo_inc/libraries';

export async function get({ url }) {
  const filePath = url.searchParams.get('path');
  if (!filePath) {
    return new Response(JSON.stringify({ error: 'Brak ścieżki' }), { status: 400 });
  }
  try {
    const fullPath = path.join(librariesRoot, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return new Response(JSON.stringify({ content }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Nie znaleziono pliku' }), { status: 404 });
  }
}
3.3. src/pages/api/saveMetadata.js
js
import fs from 'fs';
import path from 'path';

const librariesRoot = '/mnt/jimbo_inc/libraries';

export async function post({ request }) {
  const { relativePath, content } = await request.json();
  if (!relativePath || !content) {
    return new Response(JSON.stringify({ error: 'Brak danych' }), { status: 400 });
  }
  try {
    const fullPath = path.join(librariesRoot, relativePath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Błąd zapisu' }), { status: 500 });
  }
}
4. Frontend: React components w Astro
4.1. Katalog plików - CatalogTree.jsx
jsx
import React, { useState } from 'react';

function Node({ node, onSelect }) {
  const [open, setOpen] = useState(false);

  if (node.type === 'folder') {
    return (
      <div style={{ marginLeft: 10 }}>
        <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          {node.name}
        </div>
        {open && node.children.map(child => (
          <Node key={child.path} node={child} onSelect={onSelect} />
        ))}
      </div>
    );
  }
  return (
    <div onClick={() => onSelect(node)} style={{ marginLeft: 20, cursor: 'pointer' }}>
      {node.name}
    </div>
  );
}

export default function CatalogTree({ tree, onSelect }) {
  return (
    <div>
      {tree.map(node => <Node key={node.path} node={node} onSelect={onSelect} />)}
    </div>
  );
}
4.2. Edytor metadanych - MetadataEditor.jsx
jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MetadataEditor({ file }) {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!file) return;
    axios.get(`/api/fileContent?path=${encodeURIComponent(file.path)}`)
      .then(res => setContent(res.data.content))
      .catch(() => setContent(''));
  }, [file]);

  const save = () => {
    axios.post('/api/saveMetadata', { relativePath: file.path, content })
      .then(() => setMessage('Zapisano pomyślnie'))
      .catch(() => setMessage('Błąd zapisu'));
  };

  if (!file) return <div>Wybierz plik</div>;

  return (
    <div>
      <h2>Edycja: {file.name}</h2>
      <textarea rows={20} cols={80} value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={save}>Zapisz</button>
      <div>{message}</div>
    </div>
  );
}
4.3. Wizualizacja postępu - CrawlProgress.jsx
jsx
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io(); // jeśli front i backend na tym samym serwerze

export default function CrawlProgress() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    socket.on('crawlProgress', msg => {
      setLogs(prev => [...prev, msg]);
    });
    return () => {
      socket.off('crawlProgress');
    };
  }, []);

  return (
    <div style={{
      maxHeight: '300px',
      overflowY: 'auto',
      background: '#f3f3f3',
      padding: '10px',
      borderRadius: '8px',
      marginTop: '15px'
    }}>
      <h4>Postęp agenta crawlowania</h4>
      {logs.map((log, i) => (
        <div key={i}><b>{log.url || 'Nieznany'}</b>: {log.status}</div>
      ))}
    </div>
  );
}
5. Strona główna src/pages/index.astro
text
---
import { useState } from 'react';
import CatalogTree from '../components/CatalogTree.jsx';
import MetadataEditor from '../components/MetadataEditor.jsx';
import CrawlProgress from '../components/CrawlProgress.jsx';

let tree = [];

const fetchTree = async () => {
  const res = await fetch('/api/catalogTree');
  tree = await res.json();
};

fetchTree();

let selectedFile = null;
---

<html>
<head>
  <title>Wiby Advanced Browser</title>
</head>
<body>
  <div style="display:flex; height: 90vh;">
    <div style="width: 35%; overflow-y: auto; border-right: 1px solid #ccc; padding: 10px;">
      <CatalogTree client:load tree={tree} onSelect={(node) => (selectedFile = node)} />
    </div>
    <div style="width: 60%; padding: 20px;">
      <MetadataEditor client:load file={selectedFile} />
      <CrawlProgress client:load />
    </div>
  </div>
</body>
</html>
6. Uruchomienie i rozwój
npm run dev uruchomi Astro z backendem API i frontendem React

Następnie rozbuduj moduły agenta (crawler, AI) do komunikacji z backendem

Możesz implementować mechanizmy WebSocket do wspierania crawlProgress w czasie rzeczywistym.