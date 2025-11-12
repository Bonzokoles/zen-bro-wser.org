Instrukcja rozwoju integracji katalogu i przeglądarki z automatycznym synchronizowaniem danych:

Krok 1: Ulepszenie backendu do obsługi synchronizacji katalogu
Cel
Stworzyć endpoint HTTP do zwracania drzewa katalogu z plikami md/json oraz endpoint do dodawania nowych danych.

Przykładowy kod Node.js
js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const librariesRoot = '/mnt/jimbo_inc/libraries';

// Funkcja do odczytu drzewa katalogu (rekurencja)
function readMetadataDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push({
        type: 'folder',
        name: item.name,
        children: readMetadataDir(fullPath)
      });
    } else if (item.isFile() && ['.md', '.json'].includes(path.extname(item.name))) {
      results.push({
        type: 'file',
        name: item.name,
        path: path.relative(librariesRoot, fullPath)
      });
    }
  }
  return results;
}

// Endpoint zwracający drzewo katalogu
app.get('/api/catalogTree', (req, res) => {
  try {
    const tree = readMetadataDir(librariesRoot);
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: 'Błąd odczytu katalogu' });
  }
});

// Endpoint zapisu metadanych
app.post('/api/saveMetadata', (req, res) => {
  const { relativePath, content } = req.body;
  if (!relativePath || !content) {
    return res.status(400).json({ error: 'Brak relativePath lub content' });
  }
  const fullPath = path.join(librariesRoot, relativePath);
  const dir = path.dirname(fullPath);
  
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    res.json({ status: 'success', path: relativePath });
  } catch (err) {
    res.status(500).json({ error: 'Błąd zapisu pliku' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});
Krok 2: Frontend - wyświetlanie drzewa katalogu i edycja plików
Przykład komponentu React do wyświetlania i edycji metadanych
jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CatalogNode({ node, onSelect }) {
  const [open, setOpen] = useState(false);

  if (node.type === 'folder') {
    return (
      <div style={{ marginLeft: 20 }}>
        <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer', fontWeight: 'bold'}}>
          {node.name}
        </div>
        {open && node.children.map((child) => (
          <CatalogNode key={child.name} node={child} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ marginLeft: 40, cursor: 'pointer' }} onClick={() => onSelect(node)}>
      {node.name}
    </div>
  );
}

export default function MetadataManager() {
  const [tree, setTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchTree() {
      const response = await axios.get('http://localhost:3000/api/catalogTree');
      setTree(response.data);
    }
    fetchTree();
  }, []);

  useEffect(() => {
    async function fetchContent() {
      if (!selectedFile) return;
      const response = await axios.get(`http://localhost:3000/api/fileContent?path=${selectedFile.path}`);
      setContent(response.data.content);
      setMessage('');
    }
    fetchContent();
  }, [selectedFile]);

  const saveContent = async () => {
    try {
      await axios.post('http://localhost:3000/api/saveMetadata', {
        relativePath: selectedFile.path,
        content,
      });
      setMessage('Zapisano pomyślnie!');
    } catch (err) {
      setMessage('Błąd zapisu: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '40%', overflowY: 'auto', height: '90vh', borderRight: '1px solid black' }}>
        {tree.map(node => (
          <CatalogNode key={node.name} node={node} onSelect={setSelectedFile} />
        ))}
      </div>

      <div style={{ width: '60%', padding: 20 }}>
        {selectedFile ? (
          <>
            <h3>Edytujesz: {selectedFile.name}</h3>
            <textarea
              style={{ width: '100%', height: '70vh' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button onClick={saveContent} style={{ marginTop: 10 }}>Zapisz</button>
            <div>{message}</div>
          </>
        ) : (
          <div>Wybierz plik do edycji</div>
        )}
      </div>
    </div>
  );
}
Krok 3: Endpoint do pobierania zawartości pliku (backend)
Dodaj w backendzie:

js
app.get('/api/fileContent', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ error: 'Brak parametru path' });
  }
  const fullPath = path.join(librariesRoot, filePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: 'Błąd odczytu pliku' });
  }
});
Po wdrożeniu powyższych kroków:

Będziesz mieć kompletny system zarządzania lokalną bazą metadanych

Interaktywne przeglądanie struktury folderów

Edycję plików z zapisem na backendzie

Możliwość rozszerzania o funkcje automatycznego synchronizowania i importowania danych z internetu