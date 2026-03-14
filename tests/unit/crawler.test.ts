/**
 * Unit tests for CrawlerService
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CrawlerService } from '../../ZENO_WEB_CORE_APP/src/active/services/crawler';

describe('CrawlerService', () => {
  let service: CrawlerService;
  
  beforeEach(() => {
    service = new CrawlerService();
  });

  const sampleHtml = `
    <html>
      <head>
        <title>Test Page</title>
        <meta name="description" content="A test page">
      </head>
      <body>
        <h1>Main Heading</h1>
        <h2>Sub Heading</h2>
        <a href="https://example.com/page1">Link 1</a>
        <a href="https://example.com/page2">Link 2</a>
        <img src="/image.png" alt="test">
        <p>Some page content here</p>
      </body>
    </html>
  `;

  describe('parseHTML', () => {
    it('extracts title', async () => {
      const result = await service.parseHTML(sampleHtml, 'https://example.com');
      expect(result.title).toBe('Test Page');
    });

    it('extracts description from meta', async () => {
      const result = await service.parseHTML(sampleHtml, 'https://example.com');
      expect(result.description).toBe('A test page');
    });

    it('extracts links', async () => {
      const result = await service.parseHTML(sampleHtml, 'https://example.com');
      expect(result.links).toContain('https://example.com/page1');
      expect(result.links).toContain('https://example.com/page2');
    });

    it('extracts headings', async () => {
      const result = await service.parseHTML(sampleHtml, 'https://example.com');
      expect(result.headings).toContain('Main Heading');
      expect(result.headings).toContain('Sub Heading');
    });
  });
});
