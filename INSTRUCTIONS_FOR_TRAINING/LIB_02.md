Oto rozbudowany opis i gotowe przykładowe moduły do zapisu danych, prosty model AI do sortowania oraz przykład workflow prostego systemu agentów i późniejszego orchestratora.

1. Moduł zapisu danych do lokalnych bibliotek
ts
// services/storageService.ts
import fs from 'fs/promises';
import path from 'path';

export async function saveContentToLibrary(topic: string, id: string, metadata: object, text: string) {
  const basePath = path.resolve('./libraries', topic);
  await fs.mkdir(basePath, { recursive: true });

  const metaFilePath = path.join(basePath, `${id}.json`);
  const textFilePath = path.join(basePath, `${id}.md`);

  await fs.writeFile(metaFilePath, JSON.stringify(metadata, null, 2));
  await fs.writeFile(textFilePath, text);

  console.log(`Zapisano do biblioteki ${topic}: ${id}`);
}
2. Prosty model sortowania AI (klasyfikator tekstowy)
ts
// services/classifierService.ts
const categories = ['art', 'culture', 'film', 'architecture'];

export function classifyTextSimple(text: string): string {
  const lower = text.toLowerCase();

  if (lower.match(/(film|movie|cinema|actor)/)) return 'film';
  if (lower.match(/(art|painting|sculpture|gallery)/)) return 'art';
  if (lower.match(/(architecture|building|design|urban)/)) return 'architecture';
  if (lower.match(/(culture|tradition|heritage|festival)/)) return 'culture';
  return 'other';
}
3. Przykład prostego agenta, który pobiera dane, klasyfikuje i zapisuje
ts
// agents/simpleAgent.ts
import { saveContentToLibrary } from '../services/storageService';
import { classifyTextSimple } from '../services/classifierService';

interface PageData {
  id: string;
  url: string;
  content: string;
  metadata: object;
}

export async function simpleAgentProcess(pageData: PageData) {
  const category = classifyTextSimple(pageData.content);

  await saveContentToLibrary(category, pageData.id, pageData.metadata, pageData.content);

  console.log(`Agent przypisał stronę ${pageData.url} do kategorii ${category}`);
}
4. Instalacja i uruchomienie prostego systemu agentów
Utwórz katalog agents/ i services/ w projekcie

Załaduj dane do analizy z crawlera lub API

Wywołaj simpleAgentProcess asynchronicznie dla każdego źródła

Agent sortuje i zapisuje dane w lokalnych bibliotekach

5. Rozbudowa: Orkiestrator agentów z małym modelem AI i UI
Orkiestrator zarządza pulą agentów - przydziela zadania, monitoruje status

Interfejs webowy pokazuje statusy przetwarzania, logi i wyniki sortowania

Model AI pomaga w rozstrzyganiu, do której biblioteki przekazać dane (wielokrotna klasyfikacja)

Możliwość ręcznego przeglądu i przesegregowania wyników

Workflow asynchroniczny z kolejkami (RabbitMQ, Redis) do zarządzania przychodzącymi zadaniami

6. Technologie i narzędzia do implementacji większego orkiestratora
Node.js + Express/Fastify dla API

Redis lub RabbitMQ dla kolejek zadań agentów i retry

React/Vue/Svelte dla interfejsu użytkownika

Lekki LLM lub klasyfikator w TensorFlow.js, HuggingFace itp.

FileSystem + Baza danych (np. Supabase/PostgreSQL) do przechowywania metadanych i plików

Docker do konteneryzacji i skalowania agentów i usługi orkiestratora

7. Przykład workflow dla orkiestratora
Orkiestrator odbiera nowy dokument do analizy (np. JSON z crawlera)

Wysyła dane do agentów (różne modele AI do różnych kategorii)

Agenci analizują tekst, zwracają sugestie kategorii

Orkiestrator zbiera odpowiedzi, uruchamia logikę decyzyjną (np. większość głosów)

Zapisuje dane do wybranej biblioteki (folder i baza)

Aktualizuje UI dashboard statusów i wyników

Pozwala użytkownikowi ręcznie poprawić klasyfikację jeśli potrzeba

