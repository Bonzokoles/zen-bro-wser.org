Frontend: Prosty edytor i podgląd metadanych (React)
1. Instalacja podstawowa
W folderze projektu (lub osobnym frontend) zainicjuj nową aplikację React:

bash
npx create-react-app metadata-editor
cd metadata-editor
npm start
2. Struktura komponentu
Utwórz w src/ plik MetadataEditor.js:

jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MetadataEditor() {
  const [filePath, setFilePath] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  // Funkcja zapisu pliku
  const saveFile = async () => {
    if (!filePath || !content) {
      setMessage('Proszę podać ścieżkę i zawartość');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3000/api/saveMetadata', {
        relativePath: filePath,
        content: content,
      });
      setMessage('Plik zapisany: ' + response.data.path);
    } catch (error) {
      setMessage('Błąd zapisu: ' + error.message);
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h3>Edytor metadanych</h3>
      <input
        type="text"
        placeholder="Ścieżka pliku (np. AI_MODELS/agent1.md)"
        value={filePath}
        onChange={(e) => setFilePath(e.target.value)}
        style={{ width: '100%', marginBottom: 8 }}
      />
      <textarea
        rows={15}
        style={{ width: '100%' }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={saveFile} style={{ marginTop: 8 }}>
        Zapisz plik
      </button>
      <div style={{ color: 'red', marginTop: 10 }}>{message}</div>
    </div>
  );
}
3. Użycie komponentu w src/App.js
Zamień zawartość App.js na:

jsx
import React from 'react';
import MetadataEditor from './MetadataEditor';

function App() {
  return (
    <div>
      <MetadataEditor />
    </div>
  );
}
Zmien na inny np:  localchost 6040
export default App;
4. Uruchomienie frontend
bash
npm start
Otwórz przeglądarkę pod adresem http://localhost:3000 i przetestuj zapis pliku metadanych.

Integracja
Backend z API zapisu z poprzedniej instrukcji powinien działać na porcie 3000.

Frontend z powyższym edytorem pozwala na ręczne wprowadzanie/edycję metadanych zapisując je do lokalnej biblioteki.

Możesz potem rozszerzyć frontend o przeglądanie katalogów, podgląd istniejących plików, wyszukiwanie i inne funkcje jakościowe