Cel
Utworzyć repozytorium git, skonfigurować podstawowe pliki i narzędzia.

Instrukcja
W folderze projektu uruchom terminal.

Zainicjuj repozytorium git:

bash
git init
Stwórz plik .gitignore z podstawowymi wpisami:

text
# Systemowe
.DS_Store
Thumbs.db

# Node
node_modules/
dist/

# Logi i tymczasowe
*.log
*.tmp
*.swp

# Konfiguracje lokalne i hasła
.env
Dodaj nowy plik README.md z podstawowym opisem projektu:

text
# CAYD_SEARCH_ENG Project

Projekt modularnej, retro-w stylizowanej przeglądarki/katalogu z wyszukiwarką i playerem multimediów.
Dodaj zmiany, zacommituj:

bash
git add .
git commit -m "Init project with gitignore and README"
Krok 2: Utworzenie prostej struktury kodu i pierwszego endpointu (JavaScript / Node.js)
Cel
Zainicjowanie prostej aplikacji serwera HTTP, który pozwoli na rozbudowę.

Instrukcja
W terminalu utwórz package.json:

bash
npm init -y
Zainstaluj prosty serwer (np. Express):

bash
npm install express
W folderze source/ utwórz plik server.js z przykładowym kodem:

js
const express = require('express');
const app = express();
const port = 3000;

// Endpoint testowy
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Serwer działa' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
Dodaj skrypt do package.json:

json
"scripts": {
  "start": "node source/server.js"
}
Uruchom serwer i sprawdź w przeglądarce pod adresem http://localhost:3000/api/status

Krok 3: Prosty moduł katalogu (przechowywanie i zwracanie danych)
Cel
Zaimplementować podstawową strukturę katalogu z danymi w pamięci.

Instrukcja
W source/ utwórz catalog.js:

js
const catalogData = [
  { id: 1, title: 'Strona Retro 1', url: 'http://retro1.example', tags: ['retro', 'oldweb'] },
  { id: 2, title: 'Przeglądarka Netscape', url: 'http://netscape.example', tags: ['browser'] }
];

// Funkcja do pobierania całego katalogu
function getCatalog() {
  return catalogData;
}

module.exports = { getCatalog };
Zmodyfikuj server.js aby dodać endpoint zwracający katalog:

js
const express = require('express');
const app = express();
const port = 3000;

const { getCatalog } = require('./catalog');

// Endpoint katalogu
app.get('/api/catalog', (req, res) => {
  res.json(getCatalog());
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
Sprawdź endpoint http://localhost:3000/api/catalog

To są pierwsze 3 kroki startowe do dalszej rozbudowy.

W kolejnych instrukcjach będzie:

implementacja playera multimediów

podłączenie retro-wyszukiwarki z federacją

integracja z bazą danych i cache’em

dodanie prostego front-endu do przeglądania katalogu i odtwarzania mediów

integracje AI do rekomendacji i tagowania