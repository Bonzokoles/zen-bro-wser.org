# Custom Search Paths - Własne Ścieżki Wyszukiwań

## Koncepcja

Użytkownik definiuje własne przepływy wyszukiwania - sekwencje kroków, filtrów, transformacji i agregacji wyników z wielu źródeł.

## Architektura

```
src/services/search/paths/
├── path-builder.ts           # Wizualny builder ścieżek
├── path-executor.ts          # Wykonywanie ścieżek
├── path-storage.ts           # Persystencja ścieżek
├── path-templates.ts         # Gotowe szablony
├── nodes/
│   ├── source-nodes.ts       # Węzły źródłowe (search, scrape, api)
│   ├── transform-nodes.ts    # Węzły transformacji
│   ├── filter-nodes.ts       # Węzły filtracji
│   ├── aggregate-nodes.ts    # Węzły agregacji
│   └── output-nodes.ts       # Węzły wyjściowe
└── conditions/
    └── conditional-logic.ts  # Logika warunkowa
```

## Core Types

```typescript
// src/services/search/paths/types.ts

interface SearchPath {
  id: string;
  name: string;
  description: string;
  nodes: PathNode[];
  edges: PathEdge[];
  variables: PathVariable[];
  schedule?: ScheduleConfig;
  tags: string[];
  created: Date;
  modified: Date;
  author: string;
  public: boolean;
}

interface PathNode {
  id: string;
  type: NodeType;
  config: NodeConfig;
  position: { x: number; y: number };
  label?: string;
}

type NodeType =
  // Sources
  | 'search_google'
  | 'search_duckduckgo'
  | 'search_marginalia'
  | 'search_academic'
  | 'scrape_url'
  | 'api_call'
  | 'database_query'
  | 'local_files'
  // Transforms
  | 'extract_text'
  | 'summarize'
  | 'translate'
  | 'categorize'
  | 'extract_entities'
  | 'sentiment_analysis'
  // Filters
  | 'filter_by_date'
  | 'filter_by_domain'
  | 'filter_by_keyword'
  | 'filter_by_score'
  | 'deduplicate'
  | 'remove_ads'
  // Aggregators
  | 'merge_results'
  | 'rank_results'
  | 'group_by_topic'
  | 'create_report'
  // Outputs
  | 'display_results'
  | 'save_to_file'
  | 'send_notification'
  | 'trigger_agent'
  | 'add_to_knowledge_base';

interface PathEdge {
  id: string;
  from: string;          // Node ID
  to: string;            // Node ID
  condition?: Condition; // Optional conditional edge
}

interface PathVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  defaultValue?: any;
  required: boolean;
}

interface Condition {
  type: 'if' | 'unless';
  expression: string;    // JavaScript expression
}

interface ScheduleConfig {
  enabled: boolean;
  cron: string;         // Cron expression
  timezone: string;
}
```

## Path Builder

```typescript
// src/services/search/paths/path-builder.ts

class SearchPathBuilder {
  private path: SearchPath;

  constructor(name: string) {
    this.path = {
      id: crypto.randomUUID(),
      name,
      description: '',
      nodes: [],
      edges: [],
      variables: [],
      tags: [],
      created: new Date(),
      modified: new Date(),
      author: 'user',
      public: false
    };
  }

  // Add nodes
  addSearchNode(
    engine: 'google' | 'duckduckgo' | 'marginalia' | 'academic',
    config: SearchNodeConfig
  ): PathNodeBuilder {
    const node: PathNode = {
      id: crypto.randomUUID(),
      type: `search_${engine}` as NodeType,
      config,
      position: { x: 0, y: 0 }
    };

    this.path.nodes.push(node);
    return new PathNodeBuilder(this, node.id);
  }

  addFilterNode(filterType: string, config: FilterConfig): PathNodeBuilder {
    const node: PathNode = {
      id: crypto.randomUUID(),
      type: `filter_${filterType}` as NodeType,
      config,
      position: { x: 0, y: 0 }
    };

    this.path.nodes.push(node);
    return new PathNodeBuilder(this, node.id);
  }

  addTransformNode(transformType: string, config: any): PathNodeBuilder {
    const node: PathNode = {
      id: crypto.randomUUID(),
      type: `${transformType}` as NodeType,
      config,
      position: { x: 0, y: 0 }
    };

    this.path.nodes.push(node);
    return new PathNodeBuilder(this, node.id);
  }

  // Connect nodes
  connect(fromId: string, toId: string, condition?: Condition): this {
    this.path.edges.push({
      id: crypto.randomUUID(),
      from: fromId,
      to: toId,
      condition
    });

    return this;
  }

  // Variables
  addVariable(variable: PathVariable): this {
    this.path.variables.push(variable);
    return this;
  }

  // Schedule
  setSchedule(config: ScheduleConfig): this {
    this.path.schedule = config;
    return this;
  }

  // Build final path
  build(): SearchPath {
    this.validate();
    return this.path;
  }

  private validate() {
    // Ensure path is valid DAG (Directed Acyclic Graph)
    if (this.hasCycles()) {
      throw new Error('Path contains cycles');
    }

    // Ensure all edges reference existing nodes
    for (const edge of this.path.edges) {
      const fromExists = this.path.nodes.some(n => n.id === edge.from);
      const toExists = this.path.nodes.some(n => n.id === edge.to);

      if (!fromExists || !toExists) {
        throw new Error('Edge references non-existent node');
      }
    }
  }

  private hasCycles(): boolean {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      stack.add(nodeId);

      const outgoingEdges = this.path.edges.filter(e => e.from === nodeId);

      for (const edge of outgoingEdges) {
        if (!visited.has(edge.to)) {
          if (dfs(edge.to)) return true;
        } else if (stack.has(edge.to)) {
          return true; // Cycle detected
        }
      }

      stack.delete(nodeId);
      return false;
    };

    // Check from all source nodes
    const sourceNodes = this.path.nodes.filter(n =>
      !this.path.edges.some(e => e.to === n.id)
    );

    for (const node of sourceNodes) {
      if (dfs(node.id)) return true;
    }

    return false;
  }
}

// Helper class for fluent API
class PathNodeBuilder {
  constructor(
    private builder: SearchPathBuilder,
    private nodeId: string
  ) {}

  then(nextNode: PathNodeBuilder, condition?: Condition): PathNodeBuilder {
    this.builder.connect(this.nodeId, nextNode.nodeId, condition);
    return nextNode;
  }

  build(): SearchPath {
    return this.builder.build();
  }
}
```

## Node Implementations

### Source Nodes

```typescript
// src/services/search/paths/nodes/source-nodes.ts

abstract class SourceNode {
  abstract execute(context: ExecutionContext): Promise<SearchResult[]>;
}

class SearchEngineNode extends SourceNode {
  constructor(
    private engine: string,
    private config: SearchNodeConfig
  ) {
    super();
  }

  async execute(context: ExecutionContext): Promise<SearchResult[]> {
    const query = this.resolveQuery(context);

    switch (this.engine) {
      case 'google':
        return await new GoogleSearch().search(query);
      case 'duckduckgo':
        return await new DuckDuckGoSearch().search(query);
      case 'marginalia':
        return await new MarginaliaSearch().search(query);
      case 'academic':
        return await new AcademicSearch().search(query);
      default:
        throw new Error(`Unknown engine: ${this.engine}`);
    }
  }

  private resolveQuery(context: ExecutionContext): string {
    // Replace variables in query template
    let query = this.config.query;

    for (const [key, value] of Object.entries(context.variables)) {
      query = query.replace(`{{${key}}}`, String(value));
    }

    return query;
  }
}

class ScraperNode extends SourceNode {
  constructor(private config: ScraperConfig) {
    super();
  }

  async execute(context: ExecutionContext): Promise<SearchResult[]> {
    const url = this.resolveUrl(context);

    const response = await fetch(url);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract based on CSS selectors
    const elements = doc.querySelectorAll(this.config.selector);

    return Array.from(elements).map(el => ({
      title: el.querySelector(this.config.titleSelector)?.textContent || '',
      description: el.querySelector(this.config.descSelector)?.textContent || '',
      url: el.querySelector('a')?.href || '',
      timestamp: new Date()
    }));
  }

  private resolveUrl(context: ExecutionContext): string {
    let url = this.config.url;

    for (const [key, value] of Object.entries(context.variables)) {
      url = url.replace(`{{${key}}}`, String(value));
    }

    return url;
  }
}

class APINode extends SourceNode {
  constructor(private config: APIConfig) {
    super();
  }

  async execute(context: ExecutionContext): Promise<SearchResult[]> {
    const url = this.buildUrl(context);

    const response = await fetch(url, {
      method: this.config.method || 'GET',
      headers: this.config.headers,
      body: this.config.body ? JSON.stringify(this.config.body) : undefined
    });

    const data = await response.json();

    // Transform API response to SearchResult format
    return this.transformResponse(data);
  }

  private buildUrl(context: ExecutionContext): string {
    let url = this.config.url;

    // Replace variables
    for (const [key, value] of Object.entries(context.variables)) {
      url = url.replace(`{{${key}}}`, String(value));
    }

    // Add query params
    if (this.config.params) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(this.config.params)) {
        params.append(key, String(value));
      }
      url += `?${params.toString()}`;
    }

    return url;
  }

  private transformResponse(data: any): SearchResult[] {
    // Use JSONPath or similar to extract results
    const results = this.extractFromPath(data, this.config.resultPath);

    return results.map((item: any) => ({
      title: this.extractFromPath(item, this.config.titlePath),
      description: this.extractFromPath(item, this.config.descPath),
      url: this.extractFromPath(item, this.config.urlPath),
      timestamp: new Date()
    }));
  }

  private extractFromPath(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return null;
      current = current[part];
    }

    return current;
  }
}
```

### Filter Nodes

```typescript
// src/services/search/paths/nodes/filter-nodes.ts

abstract class FilterNode {
  abstract execute(
    results: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]>;
}

class DateFilterNode extends FilterNode {
  constructor(private config: DateFilterConfig) {
    super();
  }

  async execute(
    results: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    const { from, to, relative } = this.config;

    let startDate: Date;
    let endDate: Date;

    if (relative) {
      // Relative dates like "last 7 days"
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - relative.days);
    } else {
      startDate = from ? new Date(from) : new Date(0);
      endDate = to ? new Date(to) : new Date();
    }

    return results.filter(r => {
      if (!r.timestamp) return true;
      const date = new Date(r.timestamp);
      return date >= startDate && date <= endDate;
    });
  }
}

class DomainFilterNode extends FilterNode {
  constructor(private config: DomainFilterConfig) {
    super();
  }

  async execute(
    results: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    const { include, exclude } = this.config;

    return results.filter(r => {
      const domain = new URL(r.url).hostname;

      if (exclude && exclude.some(d => domain.includes(d))) {
        return false;
      }

      if (include && include.length > 0) {
        return include.some(d => domain.includes(d));
      }

      return true;
    });
  }
}

class KeywordFilterNode extends FilterNode {
  constructor(private config: KeywordFilterConfig) {
    super();
  }

  async execute(
    results: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    const { keywords, mode, caseSensitive } = this.config;

    return results.filter(r => {
      const text = `${r.title} ${r.description}`.toLowerCase();

      if (mode === 'all') {
        return keywords.every(kw =>
          caseSensitive ? text.includes(kw) : text.includes(kw.toLowerCase())
        );
      } else if (mode === 'any') {
        return keywords.some(kw =>
          caseSensitive ? text.includes(kw) : text.includes(kw.toLowerCase())
        );
      } else { // 'none'
        return !keywords.some(kw =>
          caseSensitive ? text.includes(kw) : text.includes(kw.toLowerCase())
        );
      }
    });
  }
}

class ScoreFilterNode extends FilterNode {
  constructor(private config: ScoreFilterConfig) {
    super();
  }

  async execute(
    results: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    const { minScore, maxScore } = this.config;

    return results.filter(r => {
      if (!r.score) return true;
      if (minScore !== undefined && r.score < minScore) return false;
      if (maxScore !== undefined && r.score > maxScore) return false;
      return true;
    });
  }
}

class DeduplicateNode extends FilterNode {
  constructor(private config: DeduplicateConfig) {
    super();
  }

  async execute(
    results: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    const { by } = this.config; // 'url' | 'title' | 'content'

    const seen = new Set<string>();
    const deduped: SearchResult[] = [];

    for (const result of results) {
      const key = by === 'url' ? result.url :
                  by === 'title' ? result.title :
                  result.description;

      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(result);
      }
    }

    return deduped;
  }
}
```

### Transform Nodes

```typescript
// src/services/search/paths/nodes/transform-nodes.ts

class SummarizeNode {
  constructor(private config: SummarizeConfig) {}

  async execute(
    results: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    return await Promise.all(
      results.map(async r => {
        if (this.config.fields.includes('description')) {
          r.description = await aiProvider.summarize(r.description, {
            maxLength: this.config.maxLength || 200
          });
        }

        return r;
      })
    );
  }
}

class TranslateNode {
  constructor(private config: TranslateConfig) {}

  async execute(
    results: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    const { from, to, fields } = this.config;

    return await Promise.all(
      results.map(async r => {
        for (const field of fields) {
          if (r[field]) {
            r[field] = await aiProvider.translate(r[field], { from, to });
          }
        }

        return r;
      })
    );
  }
}

class CategorizeNode {
  constructor(private config: CategorizeConfig) {}

  async execute(
    results: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    const { categories } = this.config;

    return await Promise.all(
      results.map(async r => {
        const text = `${r.title} ${r.description}`;

        r.category = await aiProvider.categorize(text, {
          categories
        });

        return r;
      })
    );
  }
}

class ExtractEntitiesNode {
  constructor(private config: ExtractEntitiesConfig) {}

  async execute(
    results: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    return await Promise.all(
      results.map(async r => {
        const text = `${r.title} ${r.description}`;

        r.entities = await aiProvider.extractEntities(text, {
          types: this.config.entityTypes // ['person', 'organization', 'location', etc.]
        });

        return r;
      })
    );
  }
}

class SentimentNode {
  constructor(private config: SentimentConfig) {}

  async execute(
    results: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    return await Promise.all(
      results.map(async r => {
        const text = `${r.title} ${r.description}`;

        r.sentiment = await aiProvider.analyzeSentiment(text);

        return r;
      })
    );
  }
}
```

## Path Executor

```typescript
// src/services/search/paths/path-executor.ts

class SearchPathExecutor {
  async execute(
    path: SearchPath,
    variables: Record<string, any>
  ): Promise<ExecutionResult> {
    const context: ExecutionContext = {
      path,
      variables,
      results: new Map(),
      startTime: new Date()
    };

    // Topological sort for execution order
    const executionOrder = this.topologicalSort(path);

    for (const nodeId of executionOrder) {
      const node = path.nodes.find(n => n.id === nodeId)!;

      // Get inputs from previous nodes
      const inputs = this.getInputs(node, context, path);

      // Execute node
      const output = await this.executeNode(node, inputs, context);

      // Store result
      context.results.set(nodeId, output);
    }

    // Get final output node results
    const outputNodes = this.getOutputNodes(path);
    const finalResults = outputNodes.map(n => context.results.get(n.id)!).flat();

    return {
      results: finalResults,
      executionTime: Date.now() - context.startTime.getTime(),
      nodesExecuted: executionOrder.length
    };
  }

  private async executeNode(
    node: PathNode,
    inputs: SearchResult[],
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    const NodeClass = this.getNodeClass(node.type);
    const nodeInstance = new NodeClass(node.config);

    // Source nodes don't take inputs
    if (this.isSourceNode(node.type)) {
      return await nodeInstance.execute(context);
    }

    // Transform/Filter nodes take inputs
    return await nodeInstance.execute(inputs, context);
  }

  private getInputs(
    node: PathNode,
    context: ExecutionContext,
    path: SearchPath
  ): SearchResult[] {
    // Find all edges pointing to this node
    const incomingEdges = path.edges.filter(e => e.to === node.id);

    if (incomingEdges.length === 0) {
      return []; // Source node
    }

    // Merge results from all incoming edges
    const allInputs: SearchResult[] = [];

    for (const edge of incomingEdges) {
      // Check condition if present
      if (edge.condition && !this.evaluateCondition(edge.condition, context)) {
        continue;
      }

      const results = context.results.get(edge.from) || [];
      allInputs.push(...results);
    }

    return allInputs;
  }

  private evaluateCondition(
    condition: Condition,
    context: ExecutionContext
  ): boolean {
    // Safe eval of condition expression
    try {
      const func = new Function('context', `return ${condition.expression}`);
      const result = func(context);

      if (condition.type === 'unless') {
        return !result;
      }

      return result;
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  private topologicalSort(path: SearchPath): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (nodeId: string) => {
      if (temp.has(nodeId)) {
        throw new Error('Cycle detected in path');
      }

      if (visited.has(nodeId)) {
        return;
      }

      temp.add(nodeId);

      // Visit all dependencies first
      const incomingEdges = path.edges.filter(e => e.to === nodeId);
      for (const edge of incomingEdges) {
        visit(edge.from);
      }

      temp.delete(nodeId);
      visited.add(nodeId);
      sorted.push(nodeId);
    };

    for (const node of path.nodes) {
      visit(node.id);
    }

    return sorted;
  }

  private getOutputNodes(path: SearchPath): PathNode[] {
    // Nodes with no outgoing edges
    return path.nodes.filter(n =>
      !path.edges.some(e => e.from === n.id)
    );
  }

  private isSourceNode(type: NodeType): boolean {
    return type.startsWith('search_') ||
           type === 'scrape_url' ||
           type === 'api_call' ||
           type === 'database_query' ||
           type === 'local_files';
  }

  private getNodeClass(type: NodeType): any {
    // Map node types to classes
    const nodeMap: Record<string, any> = {
      'search_google': SearchEngineNode,
      'search_duckduckgo': SearchEngineNode,
      'search_marginalia': SearchEngineNode,
      'scrape_url': ScraperNode,
      'api_call': APINode,
      'filter_by_date': DateFilterNode,
      'filter_by_domain': DomainFilterNode,
      'filter_by_keyword': KeywordFilterNode,
      'deduplicate': DeduplicateNode,
      'summarize': SummarizeNode,
      'translate': TranslateNode,
      'categorize': CategorizeNode,
      'extract_entities': ExtractEntitiesNode,
      'sentiment_analysis': SentimentNode,
      // ... more mappings
    };

    return nodeMap[type];
  }
}
```

## Path Templates

```typescript
// src/services/search/paths/path-templates.ts

class SearchPathTemplates {
  // Template: Academic Research
  static academicResearch(): SearchPath {
    const builder = new SearchPathBuilder('Academic Research');

    const search1 = builder.addSearchNode('academic', {
      query: '{{topic}}'
    });

    const filter1 = builder.addFilterNode('by_date', {
      relative: { days: 365 } // Last year only
    });

    const filter2 = builder.addFilterNode('by_keyword', {
      keywords: ['peer-reviewed', 'study', 'research'],
      mode: 'any'
    });

    const summarize = builder.addTransformNode('summarize', {
      fields: ['description'],
      maxLength: 300
    });

    const categorize = builder.addTransformNode('categorize', {
      categories: ['methodology', 'results', 'review', 'meta-analysis']
    });

    search1
      .then(filter1)
      .then(filter2)
      .then(summarize)
      .then(categorize);

    builder.addVariable({
      name: 'topic',
      type: 'string',
      required: true
    });

    return builder.build();
  }

  // Template: News Aggregation
  static newsAggregation(): SearchPath {
    const builder = new SearchPathBuilder('News Aggregation');

    const rss1 = builder.addSearchNode('api_call', {
      url: 'https://news.ycombinator.com/rss'
    });

    const rss2 = builder.addSearchNode('api_call', {
      url: 'https://reddit.com/r/{{subreddit}}/.rss'
    });

    const merge = builder.addTransformNode('merge_results', {});

    const dedup = builder.addFilterNode('deduplicate', { by: 'title' });

    const filter = builder.addFilterNode('by_keyword', {
      keywords: ['{{topic}}'],
      mode: 'any',
      caseSensitive: false
    });

    const rank = builder.addTransformNode('rank_results', {
      by: 'timestamp',
      order: 'desc'
    });

    rss1.then(merge);
    rss2.then(merge);

    merge
      .then(dedup)
      .then(filter)
      .then(rank);

    builder.addVariable({ name: 'subreddit', type: 'string', required: true });
    builder.addVariable({ name: 'topic', type: 'string', required: true });

    return builder.build();
  }

  // Template: Deep Web Scraping
  static deepWebScraping(): SearchPath {
    const builder = new SearchPathBuilder('Deep Web Scraping');

    const scrape1 = builder.addSearchNode('scrape_url', {
      url: '{{start_url}}',
      selector: '.article',
      titleSelector: 'h2',
      descSelector: '.content',
      follow_links: true,
      max_depth: 3
    });

    const extract = builder.addTransformNode('extract_entities', {
      entityTypes: ['person', 'organization', 'location', 'date']
    });

    const filter = builder.addFilterNode('by_score', {
      minScore: 0.7
    });

    scrape1
      .then(extract)
      .then(filter);

    builder.addVariable({ name: 'start_url', type: 'string', required: true });

    return builder.build();
  }

  // Template: Multi-Engine Comparison
  static multiEngineComparison(): SearchPath {
    const builder = new SearchPathBuilder('Multi-Engine Comparison');

    const google = builder.addSearchNode('google', { query: '{{query}}' });
    const ddg = builder.addSearchNode('duckduckgo', { query: '{{query}}' });
    const marginalia = builder.addSearchNode('marginalia', { query: '{{query}}' });

    const merge = builder.addTransformNode('merge_results', {
      annotate_source: true
    });

    const dedup = builder.addFilterNode('deduplicate', { by: 'url' });

    const analyze = builder.addTransformNode('analyze_consensus', {
      min_sources: 2
    });

    google.then(merge);
    ddg.then(merge);
    marginalia.then(merge);

    merge
      .then(dedup)
      .then(analyze);

    builder.addVariable({ name: 'query', type: 'string', required: true });

    return builder.build();
  }
}
```

## Visual Path Editor UI

```typescript
// src/components/PathEditor.tsx

function PathEditor() {
  const [path, setPath] = useState<SearchPath | null>(null);
  const [selectedNode, setSelectedNode] = useState<PathNode | null>(null);

  return (
    <div className="path-editor">
      {/* Canvas */}
      <div className="canvas">
        <ReactFlow
          nodes={path?.nodes.map(n => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: { label: n.label || n.type, config: n.config }
          }))}
          edges={path?.edges.map(e => ({
            id: e.id,
            source: e.from,
            target: e.to,
            label: e.condition ? 'conditional' : undefined
          }))}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
      </div>

      {/* Node Palette */}
      <div className="node-palette">
        <h3>Add Nodes</h3>

        <div className="node-category">
          <h4>Sources</h4>
          <button onClick={() => addNode('search_google')}>Google Search</button>
          <button onClick={() => addNode('search_marginalia')}>Marginalia</button>
          <button onClick={() => addNode('scrape_url')}>Web Scraper</button>
          <button onClick={() => addNode('api_call')}>API Call</button>
        </div>

        <div className="node-category">
          <h4>Filters</h4>
          <button onClick={() => addNode('filter_by_date')}>Date Filter</button>
          <button onClick={() => addNode('filter_by_domain')}>Domain Filter</button>
          <button onClick={() => addNode('deduplicate')}>Deduplicate</button>
        </div>

        <div className="node-category">
          <h4>Transforms</h4>
          <button onClick={() => addNode('summarize')}>Summarize</button>
          <button onClick={() => addNode('translate')}>Translate</button>
          <button onClick={() => addNode('categorize')}>Categorize</button>
        </div>
      </div>

      {/* Node Config Panel */}
      {selectedNode && (
        <div className="config-panel">
          <h3>Configure: {selectedNode.type}</h3>
          <NodeConfigForm
            node={selectedNode}
            onChange={(config) => updateNodeConfig(selectedNode.id, config)}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={savePathClick}>Save</button>
        <button onClick={executePathClick}>Execute</button>
        <button onClick={loadTemplateClick}>Load Template</button>
      </div>
    </div>
  );
}
```

## Przykłady użycia

### 1. Prosty path

```typescript
const path = new SearchPathBuilder('Simple Search')
  .addSearchNode('google', { query: 'TypeScript tutorial' })
  .then(addFilterNode('by_date', { relative: { days: 30 } }))
  .then(addFilterNode('deduplicate', { by: 'url' }))
  .build();

const executor = new SearchPathExecutor();
const results = await executor.execute(path, {});
```

### 2. Złożony path z warunkami

```typescript
const path = new SearchPathBuilder('Conditional Search')
  .addSearchNode('google', { query: '{{query}}' })
  .then(
    addFilterNode('by_score', { minScore: 0.8 }),
    { type: 'if', expression: 'context.variables.quality === "high"' }
  )
  .then(
    addTransformNode('summarize', { maxLength: 200 }),
    { type: 'unless', expression: 'context.variables.verbose === true' }
  )
  .build();
```
