/**
 * Unit tests for SecurityService
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SecurityService } from '../../ZENO_WEB_CORE_APP/src/active/services/security';

describe('SecurityService', () => {
  let service: SecurityService;
  
  beforeEach(() => {
    service = new SecurityService();
  });

  describe('checkUrl', () => {
    it('allows valid https URLs', () => {
      const result = service.checkUrl('https://example.com');
      expect(result.safe).toBe(true);
      expect(result.risk).toBe('none');
    });

    it('blocks javascript: protocol', () => {
      const result = service.checkUrl('javascript:alert(1)');
      expect(result.safe).toBe(false);
      expect(result.risk).toBe('critical');
    });

    it('blocks data:text/html', () => {
      const result = service.checkUrl('data:text/html,<script>alert(1)</script>');
      expect(result.safe).toBe(false);
      expect(result.risk).toBe('critical');
    });

    it('blocks empty URLs', () => {
      const result = service.checkUrl('');
      expect(result.safe).toBe(false);
    });

    it('marks localhost as low risk', () => {
      const result = service.checkUrl('http://localhost:3000');
      expect(result.safe).toBe(true);
      expect(result.risk).toBe('low');
    });
  });

  describe('sanitizeInput', () => {
    it('escapes HTML entities', () => {
      const result = service.sanitizeInput('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });
});
