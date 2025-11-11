Szczegółowa instrukcja rozwoju agentów wyszukiwania i wizualizacji postępu przepływu danych w systemie
1. Agenci wyszukiwania - architektura i implementacja
1.1. Architektura
Agenci działają jako asynchroniczne moduły (lub osobne mikroserwisy), odpowiedzialne za:

Przeszukiwanie internetu, stron publicznych, repozytoriów, iframe i innych źródeł danych

Parsowanie i ekstrakcję metadanych

Kategoryzację i tagowanie (AI/ML)

Zapisywanie wyników do lokalnej bazy lub poprzez API backendu

1.2. Przykładowa architektura agenta (Node.js + Puppeteer)
js
const puppeteer = require('puppeteer');
const axios = require('axios');

async function crawlPage(url, saveApiUrl) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Prosta ekstrakcja tekstu i meta
  const content = await page.content();

  // Przykładowe metadane
  const metadata = {
    title: await page.title(),
    url,
    contentSnippet: content.substring(0, 500),
    timestamp: new Date().toISOString()
  };

  // Wywołanie API do zapisu
  await axios.post(saveApiUrl, {
    relativePath: `WEB_CRAWL/${encodeURIComponent(url)}.json`,
    content: JSON.stringify(metadata, null, 2),
  });

  await browser.close();
}

// Wywołanie crawlera
crawlPage('https://example.com', 'http://localhost:3000/api/saveMetadata');
1.3. Harmonogram i obsługa kolejek
Użyj node-cron lub systemowego cron do uruchamiania crawlera cyklicznie

W przypadku wielu adresów – stwórz kolejkę z limitami równoległych połączeń

2. Wizualizacja postępu przepływu danych
2.1. Backend - WebSocket i API statusu
Wprowadź WebSocket do komunikacji zwrotnej z frontendem o postępie wykonywanych zadań agenta

Przykład z socket.io:

js
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('Klient połączony');
});

async function notifyProgress(message) {
  io.emit('crawlProgress', message);
}

// Przykład wysyłania statusu
notifyProgress({ url: 'https://example.com', status: 'started' });
notifyProgress({ url: 'https://example.com', status: 'completed' });
2.2. Frontend - React + Socket.io client
Instalacja:

bash
npm install socket.io-client
Przykładowy komponent monitorujący postęp crawlowania:

jsx
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function CrawlProgress() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    socket.on('crawlProgress', (msg) => {
      setLogs((prev) => [...prev, msg]);
    });
    return () => socket.off('crawlProgress');
  }, []);

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: 10, background: '#f5f5f5', borderRadius: 5 }}>
      <h4>Postęp crawlowania</h4>
      {logs.map((log, idx) => (
        <div key={idx} style={{ marginBottom: 4 }}>
          <strong>{log.url}</strong>: {log.status}
        </div>
      ))}
    </div>
  );
}
2.3. Integracja z frontendem głównym
Osadź komponent w panelu dashboardu

Informuj użytkownika o statusie, błędach, zakończeniu zadania

3. Rozszerzenia i usprawnienia
Logowanie błędów i retry procesu crawlowania

Wyzwalacze ręczne i zadań cyklicznych (cron)

Agenci AI do analizy i rekomendacji danych w czasie rzeczywistym

Wizualizacja wskaźników KPI (liczba przeszukanych stron, prędkość, błędy)

Możliwość anulowania lub pauzowania zadań