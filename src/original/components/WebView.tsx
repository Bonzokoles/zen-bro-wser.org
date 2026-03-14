import React, { useState } from 'react';

interface WebViewProps {
	url: string;
	isLoading: boolean;
	title: string;
}

const WebView: React.FC<WebViewProps> = ({ url, isLoading, title }) => {
	console.log('WebView props:', { url, isLoading, title });
	const [iframeError, setIframeError] = useState(false);
	
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
	if (iframeError) {
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
					<div style={{fontSize: '48px', marginBottom: '20px'}}>🚫</div>
					<h3 style={{color: 'white', fontSize: '24px', marginBottom: '16px'}}>
						Cannot display this website
					</h3>
					<p style={{color: '#94a3b8', fontSize: '16px', marginBottom: '16px'}}>
						{url}
					</p>
					<p style={{color: '#64748b', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px'}}>
						This website cannot be displayed in an iframe due to security restrictions (X-Frame-Options). 
						Many sites like Google, Facebook, and banking sites block iframe embedding for security reasons.
					</p>
					<button
						onClick={() => window.open(url, '_blank')}
						style={{
							backgroundColor: '#3b82f6',
							color: 'white',
							padding: '12px 24px',
							borderRadius: '6px',
							border: 'none',
							fontSize: '14px',
							fontWeight: '500',
							cursor: 'pointer',
							marginRight: '12px'
						}}
					>
						Open in New Tab
					</button>
					<button
						onClick={() => setIframeError(false)}
						style={{
							backgroundColor: '#374151',
							color: 'white',
							padding: '12px 24px',
							borderRadius: '6px',
							border: 'none',
							fontSize: '14px',
							fontWeight: '500',
							cursor: 'pointer'
						}}
					>
						Try Again
					</button>
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