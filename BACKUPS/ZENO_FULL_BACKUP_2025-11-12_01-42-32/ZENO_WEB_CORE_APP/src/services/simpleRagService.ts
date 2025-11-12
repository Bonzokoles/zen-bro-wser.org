/**
 * Simple RAG Service - Knowledge Base Integration
 * Używa prostego keyword matching (bez embeddings)
 */

export interface KnowledgeChunk {
  file: string;
  content: string;
  relevance: number;
}

class SimpleRAGService {
  private knowledgeBase: Map<string, string> = new Map();
  private isReady = false;

  async init() {
    if (this.isReady) return;

    const docs = [
      '01_development_plan.md',
      '02_quick_improvements.md',
      '03_version_control.md',
      '04_deployment.md',
      '05_api_reference.md'
    ];

    try {
      for (const doc of docs) {
        const response = await fetch(`/knowledge-base/${doc}`);
        if (response.ok) {
          const content = await response.text();
          this.knowledgeBase.set(doc, content);
        }
      }
      this.isReady = true;
      console.log(`[RAG] Loaded ${this.knowledgeBase.size} documents`);
    } catch (error) {
      console.error('[RAG] Failed to load knowledge base:', error);
    }
  }

  search(query: string, maxResults: number = 2): KnowledgeChunk[] {
    if (!this.isReady) return [];

    const queryLower = query.toLowerCase();
    const results: KnowledgeChunk[] = [];

    this.knowledgeBase.forEach((content, file) => {
      const contentLower = content.toLowerCase();
      let score = 0;

      // Exact phrase match
      if (contentLower.includes(queryLower)) {
        score += 100;
      }

      // Keyword matching
      const keywords = queryLower.split(/\s+/).filter(w => w.length > 3);
      keywords.forEach(keyword => {
        const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
        score += matches * 5;
      });

      if (score > 0) {
        // Extract relevant section (500 chars around match)
        const index = contentLower.indexOf(queryLower);
        const start = Math.max(0, index - 250);
        const end = Math.min(content.length, index + queryLower.length + 250);
        const excerpt = content.substring(start, end);

        results.push({
          file,
          content: excerpt,
          relevance: score
        });
      }
    });

    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);
  }

  buildPrompt(userQuery: string): string {
    const chunks = this.search(userQuery, 2);

    if (chunks.length === 0) {
      return `User question: ${userQuery}

No specific documentation found. Use general knowledge to help the user.`;
    }

    const context = chunks
      .map(chunk => `[From ${chunk.file}]\n${chunk.content}`)
      .join('\n\n---\n\n');

    return `You are a helpful AI assistant for ZENO Browser.

Context from documentation:
${context}

---

User question: ${userQuery}

Instructions:
- Answer in Polish if question is in Polish
- Answer in English if question is in English
- Be concise and helpful
- If context doesn't have the answer, say so and provide general guidance
- Reference the documentation file when quoting`;
  }
}

// Singleton
let ragInstance: SimpleRAGService | null = null;

export function getRAG(): SimpleRAGService {
  if (!ragInstance) {
    ragInstance = new SimpleRAGService();
  }
  return ragInstance;
}
