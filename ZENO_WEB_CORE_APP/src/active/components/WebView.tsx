import React, { useState, useEffect, useRef } from 'react';
import WelcomePage from './WelcomePage';

interface WebViewProps {
	url: string;
	isLoading: boolean;
	title: string;
	topOffset?: number;
}

const WebView: React.FC<WebViewProps> = ({ url, isLoading, title, topOffset = 80 }) => {
	console.log('WebView props:', { url, isLoading, title, topOffset });
	const [iframeError, setIframeError] = useState(false);
	const [loadTimeout, setLoadTimeout] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		setIframeError(false);
		setLoadTimeout(false);

		if (url === 'about:welcome' || url === 'about:blank') {
			return;
		}

		// Set timeout to detect X-Frame-Options blocks
		timeoutRef.current = setTimeout(() => {
			try {
				const iframe = iframeRef.current;
				if (iframe && !iframe.contentWindow?.document?.body) {
					setLoadTimeout(true);
				}
			} catch (e) {
				// Cross-origin access error means iframe loaded but we can't access it
				// This is actually OK - the page loaded
			}
		}, 5000);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [url]);

	// TYLKO TEN JEDEN BLOK dla about:welcome
	if (url === 'about:welcome') {
		return <WelcomePage />;
	}

	// TYLKO TEN JEDEN BLOK dla isLoading
	if (isLoading) {
		return (
			<div style={{
				position: 'fixed',
				top: `${topOffset}px`,
				left: 0,
				width: '100%',
				height: `calc(100% - ${topOffset}px - 70px)`,
				backgroundColor: 'var(--bg-secondary)',
				zIndex: 50,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<div className="loading-content">
					<div className="spinner"></div>
					<p className="loading-text">Loading...</p>
					<p className="loading-url">{url}</p>
				</div>
			</div>
		);
	}

	// TYLKO TEN JEDEN BLOK dla about:blank
	if (url === 'about:blank') {
		return (
			<div style={{
				position: 'fixed',
				top: `${topOffset}px`,
				left: 0,
				width: '100%',
				height: `calc(100% - ${topOffset}px - 70px)`,
				backgroundColor: 'var(--bg-secondary)',
				zIndex: 50,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<div className="blank-content">
					<div className="blank-icon">📄</div>
					<p className="blank-title">New Tab</p>
					<p className="blank-subtitle">
						Enter a URL or search term to get started
					</p>
				</div>
			</div>
		);
	}

	// TYLKO TEN JEDEN BLOK dla error handling
	if (iframeError || loadTimeout) {
		return (
			<div style={{
				position: 'fixed',
				top: `${topOffset}px`,
				left: 0,
				width: '100%',
				height: `calc(100% - ${topOffset}px - 70px)`,
				backgroundColor: 'var(--bg-secondary)',
				zIndex: 50,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<div className="error-content">
					<div className="error-icon">⚠️</div>
					<h3 className="error-title">Nie można wyświetlić tej strony</h3>
					<p className="error-url">{url}</p>

					<div className="error-info-box">
						<p className="error-info-text">
							<strong>Zabezpieczenie X-Frame-Options</strong><br />
							Ta strona nie może być wyświetlona w iframe ze względów bezpieczeństwa.
							Wiele serwisów (Google, Facebook, banki) blokuje osadzanie dla ochrony użytkowników.
						</p>
					</div>

					<div className="error-actions">
						<button
							onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
							className="btn-primary"
						>
							🔗 Otwórz w nowej karcie
						</button>
						<button
							onClick={() => {
								setIframeError(false);
								setLoadTimeout(false);
							}}
							className="btn-secondary"
						>
							↻ Spróbuj ponownie
						</button>
					</div>

					<p className="error-hint">
						💡 <strong>Wskazówka:</strong> Strony bez ograniczeń (np. example.com, httpbin.org, dokumentacje API)
						będą działać normalnie w przeglądarce.
					</p>
				</div>
			</div>
		);
	}

	// TYLKO TEN JEDEN return dla iframe
	return (
		<div style={{
			position: 'fixed',
			top: `${topOffset}px`,
			left: 0,
			width: '100%',
			height: `calc(100% - ${topOffset}px - 70px)`,
			backgroundColor: 'white',
			overflow: 'auto',
			zIndex: 50
		}}>
			{loadTimeout && !iframeError && (
				<div className="timeout-banner">
					⏱️ Strona ładuje się dłużej niż zwykle...
				</div>
			)}
			<iframe
				ref={iframeRef}
				src={url}
				title={title}
				className="browser-iframe"
				onLoad={() => {
					console.log(`Loaded: ${url}`);
					setIframeError(false);
					setLoadTimeout(false);
					if (timeoutRef.current) {
						clearTimeout(timeoutRef.current);
					}
				}}
				onError={() => {
					console.log(`Error loading: ${url}`);
					setIframeError(true);
				}}
				sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
			/>
		</div>
	);
};

export default WebView;
