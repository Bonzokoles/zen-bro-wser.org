/**
 * Text Selection Service - zarządzanie zaznaczeniami tekstu
 * Funkcja 6: Formatowanie, tagi, notatki, multi-selection
 * 
 * TODO: Implementacja wymaga:
 * 1. Supabase table: text_selections
 * 2. localStorage dla offline mode
 * 3. IndexedDB dla dużych zaznaczoń
 */

import type {
  TextSelection,
  SelectionMetadata,
  ExportFormat,
  ExportOptions,
} from '../../types/iframe/core.types';

export class TextSelectionService {
  private selections: Map<string, TextSelection> = new Map();
  private storageKey = 'zeno-text-selections';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Capture selection from iframe
   */
  public captureSelection(
    iframe: HTMLIFrameElement,
    sourceName: string
  ): TextSelection | null {
    try {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return null;

      const selection = iframeWindow.getSelection();
      if (!selection || selection.rangeCount === 0) return null;

      const range = selection.getRangeAt(0);
      const text = selection.toString();

      if (!text.trim()) return null;

      const textSelection: TextSelection = {
        id: this.generateId(),
        text,
        sourceUrl: iframe.src,
        sourceName,
        timestamp: Date.now(),
        metadata: {
          characters: text.length,
          words: text.trim().split(/\s+/).length,
          lines: text.split('\n').length,
          language: this.detectLanguage(text),
          selectedRange: {
            startContainer: range.startContainer.nodeName,
            startOffset: range.startOffset,
            endContainer: range.endContainer.nodeName,
            endOffset: range.endOffset,
          },
        },
        notes: '',
        tags: [],
      };

      return textSelection;
    } catch (error) {
      console.error('[TextSelectionService] Failed to capture selection:', error);
      return null;
    }
  }

  /**
   * Save selection
   */
  public async saveSelection(selection: TextSelection): Promise<void> {
    this.selections.set(selection.id, selection);
    this.saveToStorage();

    // TODO: Save to Supabase
    // await supabase.from('text_selections').insert(selection);
  }

  /**
   * Get all selections
   */
  public getSelections(): TextSelection[] {
    return Array.from(this.selections.values());
  }

  /**
   * Get selections by source
   */
  public getSelectionsBySource(sourceUrl: string): TextSelection[] {
    return this.getSelections().filter((s) => s.sourceUrl === sourceUrl);
  }

  /**
   * Get selection by ID
   */
  public getSelection(id: string): TextSelection | null {
    return this.selections.get(id) || null;
  }

  /**
   * Delete selection
   */
  public async deleteSelection(id: string): Promise<boolean> {
    const deleted = this.selections.delete(id);
    if (deleted) {
      this.saveToStorage();
      // TODO: Delete from Supabase
      // await supabase.from('text_selections').delete().eq('id', id);
    }
    return deleted;
  }

  /**
   * Add note to selection
   */
  public async addNote(id: string, note: string): Promise<boolean> {
    const selection = this.selections.get(id);
    if (!selection) return false;

    selection.notes = note;
    this.selections.set(id, selection);
    this.saveToStorage();

    // TODO: Update Supabase
    // await supabase.from('text_selections').update({ notes: note }).eq('id', id);

    return true;
  }

  /**
   * Add tags to selection
   */
  public async addTags(id: string, tags: string[]): Promise<boolean> {
    const selection = this.selections.get(id);
    if (!selection) return false;

    selection.tags = [...new Set([...(selection.tags || []), ...tags])];
    this.selections.set(id, selection);
    this.saveToStorage();

    // TODO: Update Supabase
    // await supabase.from('text_selections').update({ tags }).eq('id', id);

    return true;
  }

  /**
   * Search selections
   */
  public search(query: string): TextSelection[] {
    const lowerQuery = query.toLowerCase();
    return this.getSelections().filter(
      (selection) =>
        selection.text.toLowerCase().includes(lowerQuery) ||
        selection.sourceName.toLowerCase().includes(lowerQuery) ||
        selection.notes?.toLowerCase().includes(lowerQuery) ||
        selection.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Export selection
   */
  public export(selection: TextSelection, options: ExportOptions): Blob {
    let content = '';
    let mimeType = 'text/plain';

    switch (options.format) {
      case 'md':
        content = this.exportToMarkdown(selection, options);
        mimeType = 'text/markdown';
        break;
      case 'txt':
        content = this.exportToText(selection, options);
        mimeType = 'text/plain';
        break;
      case 'json':
        content = this.exportToJSON(selection, options);
        mimeType = 'application/json';
        break;
      case 'html':
        content = this.exportToHTML(selection, options);
        mimeType = 'text/html';
        break;
      case 'pdf':
        // TODO: Implement PDF export with jsPDF
        throw new Error('PDF export not yet implemented');
      case 'docx':
        // TODO: Implement DOCX export with docx.js
        throw new Error('DOCX export not yet implemented');
      default:
        content = selection.text;
    }

    return new Blob([content], { type: mimeType });
  }

  /**
   * Export to Markdown
   */
  private exportToMarkdown(selection: TextSelection, options: ExportOptions): string {
    let md = '';

    if (options.includeMetadata) {
      md += `# ${selection.sourceName}\n\n`;
      md += `**Source:** ${selection.sourceUrl}\n`;
      if (options.includeTimestamp) {
        md += `**Date:** ${new Date(selection.timestamp).toLocaleString()}\n`;
      }
      md += `**Words:** ${selection.metadata.words} | **Characters:** ${selection.metadata.characters}\n\n`;

      if (selection.tags && selection.tags.length > 0) {
        md += `**Tags:** ${selection.tags.map((t) => `\`${t}\``).join(', ')}\n\n`;
      }

      if (selection.notes) {
        md += `> ${selection.notes}\n\n`;
      }

      md += `---\n\n`;
    }

    md += selection.text;

    return md;
  }

  /**
   * Export to plain text
   */
  private exportToText(selection: TextSelection, options: ExportOptions): string {
    let text = '';

    if (options.includeMetadata) {
      text += `${selection.sourceName}\n`;
      text += `Source: ${selection.sourceUrl}\n`;
      if (options.includeTimestamp) {
        text += `Date: ${new Date(selection.timestamp).toLocaleString()}\n`;
      }
      text += `\n---\n\n`;
    }

    text += selection.text;

    return text;
  }

  /**
   * Export to JSON
   */
  private exportToJSON(selection: TextSelection, options: ExportOptions): string {
    const data = {
      text: selection.text,
      ...(options.includeMetadata && {
        metadata: {
          source: selection.sourceName,
          url: selection.sourceUrl,
          timestamp: options.includeTimestamp
            ? new Date(selection.timestamp).toISOString()
            : undefined,
          stats: selection.metadata,
          tags: selection.tags,
          notes: selection.notes,
        },
      }),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export to HTML
   */
  private exportToHTML(selection: TextSelection, options: ExportOptions): string {
    let html = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n';
    html += `<title>${this.escapeHtml(selection.sourceName)}</title>\n`;
    html += '<style>\n';
    html += 'body { font-family: Arial, sans-serif; max-width: 800px; margin: 2rem auto; padding: 1rem; line-height: 1.6; }\n';
    html += '.metadata { background: #f0f0f0; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }\n';
    html += '.content { white-space: pre-wrap; }\n';
    html += '.tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }\n';
    html += '.tag { background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem; }\n';
    html += '</style>\n</head>\n<body>\n';

    if (options.includeMetadata) {
      html += '<div class="metadata">\n';
      html += `<h1>${this.escapeHtml(selection.sourceName)}</h1>\n`;
      html += `<p><strong>Source:</strong> <a href="${selection.sourceUrl}">${this.escapeHtml(selection.sourceUrl)}</a></p>\n`;
      if (options.includeTimestamp) {
        html += `<p><strong>Date:</strong> ${new Date(selection.timestamp).toLocaleString()}</p>\n`;
      }
      html += `<p><strong>Words:</strong> ${selection.metadata.words} | <strong>Characters:</strong> ${selection.metadata.characters}</p>\n`;

      if (selection.tags && selection.tags.length > 0) {
        html += '<div class="tags">\n';
        selection.tags.forEach((tag) => {
          html += `<span class="tag">${this.escapeHtml(tag)}</span>\n`;
        });
        html += '</div>\n';
      }

      if (selection.notes) {
        html += `<p><em>${this.escapeHtml(selection.notes)}</em></p>\n`;
      }

      html += '</div>\n';
    }

    html += `<div class="content">${this.escapeHtml(selection.text)}</div>\n`;
    html += '</body>\n</html>';

    return html;
  }

  /**
   * Detect text language (simple heuristic)
   */
  private detectLanguage(text: string): string {
    // TODO: Use more sophisticated language detection
    const englishPattern = /\b(the|is|are|and|or|but|in|on|at|to|for)\b/gi;
    const polishPattern = /\b(jest|są|i|lub|ale|w|na|do|dla)\b/gi;

    const englishMatches = text.match(englishPattern)?.length || 0;
    const polishMatches = text.match(polishPattern)?.length || 0;

    if (englishMatches > polishMatches) return 'en';
    if (polishMatches > englishMatches) return 'pl';

    return 'unknown';
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.selections.values());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('[TextSelectionService] Failed to save to storage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const selections: TextSelection[] = JSON.parse(data);
        selections.forEach((selection) => {
          this.selections.set(selection.id, selection);
        });
      }
    } catch (error) {
      console.error('[TextSelectionService] Failed to load from storage:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `sel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Escape HTML
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clear all selections
   */
  public clearAll(): void {
    this.selections.clear();
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    const selections = this.getSelections();
    return {
      total: selections.length,
      totalCharacters: selections.reduce((sum, s) => sum + s.metadata.characters, 0),
      totalWords: selections.reduce((sum, s) => sum + s.metadata.words, 0),
      sources: [...new Set(selections.map((s) => s.sourceUrl))].length,
      tags: [...new Set(selections.flatMap((s) => s.tags || []))],
    };
  }
}

// Singleton instance
export const textSelectionService = new TextSelectionService();
