Instrukcja integracji plików crawler, backend API i frontend w środowisku developerskim i produkcyjnym
Środowisko developerskie
Krok 1: Przygotowanie projektu i zależności
Utwórz projekt Node.js (npm init -y).

Zainstaluj niezbędne biblioteki:

bash
npm install express axios cors
npm install --save-dev nodemon typescript @types/node @types/express
Skonfiguruj TypeScript (tsconfig.json), jeśli chcesz pisać w TS.

Krok 2: Dodanie crawlera
Umieść crawler.ts w folderze projektu, np. /tools/crawler.ts.

Uruchom go ręcznie podczas developmentu lub wprowadź harmonogram z node-cron:

bash
npx ts-node tools/crawler.ts
Wyniki crawlera możesz zapisywać do pliku JSON lub bezpośrednio wysyłać do backendu (np. do bazy).

Krok 3: Backend API
Utwórz serwer Express i dodaj api/sites.ts jako router.

Dodaj główny plik serwera, np. server.ts:

ts
import express from 'express';
import cors from 'cors';
import sitesRouter from './api/sites';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/sites', sitesRouter);

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
Uruchom serwer:

bash
npx ts-node server.ts
Krok 4: Frontend React
W projekcie React dodaj komponent SiteSearch.tsx.

Zapewnij, że frontend ma dostęp do backendu (przez proxy w package.json lub konfigurację CORS).

Uruchom frontend normalnie (npm start).

Krok 5: Testy połączenia
Odpal backend i frontend, przejdź do strony z SiteSearch i sprawdź, czy wyniki się ładują i filtry działają.

Uruchom crawlera aby aktualizować dane backendu.

Środowisko produkcyjne
Hosting backendu
Skorzystaj z platform typu Heroku, Vercel (serverless), AWS Lambda + API Gateway, DigitalOcean, itp.

Wdróż backend, ustaw zmienne środowiskowe, włącz HTTPS.

Hosting frontend
Wdróż aplikację React jako statyczny build (npm run build).

Hostuj na Netlify, Vercel, Cloudflare Pages lub własnym serwerze.

Baza danych
Podłącz backend do bazy produkcyjnej (np. Supabase, PostgreSQL, MongoDB).

Przechowuj wyniki crawlowania w bazie.

Harmonogram crawlera
Skonfiguruj uruchamianie crawlera cyklicznie:

Cron na VPS

Serverless cron (AWS EventBridge, Google Cloud Scheduler)

GitHub Actions lub inny CI/CD

Bezpieczeństwo i skalowalność
Zabezpiecz API (JWT, OAuth), ogranicz dostęp według roli.

Implementuj caching na backend i/lub proxy CDN.

Loguj błędy i monitoruj działanie aplikacji (np. Sentry).

