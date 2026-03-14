import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import WelcomePage from './WelcomePage';
import FloatingWindow from './FloatingWindow';
import './RetroMotifs.css';

interface WebViewProps {
	url: string;
	isLoading: boolean;
	title: string;
	topOffset?: number;
	onNavigate?: (url: string) => void;
	onToggleAI?: () => void;
	onToggleSecurity?: () => void;
}

const WebView: React.FC<WebViewProps> = ({ url, isLoading, title, topOffset = 80, onNavigate, onToggleAI, onToggleSecurity }) => {
	console.log('WebView props:', { url, isLoading, title, topOffset });
	const [iframeError, setIframeError] = useState(false);
	const [loadTimeout, setLoadTimeout] = useState(false);
	const [activeMotifs, setActiveMotifs] = useState(['synthwave', 'matrix', 'cosmic']);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchMode, setSearchMode] = useState('intr');

	const handleSearch = () => {
		if (!searchQuery.trim()) return;
		let finalUrl = searchQuery.trim();
		if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
			if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
				finalUrl = 'https://' + finalUrl;
			} else {
				finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
			}
		}
		onNavigate?.(finalUrl);
	};
	
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
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				backgroundColor: 'transparent',
				zIndex: 5,
				display: 'flex',
				flexDirection: 'row',
			}}>
				{/* Sidebar (Left) */}
				<div style={{
					width: '60px',
					backgroundColor: 'rgba(0,0,0,0.4)',
					borderRight: 'var(--zeno-border)',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					paddingTop: '20px',
					gap: '16px'
				}}>
					<button className="zeno-btn" title="System Dashboard" onClick={() => onNavigate?.('https://zenbrowsers.org')} style={{ padding: '10px', fontSize: '1.2rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>🖥️</button>
					<button className="zeno-btn" title="AI Intelligence Panel" onClick={() => onToggleAI?.()} style={{ padding: '10px', fontSize: '1.2rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>🕸️</button>
					<button className="zeno-btn" title="Security Monitor" onClick={() => onToggleSecurity?.()} style={{ padding: '10px', fontSize: '1.2rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>🛡️</button>
					<button className="zeno-btn" title="Memory Vault" onClick={() => onNavigate?.('https://github.com/Bonzokoles/zen-bro-wser.org')} style={{ padding: '10px', fontSize: '1.2rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>💾</button>
				</div>

				{/* Main Startup View */}
				<div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10vh', position: 'relative' }}>
					
					{/* Central Search Bar */}
					<div style={{
						display: 'flex',
						background: 'rgba(0, 0, 0, 0.4)',
						padding: '12px 20px',
						borderRadius: 'var(--zeno-radius)',
						border: 'var(--zeno-border)',
						gap: '12px',
						alignItems: 'center',
						boxShadow: 'var(--zeno-shadow-deep)',
						marginBottom: '50px',
						backdropFilter: 'var(--zeno-backdrop-blur)'
					}}>
						<input 
							type="text" 
							className="zeno-input" 
							placeholder="Initialize Query Sequence..." 
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
						style={{ width: '400px', fontSize: '0.95rem', background: 'transparent', border: 'none', color: 'var(--zeno-text-main)', outline: 'none' }} 
					/>
						<select className="zeno-input" value={searchMode} onChange={(e) => setSearchMode(e.target.value)} style={{ cursor: 'pointer', background: 'transparent', color: 'var(--zeno-primary)', border: 'none', outline: 'none' }}>
							<option value="intr">inet</option>
							<option value="local">local</option>
							<option value="both">both</option>
						</select>
						<button onClick={handleSearch} style={{ background: 'var(--zeno-primary)', color: '#000', border: 'none', padding: '6px 16px', borderRadius: 'var(--zeno-radius)', cursor: 'pointer', fontWeight: 'bold' }}>Execute</button>
					</div>
					
					<p style={{ color: 'var(--zeno-text-muted)', marginBottom: '20px', letterSpacing: '2px', fontSize: '0.75rem', opacity: 0.6 }}>
						ACTIVE BACKGROUND MOTIFS ({activeMotifs.length}/3)
					</p>

					{/* Resizable Floating Motif Windows */}
					{activeMotifs.includes('synthwave') && (
						<FloatingWindow
							title="Synthwave Node"
							initialX={150} initialY={300}
							initialWidth={320} initialHeight={200}
							onClose={() => setActiveMotifs(prev => prev.filter(m => m !== 'synthwave'))}
						>
							<div className="motif motif-synthwave">
								<div className="synthwave-sun"></div>
							</div>
						</FloatingWindow>
					)}

					{activeMotifs.includes('matrix') && (
						<FloatingWindow
							title="Cyber Rain Sequence"
							initialX={500} initialY={300}
							initialWidth={320} initialHeight={200}
							onClose={() => setActiveMotifs(prev => prev.filter(m => m !== 'matrix'))}
						>
							<div className="motif motif-matrix">
								<div className="matrix-container" style={{ width: '100%', height: '100%', fontSize: '1.2rem', padding: '10px' }}>
									01 10 11 00 01 10 11 01 00 10 11 01 10 10 01 10<br/>
									10 01 10 11 00 01 11 00 10 01 11 00 01 11 00 01<br/>
									11 00 01 10 11 00 01 10 11 00 01 10 11 00 10 11<br/>
									00 10 11 00 01 10 11 00 01 10 11 00 01 01 11 00<br/>
									01 11 00 01 10 11 00 01 10 11 00 10 11 10 01 10<br/>
									10 01 10 11 00 01 11 00 10 01 11 00 01 11 00 01<br/>
									11 00 01 10 11 00 01 10 11 00 01 10 11 00 10 11<br/>
									00 10 11 00 01 10 11 00 01 10 11 00 01 01 11 00<br/>
									01 11 00 01 10 11 00 01 10 11 00 10 11 10 01 10
								</div>
							</div>
						</FloatingWindow>
					)}

					{activeMotifs.includes('cosmic') && (
						<FloatingWindow
							title="Cosmic Flight Engine"
							initialX={850} initialY={300}
							initialWidth={320} initialHeight={200}
							onClose={() => setActiveMotifs(prev => prev.filter(m => m !== 'cosmic'))}
						>
							<div className="motif motif-cosmic">
								<div className="cosmic-layer1"></div>
								<div className="cosmic-layer2"></div>
								<div className="cosmic-layer3"></div>
								<div className="cosmic-layer1" style={{ top: '100%' }}></div>
								<div className="cosmic-layer2" style={{ top: '100%' }}></div>
								<div className="cosmic-layer3" style={{ top: '100%' }}></div>
							</div>
						</FloatingWindow>
					)}
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
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			backgroundColor: 'transparent',
			overflow: 'hidden',
			zIndex: 5
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
				style={{ width: '100%', height: '100%', border: 'none' }}
			/>
		</div>
	);
};

export default WebView;
