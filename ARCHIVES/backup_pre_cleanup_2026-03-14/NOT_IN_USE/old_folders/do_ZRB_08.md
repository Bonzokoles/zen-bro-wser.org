1. Kompletny pipeline CI/CD w GitHub Actions
Plik: .github/workflows/ci-cd.yml

text
name: CI/CD pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend:
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
      - run: npm ci
      - run: npm run build
      - run: npm test

  frontend:
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
      - run: npm ci
      - run: npm run build
      - run: npm test

  deploy:
    needs: [backend, frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy backend
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        run: |
          ssh -o StrictHostKeyChecking=no user@yourserver 'cd /var/app/backend && git pull && npm ci && npm run build && pm2 restart all'
      - name: Deploy frontend
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        run: |
          ssh -o StrictHostKeyChecking=no user@yourserver 'cd /var/app/frontend && git pull && npm ci && npm run build && pm2 restart all'
2. Skrypty inicjujące i migracje bazy danych (PostgreSQL)
Plik: db/init.sql

sql
-- Tabela stron do testów iframe
CREATE TABLE IF NOT EXISTS sites (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  domain_extension VARCHAR(10),
  iframe_allowed BOOLEAN DEFAULT FALSE,
  description TEXT,
  category VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela użytkowników (prosty przykład)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela sesji testowych
CREATE TABLE IF NOT EXISTS test_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  site_id INTEGER REFERENCES sites(id),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  results JSONB,
  notes TEXT
);
3. Szablon konfiguracji Traefik (docker-compose i traefik.yml)
Plik: docker-compose.yml

text
version: "3.8"

services:
  traefik:
    image: traefik:v2.10
    command:
      - --api.insecure=true
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.myresolver.acme.tlschallenge=true
      - --certificatesresolvers.myresolver.acme.email=youremail@example.com
      - --certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # dashboard Traefika
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

  backend:
    build: ./backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`backend.yourdomain.com`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=myresolver"

  frontend:
    build: ./frontend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=myresolver"
Krótkie instrukcje
Traefik automatycznie zarządza certyfikatami SSL przez Let's Encrypt.

Po deployu kontenerów backend i frontend dostępne są pod bezpiecznymi, https:// adresami.

Ustaw w GitHub Secrets klucz SSH (SSH_PRIVATE_KEY) do serwera produkcyjnego.

Docker Compose korzysta z pliku traefik.yml na potrzeby dodatkowej konfiguracji (opcjonalnie).