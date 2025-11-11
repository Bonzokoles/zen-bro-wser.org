const catalogData = [
    { id: 1, title: 'Strona Retro 1', url: 'http://retro1.example', tags: ['retro', 'oldweb'] },
    { id: 2, title: 'Przeglądarka Netscape', url: 'http://netscape.example', tags: ['browser'] }
];

// Funkcja do pobierania całego katalogu
function getCatalog() {
    return catalogData;
}

module.exports = { getCatalog };
