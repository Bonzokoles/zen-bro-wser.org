import React, { useState, useEffect, useRef } from 'react';
import WelcomePage from './WelcomePage';
import SearchPage from './SearchPage';
import LocalLibrarySearch from './LocalLibrarySearch';

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

		if (url === 'about:welcome' || url === 'about:blank' || url === 'about:search') {
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
			<div
				className="fixed left-0 w-full bg-slate-50 dark:bg-slate-900 z-50 flex items-center justify-center"
				style={{ top: `${topOffset}px`, height: `calc(100% - ${topOffset}px - 70px)` }}
			>
				<div className="text-center">
					<div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
					<p className="text-slate-400 dark:text-slate-600 text-sm mt-1">{url}</p>
				</div>
			</div>
		);
	}

	// TYLKO TEN JEDEN BLOK dla about:blank
	if (url === 'about:blank') {
		return (
			<div
				className="fixed left-0 w-full bg-slate-50 dark:bg-slate-900 z-50 flex items-center justify-center"
				style={{ top: `${topOffset}px`, height: `calc(100% - ${topOffset}px - 70px)` }}
			>
				<div className="text-center">
					<div className="text-6xl mb-4">📄</div>
					<p className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">New Tab</p>
					<p className="text-slate-500 dark:text-slate-400">
						Enter a URL or search term to get started
					</p>
				</div>
			</div>
		);
	}

	// Search page
	if (url === 'about:search') {
		return (
			<div
				className="fixed left-0 w-full bg-slate-50 dark:bg-slate-900 z-50"
				style={{ top: `${topOffset}px`, height: `calc(100% - ${topOffset}px - 70px)` }}
			>
				<SearchPage
					onSearch={(query) => {
						window.dispatchEvent(new CustomEvent('zeno-search', {
							detail: { query }
						}));
					}}
				/>
			</div>
		);
	}

	// Local Library Search page
	if (url.startsWith('about:local-search')) {
		const urlObj = new URL(url.replace('about:local-search', 'http://dummy'));
		const searchQuery = urlObj.searchParams.get('q') || '';

		return (
			<div
				className="fixed left-0 w-full bg-slate-900 z-50"
				style={{ top: `${topOffset}px`, height: `calc(100% - ${topOffset}px - 70px)` }}
			>
				<LocalLibrarySearch query={searchQuery} />
			</div>
		);
	}

	// TYLKO TEN JEDEN BLOK dla error handling
	if (iframeError || loadTimeout) {
		return (
			<div
				className="fixed left-0 w-full bg-slate-50 dark:bg-slate-900 z-50 flex items-center justify-center"
				style={{ top: `${topOffset}px`, height: `calc(100% - ${topOffset}px - 70px)` }}
			>
				<div className="max-w-lg p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-center">
					<div className="text-5xl mb-4">⚠️</div>
					<h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Cannot display this page</h3>
					<p className="text-slate-500 dark:text-slate-400 text-sm mb-6 break-all">{url}</p>

					<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6 text-left">
						<p className="text-sm text-blue-800 dark:text-blue-200">
							<strong>X-Frame-Options Protection</strong><br />
							This page cannot be displayed in an iframe due to security restrictions.
							Many sites (Google, Facebook, banks) block embedding to protect users.
						</p>
					</div>

					<div className="flex gap-3 justify-center mb-6">
						<button
							onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
							className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
						>
							🔗 Open in New Tab
						</button>
						<button
							onClick={() => {
								setIframeError(false);
								setLoadTimeout(false);
							}}
							className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors flex items-center gap-2"
						>
							↻ Try Again
						</button>
					</div>

					<p className="text-xs text-slate-400 dark:text-slate-500">
						💡 <strong>Tip:</strong> Sites without restrictions (e.g. example.com, httpbin.org, API docs)
						will work normally in the browser.
					</p>
				</div>
			</div>
		);
	}

	// TYLKO TEN JEDEN return dla iframe
	return (
		<div
			className="fixed left-0 w-full bg-white z-50 overflow-auto"
			style={{ top: `${topOffset}px`, height: `calc(100% - ${topOffset}px - 70px)` }}
		>
			{loadTimeout && !iframeError && (
				<div className="absolute top-0 left-0 right-0 bg-yellow-100 text-yellow-800 px-4 py-2 text-sm text-center border-b border-yellow-200">
					⏱️ Page is taking longer than usual to load...
				</div>
			)}
			<iframe
				ref={iframeRef}
				src={url}
				title={title}
				className="w-full h-full border-none"
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
