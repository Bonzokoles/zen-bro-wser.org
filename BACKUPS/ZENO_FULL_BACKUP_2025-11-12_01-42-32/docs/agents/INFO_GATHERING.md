# Information Gathering System - Zbieranie Informacji

## Koncepcja

Automatyczne zbieranie, katalogowanie i analiza informacji z różnych źródeł. System gromadzi dane, wykrywa wzorce i buduje bazę wiedzy.

## Architektura

```
src/services/gathering/
├── collector.ts              # Główny kolektor
├── sources/
│   ├── web-crawler.ts        # Przeglądanie stron
│   ├── rss-monitor.ts        # Monitoring RSS
│   ├── api-poller.ts         # Odpytywanie API
│   ├── file-watcher.ts       # Monitoring plików lokalnych
│   └── social-monitor.ts     # Monitor mediów społecznościowych
├── processors/
│   ├── content-extractor.ts  # Ekstrakcja treści
│   ├── metadata-parser.ts    # Parsowanie metadanych
│   ├── entity-recognizer.ts  # Rozpoznawanie encji
│   └── relationship-mapper.ts # Mapowanie relacji
├── storage/
│   ├── fact-database.ts      # Baza faktów
│   ├── timeline.ts           # Oś czasu
│   └── knowledge-graph.ts    # Graf wiedzy
└── analyzers/
    ├── trend-detector.ts     # Detekcja trendów
    ├── pattern-finder.ts     # Wykrywanie wzorców
    └── anomaly-detector.ts   # Detekcja anomalii
```

## Core Types

```typescript
// src/services/gathering/types.ts

interface GatheredInfo {
  id: string;
  source: InfoSource;
  type: InfoType;
  content: string;
  metadata: InfoMetadata;
  entities: Entity[];
  facts: Fact[];
  timestamp: Date;
  confidence: number;
}

interface InfoSource {
  type: 'web' | 'api' | 'rss' | 'file' | 'social' | 'manual';
  url?: string;
  name: string;
  credibility: number; // 0-1
}

type InfoType =
  | 'article'
  | 'news'
  | 'social_post'
  | 'academic_paper'
  | 'documentation'
  | 'discussion'
  | 'media'
  | 'data';

interface InfoMetadata {
  title: string;
  author?: string;
  publishedDate?: Date;
  language: string;
  tags: string[];
  categories: string[];
}

interface Entity {
  type: 'person' | 'organization' | 'location' | 'event' | 'concept' | 'product';
  name: string;
  mentions: number;
  confidence: number;
  aliases: string[];
  properties: Record<string, any>;
}

interface Fact {
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
  source: string;
  timestamp: Date;
}

interface GatheringConfig {
  sources: SourceConfig[];
  schedule: string; // cron
  filters: FilterConfig;
  processing: ProcessingConfig;
  storage: StorageConfig;
}
```

## Information Collector

```typescript
// src/services/gathering/collector.ts

class InformationCollector {
  private sources: Map<string, InfoSource> = new Map();
  private processors: ContentProcessor[] = [];
  private storage: KnowledgeStorage;
  private running = false;

  async start(config: GatheringConfig) {
    this.running = true;

    // Initialize sources
    for (const sourceConfig of config.sources) {
      await this.initializeSource(sourceConfig);
    }

    // Start collection loop
    this.collectLoop();
  }

  async stop() {
    this.running = false;
  }

  private async collectLoop() {
    while (this.running) {
      // Collect from all sources
      const results = await Promise.all(
        Array.from(this.sources.values()).map(source =>
          this.collectFromSource(source)
        )
      );

      const gathered = results.flat();

      // Process gathered information
      for (const info of gathered) {
        await this.processInformation(info);
      }

      // Wait before next cycle
      await this.sleep(60000); // 1 minute
    }
  }

  private async collectFromSource(source: InfoSource): Promise<GatheredInfo[]> {
    try {
      const collector = this.getCollector(source.type);
      const raw = await collector.collect(source);

      return raw.map(item => ({
        id: crypto.randomUUID(),
        source,
        type: this.detectType(item),
        content: item.content,
        metadata: item.metadata,
        entities: [],
        facts: [],
        timestamp: new Date(),
        confidence: source.credibility
      }));
    } catch (error) {
      console.error(`Error collecting from ${source.name}:`, error);
      return [];
    }
  }

  private async processInformation(info: GatheredInfo) {
    // Extract entities
    info.entities = await this.extractEntities(info.content);

    // Extract facts
    info.facts = await this.extractFacts(info.content, info.entities);

    // Detect relationships
    const relationships = await this.detectRelationships(info);

    // Store in knowledge base
    await this.storage.store(info);
    await this.storage.storeRelationships(relationships);

    // Emit event
    this.emit('info:gathered', info);
  }

  private async extractEntities(text: string): Promise<Entity[]> {
    const entities: Entity[] = [];

    // Use AI for entity extraction
    const response = await aiProvider.extractEntities(text, {
      types: ['person', 'organization', 'location', 'event', 'concept', 'product']
    });

    for (const entity of response) {
      entities.push({
        type: entity.type,
        name: entity.name,
        mentions: 1,
        confidence: entity.confidence,
        aliases: [],
        properties: entity.properties || {}
      });
    }

    return entities;
  }

  private async extractFacts(text: string, entities: Entity[]): Promise<Fact[]> {
    const facts: Fact[] = [];

    // Use AI for fact extraction
    const prompt = `
      Extract factual statements from this text.
      For each fact, provide: subject, predicate, object

      Text: ${text}

      Entities found: ${entities.map(e => e.name).join(', ')}

      Facts (JSON array):
    `;

    const response = await aiProvider.complete(prompt);
    const parsed = JSON.parse(response);

    for (const fact of parsed) {
      facts.push({
        subject: fact.subject,
        predicate: fact.predicate,
        object: fact.object,
        confidence: 0.8,
        source: text.slice(0, 100),
        timestamp: new Date()
      });
    }

    return facts;
  }

  private async detectRelationships(info: GatheredInfo): Promise<Relationship[]> {
    const relationships: Relationship[] = [];

    // Relationships between entities
    for (let i = 0; i < info.entities.length; i++) {
      for (let j = i + 1; j < info.entities.length; j++) {
        const e1 = info.entities[i];
        const e2 = info.entities[j];

        // Check if entities co-occur in facts
        const relatedFacts = info.facts.filter(f =>
          (f.subject === e1.name && f.object === e2.name) ||
          (f.subject === e2.name && f.object === e1.name)
        );

        if (relatedFacts.length > 0) {
          relationships.push({
            from: e1.name,
            to: e2.name,
            type: relatedFacts[0].predicate,
            weight: relatedFacts.length,
            confidence: Math.min(e1.confidence, e2.confidence)
          });
        }
      }
    }

    return relationships;
  }
}
```

## Source Collectors

### Web Crawler

```typescript
// src/services/gathering/sources/web-crawler.ts

class WebCrawler {
  private visited: Set<string> = new Set();
  private queue: string[] = [];
  private maxDepth = 3;
  private maxPages = 100;

  async crawl(startUrl: string, options?: CrawlOptions): Promise<CrawledPage[]> {
    this.queue = [startUrl];
    const pages: CrawledPage[] = [];

    while (this.queue.length > 0 && pages.length < this.maxPages) {
      const url = this.queue.shift()!;

      if (this.visited.has(url)) continue;
      this.visited.add(url);

      const page = await this.crawlPage(url);
      if (page) {
        pages.push(page);

        // Extract and queue links
        if (this.getDepth(url) < this.maxDepth) {
          const links = this.extractLinks(page.html);
          this.queue.push(...links);
        }
      }

      // Rate limiting
      await this.sleep(1000);
    }

    return pages;
  }

  private async crawlPage(url: string): Promise<CrawledPage | null> {
    try {
      const response = await fetch(url);
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      return {
        url,
        html,
        title: doc.querySelector('title')?.textContent || '',
        content: doc.body.textContent || '',
        metadata: this.extractMetadata(doc),
        links: this.extractLinks(html),
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error);
      return null;
    }
  }

  private extractMetadata(doc: Document): Record<string, string> {
    const metadata: Record<string, string> = {};

    // Meta tags
    const metaTags = doc.querySelectorAll('meta');
    metaTags.forEach(tag => {
      const name = tag.getAttribute('name') || tag.getAttribute('property');
      const content = tag.getAttribute('content');

      if (name && content) {
        metadata[name] = content;
      }
    });

    return metadata;
  }

  private extractLinks(html: string): string[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const links = Array.from(doc.querySelectorAll('a[href]'));

    return links
      .map(a => a.getAttribute('href')!)
      .filter(href => href.startsWith('http'));
  }
}
```

### RSS Monitor

```typescript
// src/services/gathering/sources/rss-monitor.ts

class RSSMonitor {
  private feeds: Map<string, RSSFeed> = new Map();
  private lastCheck: Map<string, Date> = new Map();

  async addFeed(url: string) {
    const feed = await this.parseFeed(url);
    this.feeds.set(url, feed);
    this.lastCheck.set(url, new Date());
  }

  async checkUpdates(): Promise<RSSItem[]> {
    const updates: RSSItem[] = [];

    for (const [url, feed] of this.feeds) {
      const items = await this.fetchNewItems(url);
      updates.push(...items);
      this.lastCheck.set(url, new Date());
    }

    return updates;
  }

  private async parseFeed(url: string): Promise<RSSFeed> {
    const response = await fetch(url);
    const xml = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    const channel = doc.querySelector('channel');

    return {
      url,
      title: channel?.querySelector('title')?.textContent || '',
      description: channel?.querySelector('description')?.textContent || '',
      link: channel?.querySelector('link')?.textContent || '',
      items: this.parseItems(doc)
    };
  }

  private parseItems(doc: Document): RSSItem[] {
    const items = doc.querySelectorAll('item');

    return Array.from(items).map(item => ({
      title: item.querySelector('title')?.textContent || '',
      link: item.querySelector('link')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
      pubDate: new Date(item.querySelector('pubDate')?.textContent || ''),
      guid: item.querySelector('guid')?.textContent || ''
    }));
  }

  private async fetchNewItems(url: string): Promise<RSSItem[]> {
    const feed = await this.parseFeed(url);
    const lastCheck = this.lastCheck.get(url) || new Date(0);

    return feed.items.filter(item => item.pubDate > lastCheck);
  }
}
```

### API Poller

```typescript
// src/services/gathering/sources/api-poller.ts

class APIPoller {
  private endpoints: Map<string, APIEndpoint> = new Map();

  async addEndpoint(config: APIEndpointConfig) {
    const endpoint: APIEndpoint = {
      ...config,
      lastPoll: null,
      lastData: null
    };

    this.endpoints.set(config.id, endpoint);
  }

  async poll(endpointId: string): Promise<any> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) throw new Error(`Endpoint ${endpointId} not found`);

    const response = await fetch(endpoint.url, {
      method: endpoint.method || 'GET',
      headers: endpoint.headers,
      body: endpoint.body
    });

    const data = await response.json();

    endpoint.lastPoll = new Date();
    endpoint.lastData = data;

    // Check for changes
    const hasChanges = this.detectChanges(endpoint.lastData, data);

    if (hasChanges) {
      this.emit('api:changes', { endpointId, data });
    }

    return data;
  }

  private detectChanges(oldData: any, newData: any): boolean {
    // Simple deep equality check
    return JSON.stringify(oldData) !== JSON.stringify(newData);
  }

  async pollAll(): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    for (const [id, endpoint] of this.endpoints) {
      try {
        const data = await this.poll(id);
        results.set(id, data);
      } catch (error) {
        console.error(`Error polling ${id}:`, error);
      }
    }

    return results;
  }
}
```

## Knowledge Storage

```typescript
// src/services/gathering/storage/knowledge-graph.ts

interface KnowledgeNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
  timestamp: Date;
}

interface KnowledgeEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  weight: number;
  properties: Record<string, any>;
}

class KnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private edges: Map<string, KnowledgeEdge> = new Map();
  private db: IDBDatabase;

  async addNode(node: KnowledgeNode) {
    this.nodes.set(node.id, node);
    await this.persistNode(node);
  }

  async addEdge(edge: KnowledgeEdge) {
    this.edges.set(edge.id, edge);
    await this.persistEdge(edge);
  }

  async query(pattern: GraphPattern): Promise<KnowledgeNode[]> {
    // Simple pattern matching
    // In production, use graph query language like Cypher

    const results: KnowledgeNode[] = [];

    for (const node of this.nodes.values()) {
      if (this.matchesPattern(node, pattern)) {
        results.push(node);
      }
    }

    return results;
  }

  async getNeighbors(nodeId: string, depth = 1): Promise<KnowledgeNode[]> {
    const neighbors = new Set<string>();
    const queue = [[nodeId, 0]];

    while (queue.length > 0) {
      const [currentId, currentDepth] = queue.shift()!;

      if (currentDepth >= depth) continue;

      // Find connected nodes
      for (const edge of this.edges.values()) {
        if (edge.from === currentId) {
          neighbors.add(edge.to);
          queue.push([edge.to, currentDepth + 1]);
        } else if (edge.to === currentId) {
          neighbors.add(edge.from);
          queue.push([edge.from, currentDepth + 1]);
        }
      }
    }

    return Array.from(neighbors)
      .map(id => this.nodes.get(id)!)
      .filter(Boolean);
  }

  async findPath(from: string, to: string): Promise<string[] | null> {
    // BFS to find shortest path
    const queue: string[][] = [[from]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];

      if (current === to) {
        return path;
      }

      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = await this.getNeighbors(current, 1);

      for (const neighbor of neighbors) {
        queue.push([...path, neighbor.id]);
      }
    }

    return null; // No path found
  }

  async exportGraph(): Promise<{ nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }> {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    };
  }

  async visualize(): Promise<string> {
    // Export to DOT format for Graphviz
    let dot = 'digraph Knowledge {\n';

    for (const node of this.nodes.values()) {
      dot += `  "${node.id}" [label="${node.label}"];\n`;
    }

    for (const edge of this.edges.values()) {
      dot += `  "${edge.from}" -> "${edge.to}" [label="${edge.type}"];\n`;
    }

    dot += '}';

    return dot;
  }
}
```

## Analyzers

### Trend Detector

```typescript
// src/services/gathering/analyzers/trend-detector.ts

interface Trend {
  topic: string;
  velocity: number;    // Rate of mentions over time
  momentum: number;    // Acceleration
  peak: Date;
  confidence: number;
  relatedTopics: string[];
}

class TrendDetector {
  async detectTrends(
    timeWindow: { start: Date; end: Date },
    minMentions = 5
  ): Promise<Trend[]> {
    // Get all gathered info in time window
    const info = await this.getInfoInWindow(timeWindow);

    // Extract topics and count mentions over time
    const topicTimeline = this.buildTopicTimeline(info);

    // Analyze each topic
    const trends: Trend[] = [];

    for (const [topic, timeline] of topicTimeline) {
      if (timeline.length < minMentions) continue;

      const velocity = this.calculateVelocity(timeline);
      const momentum = this.calculateMomentum(timeline);

      if (velocity > 0.1) { // Threshold for "trending"
        trends.push({
          topic,
          velocity,
          momentum,
          peak: this.findPeak(timeline),
          confidence: this.calculateConfidence(timeline),
          relatedTopics: await this.findRelatedTopics(topic)
        });
      }
    }

    return trends.sort((a, b) => b.velocity - a.velocity);
  }

  private buildTopicTimeline(info: GatheredInfo[]): Map<string, TimePoint[]> {
    const timeline = new Map<string, TimePoint[]>();

    for (const item of info) {
      for (const entity of item.entities) {
        if (!timeline.has(entity.name)) {
          timeline.set(entity.name, []);
        }

        timeline.get(entity.name)!.push({
          timestamp: item.timestamp,
          mentions: entity.mentions
        });
      }
    }

    return timeline;
  }

  private calculateVelocity(timeline: TimePoint[]): number {
    if (timeline.length < 2) return 0;

    // Sort by time
    timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Count mentions in first half vs second half
    const midpoint = Math.floor(timeline.length / 2);
    const firstHalf = timeline.slice(0, midpoint);
    const secondHalf = timeline.slice(midpoint);

    const firstCount = firstHalf.reduce((sum, t) => sum + t.mentions, 0);
    const secondCount = secondHalf.reduce((sum, t) => sum + t.mentions, 0);

    return (secondCount - firstCount) / firstCount;
  }

  private calculateMomentum(timeline: TimePoint[]): number {
    // Second derivative - acceleration
    if (timeline.length < 3) return 0;

    const velocities: number[] = [];

    for (let i = 1; i < timeline.length; i++) {
      const dt = timeline[i].timestamp.getTime() - timeline[i - 1].timestamp.getTime();
      const dm = timeline[i].mentions - timeline[i - 1].mentions;
      velocities.push(dm / dt);
    }

    // Average acceleration
    let totalAccel = 0;
    for (let i = 1; i < velocities.length; i++) {
      totalAccel += velocities[i] - velocities[i - 1];
    }

    return totalAccel / velocities.length;
  }

  private findPeak(timeline: TimePoint[]): Date {
    let maxMentions = 0;
    let peakTime = timeline[0].timestamp;

    for (const point of timeline) {
      if (point.mentions > maxMentions) {
        maxMentions = point.mentions;
        peakTime = point.timestamp;
      }
    }

    return peakTime;
  }

  private calculateConfidence(timeline: TimePoint[]): number {
    // Higher confidence for more data points and consistent trend
    const dataPoints = timeline.length;
    const consistency = this.measureConsistency(timeline);

    return Math.min((dataPoints / 100) * 0.5 + consistency * 0.5, 1);
  }

  private measureConsistency(timeline: TimePoint[]): number {
    // How consistently is the trend increasing?
    let increases = 0;

    for (let i = 1; i < timeline.length; i++) {
      if (timeline[i].mentions > timeline[i - 1].mentions) {
        increases++;
      }
    }

    return increases / (timeline.length - 1);
  }
}
```

## Integration

```typescript
// Start information gathering
const collector = new InformationCollector();

await collector.start({
  sources: [
    { type: 'rss', url: 'https://news.ycombinator.com/rss', name: 'HN' },
    { type: 'api', url: 'https://api.github.com/trending', name: 'GitHub' },
    { type: 'web', url: 'https://example.com', name: 'Example' }
  ],
  schedule: '*/15 * * * *', // Every 15 minutes
  filters: {
    languages: ['en'],
    minCredibility: 0.5
  },
  processing: {
    extractEntities: true,
    extractFacts: true,
    buildKnowledgeGraph: true
  },
  storage: {
    maxAge: 90 // days
  }
});

// Query knowledge
const graph = new KnowledgeGraph();
const results = await graph.query({
  type: 'person',
  properties: { occupation: 'programmer' }
});

// Detect trends
const detector = new TrendDetector();
const trends = await detector.detectTrends({
  start: new Date('2025-01-01'),
  end: new Date()
});
```

To jest kompleksowy system zbierania informacji. Teraz stworzę ostatni plik - detekcję anomalii.
