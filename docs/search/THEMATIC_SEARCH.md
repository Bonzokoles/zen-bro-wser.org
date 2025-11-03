# Thematic Search System - Wyszukiwanie Tematyczne

## Koncepcja

System wyszukiwania grupujący wyniki według tematów, kontekstów i relacji semantycznych zamiast prostego rankingu słów kluczowych.

## Architektura

```
src/services/search/
├── thematic-engine.ts        # Główny silnik
├── topic-detector.ts         # Detekcja tematów
├── semantic-grouper.ts       # Grupowanie semantyczne
├── context-analyzer.ts       # Analiza kontekstu
├── relation-mapper.ts        # Mapowanie relacji
└── result-organizer.ts       # Organizacja wyników
```

## Core Implementation

### 1. Topic Detection

```typescript
// src/services/search/topic-detector.ts

interface Topic {
  id: string;
  name: string;
  keywords: string[];
  weight: number;
  relatedTopics: string[];
  category: 'tech' | 'science' | 'culture' | 'politics' | 'business' | 'other';
}

interface DetectedTopic {
  topic: Topic;
  confidence: number;
  matchedKeywords: string[];
  context: string;
}

class TopicDetector {
  private topics: Map<string, Topic> = new Map();
  private embeddings: Map<string, number[]> = new Map();

  constructor() {
    this.loadTopicDatabase();
  }

  async detectTopics(query: string, content?: string): Promise<DetectedTopic[]> {
    const text = content || query;
    const tokens = this.tokenize(text);

    // 1. Keyword-based detection
    const keywordMatches = this.detectByKeywords(tokens);

    // 2. Semantic similarity
    const semanticMatches = await this.detectBySemantic(text);

    // 3. Co-occurrence analysis
    const cooccurrenceMatches = this.detectByCooccurrence(tokens);

    // Merge and rank
    const allMatches = this.mergeResults([
      keywordMatches,
      semanticMatches,
      cooccurrenceMatches
    ]);

    return allMatches
      .filter(m => m.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  private detectByKeywords(tokens: string[]): DetectedTopic[] {
    const results: DetectedTopic[] = [];

    for (const [id, topic] of this.topics) {
      const matchedKeywords = tokens.filter(t =>
        topic.keywords.some(k => k.toLowerCase().includes(t.toLowerCase()))
      );

      if (matchedKeywords.length > 0) {
        const confidence = matchedKeywords.length / topic.keywords.length;
        results.push({
          topic,
          confidence,
          matchedKeywords,
          context: 'keyword-match'
        });
      }
    }

    return results;
  }

  private async detectBySemantic(text: string): Promise<DetectedTopic[]> {
    const queryEmbedding = await this.getEmbedding(text);

    const results: DetectedTopic[] = [];

    for (const [id, topic] of this.topics) {
      const topicEmbedding = this.embeddings.get(id);
      if (!topicEmbedding) continue;

      const similarity = this.cosineSimilarity(queryEmbedding, topicEmbedding);

      if (similarity > 0.3) {
        results.push({
          topic,
          confidence: similarity,
          matchedKeywords: [],
          context: 'semantic-similarity'
        });
      }
    }

    return results;
  }

  private detectByCooccurrence(tokens: string[]): DetectedTopic[] {
    // Analiza współwystępowania słów
    const results: DetectedTopic[] = [];

    for (const [id, topic] of this.topics) {
      const pairs = this.generatePairs(tokens);
      let cooccurrenceScore = 0;

      for (const [word1, word2] of pairs) {
        if (this.topicsCooccur(topic, word1, word2)) {
          cooccurrenceScore++;
        }
      }

      if (cooccurrenceScore > 0) {
        results.push({
          topic,
          confidence: Math.min(cooccurrenceScore / 10, 1),
          matchedKeywords: tokens,
          context: 'co-occurrence'
        });
      }
    }

    return results;
  }

  // Topic database
  private loadTopicDatabase() {
    this.addTopic({
      id: 'ai-ml',
      name: 'Artificial Intelligence & Machine Learning',
      keywords: [
        'artificial intelligence', 'machine learning', 'deep learning',
        'neural network', 'transformer', 'LLM', 'GPT', 'Claude',
        'training', 'inference', 'model', 'dataset', 'embedding'
      ],
      weight: 1.0,
      relatedTopics: ['programming', 'data-science', 'research'],
      category: 'tech'
    });

    this.addTopic({
      id: 'web-dev',
      name: 'Web Development',
      keywords: [
        'react', 'vue', 'angular', 'javascript', 'typescript',
        'html', 'css', 'frontend', 'backend', 'fullstack',
        'api', 'rest', 'graphql', 'nodejs', 'browser'
      ],
      weight: 1.0,
      relatedTopics: ['programming', 'ui-ux'],
      category: 'tech'
    });

    this.addTopic({
      id: 'privacy',
      name: 'Privacy & Security',
      keywords: [
        'privacy', 'security', 'encryption', 'anonymity',
        'vpn', 'tor', 'surveillance', 'data protection',
        'gdpr', 'e2e', 'zero-knowledge'
      ],
      weight: 1.0,
      relatedTopics: ['cybersecurity', 'legal'],
      category: 'tech'
    });

    // ... więcej tematów
  }

  private addTopic(topic: Topic) {
    this.topics.set(topic.id, topic);
    // Generate embedding for topic
    this.generateTopicEmbedding(topic);
  }
}
```

### 2. Semantic Grouping

```typescript
// src/services/search/semantic-grouper.ts

interface SemanticGroup {
  id: string;
  theme: string;
  results: SearchResult[];
  coherenceScore: number;
  keywords: string[];
}

class SemanticGrouper {
  async groupResults(results: SearchResult[]): Promise<SemanticGroup[]> {
    // 1. Extract features from each result
    const features = await Promise.all(
      results.map(r => this.extractFeatures(r))
    );

    // 2. Clustering (hierarchical or k-means)
    const clusters = this.cluster(features, { maxGroups: 5 });

    // 3. Assign theme to each cluster
    const groups: SemanticGroup[] = [];

    for (const cluster of clusters) {
      const clusterResults = cluster.indices.map(i => results[i]);
      const theme = await this.determineTheme(clusterResults);
      const keywords = this.extractCommonKeywords(clusterResults);

      groups.push({
        id: crypto.randomUUID(),
        theme,
        results: clusterResults,
        coherenceScore: this.calculateCoherence(clusterResults),
        keywords
      });
    }

    return groups.sort((a, b) => b.coherenceScore - a.coherenceScore);
  }

  private async extractFeatures(result: SearchResult): Promise<number[]> {
    const text = `${result.title} ${result.description} ${result.url}`;
    return await this.getEmbedding(text);
  }

  private cluster(features: number[][], options: { maxGroups: number }) {
    // K-means clustering
    const k = Math.min(options.maxGroups, features.length);
    let centroids = this.initializeCentroids(features, k);

    let iterations = 0;
    let assignments: number[] = [];

    while (iterations < 100) {
      // Assign to nearest centroid
      const newAssignments = features.map(f =>
        this.nearestCentroid(f, centroids)
      );

      // Check convergence
      if (this.arraysEqual(assignments, newAssignments)) break;

      assignments = newAssignments;

      // Update centroids
      centroids = this.updateCentroids(features, assignments, k);

      iterations++;
    }

    // Convert to cluster objects
    return this.formatClusters(assignments, k);
  }

  private async determineTheme(results: SearchResult[]): Promise<string> {
    // Use AI to determine theme
    const titles = results.map(r => r.title).join('\n');

    const prompt = `
      Based on these search results, provide a concise theme (2-4 words):
      ${titles}

      Theme:
    `;

    const theme = await aiProvider.complete(prompt);
    return theme.trim();
  }

  private extractCommonKeywords(results: SearchResult[]): string[] {
    const allWords = results.flatMap(r =>
      this.tokenize(`${r.title} ${r.description}`)
    );

    const wordFreq = new Map<string, number>();
    allWords.forEach(w => {
      wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
    });

    return Array.from(wordFreq.entries())
      .filter(([word, freq]) => freq >= results.length * 0.5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private calculateCoherence(results: SearchResult[]): number {
    if (results.length < 2) return 1;

    let totalSimilarity = 0;
    let pairs = 0;

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const sim = this.similarity(results[i], results[j]);
        totalSimilarity += sim;
        pairs++;
      }
    }

    return totalSimilarity / pairs;
  }
}
```

### 3. Context Analyzer

```typescript
// src/services/search/context-analyzer.ts

interface SearchContext {
  intent: 'research' | 'learn' | 'buy' | 'navigate' | 'troubleshoot';
  depth: 'shallow' | 'medium' | 'deep';
  timeframe: 'recent' | 'anytime' | 'historical';
  audience: 'beginner' | 'intermediate' | 'expert';
  format: 'article' | 'video' | 'tutorial' | 'documentation' | 'discussion';
}

class ContextAnalyzer {
  analyzeQuery(query: string, userHistory?: SearchHistory): SearchContext {
    return {
      intent: this.detectIntent(query),
      depth: this.detectDepth(query),
      timeframe: this.detectTimeframe(query),
      audience: this.detectAudience(query, userHistory),
      format: this.detectFormat(query)
    };
  }

  private detectIntent(query: string): SearchContext['intent'] {
    const intentPatterns = {
      research: /how does|why|what is|explain|theory|research/i,
      learn: /learn|tutorial|guide|course|teach|beginner/i,
      buy: /buy|purchase|price|shop|deal|review/i,
      navigate: /official|login|website|homepage|app/i,
      troubleshoot: /fix|error|problem|issue|not working|debug/i
    };

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(query)) {
        return intent as SearchContext['intent'];
      }
    }

    return 'research'; // default
  }

  private detectDepth(query: string): SearchContext['depth'] {
    const words = query.split(' ').length;
    const technicalTerms = this.countTechnicalTerms(query);

    if (words < 3) return 'shallow';
    if (words > 8 || technicalTerms > 3) return 'deep';
    return 'medium';
  }

  private detectTimeframe(query: string): SearchContext['timeframe'] {
    const timePatterns = {
      recent: /recent|latest|new|2024|2025|current|today/i,
      historical: /history|old|classic|vintage|archive|before/i
    };

    if (timePatterns.recent.test(query)) return 'recent';
    if (timePatterns.historical.test(query)) return 'historical';
    return 'anytime';
  }

  private detectAudience(
    query: string,
    history?: SearchHistory
  ): SearchContext['audience'] {
    const beginnerKeywords = /beginner|simple|basic|intro|eli5|for dummies/i;
    const expertKeywords = /advanced|expert|professional|technical|in-depth/i;

    if (beginnerKeywords.test(query)) return 'beginner';
    if (expertKeywords.test(query)) return 'expert';

    // Analyze user history
    if (history) {
      const avgComplexity = history.getAverageComplexity();
      if (avgComplexity > 0.7) return 'expert';
      if (avgComplexity < 0.3) return 'beginner';
    }

    return 'intermediate';
  }

  private detectFormat(query: string): SearchContext['format'] {
    const formatPatterns = {
      video: /video|watch|tutorial video|youtube/i,
      tutorial: /tutorial|guide|how to|step by step/i,
      documentation: /docs|documentation|api|reference/i,
      discussion: /discussion|forum|reddit|stackoverflow/i,
      article: /article|blog|post|read/i
    };

    for (const [format, pattern] of Object.entries(formatPatterns)) {
      if (pattern.test(query)) {
        return format as SearchContext['format'];
      }
    }

    return 'article';
  }
}
```

### 4. Thematic Search Engine (Main)

```typescript
// src/services/search/thematic-engine.ts

interface ThematicSearchOptions {
  query: string;
  topics?: string[];        // Filter by topics
  minRelevance?: number;    // 0-1
  groupByTopic?: boolean;
  includeRelated?: boolean;
  maxResults?: number;
}

interface ThematicSearchResult {
  query: string;
  context: SearchContext;
  topics: DetectedTopic[];
  groups: SemanticGroup[];
  relatedQueries: string[];
  totalResults: number;
}

class ThematicSearchEngine {
  private topicDetector = new TopicDetector();
  private semanticGrouper = new SemanticGrouper();
  private contextAnalyzer = new ContextAnalyzer();

  async search(options: ThematicSearchOptions): Promise<ThematicSearchResult> {
    const {
      query,
      topics: filterTopics,
      minRelevance = 0.3,
      groupByTopic = true,
      includeRelated = true,
      maxResults = 50
    } = options;

    // 1. Analyze context
    const context = this.contextAnalyzer.analyzeQuery(query);

    // 2. Detect topics
    const topics = await this.topicDetector.detectTopics(query);

    // 3. Search across multiple engines
    const rawResults = await this.multiEngineSearch(query, context, topics);

    // 4. Filter by topics if specified
    let filteredResults = filterTopics
      ? this.filterByTopics(rawResults, filterTopics, topics)
      : rawResults;

    // 5. Filter by relevance
    filteredResults = filteredResults.filter(r => r.relevance >= minRelevance);

    // 6. Group semantically
    const groups = groupByTopic
      ? await this.semanticGrouper.groupResults(filteredResults)
      : [{ id: 'all', theme: 'All Results', results: filteredResults, coherenceScore: 1, keywords: [] }];

    // 7. Generate related queries
    const relatedQueries = includeRelated
      ? await this.generateRelatedQueries(query, topics)
      : [];

    return {
      query,
      context,
      topics,
      groups,
      relatedQueries,
      totalResults: filteredResults.length
    };
  }

  private async multiEngineSearch(
    query: string,
    context: SearchContext,
    topics: DetectedTopic[]
  ): Promise<SearchResult[]> {
    // Search across multiple sources
    const sources = [
      this.searchTavily(query),
      this.searchDuckDuckGo(query),
      this.searchWikipedia(query, topics),
      this.searchArxiv(query, topics),
      this.searchGitHub(query, topics),
      this.searchLocalBookmarks(query),
      this.searchLocalHistory(query)
    ];

    const results = await Promise.all(sources);
    const combined = results.flat();

    // Deduplicate
    return this.deduplicateResults(combined);
  }

  private filterByTopics(
    results: SearchResult[],
    filterTopics: string[],
    detectedTopics: DetectedTopic[]
  ): SearchResult[] {
    return results.filter(result => {
      const resultTopics = this.topicDetector.detectTopics(
        `${result.title} ${result.description}`
      );

      return resultTopics.some(t =>
        filterTopics.includes(t.topic.id)
      );
    });
  }

  private async generateRelatedQueries(
    query: string,
    topics: DetectedTopic[]
  ): Promise<string[]> {
    const prompt = `
      Original query: "${query}"
      Detected topics: ${topics.map(t => t.topic.name).join(', ')}

      Generate 5 related search queries that explore different aspects:
    `;

    const response = await aiProvider.complete(prompt);
    return response.split('\n').filter(Boolean);
  }
}
```

## UI Components

### Search Interface

```typescript
// src/components/ThematicSearch.tsx

function ThematicSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ThematicSearchResult | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const engine = new ThematicSearchEngine();

  const handleSearch = async () => {
    const searchResults = await engine.search({
      query,
      topics: selectedTopic ? [selectedTopic] : undefined,
      groupByTopic: true,
      includeRelated: true
    });

    setResults(searchResults);
  };

  return (
    <div className="thematic-search">
      {/* Search bar */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Thematic search..."
      />

      {results && (
        <>
          {/* Topics bar */}
          <div className="topics-bar">
            <span className="label">Topics:</span>
            {results.topics.map(t => (
              <button
                key={t.topic.id}
                onClick={() => setSelectedTopic(t.topic.id)}
                className={cn(
                  'topic-pill',
                  selectedTopic === t.topic.id && 'active'
                )}
              >
                {t.topic.name}
                <span className="confidence">{(t.confidence * 100).toFixed(0)}%</span>
              </button>
            ))}
          </div>

          {/* Context info */}
          <div className="context-info">
            <span>Intent: {results.context.intent}</span>
            <span>Depth: {results.context.depth}</span>
            <span>Format: {results.context.format}</span>
          </div>

          {/* Grouped results */}
          {results.groups.map(group => (
            <div key={group.id} className="result-group">
              <h3 className="group-theme">{group.theme}</h3>
              <div className="group-keywords">
                {group.keywords.map(kw => (
                  <span key={kw} className="keyword">{kw}</span>
                ))}
              </div>

              <div className="results">
                {group.results.map(result => (
                  <SearchResultCard key={result.url} result={result} />
                ))}
              </div>
            </div>
          ))}

          {/* Related queries */}
          {results.relatedQueries.length > 0 && (
            <div className="related-queries">
              <h4>Related searches:</h4>
              {results.relatedQueries.map(q => (
                <button
                  key={q}
                  onClick={() => setQuery(q) && handleSearch()}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

## Advanced Features

### Topic Graph Visualization

```typescript
// Show relationships between topics
function TopicGraph({ topics }: { topics: DetectedTopic[] }) {
  const nodes = topics.map(t => ({
    id: t.topic.id,
    label: t.topic.name,
    size: t.confidence * 100
  }));

  const edges = topics.flatMap(t =>
    t.topic.relatedTopics.map(rt => ({
      from: t.topic.id,
      to: rt
    }))
  );

  return <NetworkGraph nodes={nodes} edges={edges} />;
}
```

### Temporal Filtering

```typescript
// Filter by time period
function TemporalFilter({ onFilterChange }: Props) {
  return (
    <div className="temporal-filter">
      <button onClick={() => onFilterChange({ period: 'today' })}>
        Today
      </button>
      <button onClick={() => onFilterChange({ period: 'week' })}>
        This week
      </button>
      <button onClick={() => onFilterChange({ period: 'month' })}>
        This month
      </button>
      <button onClick={() => onFilterChange({ period: 'year' })}>
        This year
      </button>
      <button onClick={() => onFilterChange({ period: 'all' })}>
        All time
      </button>
    </div>
  );
}
```

## Performance Optimization

### Caching

```typescript
const topicCache = new Map<string, DetectedTopic[]>();
const resultCache = new Map<string, ThematicSearchResult>();

// Cache topic detection results
async function getCachedTopics(query: string): Promise<DetectedTopic[]> {
  if (topicCache.has(query)) {
    return topicCache.get(query)!;
  }

  const topics = await topicDetector.detectTopics(query);
  topicCache.set(query, topics);

  return topics;
}
```

### Incremental Loading

```typescript
// Load results incrementally
async function* searchIncremental(query: string) {
  const topics = await topicDetector.detectTopics(query);
  yield { topics, results: [] };

  const results = await multiEngineSearch(query);
  yield { topics, results: results.slice(0, 10) };

  const groups = await semanticGrouper.groupResults(results);
  yield { topics, results, groups };
}
```

## Integration with Other Systems

```typescript
// Hook into agent system for deep research
async function deepThematicResearch(topic: Topic) {
  const agent = new ResearchAgent();

  const research = await agent.investigate({
    topic: topic.name,
    depth: 'comprehensive',
    sources: ['academic', 'web', 'books'],
    duration: '1h'
  });

  return research;
}
```
