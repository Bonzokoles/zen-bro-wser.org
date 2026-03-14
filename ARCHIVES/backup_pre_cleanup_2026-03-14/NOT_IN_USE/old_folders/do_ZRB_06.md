Oto propozycja automatyzacji wdrożeń, przykładowe skrypty CI/CD oraz sugestie struktury plików i workflow deweloperskiego dla Twojego projektu z crawlerem, backendem i frontendem.

1. Przykładowa struktura plików projektu
text
my-iframe-project/
│
├── backend/
│   ├── api/
│   │   └── sites.ts
│   ├── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/SiteSearch.tsx
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
├── tools/
│   └── crawler.ts
│
├── .github/workflows/
│   └── ci-cd.yml
│
└── README.md
2. Workflow GitHub Actions (ci-cd.yml) - CI/CD pipeline
text
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm test

  build-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm test

  deploy:
    needs: [build-backend, build-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Backend to VPS / Cloud
        run: |
          scp -r ./backend/build user@yourserver:/path/to/backend
          ssh user@yourserver "pm2 reload backend"
      - name: Deploy Frontend to Hosting
        run: |
          scp -r ./frontend/build/* user@yourserver:/path/to/frontend
3. Skrócony opis workflow deweloperskiego
Klonowanie repozytorium i konfiguracja:
git clone ... && cd my-iframe-project

Praca w osobnych katalogach backend i frontend z niezależnymi package.json i konfiguracjami.

Regularne commity do branży main wraz z testami. Pull requesty do review.

GitHub Actions automatycznie budują backend i frontend, uruchamiają testy i deployują na serwer produkcyjny.

Aplikacja może korzystać z pliku .env do bezpiecznych zmiennych (API keys, DB connection).

Crawler tools/crawler.ts można uruchamiać manualnie lub ustawić jako osobny zadaniowy harmonogram (cron job).

4. Monitorowanie i utrzymanie
Dodaj monitoring (np. Sentry) i logowanie błędów w backendzie i frontendzie.

Automatyczna aktualizacja zależności okresowo (Dependency bot).

Testy integracyjne dla API, testy E2E dla UI (np. Cypress).

