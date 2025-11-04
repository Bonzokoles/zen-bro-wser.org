import React, { useState, useEffect, useRef } from 'react';

interface WebViewProps {
	url: string;
	isLoading: boolean;
	title: string;
}

const WebView: React.FC<WebViewProps> = ({ url, isLoading, title }) => {
	console.log('WebView props:', { url, isLoading, title });
	const [iframeError, setIframeError] = useState(false);
	const [loadTimeout, setLoadTimeout] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Reset error states when URL changes
	useEffect(() => {
		setIframeError(false);
		setLoadTimeout(false);

		// Don't set timeout for special URLs
		if (url.startsWith('about:')) {
			return;
		}

		// Set timeout to detect X-Frame-Options blocks
		timeoutRef.current = setTimeout(() => {
			// Check if iframe loaded successfully
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
	
	if (url === 'about:welcome') {
		return (
			<div style={{
				position: 'fixed',
				top: '60px',
				left: 0,
				width: '100%',
				height: 'calc(100% - 60px)',
				backgroundColor: '#0f172a',
				zIndex: 10,
				overflow: 'auto',
				padding: '20px'
			}}>
				<div style={{
					maxWidth: '800px',
					margin: '0 auto',
					textAlign: 'center',
					color: 'white'
				}}>
					<div style={{fontSize: '60px', marginBottom: '20px'}}>🚀</div>
					<h1 style={{
						fontSize: '48px', 
						fontWeight: 'bold', 
						color: 'white', 
						marginBottom: '16px'
					}}>
						ZENO Browser
					</h1>
					<p style={{
						fontSize: '24px', 
						color: '#94a3b8', 
						marginBottom: '12px'
					}}>
						Advanced Web Browser with MCP Integration
					</p>
					<p style={{
						fontSize: '18px', 
						color: '#64748b'
					}}>
						Powered by Astro + React + Model Context Protocol
					</p>
					
					<div style={{
						marginTop: '40px',
						backgroundColor: '#1e293b',
						padding: '24px',
						borderRadius: '8px'
					}}>
						<h3 style={{
							fontSize: '20px',
							fontWeight: 'bold',
							color: 'white',
							marginBottom: '16px'
						}}>
							Welcome to ZENO Browser!
						</h3>
						<p style={{
							color: '#94a3b8',
							marginBottom: '16px'
						}}>
							This is a modern web browser built with Astro and React.
						</p>
					</div>
				</div>
			</div>
		);
	}
	
	if (isLoading) {
		return (
			<div style={{
				position: 'fixed',
				top: '60px',
				left: 0,
				width: '100%',
				height: 'calc(100% - 60px)',
				backgroundColor: '#1e293b',
				zIndex: 10,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<div style={{textAlign: 'center'}}>
					<div style={{
						width: '64px',
						height: '64px',
						border: '4px solid #475569',
						borderTop: '4px solid #3b82f6',
						borderRadius: '50%',
						animation: 'spin 1s linear infinite',
						margin: '0 auto 16px'
					}}></div>
					<p style={{color: '#94a3b8', fontSize: '18px'}}>Loading...</p>
					<p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>{url}</p>
				</div>
			</div>
		);
	}
	
	if (url === 'about:blank') {
		return (
			<div style={{
				position: 'fixed',
				top: '60px',
				left: 0,
				width: '100%',
				height: 'calc(100% - 60px)',
				backgroundColor: '#1e293b',
				zIndex: 10,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<div style={{textAlign: 'center'}}>
					<div style={{fontSize: '60px', marginBottom: '16px'}}>📄</div>
					<p style={{color: '#94a3b8', fontSize: '18px'}}>New Tab</p>
					<p style={{color: '#64748b', fontSize: '14px', marginTop: '8px'}}>
						Enter a URL or search term to get started
					</p>
				</div>
			</div>
		);
	}
	
	// External URLs - Load real websites with error handling
	if (iframeError || loadTimeout) {
		return (
			<div style={{
				position: 'fixed',
				top: '60px',
				left: 0,
				width: '100%',
				height: 'calc(100% - 60px)',
				backgroundColor: '#1e293b',
				zIndex: 10,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<div style={{textAlign: 'center', maxWidth: '600px', padding: '20px'}}>
					<div style={{fontSize: '48px', marginBottom: '20px'}}>�</div>
					<h3 style={{color: 'white', fontSize: '24px', marginBottom: '16px'}}>
						Nie można wyświetlić tej strony
					</h3>
					<p style={{color: '#94a3b8', fontSize: '16px', marginBottom: '16px', wordBreak: 'break-all'}}>
						{url}
					</p>
					<div style={{
						backgroundColor: '#0f172a',
						padding: '16px',
						borderRadius: '8px',
						borderLeft: '4px solid #3b82f6',
						marginBottom: '24px',
						textAlign: 'left'
					}}>
						<p style={{color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: 0}}>
							<strong style={{color: '#60a5fa'}}>Zabezpieczenie X-Frame-Options</strong><br />
							Ta strona nie może być wyświetlona w iframe ze względów bezpieczeństwa. 
							Wiele serwisów (Google, Facebook, banki) blokuje osadzanie dla ochrony użytkowników.
						</p>
					</div>
					<div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
						<button
							onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
							style={{
								background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
								color: 'white',
								padding: '12px 24px',
								borderRadius: '8px',
								border: 'none',
								fontSize: '14px',
								fontWeight: '600',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '8px'
							}}
						>
							🔗 Otwórz w nowej karcie
						</button>
						<button
							onClick={() => {
								setIframeError(false);
								setLoadTimeout(false);
							}}
							style={{
								backgroundColor: '#374151',
								color: 'white',
								padding: '12px 24px',
								borderRadius: '8px',
								border: 'none',
								fontSize: '14px',
								fontWeight: '600',
								cursor: 'pointer'
							}}
						>
							↻ Spróbuj ponownie
						</button>
					</div>
					<p style={{color: '#64748b', fontSize: '12px', marginTop: '24px', lineHeight: '1.5'}}>
						💡 <strong>Wskazówka:</strong> Strony bez ograniczeń (np. example.com, httpbin.org, dokumentacje API) 
						będą działać normalnie w przeglądarce.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div style={{
			position: 'fixed',
			top: '60px',
			left: 0,
			width: '100%',
			height: 'calc(100% - 60px)',
			backgroundColor: 'white',
			zIndex: 10
		}}>
			<div style={{
				backgroundColor: '#f1f5f9',
				borderBottom: '1px solid #e2e8f0',
				padding: '12px 16px'
			}}>
				<div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between'}}>
					<div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
						<div style={{
							width: '12px',
							height: '12px',
							backgroundColor: iframeError ? '#ef4444' : '#10b981',
							borderRadius: '50%'
						}}></div>
						<span style={{fontSize: '13px', color: '#64748b'}}>
							{url}
						</span>
					</div>
					<button
						onClick={() => window.open(url, '_blank')}
						style={{
							backgroundColor: 'transparent',
							border: '1px solid #d1d5db',
							borderRadius: '4px',
							padding: '4px 8px',
							fontSize: '12px',
							color: '#64748b',
							cursor: 'pointer'
						}}
					>
						Open in New Tab
					</button>
				</div>
			</div>
			<iframe
				ref={iframeRef}
				src={url}
				style={{
					width: '100%',
					height: 'calc(100% - 49px)',
					border: 'none',
					backgroundColor: 'white'
				}}
				title={`Website: ${url}`}
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