/**
 * SandboxWebView - Modern sandbox-based web content viewer
 * Replaces basic iframes with secure, sandboxed content rendering
 * Supports both iframe sandbox mode and Proxy mode for cross-origin content
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';

export type SandboxMode = 'iframe' | 'proxy' | 'screenshot';

export interface SandboxPermissions {
  allowScripts: boolean;
  allowForms: boolean;
  allowPopups: boolean;
  allowSameOrigin: boolean;
  allowModals: boolean;
  allowDownloads: boolean;
}

export interface SandboxWebViewProps {
  url: string;
  mode?: SandboxMode;
  permissions?: Partial<SandboxPermissions>;
  onNavigate?: (url: string) => void;
  onLoad?: () => void;
  onError?: (error: string) => void;
  className?: string;
  title?: string;
  proxyUrl?: string;
}

const DEFAULT_PERMISSIONS: SandboxPermissions = {
  allowScripts: true,
  allowForms: true,
  allowPopups: false,
  allowSameOrigin: false,
  allowModals: false,
  allowDownloads: false,
};

function buildSandboxAttr(permissions: SandboxPermissions): string {
  const attrs: string[] = [];
  if (permissions.allowScripts) attrs.push('allow-scripts');
  if (permissions.allowForms) attrs.push('allow-forms');
  if (permissions.allowPopups) attrs.push('allow-popups');
  if (permissions.allowSameOrigin) attrs.push('allow-same-origin');
  if (permissions.allowModals) attrs.push('allow-modals');
  if (permissions.allowDownloads) attrs.push('allow-downloads');
  return attrs.join(' ');
}

const SandboxWebView: React.FC<SandboxWebViewProps> = ({
  url,
  mode = 'iframe',
  permissions: permissionsOverride,
  onNavigate,
  onLoad,
  onError,
  className = '',
  title = 'Web Content',
  proxyUrl = '/api/proxy',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUrl, setCurrentUrl] = useState(url);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const permissions = { ...DEFAULT_PERMISSIONS, ...permissionsOverride };

  useEffect(() => {
    setCurrentUrl(url);
    setIsLoading(true);
    setHasError(false);
  }, [url]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const { type, payload } = event.data || {};
      if (type === 'NAVIGATE') {
        const newUrl = payload?.url;
        if (newUrl) {
          setCurrentUrl(newUrl);
          onNavigate?.(newUrl);
        }
      }
      if (type === 'ERROR') {
        setHasError(true);
        setErrorMessage(payload?.message || 'Unknown error');
        onError?.(payload?.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate, onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    const msg = `Failed to load: ${currentUrl}`;
    setErrorMessage(msg);
    onError?.(msg);
  }, [currentUrl, onError]);

  const getEffectiveUrl = () => {
    if (mode === 'proxy') {
      return `${proxyUrl}?url=${encodeURIComponent(currentUrl)}`;
    }
    return currentUrl;
  };

  const sandboxAttr = buildSandboxAttr(permissions);

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-900 rounded-lg p-8 ${className}`}>
        <div className="text-5xl mb-4">🚫</div>
        <h3 className="text-white text-lg font-semibold mb-2">Cannot Display Page</h3>
        <p className="text-gray-400 text-sm text-center mb-4">{errorMessage}</p>
        <div className="text-xs text-gray-600 mb-4 break-all max-w-md">{currentUrl}</div>
        <div className="flex gap-3">
          <button
            onClick={() => { setHasError(false); setIsLoading(true); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500"
          >
            Retry
          </button>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600"
          >
            Open in New Tab
          </a>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          💡 Some pages block iframe embedding (X-Frame-Options). Try proxy mode or open externally.
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-950 rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">Loading sandbox...</span>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={getEffectiveUrl()}
        sandbox={sandboxAttr}
        onLoad={handleLoad}
        onError={handleError}
        title={title}
        allow="fullscreen"
        referrerPolicy="no-referrer"
        className="w-full h-full border-0"
        style={{ minHeight: '400px' }}
      />
      <div className="absolute bottom-2 right-2 flex gap-1">
        <span className="px-2 py-0.5 bg-gray-900/80 text-gray-500 text-xs rounded-full border border-gray-800">
          🔒 Sandboxed
        </span>
        {mode === 'proxy' && (
          <span className="px-2 py-0.5 bg-gray-900/80 text-indigo-400 text-xs rounded-full border border-indigo-900">
            🔀 Proxy
          </span>
        )}
      </div>
    </div>
  );
};

export default SandboxWebView;
