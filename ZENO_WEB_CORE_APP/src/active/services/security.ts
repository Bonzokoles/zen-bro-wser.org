/**
 * ZENO Browser Security Service
 * URL validation, content security, and threat detection
 */

const DANGEROUS_PROTOCOLS = ['javascript:', 'vbscript:', 'data:text/html', 'data:application'];
const BLOCKED_DOMAINS: string[] = [];
const ALLOWED_SANDBOX_PROTOCOLS = ['http:', 'https:'];

export interface SecurityCheckResult {
  safe: boolean;
  reason?: string;
  risk: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityService {
  checkUrl(url: string): SecurityCheckResult {
    if (!url) return { safe: false, reason: 'Empty URL', risk: 'medium' };
    
    for (const proto of DANGEROUS_PROTOCOLS) {
      if (url.toLowerCase().startsWith(proto)) {
        return { safe: false, reason: `Dangerous protocol: ${proto}`, risk: 'critical' };
      }
    }
    
    try {
      const parsed = new URL(url);
      if (!ALLOWED_SANDBOX_PROTOCOLS.includes(parsed.protocol)) {
        return { safe: false, reason: `Unsupported protocol: ${parsed.protocol}`, risk: 'high' };
      }
      if (BLOCKED_DOMAINS.some((d) => parsed.hostname.endsWith(d))) {
        return { safe: false, reason: 'Domain blocked by policy', risk: 'high' };
      }
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return { safe: true, reason: 'Local development URL', risk: 'low' };
      }
    } catch {
      return { safe: false, reason: 'Invalid URL format', risk: 'medium' };
    }
    
    return { safe: true, risk: 'none' };
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  sanitizeUrl(url: string): string {
    const check = this.checkUrl(url);
    if (!check.safe) throw new Error(`Unsafe URL: ${check.reason}`);
    return url;
  }

  generateCSPHeader(options: { allowInline?: boolean; allowEval?: boolean } = {}): string {
    const parts = ["default-src 'self'"];
    parts.push(`script-src 'self'${options.allowInline ? " 'unsafe-inline'" : ''}${options.allowEval ? " 'unsafe-eval'" : ''}`);
    parts.push("style-src 'self' 'unsafe-inline'");
    parts.push("img-src 'self' data: https:");
    parts.push("frame-ancestors 'none'");
    return parts.join('; ');
  }

  isContentAllowed(content: string, maxLength = 10_000_000): boolean {
    if (content.length > maxLength) return false;
    if (/<script[^>]*>[\s\S]*?<\/script>/gi.test(content)) return false;
    return true;
  }
}

export const securityService = new SecurityService();
