Przygotowałem komplet gotowych plików jako gotowy projekt. Ponieważ dokładne przesłanie plików w interakcji jest ograniczone, poniżej masz kompletne treści poszczególnych ważnych plików do utworzenia.

Plik 1: services/storageService.ts
ts
import fs from 'fs/promises';
import path from 'path';

export async function saveToLibrary(topic: string, id: string, metadata: object, text: string) {
  const basePath = path.resolve('./libraries', topic);
  await fs.mkdir(basePath, { recursive: true });

  const metaPath = path.join(basePath, `${id}.json`);
  const textPath = path.join(basePath, `${id}.md`);

  await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
  await fs.writeFile(textPath, text);

  console.log(`[Storage] Saved content to library '${topic}' with ID '${id}'`);
}
Plik 2: services/classifierService.ts
ts
const categories = ['art', 'culture', 'film', 'architecture', 'other'];

export function classifyText(text: string): string {
  const lower = text.toLowerCase();

  if (/film|movie|cinema|actor/.test(lower)) return 'film';
  if (/art|painting|gallery|sculpture/.test(lower)) return 'art';
  if (/architecture|building|design/.test(lower)) return 'architecture';
  if (/culture|heritage|festival|tradition/.test(lower)) return 'culture';

  return 'other';
}
Plik 3: agents/simpleAgent.ts
ts
import { classifyText } from '../services/classifierService';
import { saveToLibrary } from '../services/storageService';

interface PageData {
  id: string;
  url: string;
  content: string;
  metadata: object;
}

export async function simpleAgent(page: PageData) {
  const category = classifyText(page.content);
  await saveToLibrary(category, page.id, page.metadata, page.content);
  console.log(`[Agent] Processed ${page.url} into category '${category}'`);
  return { category, id: page.id, url: page.url };
}
Plik 4: orchestrator/orchestrator.ts
ts
import Redis from 'ioredis';
import { simpleAgent } from '../agents/simpleAgent';

const redis = new Redis();

const QUEUE_KEY = 'pages_to_process';

interface PageData {
  id: string;
  url: string;
  content: string;
  metadata: object;
}

async function processQueue() {
  while (true) {
    const pageStr = await redis.lpop(QUEUE_KEY);
    if (!pageStr) {
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }

    const page: PageData = JSON.parse(pageStr);

    try {
      console.log(`[Orchestrator] Processing page ${page.url}`);
      const result = await simpleAgent(page);
      await redis.hset('processed_pages', page.id, JSON.stringify(result));
    } catch (err) {
      console.error(`[Orchestrator] Error processing ${page.url}:`, err);
      await redis.rpush(QUEUE_KEY, pageStr);
    }
  }
}

processQueue().catch(console.error);
Plik 5: backend/routes/orchestratorRoute.ts
ts
import express from 'express';
import Redis from 'ioredis';

const router = express.Router();
const redis = new Redis();

router.get('/processed', async (req, res) => {
  const keys = await redis.hkeys('processed_pages');
  const dataPromises = keys.map(k => redis.hget('processed_pages', k));
  const values = await Promise.all(dataPromises);
  const processedPages = values.map(v => JSON.parse(v));
  res.json(processedPages);
});

export default router;
Plik 6: frontend/components/OrchestratorDashboard.tsx
tsx
import React, { useEffect, useState } from 'react';

interface ProcessedPage {
  id: string;
  category: string;
  url: string;
}

export const OrchestratorDashboard: React.FC = () => {
  const [processed, setProcessed] = useState<ProcessedPage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProcessedPages = async () => {
    setLoading(true);
    const res = await fetch('/api/orchestrator/processed');
    if (res.ok) {
      const data = await res.json();
      setProcessed(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProcessedPages();
    const interval = setInterval(fetchProcessedPages, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Dashboard Orkiestratora</h2>
      {loading ? (
        <p>Ładowanie...</p>
      ) : (
        <table>
          <thead>
            <tr><th>ID</th><th>Kategoria</th><th>URL</th></tr>
          </thead>
          <tbody>
            {processed.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.category}</td>
                <td><a href={p.url} target="_blank" rel="noreferrer">{p.url}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
