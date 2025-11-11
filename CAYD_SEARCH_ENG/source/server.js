const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const chokidar = require('chokidar');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors()); // STEP_04: Enable CORS for frontend communication
app.use(bodyParser.json());

/**
 * CAYD Search Engine - Port Configuration
 * Reserved ports: 6040-6050 (11 ports total)
 * 
 * Port allocation:
 * - 6040: Main CAYD API Server (current)
 * - 6041: Reserved for Search Index Service
 * - 6042: Reserved for Cache Service
 * - 6043: Reserved for WebSocket Real-time Updates
 * - 6044: Reserved for File Watcher Service
 * - 6045: Reserved for Analytics Service
 * - 6046: Reserved for Admin Dashboard
 * - 6047: Reserved for Backup Service
 * - 6048: Reserved for Preview Service
 * - 6049: Reserved for Testing/Development
 * - 6050: Reserved for Load Balancer
 */
const port = 6040;

const { getCatalog } = require('./catalog');
const { getLibraryStructure, getPathsConfig, readMetadataDir } = require('./libraryReader');

// Endpoint testowy
app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', message: 'Serwer działa' });
});

// Endpoint katalogu
app.get('/api/catalog', (req, res) => {
    res.json(getCatalog());
});

// Endpoint biblioteki - pełna struktura
app.get('/api/library', (req, res) => {
    try {
        const library = getLibraryStructure();
        res.json(library);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint konfiguracji
app.get('/api/config/paths', (req, res) => {
    try {
        const config = getPathsConfig();
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// STEP_03: Endpoint drzewa katalogów (bez pełnej zawartości plików)
app.get('/api/catalogTree', (req, res) => {
    try {
        const config = getPathsConfig();
        const librariesRoot = config.librariesRoot;

        function buildTree(dir) {
            if (!fs.existsSync(dir)) {
                return [];
            }

            const items = fs.readdirSync(dir, { withFileTypes: true });
            let results = [];

            for (const item of items) {
                const fullPath = path.join(dir, item.name);

                if (item.isDirectory()) {
                    results.push({
                        type: 'folder',
                        name: item.name,
                        children: buildTree(fullPath)
                    });
                } else if (item.isFile() && ['.md', '.json'].includes(path.extname(item.name))) {
                    results.push({
                        type: 'file',
                        name: item.name,
                        path: path.relative(librariesRoot, fullPath)
                    });
                }
            }
            return results;
        }

        const tree = buildTree(librariesRoot);
        res.json(tree);
    } catch (err) {
        res.status(500).json({ error: 'Błąd odczytu katalogu: ' + err.message });
    }
});

// STEP_03: Endpoint pobierania zawartości pliku
app.get('/api/fileContent', (req, res) => {
    const filePath = req.query.path;

    if (!filePath) {
        return res.status(400).json({ error: 'Brak parametru path' });
    }

    try {
        const config = getPathsConfig();
        const fullPath = path.join(config.librariesRoot, filePath);

        // Sprawdzenie czy plik istnieje i jest w dozwolonym katalogu
        if (!fullPath.startsWith(config.librariesRoot)) {
            return res.status(403).json({ error: 'Dostęp zabroniony' });
        }

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Plik nie istnieje' });
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        res.json({ content });
    } catch (err) {
        res.status(500).json({ error: 'Błąd odczytu pliku: ' + err.message });
    }
});

// STEP_03: Endpoint zapisu metadanych
app.post('/api/saveMetadata', (req, res) => {
    const { relativePath, content } = req.body;

    if (!relativePath || content === undefined) {
        return res.status(400).json({ error: 'Brak relativePath lub content' });
    }

    try {
        const config = getPathsConfig();
        const fullPath = path.join(config.librariesRoot, relativePath);
        const dir = path.dirname(fullPath);

        // Sprawdzenie bezpieczeństwa ścieżki
        if (!fullPath.startsWith(config.librariesRoot)) {
            return res.status(403).json({ error: 'Dostęp zabroniony' });
        }

        // Tworzenie katalogów jeśli nie istnieją
        fs.mkdirSync(dir, { recursive: true });

        // Zapis pliku
        fs.writeFileSync(fullPath, content, 'utf8');

        res.json({
            status: 'success',
            path: relativePath,
            message: 'Plik zapisany pomyślnie'
        });
    } catch (err) {
        res.status(500).json({ error: 'Błąd zapisu pliku: ' + err.message });
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// STEP_06: WebSocket connection handler
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// STEP_06: File watcher setup
const config = getPathsConfig();
const watcher = chokidar.watch(config.librariesRoot, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true
});

watcher
    .on('add', (filePath) => {
        const relativePath = path.relative(config.librariesRoot, filePath);
        console.log(`File added: ${relativePath}`);
        io.emit('fileChanged', {
            type: 'add',
            path: relativePath,
            timestamp: Date.now()
        });
    })
    .on('change', (filePath) => {
        const relativePath = path.relative(config.librariesRoot, filePath);
        console.log(`File changed: ${relativePath}`);
        io.emit('fileChanged', {
            type: 'change',
            path: relativePath,
            timestamp: Date.now()
        });
    })
    .on('unlink', (filePath) => {
        const relativePath = path.relative(config.librariesRoot, filePath);
        console.log(`File removed: ${relativePath}`);
        io.emit('fileChanged', {
            type: 'unlink',
            path: relativePath,
            timestamp: Date.now()
        });
    });

console.log(`Watching for file changes in: ${config.librariesRoot}`);
