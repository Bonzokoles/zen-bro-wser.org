/**
 * Unit tests for NetworkService
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NetworkService } from '../../ZENO_WEB_CORE_APP/src/active/services/network';

describe('NetworkService', () => {
  let service: NetworkService;

  beforeEach(() => {
    service = new NetworkService();
  });

  describe('parseUrl', () => {
    it('returns http URLs unchanged', () => {
      expect(service.parseUrl('http://example.com')).toBe('http://example.com');
    });

    it('returns https URLs unchanged', () => {
      expect(service.parseUrl('https://example.com')).toBe('https://example.com');
    });

    it('adds https to bare domains', () => {
      expect(service.parseUrl('example.com')).toBe('https://example.com');
    });

    it('converts search queries to Google searches', () => {
      expect(service.parseUrl('hello world')).toContain('google.com/search?q=');
    });
  });

  describe('fetch', () => {
    it('makes GET request by default', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        headers: { entries: () => [] },
        text: () => Promise.resolve('<html>test</html>'),
        url: 'https://example.com',
      });
      vi.stubGlobal('fetch', mockFetch);
      
      const result = await service.fetch({ url: 'https://example.com' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.status).toBe(200);
    });
  });
});
