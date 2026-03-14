import axios from 'axios';

export interface SiteCheckResult {
  url: string;
  domainExtension: string;
  iframeAllowed: boolean;
  errorMessage?: string;
}

export interface CrawlerConfig {
  urlsToCheck: string[];
  timeout?: number;
  targetExtensions?: string[];
}

function getDomainExtension(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
  } catch {
    return '';
  }
}

async function checkIframeAllowed(url: string, timeout: number = 5000): Promise<{ allowed: boolean; message?: string }> {
  try {
    const res = await axios.head(url, { timeout });
    const xFrameOptions = res.headers['x-frame-options'];
    const csp = res.headers['content-security-policy'];

    if (xFrameOptions) {
      const val = xFrameOptions.toLowerCase();
      if (val.includes('deny')) {
        return { allowed: false, message: 'X-Frame-Options: DENY' };
      }
      if (val.includes('sameorigin')) {
        return { allowed: false, message: 'X-Frame-Options: SAMEORIGIN' };
      }
    }

    if (csp) {
      if (csp.includes("frame-ancestors 'none'")) {
        return { allowed: false, message: "CSP: frame-ancestors 'none'" };
      }
      if (csp.includes("frame-ancestors 'self'")) {
        return { allowed: false, message: "CSP: frame-ancestors 'self'" };
      }
    }

    return { allowed: true, message: 'No iframe blocking headers detected' };
  } catch (err: any) {
    return {
      allowed: false,
      message: `Error: ${err.message || 'Unknown error'}`
    };
  }
}

export async function crawlSites(config: CrawlerConfig): Promise<SiteCheckResult[]> {
  const {
    urlsToCheck,
    timeout = 5000,
    targetExtensions = ['.cc', '.oi']
  } = config;

  const results: SiteCheckResult[] = [];

  for (const url of urlsToCheck) {
    const domainExtension = getDomainExtension(url);

    // Filter by target extensions if specified
    if (targetExtensions.length > 0 && !targetExtensions.includes(domainExtension)) {
      console.log(`Skipped (not in target extensions): ${url}`);
      continue;
    }

    const { allowed, message } = await checkIframeAllowed(url, timeout);

    results.push({
      url,
      domainExtension,
      iframeAllowed: allowed,
      errorMessage: message
    });

    console.log(`Checked: ${url} | iframe: ${allowed} | ${message}`);
  }

  return results;
}

// Export for use in backend/API
export { getDomainExtension, checkIframeAllowed };
