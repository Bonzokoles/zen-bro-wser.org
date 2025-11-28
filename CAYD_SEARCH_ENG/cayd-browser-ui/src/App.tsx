import React from 'react';

// Mocking Electron IPC for browser environment if not available
// Mocking Electron IPC for browser environment if not available
// const mockIpc = { ... };

declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { src?: string; allowpopups?: boolean; };
    }
  }
}

// Try to get electron API safely
// const electron = (window as any).electron || { ipcRenderer: mockIpc };

// BrowserHeader removed
// const BrowserHeader: React.FC<{...}> = ...

function App() {
  // const [url, setUrl] = useState('http://localhost:4378');
  // const [inputUrl, setInputUrl] = useState('http://localhost:4378');
  // const [isLoading, setIsLoading] = useState(false);
  const webviewRef = React.useRef<any>(null);

  // useEffect(() => {
  //   const webview = webviewRef.current;
  //   if (!webview) return;

  //   const handleDidStartLoading = () => setIsLoading(true);
  //   const handleDidStopLoading = () => setIsLoading(false);
  //   const handleDidNavigate = (e: any) => {
  //     setInputUrl(e.url);
  //     setUrl(e.url);
  //   };

  //   webview.addEventListener('did-start-loading', handleDidStartLoading);
  //   webview.addEventListener('did-stop-loading', handleDidStopLoading);
  //   webview.addEventListener('did-navigate', handleDidNavigate);
  //   webview.addEventListener('did-navigate-in-page', handleDidNavigate);

  //   return () => {
  //     webview.removeEventListener('did-start-loading', handleDidStartLoading);
  //     webview.removeEventListener('did-stop-loading', handleDidStopLoading);
  //     webview.removeEventListener('did-navigate', handleDidNavigate);
  //     webview.removeEventListener('did-navigate-in-page', handleDidNavigate);
  //   };
  // }, []);

  // const handleNavigate = () => {
  //   let targetUrl = inputUrl.trim();
  //   if (!targetUrl.startsWith('http')) {
  //     if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
  //       targetUrl = 'https://' + targetUrl;
  //     } else {
  //       targetUrl = 'https://www.google.com/search?q=' + encodeURIComponent(targetUrl);
  //     }
  //   }
  //   if (webviewRef.current) {
  //     webviewRef.current.loadURL(targetUrl);
  //   }
  // };

  // const handleReload = () => {
  //   if (webviewRef.current) webviewRef.current.reload();
  // };

  // const handleBack = () => {
  //   if (webviewRef.current && webviewRef.current.canGoBack()) webviewRef.current.goBack();
  // };

  // const handleForward = () => {
  //   if (webviewRef.current && webviewRef.current.canGoForward()) webviewRef.current.goForward();
  // };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header removed as requested */}
      {/* <BrowserHeader
        url={inputUrl}
        setUrl={setInputUrl}
        onNavigate={handleNavigate}
        onReload={handleReload}
        onBack={handleBack}
        onForward={handleForward}
        isLoading={isLoading}
      /> */}
      <div className="flex-1 relative bg-white">
        {/* Electron webview tag */}
        <webview
          ref={webviewRef}
          src="http://localhost:4378"
          className="w-full h-full border-none"
          allowpopups={true}
        />
      </div>
    </div>
  );
}

export default App;
