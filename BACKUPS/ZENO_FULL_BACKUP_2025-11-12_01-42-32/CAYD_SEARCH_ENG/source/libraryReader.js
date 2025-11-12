const fs = require('fs');
const path = require('path');

/**
 * Rekurencyjne odczytywanie katalogów z metadanymi (.md, .json)
 * @param {string} dir - Ścieżka do katalogu
 * @returns {Array} - Struktura drzewa plików i folderów
 */
function readMetadataDir(dir) {
    if (!fs.existsSync(dir)) {
        console.warn(`Directory does not exist: ${dir}`);
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
                path: fullPath,
                children: readMetadataDir(fullPath)
            });
        } else if (item.isFile() && [".md", ".json"].includes(path.extname(item.name))) {
            try {
                const content = fs.readFileSync(fullPath, 'utf-8');
                results.push({
                    type: 'file',
                    name: item.name,
                    path: fullPath,
                    extension: path.extname(item.name),
                    content: content,
                    size: fs.statSync(fullPath).size,
                    modified: fs.statSync(fullPath).mtime
                });
            } catch (err) {
                console.error(`Error reading file ${fullPath}:`, err.message);
            }
        }
    }

    return results;
}

/**
 * Pobieranie konfiguracji ścieżek
 * @returns {Object} - Konfiguracja z paths.json
 */
function getPathsConfig() {
    const configPath = path.join(__dirname, '../config/paths.json');

    if (!fs.existsSync(configPath)) {
        throw new Error('Config file paths.json not found');
    }

    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * Główna funkcja do pobierania struktury biblioteki
 * @returns {Object} - Pełna struktura biblioteki z metadanymi
 */
function getLibraryStructure() {
    const config = getPathsConfig();
    const librariesRoot = config.librariesRoot;

    return {
        root: librariesRoot,
        lastSync: new Date().toISOString(),
        structure: readMetadataDir(librariesRoot)
    };
}

module.exports = {
    readMetadataDir,
    getPathsConfig,
    getLibraryStructure
};
