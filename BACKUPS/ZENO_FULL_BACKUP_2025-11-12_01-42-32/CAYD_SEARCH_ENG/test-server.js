const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', message: 'Serwer działa' }));
    } else if (req.url === '/api/catalog') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const catalog = [
            { id: 1, title: 'Strona Retro 1', url: 'http://retro1.example', tags: ['retro', 'oldweb'] },
            { id: 2, title: 'Przeglądarka Netscape', url: 'http://netscape.example', tags: ['browser'] }
        ];
        res.end(JSON.stringify(catalog));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3333, '0.0.0.0', () => {
    console.log('Test server listening at http://localhost:3333');
});
