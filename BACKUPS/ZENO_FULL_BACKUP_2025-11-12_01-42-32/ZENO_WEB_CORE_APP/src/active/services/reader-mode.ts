// src/active/services/reader-mode.ts

export interface ReaderContent {
  title: string;
  author?: string;
  content: string; // This will be cleaned HTML or Markdown-like text
  publishedDate?: string;
  readingTime: number; // in minutes
}

export class ReaderMode {
  async extractArticle(url: string): Promise<ReaderContent> {
    try {
      // In a real scenario, you might use a server-side endpoint to bypass CORS
      const response = await fetch(url);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Remove elements that are definitely not content
      const selectorsToRemove = [
        'script', 'style', 'nav', 'header', 'footer',
        'aside', '.advertisement', '.social-share', '#comments', 'form'
      ];
      selectorsToRemove.forEach(sel => {
        doc.querySelectorAll(sel).forEach(el => el.remove());
      });

      const title = this.extractTitle(doc);
      const content = this.findMainContent(doc); // Simplified for now
      
      return {
        title,
        content: content.innerHTML, // Return innerHTML of the main content
        readingTime: this.calculateReadingTime(content.textContent || ''),
        author: this.extractAuthor(doc),
        publishedDate: this.extractDate(doc),
      };
    } catch (error) {
      console.error("Failed to extract article:", error);
      throw new Error("Could not fetch or parse the article content.");
    }
  }

  private findMainContent(doc: Document): HTMLElement {
    // Simple heuristic: find the element with the most <p> tags.
    // A more robust solution would use libraries like Mozilla's Readability.
    const allElements = Array.from(doc.body.querySelectorAll('div, article, main, section'));
    let bestElement = doc.body;
    let maxPCount = 0;

    for (const el of allElements) {
      const pCount = el.querySelectorAll('p').length;
      if (pCount > maxPCount && el.textContent && el.textContent.length > 200) {
        maxPCount = pCount;
        bestElement = el as HTMLElement;
      }
    }
    return bestElement;
  }

  private calculateReadingTime(textContent: string): number {
    const words = textContent.trim().split(/\s+/).length;
    const wpm = 225; // Average reading speed
    return Math.ceil(words / wpm);
  }

  private extractTitle(doc: Document): string {
    return (
      doc.querySelector('h1')?.textContent ||
      doc.querySelector('title')?.textContent ||
      'Untitled'
    ).trim();
  }

  private extractAuthor(doc: Document): string | undefined {
    const selectors = [
      'meta[name="author"]',
      '[rel="author"]',
      '.author',
      '.byline',
      '[itemprop="author"]'
    ];
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      if (el) {
        return (el.getAttribute('content') || el.textContent || '').trim();
      }
    }
  }

  private extractDate(doc: Document): string | undefined {
    const el = doc.querySelector('time[datetime]');
    return el?.getAttribute('datetime') || undefined;
  }
}
