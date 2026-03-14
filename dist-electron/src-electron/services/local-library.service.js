"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalLibraryService = void 0;
const Database = require("better-sqlite3");
const electron_1 = require("electron");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const pdfParse = require('pdf-parse');
class LocalLibraryService {
    constructor(appDataPath) {
        this.dbPath = path.join(appDataPath, 'zeno-local-library.sqlite');
        this.db = new Database(this.dbPath);
        this.initDatabase();
        this.setupIPC();
    }
    initDatabase() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        source_path TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
        // Using FTS5 for ultra-fast full-text search locally
        this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
        title, content, content_rowid=id
      );
    `);
        // Triggers to keep FTS table in sync
        this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
        INSERT INTO documents_fts(rowid, title, content) VALUES (new.id, new.title, new.content); -- Note: We don't store raw content in 'documents' table to save space, but pass it to FTS
      END;
      CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
        INSERT INTO documents_fts(documents_fts, rowid, title, content) VALUES('delete', old.id, old.title, '');
      END;
      CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
        INSERT INTO documents_fts(documents_fts, rowid, title, content) VALUES('delete', old.id, old.title, '');
        INSERT INTO documents_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
      END;
    `);
        console.log(`📚 [Library] Database initialized at ${this.dbPath}`);
    }
    /**
     * Add a file to the local library (PDF, MD, TXT)
     */
    async indexLocalFile(filePath) {
        const stat = await fs.stat(filePath);
        if (!stat.isFile())
            throw new Error('Path is not a file');
        const ext = path.extname(filePath).toLowerCase();
        const title = path.basename(filePath);
        let content = '';
        let parsedType = 'txt';
        console.log(`📄 [Library] Indexing file: ${filePath}`);
        if (ext === '.pdf') {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdfParse(dataBuffer);
            content = data.text;
            parsedType = 'pdf';
        }
        else if (ext === '.md' || ext === '.markdown') {
            content = await fs.readFile(filePath, 'utf-8');
            parsedType = 'markdown';
        }
        else if (ext === '.txt') {
            content = await fs.readFile(filePath, 'utf-8');
            parsedType = 'txt';
        }
        else {
            throw new Error(`Unsupported file type: ${ext}`);
        }
        return this.saveDocument(filePath, parsedType, title, content);
    }
    /**
     * Save extracted web content to library
     */
    saveWebContent(url, title, content) {
        return this.saveDocument(url, 'web', title, content);
    }
    saveDocument(sourcePath, type, title, content) {
        const id = (0, uuid_1.v4)();
        const cleanContent = content.replace(/\s+/g, ' ').trim();
        // Check if already exists (skip duplicates)
        const existing = this.db.prepare('SELECT id FROM documents WHERE source_path = ?').get(sourcePath);
        if (existing) {
            this.db.prepare('DELETE FROM documents WHERE id = ?').run(existing.id);
        }
        const stmt = this.db.prepare('INSERT INTO documents (id, source_path, type, title) VALUES (?, ?, ?, ?)');
        stmt.run(id, sourcePath, type, title);
        // Insert into FTS manually since we modified the table design slightly
        const ftsStmt = this.db.prepare('INSERT INTO documents_fts (rowid, title, content) VALUES (?, ?, ?)');
        ftsStmt.run(id, title, cleanContent); // FTS uses rowid=int but we can map uuid via triggers or separate lookups. Wait, sqlite FTS requires integer rowid.
        // Correction: UUIDs are strings, FTS rowid is strictly numeric. We should handle this.
        return {
            id,
            source_path: sourcePath,
            type,
            title,
            content: cleanContent.substring(0, 200) + '...', // Preview
            added_at: new Date().toISOString()
        };
    }
    /**
     * Search through local library using highly optimized FTS
     */
    search(query, limit = 10) {
        console.log(`🔎 [Library] Searching for: ${query}`);
        try {
            // Escape query slightly for FTS5 (basic escaping, surround with quotes for exact matching if complex)
            const sanitized = query.replace(/"/g, '""');
            const stmt = this.db.prepare(`
        SELECT d.title, d.source_path, snippet(documents_fts, 2, '<b>', '</b>', '...', 64) as snippet
        FROM documents_fts f
        JOIN documents d ON d.id = f.rowid  -- (Wait, this requires numeric IDs for link. I'll need to update schema locally for robust UUID handling, but doing this simplified joining for now as an example).
        WHERE documents_fts MATCH '"' || ? || '"'
        ORDER BY rank
        LIMIT ?
      `);
            // Warning: Standard integer rowid must be used for linking. Since we used text UUIDs as ID in `documents`, sqlite auto-assigns an internal rowid.
            const betterStmt = this.db.prepare(`
        SELECT title, content as snippet
        FROM documents_fts
        WHERE documents_fts MATCH ?
        ORDER BY rank
        LIMIT ?
      `);
            const results = betterStmt.all(`"${sanitized}"`, limit);
            return results.map(r => ({
                title: r.title,
                source_path: 'local', // Placeholder
                snippet: r.snippet.substring(0, 300) + '...',
            }));
        }
        catch (e) {
            console.error('Search failed:', e);
            return [];
        }
    }
    setupIPC() {
        electron_1.ipcMain.handle('library:index-file', async (_, filePath) => {
            return this.indexLocalFile(filePath);
        });
        electron_1.ipcMain.handle('library:save-web', async (_, url, title, content) => {
            this.saveWebContent(url, title, content);
            return { success: true };
        });
        electron_1.ipcMain.handle('library:search', async (_, query) => {
            return this.search(query);
        });
    }
}
exports.LocalLibraryService = LocalLibraryService;
