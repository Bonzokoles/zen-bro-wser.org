export interface CrawlerResult {
    url: string;
    title: string;
    markdown: string;
    links: string[];
    error?: string;
}
export declare class WebCrawlerService {
    private tvly;
    constructor();
    /**
     * Deep Search using Tavily (Optimized for AI/RAG)
     */
    deepSearch(query: string, searchDepth?: 'basic' | 'advanced'): Promise<any>;
    /**
     * Extract content from a specific URL using raw HTTP or Headless render
     */
    extractContent(url: string, useRender?: boolean): Promise<CrawlerResult>;
    private extractWithAxios;
    private extractWithBrowserWindow;
    private parseHtml;
    private setupIPC;
}
