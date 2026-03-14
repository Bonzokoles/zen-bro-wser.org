export interface DocumentInfo {
    id: string;
    source_path: string;
    type: 'pdf' | 'markdown' | 'txt' | 'web';
    title: string;
    content: string;
    added_at: string;
}
export declare class LocalLibraryService {
    private db;
    private dbPath;
    constructor(appDataPath: string);
    private initDatabase;
    /**
     * Add a file to the local library (PDF, MD, TXT)
     */
    indexLocalFile(filePath: string): Promise<DocumentInfo>;
    /**
     * Save extracted web content to library
     */
    saveWebContent(url: string, title: string, content: string): DocumentInfo;
    private saveDocument;
    /**
     * Search through local library using highly optimized FTS
     */
    search(query: string, limit?: number): Array<{
        title: string;
        source_path: string;
        snippet: string;
    }>;
    private setupIPC;
}
