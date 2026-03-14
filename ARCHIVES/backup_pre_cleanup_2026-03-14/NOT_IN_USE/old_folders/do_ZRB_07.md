Oto zaawansowana konfiguracja projektu z Docker Compose, która:

Uruchamia backend (Node.js/Express + TS)

Uruchamia frontend (React + Vite)

Uruchamia bazę danych PostgreSQL (można łatwo zastąpić lub rozszerzyć o Supabase)

Konfiguracja SSL z Let's Encrypt przez proxy nginx (np. użycie Traefik lub nginx w osobnym kontenerze)

Możliwość deployu na chmurze (np. DigitalOcean Droplet, AWS EC2) z wykorzystaniem Dockera

Plik docker-compose.yml
text
version: "3.8"
services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: iframedb
    networks:
      - backend

  backend:
    build: ./backend
    restart: unless-stopped
    volumes:
      - ./backend:/app
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgres://myuser:mypassword@postgres:5432/iframedb
    networks:
      - backend

  frontend:
    build: ./frontend
    restart: unless-stopped
    volumes:
      - ./frontend:/app
    ports:
      - "3000:5173"
    networks:
      - frontend

  nginx:
    image: nginx:stable-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - frontend
      - backend
    networks:
      - frontend
      - backend

volumes:
  pgdata:

networks:
  backend:
  frontend:
Nginx konfiguracja - przykład pliku nginx/conf.d/iframe.conf
text
server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;

  location / {
    return 301 https://$host$request_uri;
  }
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com www.yourdomain.com;

  ssl_certificate /etc/nginx/certs/fullchain.pem;
  ssl_certificate_key /etc/nginx/certs/privkey.pem;

  location /api/ {
    proxy_pass http://backend:5000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location / {
    proxy_pass http://frontend:5173/;
    proxy_set_header Host $host;
  }
}
Dockerfile Backend (Node.js + TS)
text
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]
Dockerfile Frontend (React + Vite)
text
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "build"]
Keywords do deployu na chmurze
VPS (DigitalOcean, Linode): skopiuj foldery i uruchom docker-compose up -d

AWS EC2: analogicznie lub użyj ECS z Fargate

SSL: Let's Encrypt certbot można zainstalować na VPS lub użyć Traefik jako reverse proxy automatyzujące certyfikaty

Supabase Managed DB: podmień połączenie DB w DATABASE_URL

Workflow developerów
backend/ i frontend/ oddzielone repo lub workspace monorepo

Testy uruchamiamy lokalnie przez Docker albo npm run dev

CI/CD na GitHub Actions z build/test/deploy

Harmonogram crawlera na VPS lub platformie serverless

Monitorowanie (Sentry) i logowanie (LogDNA, ELK)

