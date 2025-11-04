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
	const [showMoreSites, setShowMoreSites] = useState(false);
	const [activeTab, setActiveTab] = useState<'popular' | 'niche'>('popular');
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
	
					backgroundColor: '#0f172a',
	
					overflow: 'auto',
	
					padding: '20px',
	
					height: '100%'
	
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
						borderRadius: '8px',
						textAlign: 'left'
					}}>
						<h3 style={{
							fontSize: '20px',
							fontWeight: 'bold',
							color: 'white',
							marginBottom: '16px'
						}}>
							🎯 Strony do przetestowania
						</h3>
						<p style={{
							color: '#94a3b8',
							marginBottom: '16px',
							fontSize: '14px'
						}}>
							⚠️ Google, Facebook, YouTube, Twitter blokują iframe (X-Frame-Options). 
							<br />Poniższe strony <strong>działają</strong> bez ograniczeń:
						</p>
						<div style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
							gap: '12px',
							marginTop: '16px'
						}}>
							{[
								{ name: '🌐 Example.com', url: 'https://example.com' },
								{ name: '🔧 HTTPBin API', url: 'https://httpbin.org' },
								{ name: '📰 Wikipedia', url: 'https://en.wikipedia.org' },
								{ name: '🎓 W3Schools', url: 'https://www.w3schools.com' },
								{ name: '⚡ JSFiddle', url: 'https://jsfiddle.net' },
								{ name: '🔍 DuckDuckGo', url: 'https://duckduckgo.com' }
							].map(site => (
								<button
									key={site.url}
									onClick={() => {
										const event = new CustomEvent('navigate', { detail: { url: site.url } });
										window.dispatchEvent(event);
									}}
									style={{
										backgroundColor: '#334155',
										color: 'white',
										padding: '12px',
										borderRadius: '6px',
										border: 'none',
										fontSize: '13px',
										cursor: 'pointer',
										textAlign: 'left',
										transition: 'all 0.2s'
									}}
									onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'}
									onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}
								>
									{site.name}
								</button>
							))}
						</div>
						<button
							onClick={() => setShowMoreSites(true)}
							style={{
								marginTop: '16px',
								width: '100%',
								background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
								color: 'white',
								padding: '14px',
								borderRadius: '8px',
								border: 'none',
								fontSize: '14px',
								fontWeight: '600',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '8px'
							}}
						>
							📋 Pełna lista sprawdzonych stron
						</button>
					</div>
					
					{showMoreSites && (
						<div style={{
							position: 'fixed',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							backgroundColor: 'rgba(0,0,0,0.95)',
							zIndex: 99999,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '20px',
							overflow: 'hidden'
						}} onClick={() => setShowMoreSites(false)}>
							<div style={{
								backgroundColor: '#1e293b',
								borderRadius: '16px',
								padding: '0',
								maxWidth: '1000px',
								width: '100%',
								maxHeight: '90vh',
								display: 'flex',
								flexDirection: 'column',
								position: 'relative',
								boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
							}} onClick={(e) => e.stopPropagation()}>
								{/* Header - fixed */}
								<div style={{
									padding: '24px 32px',
									borderBottom: '2px solid #334155',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center'
								}}>
									<h2 style={{
										color: 'white',
										margin: 0,
										fontSize: '24px',
										fontWeight: '700'
									}}>
										📋 Sprawdzone strony bez X-Frame-Options
									</h2>
									<button
										onClick={() => setShowMoreSites(false)}
										style={{
											backgroundColor: '#ef4444',
											color: 'white',
											border: 'none',
											borderRadius: '50%',
											width: '36px',
											height: '36px',
											cursor: 'pointer',
											fontSize: '20px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											transition: 'all 0.2s',
											fontWeight: 'bold'
										}}
										onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
										onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
									>
										✕
									</button>
								</div>
								
								{/* Advanced Search Button */}
								<div style={{
									padding: '16px 32px',
									borderBottom: '2px solid #334155',
									backgroundColor: '#0f172a'
								}}>
									<a
										href="/"
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											gap: '8px',
											backgroundColor: '#3b82f6',
											color: 'white',
											padding: '12px 24px',
											borderRadius: '8px',
											textDecoration: 'none',
											fontWeight: '600',
											fontSize: '14px',
											transition: 'all 0.2s',
											border: 'none'
										}}
										onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
										onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
									>
										🔍 Przejdź do wyszukiwarki
									</a>
									<p style={{
										color: '#94a3b8',
										fontSize: '13px',
										margin: '8px 0 0 0'
									}}>
										Szukaj, filtruj i sortuj strony z zaawansowanymi opcjami
									</p>
								</div>
								
								{/* Scrollable Content */}
								<div style={{
									flex: 1,
									overflowY: 'auto',
									overflowX: 'hidden',
									padding: '24px 32px'
								}}>
									{/* Tabs */}
									<div style={{
										display: 'flex',
										gap: '8px',
										marginBottom: '24px',
										borderBottom: '2px solid #334155',
										position: 'sticky',
										top: '-24px',
										backgroundColor: '#1e293b',
										zIndex: 10,
										paddingTop: '8px',
										marginTop: '-8px'
									}}>
										<button
											onClick={() => setActiveTab('popular')}
											style={{
												backgroundColor: activeTab === 'popular' ? '#3b82f6' : 'transparent',
												color: 'white',
												border: 'none',
												padding: '12px 24px',
												cursor: 'pointer',
												fontSize: '14px',
												fontWeight: '600',
												borderRadius: '8px 8px 0 0',
												transition: 'all 0.2s'
											}}
										>
											🔥 Popularne (38)
										</button>
										<button
											onClick={() => setActiveTab('niche')}
											style={{
												backgroundColor: activeTab === 'niche' ? '#3b82f6' : 'transparent',
												color: 'white',
												border: 'none',
												padding: '12px 24px',
												cursor: 'pointer',
												fontSize: '14px',
												fontWeight: '600',
												borderRadius: '8px 8px 0 0',
												transition: 'all 0.2s'
											}}
										>
											💎 Niszowe (30)
										</button>
									</div>
								
								<div style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
									gap: '12px'
								}}>
									{activeTab === 'popular' ? [
										{ cat: '🇵🇱 Polskie strony', sites: [
											{ name: 'Onet.pl', url: 'https://www.onet.pl' },
											{ name: 'Interia.pl', url: 'https://www.interia.pl' },
											{ name: 'Wp.pl', url: 'https://www.wp.pl' },
											{ name: 'Gazeta.pl', url: 'https://www.gazeta.pl' },
											{ name: 'Allegro.pl', url: 'https://allegro.pl' },
											{ name: 'OLX.pl', url: 'https://www.olx.pl' },
											{ name: 'Filmweb.pl', url: 'https://www.filmweb.pl' },
											{ name: 'Wykop.pl', url: 'https://www.wykop.pl' },
											{ name: 'TVP VOD', url: 'https://vod.tvp.pl' },
											{ name: 'Niebezpiecznik.pl', url: 'https://niebezpiecznik.pl' }
										]},
										{ cat: '⚡ Code Playgrounds', sites: [
											{ name: 'CodeSandbox', url: 'https://codesandbox.io' },
											{ name: 'StackBlitz', url: 'https://stackblitz.com' },
											{ name: 'JSFiddle', url: 'https://jsfiddle.net' },
											{ name: 'JSBin', url: 'https://jsbin.com' },
											{ name: 'Replit', url: 'https://replit.com' },
											{ name: 'RunKit Embed', url: 'https://runkit.com/embed' }
										]},
										{ cat: '🔧 API & Dev Tools', sites: [
											{ name: 'HTTPBin', url: 'https://httpbin.org' },
											{ name: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com' },
											{ name: 'Swagger Petstore', url: 'https://petstore.swagger.io' },
											{ name: 'GraphQL Playground', url: 'https://graphql.org/swapi-graphql' },
											{ name: 'APIs.guru Browser', url: 'https://apis.guru/browse-apis' },
											{ name: 'SQL Fiddle', url: 'http://sqlfiddle.com' }
										]},
										{ cat: '🎓 Edukacja & Docs', sites: [
											{ name: 'Wikipedia', url: 'https://en.wikipedia.org' },
											{ name: 'W3Schools Tryit', url: 'https://www.w3schools.com/html/tryit.asp' },
											{ name: 'Observable HQ', url: 'https://observablehq.com' },
											{ name: 'D3.js Gallery', url: 'https://observablehq.com/@d3/gallery' },
											{ name: 'Jupyter nbviewer', url: 'https://nbviewer.jupyter.org' },
											{ name: 'Scratch MIT', url: 'https://scratch.mit.edu' }
										]},
										{ cat: '🗺️ Mapy & Media', sites: [
											{ name: 'OpenStreetMap', url: 'https://www.openstreetmap.org/export/embed.html' },
											{ name: 'Google Maps Embed', url: 'https://www.google.com/maps/embed' },
											{ name: 'YouTube Embed', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
											{ name: 'Vimeo Player', url: 'https://player.vimeo.com/video/148751763' },
											{ name: 'Spotify Playlist', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M' }
										]},
										{ cat: '🌐 Testowe & Utilities', sites: [
											{ name: 'Example.com', url: 'https://example.com' },
											{ name: 'IframeTester', url: 'https://iframetester.com' },
											{ name: 'Webhook.site', url: 'https://webhook.site' },
											{ name: 'H5P Interactive', url: 'https://h5p.org' },
											{ name: 'DuckDuckGo', url: 'https://duckduckgo.com' }
										]}
									] : [
										{ cat: '🎨 Design & 3D', sites: [
											{ name: 'Glitch', url: 'https://glitch.com' },
											{ name: 'Draw.io Diagrams', url: 'https://app.diagrams.net' },
											{ name: 'Figma Embed', url: 'https://www.figma.com/embed' },
											{ name: 'Tinkercad 3D', url: 'https://www.tinkercad.com/embed' }
										]},
										{ cat: '📚 Edukacja & Kursy', sites: [
											{ name: 'Exercism', url: 'https://exercism.io' },
											{ name: 'The Odin Project', url: 'https://www.theodinproject.com' },
											{ name: 'FreeCodeCamp', url: 'https://freecodecamp.org' },
											{ name: 'Codewars', url: 'https://www.codewars.com' },
											{ name: 'Katacoda DevOps', url: 'https://www.katacoda.com' }
										]},
										{ cat: '⚡ Code Interpreters', sites: [
											{ name: 'JS Tutor Visualizer', url: 'http://pythontutor.com/javascript.html' },
											{ name: 'RunJS Playground', url: 'https://runjs.app' },
											{ name: 'Observable Plot', url: 'https://observablehq.com/@observablehq/plot' },
											{ name: 'Circuit Simulator', url: 'https://www.falstad.com/circuit' }
										]},
										{ cat: '🔧 Dev & Testing Tools', sites: [
											{ name: 'Can I Use', url: 'https://caniuse.com' },
											{ name: 'JSON Formatter', url: 'https://jsonformatter.curiousconcept.com' },
											{ name: 'Applitools Demo', url: 'https://applitools.com/demo' },
											{ name: 'Postman Docs', url: 'https://learning.postman.com/docs' },
											{ name: 'IP Info API', url: 'https://ipinfo.io/developers/embed' }
										]},
										{ cat: '📝 Productivity & Forms', sites: [
											{ name: 'Overleaf LaTeX', url: 'https://www.overleaf.com/docs' },
											{ name: 'Typeform', url: 'https://www.typeform.com/help/embed-form' },
											{ name: 'Calendly', url: 'https://calendly.com/embed' },
											{ name: 'Workflowy', url: 'https://workflowy.com/embed' },
											{ name: 'Glide Apps', url: 'https://www.glideapps.com/embed' }
										]},
										{ cat: '🌍 Widgets & Data', sites: [
											{ name: 'Air Visual', url: 'https://www.iqair.com/world-air-quality' },
											{ name: 'OpenWeatherMap', url: 'https://openweathermap.org/widgets' },
											{ name: 'DuckDuckGo Search', url: 'https://duckduckgo.com/search_box.html' },
											{ name: 'Scratch MIT', url: 'https://scratch.mit.edu/projects/embed' },
											{ name: 'Amazon Honeycode', url: 'https://www.honeycode.aws/embed' }
										]}
									].map(category => (
										<div key={category.cat} style={{
											backgroundColor: '#334155',
											padding: '16px',
											borderRadius: '8px'
										}}>
											<h3 style={{
												color: '#60a5fa',
												fontSize: '14px',
												fontWeight: 'bold',
												marginBottom: '12px'
											}}>
												{category.cat}
											</h3>
											{category.sites.map(site => (
												<button
													key={site.url}
													onClick={() => {
														const event = new CustomEvent('navigate', { detail: { url: site.url } });
														window.dispatchEvent(event);
														setShowMoreSites(false);
													}}
													style={{
														width: '100%',
														backgroundColor: '#475569',
														color: 'white',
														padding: '10px',
														borderRadius: '6px',
														border: 'none',
														fontSize: '12px',
														cursor: 'pointer',
														textAlign: 'left',
														marginBottom: '8px',
														transition: 'all 0.2s'
													}}
													onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
													onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#475569'}
												>
													{site.name}
												</button>
											))}
										</div>
									))}
								</div>
								<div style={{
									backgroundColor: '#0f172a',
									padding: '16px',
									borderRadius: '8px',
									marginTop: '24px',
									textAlign: 'center'
								}}>
									<p style={{
										color: '#94a3b8',
										fontSize: '13px',
										lineHeight: '1.6',
										margin: 0
									}}>
										💡 <strong style={{color: '#60a5fa'}}>Razem 68 stron!</strong> Popularne playgrounds, API tools, edukacja, design, widgets i więcej.
										<br />
										<span style={{fontSize: '11px', color: '#64748b'}}>Źródło: Perplexity AI + ręczna weryfikacja iframe policies</span>
									</p>
								</div>
								</div>
							</div>
						</div>
					)}
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