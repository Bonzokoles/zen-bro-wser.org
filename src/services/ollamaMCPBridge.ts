/**
 * Ollama MCP Bridge Service
 * Łączy Ollama z narzędziami MCP bez potrzeby pełnej inicjalizacji AI providera
 */

export interface MCPTool {
    id: string;
    name: string;
    description: string;
    category: 'browser' | 'search' | 'analysis' | 'utility';
    enabled: boolean;
}

export interface ToolExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
    toolId: string;
}

/**
 * Wykrywa czy wiadomość użytkownika wymaga użycia narzędzia MCP
 */
export function detectToolIntent(message: string): { toolId: string; params: any } | null {
    const lowerMessage = message.toLowerCase();

    // Web Search patterns
    if (
        lowerMessage.includes('szukaj') ||
        lowerMessage.includes('przeszukaj') ||
        lowerMessage.includes('znajdź w internecie') ||
        lowerMessage.includes('search') ||
        lowerMessage.includes('google')
    ) {
        // Wyciągnij query (usuń trigger words)
        const query = message
            .replace(/(?:szukaj|przeszukaj|znajdź w internecie|search|google)\s*/gi, '')
            .trim();

        return {
            toolId: 'web_search',
            params: { query }
        };
    }

    // Content Analysis patterns
    if (
        lowerMessage.includes('przeanalizuj') ||
        lowerMessage.includes('analyze') ||
        lowerMessage.includes('sprawdź stronę') ||
        lowerMessage.includes('check page')
    ) {
        // Próbuj wyciągnąć URL z wiadomości
        const urlMatch = message.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : '';

        return {
            toolId: 'content_analysis',
            params: { url, content: message }
        };
    }

    // Bookmark Manager patterns
    if (
        lowerMessage.includes('dodaj bookmark') ||
        lowerMessage.includes('add bookmark') ||
        lowerMessage.includes('zapisz stronę') ||
        lowerMessage.includes('save page')
    ) {
        const urlMatch = message.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : '';

        return {
            toolId: 'bookmark_manager',
            params: { action: 'add', url }
        };
    }

    // Page Summarizer patterns
    if (
        lowerMessage.includes('podsumuj') ||
        lowerMessage.includes('summarize') ||
        lowerMessage.includes('streszczenie') ||
        lowerMessage.includes('summary')
    ) {
        const urlMatch = message.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : '';

        return {
            toolId: 'page_summarizer',
            params: { url }
        };
    }

    // Link Extractor patterns
    if (
        lowerMessage.includes('wyciągnij linki') ||
        lowerMessage.includes('extract links') ||
        lowerMessage.includes('znajdź linki') ||
        lowerMessage.includes('find links')
    ) {
        const urlMatch = message.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : '';

        return {
            toolId: 'link_extractor',
            params: { url }
        };
    }

    // Web Navigation patterns
    if (
        lowerMessage.includes('otwórz') ||
        lowerMessage.includes('open') ||
        lowerMessage.includes('przejdź do') ||
        lowerMessage.includes('navigate to')
    ) {
        const urlMatch = message.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : '';

        return {
            toolId: 'web_navigation',
            params: { url }
        };
    }

    return null;
}

/**
 * Wykonuje narzędzie MCP (uproszczona wersja bez pełnego toolExecutionService)
 */
export async function executeMCPTool(
    toolId: string,
    params: any
): Promise<ToolExecutionResult> {
    try {
        console.log(`[MCP Bridge] Executing tool: ${toolId}`, params);

        switch (toolId) {
            case 'web_search':
                return await executeWebSearch(params.query);

            case 'content_analysis':
                return await executeContentAnalysis(params.url, params.content);

            case 'bookmark_manager':
                return await executeBookmarkManager(params);

            case 'page_summarizer':
                return await executePageSummarizer(params.url);

            case 'link_extractor':
                return await executeLinkExtractor(params.url);

            case 'web_navigation':
                return await executeWebNavigation(params.url);

            default:
                return {
                    success: false,
                    error: `Unknown tool: ${toolId}`,
                    toolId
                };
        }
    } catch (error) {
        console.error(`[MCP Bridge] Tool execution error:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            toolId
        };
    }
}

/**
 * Implementacje poszczególnych narzędzi
 */

async function executeWebSearch(query: string): Promise<ToolExecutionResult> {
    // TODO: Integracja z Tavily API lub Brave Search
    // Na razie mock
    return {
        success: true,
        data: {
            query,
            results: [
                {
                    title: `Wyniki wyszukiwania dla: ${query}`,
                    snippet: 'Funkcja web search będzie działać po dodaniu TAVILY_API_KEY do .env',
                    url: '#'
                }
            ],
            message: 'Web search wymaga konfiguracji TAVILY_API_KEY lub BRAVE_API_KEY'
        },
        toolId: 'web_search'
    };
}

async function executeContentAnalysis(url: string, content: string): Promise<ToolExecutionResult> {
    return {
        success: true,
        data: {
            url,
            analysis: 'Analiza treści zostanie zaimplementowana z pełnym ToolExecutionService',
            contentPreview: content.substring(0, 200)
        },
        toolId: 'content_analysis'
    };
}

async function executeBookmarkManager(params: any): Promise<ToolExecutionResult> {
    const { action, url } = params;

    if (action === 'add' && url) {
        // Dodaj bookmark do localStorage (kompatybilne z istniejącym systemem)
        const bookmarks = JSON.parse(localStorage.getItem('zeno_bookmarks') || '[]');
        const newBookmark = {
            id: Date.now().toString(),
            title: `Bookmark ${bookmarks.length + 1}`,
            url,
            category: 'Inne',
            createdAt: new Date().toISOString()
        };

        bookmarks.push(newBookmark);
        localStorage.setItem('zeno_bookmarks', JSON.stringify(bookmarks));

        return {
            success: true,
            data: {
                message: `✅ Dodano bookmark: ${url}`,
                bookmark: newBookmark
            },
            toolId: 'bookmark_manager'
        };
    }

    return {
        success: false,
        error: 'Invalid bookmark action or missing URL',
        toolId: 'bookmark_manager'
    };
}

async function executePageSummarizer(url: string): Promise<ToolExecutionResult> {
    return {
        success: true,
        data: {
            url,
            summary: 'Page summarizer zostanie zaimplementowany z pełnym ToolExecutionService',
            message: 'Funkcja wymaga integracji z AI do generowania streszczeń'
        },
        toolId: 'page_summarizer'
    };
}

async function executeLinkExtractor(url: string): Promise<ToolExecutionResult> {
    return {
        success: true,
        data: {
            url,
            links: [],
            message: 'Link extractor zostanie zaimplementowany z web scraping'
        },
        toolId: 'link_extractor'
    };
}

async function executeWebNavigation(url: string): Promise<ToolExecutionResult> {
    if (url) {
        // Emit event do Browser.tsx (będzie obsługiwane przez window.postMessage)
        window.postMessage({
            type: 'MCP_NAVIGATE',
            url
        }, '*');

        return {
            success: true,
            data: {
                message: `✅ Nawigacja do: ${url}`,
                url
            },
            toolId: 'web_navigation'
        };
    }

    return {
        success: false,
        error: 'Missing URL for navigation',
        toolId: 'web_navigation'
    };
}

/**
 * Formatuje wynik narzędzia do tekstu dla Ollama
 */
export function formatToolResult(result: ToolExecutionResult): string {
    if (!result.success) {
        return `❌ Tool Error (${result.toolId}): ${result.error}`;
    }

    const toolNames: Record<string, string> = {
        web_search: '🔍 Web Search',
        content_analysis: '📊 Content Analysis',
        bookmark_manager: '📑 Bookmark Manager',
        page_summarizer: '📝 Page Summarizer',
        link_extractor: '🔗 Link Extractor',
        web_navigation: '🌐 Web Navigation'
    };

    const toolName = toolNames[result.toolId] || result.toolId;

    return `✅ ${toolName} Result:\n${JSON.stringify(result.data, null, 2)}`;
}

/**
 * Lista dostępnych narzędzi MCP
 */
export function getAvailableMCPTools(): MCPTool[] {
    return [
        {
            id: 'web_search',
            name: 'Web Search',
            description: 'Szukaj informacji w internecie (Tavily/Brave)',
            category: 'search',
            enabled: true
        },
        {
            id: 'content_analysis',
            name: 'Content Analysis',
            description: 'Analizuj treść strony internetowej',
            category: 'analysis',
            enabled: true
        },
        {
            id: 'bookmark_manager',
            name: 'Bookmark Manager',
            description: 'Zarządzaj zakładkami',
            category: 'browser',
            enabled: true
        },
        {
            id: 'page_summarizer',
            name: 'Page Summarizer',
            description: 'Generuj streszczenia stron',
            category: 'analysis',
            enabled: true
        },
        {
            id: 'link_extractor',
            name: 'Link Extractor',
            description: 'Wyciągaj linki ze stron',
            category: 'utility',
            enabled: true
        },
        {
            id: 'web_navigation',
            name: 'Web Navigation',
            description: 'Nawiguj do URL w przeglądarce',
            category: 'browser',
            enabled: true
        }
    ];
}
