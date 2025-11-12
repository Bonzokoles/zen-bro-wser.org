Szczegółowa instrukcja rozwoju rozbudowanego systemu biblioteki i wyszukiwarki
1. Backend - Node.js / Express
1.1. Konfiguracja
Utwórz plik .env na konfigurację ścieżki bazowej:

text
LIBRARIES_ROOT=/mnt/jimbo_inc/libraries
PORT=3000
Załaduj zmienne środowiskowe:

js
require('dotenv').config();
const librariesRoot = process.env.LIBRARIES_ROOT || '/mnt/jimbo_inc/libraries';
const port = process.env.PORT || 3000;
1.2. Pełniejszy odczyt i parsowanie plików JSON i MD
Do parsowania MD można użyć biblioteki marked:

bash
npm install marked
Wczytywanie pliku MD i konwersja na HTML:

js
const marked = require('marked');

function parseMarkdown(content) {
  return marked(content);
}
Zwrot JSON np. z podglądem HTML na frontend:

js
const content = readMetadataFile(filePath);
const html = filePath.endsWith('.md') ? parseMarkdown(content) : content;
res.json({ content, html });
1.3. Obsługa większych katalogów - paginacja i filtracja
Dodaj parametry zapytania: page, limit, filterTags, searchTerm

Implementuj filtrowanie po tagach z metadata JSON

Realizuj paginację po liczbie plików na stronę

1.4. Security i backup
Wdróż podstawową autoryzację np. Basic Auth lub tokeny JWT

Zapewnij backup danych i logi zmian przy zapisie

1.5. Synchronizacja i WebSocket
Integracja z socket.io do powiadomień frontend o zmianach katalogu:

bash
npm install socket.io
Serwer WebSocket:

js
const http = require('http').createServer(app);
const io = require('socket.io')(http);

watcher.on('all', (event, path) => {
  io.emit('fileChanged', path);
});

http.listen(port, () => {
  console.log('Server listening on port ' + port);
});
2. Frontend - React, z rozbudowanym UI
2.1. Pobieranie drzewa i obsługa filtrowania
Rozbuduj komponent katalogu:

Wyświetlaj podfoldery i pliki z ikonkami

Dodaj pasek wyszukiwania i filtr po tagach

Pagina na liście plików

2.2. Edytor i podgląd z renderem Markdown
Edytuj Markdown i zapisz poprzez API

Podgląd pod edytorem w czasie rzeczywistym (render z markdown react)

2.3. Powiadomienia od WebSocket
Po wykryciu zmian przeładuj strukturę lub oznacz plik jako zmodyfikowany

3. Moduły automatycznego importu i uzupełniania
3.1. Crawler z Puppeteer
Renderuj strony i iframe headless Chrome do ekstrakcji danych

Wstępna ekstrakcja tekstu i metadanych + przesłanie do API zapisu

3.2. AI do tagowania i rekomendacji
Po imporcie uruchamiaj pipeline AI rozpoznający tematy, generujący tagi, streszczenia

Aktualizuj metadane plików JSON lub MD

4. Rozszerzenia i UX
Historia wersji plików z możliwością rollback

Eksport/import części katalogu

Panel administracyjny do monitorowania crawlerów i stanu biblioteki

Integracja z wygodnymi wyszukiwarkami pełnotekstowymi (Elasticsearch, Tantivy)

5. Workflow przykładowy:
Uruchamiasz backend z API i WebSocketem

Uruchamiasz frontend i łączysz się do backendu

Importujesz początkową bazę danych do struktur LIBRARIES

Wybierasz plik w frontendzie, edytujesz i zapisujesz

Crawler okresowo pobiera dane z internetu, dodaje pliki do LIBRARIES przez API

AI analizuje nowe pliki i dodaje tagi

Frontend dostaje powiadomienie o nowościach i możesz je przeglądać

