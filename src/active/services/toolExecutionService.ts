
import { TavilyClient } from 'tavily';

export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
}

class ToolExecutionService {
  private tavilyApiKey: string | null = null;
  private tavilyClient: TavilyClient | null = null;
  private braveApiKey: string | null = null;

  constructor(tavilyApiKey?: string, braveApiKey?: string) {
    if (tavilyApiKey) {
      this.configureTavilyClient(tavilyApiKey);
    }
    if (braveApiKey) {
      this.braveApiKey = braveApiKey;
    }
  }

  public async execute(toolId: string, args: any): Promise<ToolResult> {
    switch (toolId) {
      case 'web_search':
        return this.executeWebSearch(args);
      case 'content_analysis':
        return this.executeContentAnalysis(args);
      case 'bookmark_manager':
        return this.executeBookmarkManager(args);
      case 'page_summarizer':
        return this.executePageSummarizer(args);
      case 'link_extractor':
        return this.executeLinkExtractor(args);
      case 'web_navigation':
        return this.executeWebNavigation(args);
      default:
        return { success: false, data: null, error: `Tool not found: ${toolId}` };
    }
  }

  private async executeWebSearch(args: any): Promise<ToolResult> {
    if (!args.query) {
      return { success: false, data: null, error: 'Missing query for web_search' };
    }

    // Try Tavily first
    const client = this.getTavilyClient();
    if (client) {
      try {
        const searchParams: any = {
          query: args.query,
          // Max results (1-20)
          max_results: typeof args.maxResults === 'number' ? args.maxResults : 5,
          // Search depth: 'basic' (faster) or 'advanced' (more thorough)
          search_depth: args.searchDepth || 'basic',
          // Include AI-generated answer
          include_answer: args.includeAnswer !== false,
          // Include images in results
          include_images: args.includeImages === true,
          // Include raw page content
          include_raw_content: args.includeRawContent === true,
          // Time range: 'd' (day), 'w' (week), 'm' (month), 'y' (year)
          ...(args.days && { days: args.days }),
          // Domain filters
          ...(Array.isArray(args.includeDomains) && args.includeDomains.length > 0
            ? { include_domains: args.includeDomains }
            : {}),
          ...(Array.isArray(args.excludeDomains) && args.excludeDomains.length > 0
            ? { exclude_domains: args.excludeDomains }
            : {}),
          // Topic filtering
          ...(args.topic && { topic: args.topic }), // 'general', 'news', 'finance'
        };

        const response = await client.search(searchParams);

        // Enhance response with metadata
        return {
          success: true,
          data: {
            ...response,
            searchParams: {
              query: args.query,
              depth: searchParams.search_depth,
              maxResults: searchParams.max_results,
              hasAnswer: searchParams.include_answer,
              hasImages: searchParams.include_images
            }
          }
        };
      } catch (error: any) {
        console.warn('Tavily search failed, trying Brave...', error);
      }
    }

    // Fallback to Brave Search
    if (this.braveApiKey) {
      try {
        const maxResults = typeof args.maxResults === 'number' ? args.maxResults : 5;
        const response = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(args.query)}&count=${maxResults}`,
          {
            headers: {
              'Accept': 'application/json',
              'X-Subscription-Token': this.braveApiKey
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Brave API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform Brave response to match Tavily format
        const results = (data.web?.results || []).map((item: any) => ({
          title: item.title,
          url: item.url,
          content: item.description,
          score: item.relevance || 1
        }));

        return {
          success: true,
          data: {
            results,
            answer: data.discussions?.[0]?.data?.summary || null,
            query: args.query,
            response_time: 1
          }
        };
      } catch (error: any) {
        return { success: false, data: null, error: `Brave search failed: ${error?.message || error}` };
      }
    }

    return {
      success: false,
      data: null,
      error: 'No search API configured. Add VITE_TAVILY_API_KEY or VITE_BRAVE_API_KEY to .env'
    };
  }

  private configureTavilyClient(apiKey: string): void {
    this.tavilyApiKey = apiKey;
    this.tavilyClient = new TavilyClient({ apiKey });
  }

  private getTavilyClient(): TavilyClient | null {
    if (this.tavilyClient) {
      return this.tavilyClient;
    }

    if (!this.tavilyApiKey) {
      return null;
    }

    this.tavilyClient = new TavilyClient({ apiKey: this.tavilyApiKey });
    return this.tavilyClient;
  }

  private async executeContentAnalysis(args: any): Promise<ToolResult> {
    if (!args.content) {
      return { success: false, data: null, error: 'Missing content for content_analysis' };
    }

    try {
      // Extract key information from content
      const wordCount = args.content.split(/\s+/).length;
      const paragraphs = args.content.split(/\n\n+/).length;
      const sentences = args.content.split(/[.!?]+/).length;

      // Extract headings (simplified)
      const headings = (args.content.match(/^#{1,6}\s+.+$/gm) || [])
        .map((h: string) => h.replace(/^#+\s+/, ''));

      // Extract links
      const links = (args.content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [])
        .map((link: string) => {
          const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
          return match ? { text: match[1], url: match[2] } : null;
        })
        .filter(Boolean);

      return {
        success: true,
        data: {
          statistics: {
            wordCount,
            paragraphs,
            sentences,
            readingTime: Math.ceil(wordCount / 200) // Average reading speed
          },
          structure: {
            headings,
            linksCount: links.length
          },
          links: links.slice(0, 10) // First 10 links
        }
      };
    } catch (error: any) {
      return { success: false, data: null, error: `Content analysis failed: ${error?.message || error}` };
    }
  }

  private async executeBookmarkManager(args: any): Promise<ToolResult> {
    const action = args.action; // 'add', 'remove', 'list', 'search'

    try {
      // Get bookmarks from localStorage
      const bookmarks = JSON.parse(localStorage.getItem('zeno_bookmarks') || '[]');

      switch (action) {
        case 'add':
          if (!args.url || !args.title) {
            return { success: false, data: null, error: 'Missing url or title for bookmark' };
          }
          const newBookmark = {
            id: `bookmark_${Date.now()}`,
            url: args.url,
            title: args.title,
            description: args.description || '',
            tags: args.tags || [],
            createdAt: new Date().toISOString()
          };
          bookmarks.push(newBookmark);
          localStorage.setItem('zeno_bookmarks', JSON.stringify(bookmarks));
          return { success: true, data: { bookmark: newBookmark, total: bookmarks.length } };

        case 'remove':
          if (!args.id && !args.url) {
            return { success: false, data: null, error: 'Missing id or url for bookmark removal' };
          }
          const filtered = bookmarks.filter((b: any) =>
            b.id !== args.id && b.url !== args.url
          );
          localStorage.setItem('zeno_bookmarks', JSON.stringify(filtered));
          return { success: true, data: { removed: bookmarks.length - filtered.length, total: filtered.length } };

        case 'search':
          if (!args.query) {
            return { success: false, data: null, error: 'Missing query for bookmark search' };
          }
          const query = args.query.toLowerCase();
          const results = bookmarks.filter((b: any) =>
            b.title.toLowerCase().includes(query) ||
            b.description.toLowerCase().includes(query) ||
            b.url.toLowerCase().includes(query) ||
            b.tags.some((t: string) => t.toLowerCase().includes(query))
          );
          return { success: true, data: { results, count: results.length } };

        case 'list':
          const limit = args.limit || 50;
          const offset = args.offset || 0;
          return {
            success: true,
            data: {
              bookmarks: bookmarks.slice(offset, offset + limit),
              total: bookmarks.length
            }
          };

        default:
          return { success: false, data: null, error: `Unknown bookmark action: ${action}` };
      }
    } catch (error: any) {
      return { success: false, data: null, error: `Bookmark manager failed: ${error?.message || error}` };
    }
  }

  private async executePageSummarizer(args: any): Promise<ToolResult> {
    if (!args.content) {
      return { success: false, data: null, error: 'Missing content for page_summarizer' };
    }

    try {
      const content = args.content;
      const maxLength = args.maxLength || 200;

      // Extract first N characters for summary
      const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);

      let summary = '';
      let currentLength = 0;

      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (currentLength + trimmed.length > maxLength) break;
        summary += trimmed + '. ';
        currentLength += trimmed.length;
      }

      // Extract key points (headings or bold text)
      const keyPoints = (content.match(/^#{1,6}\s+.+$|^\*\*.+?\*\*$/gm) || [])
        .map((p: string) => p.replace(/^#+\s+|\*\*/g, '').trim())
        .slice(0, 5);

      return {
        success: true,
        data: {
          summary: summary.trim(),
          keyPoints,
          originalLength: content.length,
          summaryLength: summary.length
        }
      };
    } catch (error: any) {
      return { success: false, data: null, error: `Page summarizer failed: ${error?.message || error}` };
    }
  }

  private async executeLinkExtractor(args: any): Promise<ToolResult> {
    if (!args.content && !args.html) {
      return { success: false, data: null, error: 'Missing content or html for link_extractor' };
    }

    try {
      const text = args.content || args.html;

      // Extract markdown links
      const markdownLinks = (text.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [])
        .map((link: string) => {
          const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
          return match ? { text: match[1], url: match[2], type: 'markdown' } : null;
        })
        .filter(Boolean);

      // Extract HTML links (basic)
      const htmlLinks = (text.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/g) || [])
        .map((link: string) => {
          const match = link.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/);
          return match ? { text: match[2], url: match[1], type: 'html' } : null;
        })
        .filter(Boolean);

      // Extract plain URLs
      const plainUrls = (text.match(/https?:\/\/[^\s<>"]+/g) || [])
        .map((url: string) => ({ text: url, url, type: 'plain' }));

      const allLinks = [...markdownLinks, ...htmlLinks, ...plainUrls];

      // Remove duplicates
      const uniqueLinks = Array.from(
        new Map(allLinks.map(l => [l.url, l])).values()
      );

      // Categorize links
      const internal = uniqueLinks.filter(l =>
        l.url.startsWith('/') || l.url.startsWith('#')
      );
      const external = uniqueLinks.filter(l =>
        l.url.startsWith('http') && !l.url.startsWith('/')
      );

      return {
        success: true,
        data: {
          all: uniqueLinks,
          internal,
          external,
          counts: {
            total: uniqueLinks.length,
            internal: internal.length,
            external: external.length
          }
        }
      };
    } catch (error: any) {
      return { success: false, data: null, error: `Link extractor failed: ${error?.message || error}` };
    }
  }

  private async executeWebNavigation(args: any): Promise<ToolResult> {
    const action = args.action; // 'navigate', 'back', 'forward', 'reload', 'new_tab', 'close_tab'

    try {
      switch (action) {
        case 'navigate':
          if (!args.url) {
            return { success: false, data: null, error: 'Missing url for navigation' };
          }
          // In a real implementation, this would communicate with the browser
          // For now, return a success message
          return {
            success: true,
            data: {
              action: 'navigate',
              url: args.url,
              message: `Navigating to ${args.url}`
            }
          };

        case 'back':
          return {
            success: true,
            data: {
              action: 'back',
              message: 'Navigating back'
            }
          };

        case 'forward':
          return {
            success: true,
            data: {
              action: 'forward',
              message: 'Navigating forward'
            }
          };

        case 'reload':
          return {
            success: true,
            data: {
              action: 'reload',
              message: 'Reloading current page'
            }
          };

        case 'new_tab':
          return {
            success: true,
            data: {
              action: 'new_tab',
              url: args.url || 'about:blank',
              message: `Opening new tab${args.url ? ` with ${args.url}` : ''}`
            }
          };

        case 'close_tab':
          return {
            success: true,
            data: {
              action: 'close_tab',
              tabId: args.tabId,
              message: 'Closing tab'
            }
          };

        default:
          return { success: false, data: null, error: `Unknown navigation action: ${action}` };
      }
    } catch (error: any) {
      return { success: false, data: null, error: `Web navigation failed: ${error?.message || error}` };
    }
  }
}

export default ToolExecutionService;
