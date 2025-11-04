import React, { useState, useEffect, useMemo } from 'react';
import WebView from './WebView';
import ChatPanel from './ChatPanel';
import ProviderSettings from './ProviderSettings';
// import LocalChatbot from './LocalChatbot'; // Moved to NOT_IN_USE
import { mcpService } from '../services/mcpService';

export interface Tab {
	id: string;
	title: string;
	url: string;
	isActive: boolean;
	isLoading: boolean;
	favicon?: string;
}

export interface MCPTool {
	id: string;
	name: string;
	description: string;
	server: string;
	status: 'connected' | 'disconnected' | 'error';
}

interface Bookmark {
	id: string;
	title: string;
	url: string;
	favicon: string;
}

interface HistoryItem {
	id: string;
	url: string;
	title: string;
	visitedAt: Date;
	favicon: string;
}

type Theme = 'dark' | 'light';

const Browser: React.FC = () => {
	const [tabs, setTabs] = useState<Tab[]>([
		{
			id: '1',
			title: 'ZENO_WEB_CORE - Welcome',
			url: 'about:welcome',
			isActive: true,
			isLoading: false,
			favicon: '⚡'
		}
	]);

	const [currentUrl, setCurrentUrl] = useState('about:welcome');
	const [inputUrl, setInputUrl] = useState('about:welcome');
	const [mcpTools, setMcpTools] = useState<MCPTool[]>([]);
	const [isConsoleOpen, setIsConsoleOpen] = useState(false);
	const [showBookmarks, setShowBookmarks] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [showTools, setShowTools] = useState(false);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isLocalChatOpen, setIsLocalChatOpen] = useState(false);
	const [theme, setTheme] = useState<Theme>('dark');
	const [consoleOutput, setConsoleOutput] = useState<string[]>([
		'ZENO_WEB_CORE initialized successfully!',
		'Advanced MCP integration ready...',
		'Modern browser experience activated!',
		'⌨️ Keyboard shortcuts: Ctrl/Cmd + T (Tools), B (Bookmarks), H (History), K (Console), , (Settings)'
	]);

	const [bookmarks, setBookmarks] = useState<Bookmark[]>([
		{ id: '1', title: 'Example.com', url: 'https://example.com', favicon: '🌐' },
		{ id: '2', title: 'GitHub', url: 'https://github.com', favicon: '🐙' },
		{ id: '3', title: 'Stack Overflow', url: 'https://stackoverflow.com', favicon: '📚' },
		{ id: '4', title: 'Google', url: 'https://google.com', favicon: '🔍' }
	]);

	const [history, setHistory] = useState<HistoryItem[]>([]);

	// Listen for navigation events from WebView
	useEffect(() => {
		const handleNavigationEvent = (event: any) => {
			if (event.detail && event.detail.url) {
				handleNavigate(event.detail.url);
			}
		};

		window.addEventListener('navigate', handleNavigationEvent);
		return () => window.removeEventListener('navigate', handleNavigationEvent);
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			// Check if Ctrl/Cmd is pressed
			const isMod = e.ctrlKey || e.metaKey;

			if (!isMod) return;

			// Prevent default browser behavior for our shortcuts
			switch(e.key.toLowerCase()) {
				case 't':
					e.preventDefault();
					setShowTools(prev => !prev);
					addConsoleMessage('⌨️ Keyboard shortcut: Tools panel toggled');
					break;
				case 'b':
					e.preventDefault();
					setShowBookmarks(prev => !prev);
					addConsoleMessage('⌨️ Keyboard shortcut: Bookmarks panel toggled');
					break;
				case 'h':
					e.preventDefault();
					setShowHistory(prev => !prev);
					addConsoleMessage('⌨️ Keyboard shortcut: History panel toggled');
					break;
				case 'k':
					e.preventDefault();
					setIsConsoleOpen(prev => !prev);
					addConsoleMessage('⌨️ Keyboard shortcut: Console toggled');
					break;
				case ',':
					e.preventDefault();
					setIsSettingsOpen(true);
					addConsoleMessage('⌨️ Keyboard shortcut: Settings opened');
					break;
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, []);

	// Initialize MCP Service automatically
	useEffect(() => {
		const initMCP = async () => {
			// Check if already connected
			if (mcpService.isConnected()) {
				setMcpTools(mcpService.getTools());
				addConsoleMessage('✅ MCP Service already connected');
				return;
			}

			// Try to load from localStorage or .env
			const savedConfig = localStorage.getItem('mcp_config');
			if (savedConfig) {
				try {
					const config = JSON.parse(savedConfig);
					addConsoleMessage('🔄 Initializing MCP from saved config...');
					const success = await mcpService.initialize(config);
					if (success) {
						setMcpTools(mcpService.getTools());
						addConsoleMessage(`✅ MCP connected to ${config.provider}`);
					} else {
						addConsoleMessage('⚠️ MCP connection failed - check Settings');
					}
				} catch (error) {
					addConsoleMessage('⚠️ Failed to restore MCP session');
				}
			} else {
				// Try auto-init from .env
				const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
				console.log('🔍 Checking env variables:', {
					geminiKey: geminiKey ? `${geminiKey.substring(0, 10)}...` : 'NOT FOUND',
					allEnv: import.meta.env
				});
				
				if (geminiKey) {
					addConsoleMessage('🔄 Auto-initializing MCP with Gemini...');
					try {
						const success = await mcpService.initialize({
							provider: 'gemini',
							apiKey: geminiKey,
							model: 'gemini-1.5-pro'
						});
						if (success) {
							setMcpTools(mcpService.getTools());
							addConsoleMessage('✅ MCP auto-connected with Gemini');
							// Save config
							localStorage.setItem('mcp_config', JSON.stringify({
								provider: 'gemini',
								apiKey: geminiKey,
								model: 'gemini-1.5-pro'
							}));
						} else {
							addConsoleMessage('⚠️ Auto-connect failed - configure in Settings');
						}
					} catch (error: any) {
						addConsoleMessage(`⚠️ Auto-connect error: ${error?.message || 'Unknown error'}`);
						console.error('MCP init error:', error);
					}
				} else {
					addConsoleMessage('ℹ️ Please configure MCP in Settings');
				}
			}
		};

		initMCP();
	}, []);

	const activeTab = useMemo(() => tabs.find(tab => tab.isActive), [tabs]);

	const handleCreateTab = (url: string = 'about:blank') => {
		const newTab: Tab = {
			id: Date.now().toString(),
			title: url === 'about:blank' ? 'New Tab' : 'Loading...',
			url,
			isActive: true,
			isLoading: true
		};

		setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat(newTab));
		setCurrentUrl(url);
		addConsoleMessage(`New tab created: ${url}`);
	};

	const handleCloseTab = (tabId: string) => {
		const remainingTabs = tabs.filter(tab => tab.id !== tabId);
		
		if (remainingTabs.length === 0) {
			handleCreateTab();
			return;
		}

		const closedTab = tabs.find(tab => tab.id === tabId);
		if (closedTab?.isActive && remainingTabs.length > 0) {
			remainingTabs[0].isActive = true;
			setCurrentUrl(remainingTabs[0].url);
		}

		setTabs(remainingTabs);
		addConsoleMessage(`Tab closed: ${closedTab?.title || 'Unknown'}`);
	};

	const handleSwitchTab = (tabId: string) => {
		setTabs(prev => prev.map(tab => ({
			...tab,
			isActive: tab.id === tabId
		})));

		const tab = tabs.find(t => t.id === tabId);
		if (tab) {
			setCurrentUrl(tab.url);
			addConsoleMessage(`Switched to: ${tab.title}`);
		}
	};

	const addBookmark = () => {
		if (!activeTab) return;
		
		const existingBookmark = bookmarks.find(b => b.url === activeTab.url);
		if (existingBookmark) {
			addConsoleMessage('Page already bookmarked');
			return;
		}
		
		const newBookmark: Bookmark = {
			id: Date.now().toString(),
			title: activeTab.title,
			url: activeTab.url,
			favicon: activeTab.favicon || '🌐'
		};
		
		setBookmarks(prev => [...prev, newBookmark]);
		addConsoleMessage(`Bookmark added: ${newBookmark.title}`);
	};

	const openBookmark = (url: string) => {
		handleNavigate(url);
		setShowBookmarks(false);
		addConsoleMessage(`Opened bookmark: ${url}`);
	};

	const removeBookmark = (bookmarkId: string) => {
		const bookmark = bookmarks.find(b => b.id === bookmarkId);
		setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
		addConsoleMessage(`Bookmark removed: ${bookmark?.title || 'Unknown'}`);
	};

	const addToHistory = (url: string, title: string, favicon: string = '🌐') => {
		const historyItem: HistoryItem = {
			id: Date.now().toString(),
			url,
			title,
			visitedAt: new Date(),
			favicon
		};
		
		setHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 items
		addConsoleMessage(`Added to history: ${title}`);
	};

	const openFromHistory = (url: string) => {
		setInputUrl(url);
		handleNavigate(url);
		setShowHistory(false);
	};

	const clearHistory = () => {
		setHistory([]);
		addConsoleMessage('History cleared');
	};

	const performSearch = (query: string) => {
		// Trim whitespace
		query = query.trim();
		
		// Already a full URL with protocol
		if (query.startsWith('http://') || query.startsWith('https://')) {
			return query;
		}
		
		// Special URLs (localhost, about:, file:)
		if (query.startsWith('localhost') || query.startsWith('about:') || query.startsWith('file:')) {
			if (query.startsWith('localhost')) {
				return `http://${query}`;
			}
			return query;
		}
		
		// Check if it looks like a domain (has TLD and no spaces)
		const domainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
		if (domainPattern.test(query)) {
			return `https://${query}`;
		}
		
		// If it has a dot and no spaces, treat as URL
		if (query.includes('.') && !query.includes(' ')) {
			return `https://${query}`;
		}
		
		// Otherwise, it's a search query - use Tavily or Brave instead of Google
		// For now, open in new tab with Google (since Google blocks iframe anyway)
		const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
		window.open(searchUrl, '_blank');
		addConsoleMessage(`Search query opened in new tab: "${query}"`);
		return currentUrl; // Stay on current page
	};

	const toggleTheme = () => {
		const newTheme = theme === 'dark' ? 'light' : 'dark';
		setTheme(newTheme);
		addConsoleMessage(`Theme switched to: ${newTheme} mode`);
	};

	const colors = useMemo(() => {
		if (theme === 'light') {
			return {
				primary: '#ffffff',
				secondary: '#f8fafc',
				accent: '#e2e8f0',
				text: '#1e293b',
				muted: '#64748b',
				border: '#cbd5e1'
			};
		}
		return {
			primary: '#0f172a',
			secondary: '#1e293b',
			accent: '#334155',
			text: '#f1f5f9',
			muted: '#94a3b8',
			border: '#94a3b8'
		};
	}, [theme]);

	const getPageFavicon = (url: string): string => {
		if (url === 'about:welcome') return '⚡';
		if (url === 'about:blank') return '📄';
		if (url.includes('google.com')) return '🔍';
		if (url.includes('github.com')) return '🐙';
		if (url.includes('stackoverflow.com')) return '📚';
		if (url.includes('youtube.com')) return '📺';
		if (url.includes('twitter.com') || url.includes('x.com')) return '🐦';
		return '🌐';
	};

	const handleNavigate = (url: string) => {
		if (!activeTab) return;

		const finalUrl = performSearch(url);
		const pageTitle = getPageTitle(finalUrl);

		setCurrentUrl(finalUrl);
		setInputUrl(finalUrl);
		setTabs(prev => prev.map(tab => 
			tab.isActive 
				? { ...tab, url: finalUrl, isLoading: true, title: 'Loading...' }
				: tab
		));

		// Add to history
		addToHistory(finalUrl, pageTitle, getPageFavicon(finalUrl));

		// Simulate page load
		setTimeout(() => {
			setTabs(prev => prev.map(tab => 
				tab.isActive 
					? { ...tab, isLoading: false, title: pageTitle }
					: tab
			));
		}, 1000);

		addConsoleMessage(`Navigating to: ${finalUrl}`);
	};

	const handleUrlSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleNavigate(inputUrl);
	};

	const addConsoleMessage = (message: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setConsoleOutput(prev => [...prev, `[${timestamp}] ${message}`]);
	};

	const getPageTitle = (url: string): string => {
		if (url === 'about:welcome') return 'ZENO_WEB_CORE - Welcome';
		if (url === 'about:blank') return 'New Tab';
		
		try {
			const urlObj = new URL(url);
			return urlObj.hostname;
		} catch {
			return url;
		}
	};

	const handleMCPCommand = (command: string) => {
		addConsoleMessage(`MCP Command: ${command}`);
		// Here we would integrate with actual MCP tools
		// For now, simulate some responses
		setTimeout(() => {
			addConsoleMessage(`MCP Response: Command "${command}" executed successfully`);
		}, 500);
	};


	
	return (
		<div style={{position: 'relative', zIndex: 1, backgroundColor: colors.primary, minHeight: '100vh'}}>
			{/* Top Bar with Logo and Search */}
			<div style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				backgroundColor: colors.secondary,
				borderBottom: `1px solid ${colors.border}`,
				zIndex: 100,
				padding: '12px 20px',
				backdropFilter: 'blur(10px)',
				boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
			}}>
				<div style={{
					display: 'flex',
					alignItems: 'center',
					gap: '20px'
				}}>
					{/* Modern Logo */}
					<div style={{
						display: 'flex',
						alignItems: 'center',
						gap: '12px',
						fontWeight: 'bold',
						fontSize: '18px'
					}}>
						<div style={{
							width: '40px',
							height: '40px',
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							borderRadius: '12px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
							fontSize: '20px',
							boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
						}}>⚡</div>
						<span style={{color: colors.text}}>ZENO_WEB_CORE</span>
					</div>
					
					{/* Theme Toggle */}
					<button
						onClick={toggleTheme}
						style={{
							background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
							border: 'none',
							borderRadius: '10px',
							padding: '8px 16px',
							color: 'white',
							fontWeight: '600',
							cursor: 'pointer',
							transition: 'all 0.3s ease',
							boxShadow: '0 4px 15px rgba(255, 234, 167, 0.4)'
						}}
					>
						{theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? 'Light' : 'Dark'}
					</button>

					{/* Modern Search Bar */}
					<form onSubmit={handleUrlSubmit} style={{flex: 1, maxWidth: '600px'}}>
						<div style={{position: 'relative'}}>
							<input
								type="text"
								value={inputUrl}
								onChange={(e) => setInputUrl(e.target.value)}
								style={{
									width: '100%',
									backgroundColor: colors.primary,
									color: colors.text,
									border: `2px solid ${colors.border}`,
									borderRadius: '25px',
									padding: '14px 50px 14px 20px',
									fontSize: '16px',
									outline: 'none',
									transition: 'all 0.3s ease',
									boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
								}}
								placeholder="Search or enter URL..."
								onFocus={(e) => e.target.style.borderColor = '#667eea'}
								onBlur={(e) => e.target.style.borderColor = colors.border}
							/>
							<button
								type="submit"
								style={{
									position: 'absolute',
									right: '8px',
									top: '50%',
									transform: 'translateY(-50%)',
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
									border: 'none',
									borderRadius: '50%',
									width: '36px',
									height: '36px',
									color: 'white',
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transition: 'all 0.3s ease'
								}}
							>
								🔍
							</button>
						</div>
					</form>
				</div>
			</div>

			{/* Bookmarks Panel */}
			{showBookmarks && (
				<div style={{
					position: 'fixed',
					top: '80px',
					left: 0,
					right: 0,
					height: '240px',
					backgroundColor: colors.secondary,
					borderBottom: `1px solid ${colors.border}`,
					zIndex: 99,
					padding: '20px',
					overflowY: 'auto',
					backdropFilter: 'blur(10px)'
				}}>
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '20px'
					}}>
						<h3 style={{color: colors.text, fontSize: '20px', margin: 0, fontWeight: '600'}}>� Bookmarks</h3>
						<button
							onClick={() => setShowBookmarks(false)}
							style={{
								background: colors.accent,
								border: 'none',
								color: colors.muted,
								fontSize: '18px',
								cursor: 'pointer',
								borderRadius: '50%',
								width: '32px',
								height: '32px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							✕
						</button>
					</div>
					<div style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
						gap: '16px'
					}}>
						{bookmarks.map(bookmark => (
							<div
								key={bookmark.id}
								style={{
									backgroundColor: colors.primary,
									border: `1px solid ${colors.border}`,
									borderRadius: '12px',
									padding: '16px',
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
									transition: 'all 0.3s ease',
									boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = 'translateY(-2px)';
									e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = 'translateY(0)';
									e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
								}}
								onClick={() => openBookmark(bookmark.url)}
							>
								<div style={{
									fontSize: '24px',
									width: '40px',
									height: '40px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									background: colors.accent,
									borderRadius: '10px'
								}}>{bookmark.favicon}</div>
								<div style={{flex: 1, overflow: 'hidden'}}>
									<div style={{
										color: colors.text,
										fontSize: '15px',
										fontWeight: '600',
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										marginBottom: '4px'
									}}>
										{bookmark.title}
									</div>
									<div style={{
										color: colors.muted,
										fontSize: '13px',
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis'
									}}>
										{bookmark.url}
									</div>
								</div>
								<button
									onClick={(e) => {
										e.stopPropagation();
										removeBookmark(bookmark.id);
									}}
									style={{
										background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
										border: 'none',
										color: 'white',
										fontSize: '16px',
										cursor: 'pointer',
										borderRadius: '8px',
										width: '32px',
										height: '32px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										transition: 'all 0.3s ease'
									}}
								>
									🗑️
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* History Panel */}
			{showHistory && (
				<div style={{
					position: 'fixed',
					top: '80px',
					left: 0,
					right: 0,
					height: '300px',
					backgroundColor: colors.secondary,
					borderBottom: `1px solid ${colors.border}`,
					zIndex: 99,
					padding: '20px',
					overflowY: 'auto',
					backdropFilter: 'blur(10px)'
				}}>
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '20px'
					}}>
						<h3 style={{color: colors.text, fontSize: '20px', margin: 0, fontWeight: '600'}}>📈 History</h3>
						<div style={{display: 'flex', gap: '8px'}}>
							<button
								onClick={clearHistory}
								style={{
									background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
									border: 'none',
									color: 'white',
									fontSize: '12px',
									cursor: 'pointer',
									borderRadius: '6px',
									padding: '6px 12px'
								}}
							>
								Clear All
							</button>
							<button
								onClick={() => setShowHistory(false)}
								style={{
									background: colors.accent,
									border: 'none',
									color: colors.muted,
									fontSize: '18px',
									cursor: 'pointer',
									borderRadius: '50%',
									width: '32px',
									height: '32px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
								✕
							</button>
						</div>
					</div>
					<div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
						{history.length === 0 ? (
							<div style={{
								textAlign: 'center',
								color: colors.muted,
								padding: '40px',
								fontSize: '16px'
							}}>
								No history yet. Start browsing!
							</div>
						) : (
							history.map(item => (
								<div
									key={item.id}
									style={{
										backgroundColor: colors.primary,
										border: `1px solid ${colors.border}`,
										borderRadius: '8px',
										padding: '12px',
										cursor: 'pointer',
										display: 'flex',
										alignItems: 'center',
										gap: '12px',
										transition: 'all 0.3s ease'
									}}
									onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accent}
									onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
									onClick={() => openFromHistory(item.url)}
								>
									<span style={{fontSize: '20px'}}>{item.favicon}</span>
									<div style={{flex: 1, overflow: 'hidden'}}>
										<div style={{
											color: colors.text,
											fontSize: '14px',
											fontWeight: '500',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}>
											{item.title}
										</div>
										<div style={{
											color: colors.muted,
											fontSize: '12px',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}>
											{item.url}
										</div>
									</div>
									<div style={{
										color: colors.muted,
										fontSize: '11px',
										whiteSpace: 'nowrap'
									}}>
										{item.visitedAt.toLocaleTimeString()}
									</div>
								</div>
							))
						)}
					</div>
				</div>
			)}

			{/* Tools Panel */}
			{showTools && (
				<div style={{
					position: 'fixed',
					top: '80px',
					left: 0,
					right: 0,
					height: '400px',
					backgroundColor: colors.secondary,
					borderBottom: `1px solid ${colors.border}`,
					zIndex: 99,
					padding: '20px',
					overflowY: 'auto',
					backdropFilter: 'blur(10px)'
				}}>
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '20px'
					}}>
						<h3 style={{color: colors.text, fontSize: '20px', margin: 0, fontWeight: '600'}}>🛠️ Tools & Features</h3>
						<button
							onClick={() => setShowTools(false)}
							style={{
								background: colors.accent,
								border: 'none',
								color: colors.muted,
								fontSize: '18px',
								cursor: 'pointer',
								borderRadius: '50%',
								width: '32px',
								height: '32px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							✕
						</button>
					</div>
					<div style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
						gap: '16px'
					}}>
						{/* Iframe Tester */}
						<a
							href="/iframe-tester"
							style={{
								backgroundColor: colors.primary,
								border: `1px solid ${colors.border}`,
								borderRadius: '12px',
								padding: '20px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'flex-start',
								gap: '12px',
								transition: 'all 0.3s ease',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								textDecoration: 'none'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
							}}
						>
							<div style={{
								fontSize: '32px',
								width: '50px',
								height: '50px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
								borderRadius: '10px',
								flexShrink: 0
							}}>🧪</div>
							<div style={{flex: 1}}>
								<div style={{
									color: colors.text,
									fontSize: '16px',
									fontWeight: '700',
									marginBottom: '6px'
								}}>
									Iframe Tester
								</div>
								<div style={{
									color: colors.muted,
									fontSize: '13px',
									lineHeight: '1.4'
								}}>
									Test iframe compatibility, measure load times, and manage test sessions
								</div>
							</div>
						</a>

						{/* Agents Manager */}
						<a
							href="/agents"
							style={{
								backgroundColor: colors.primary,
								border: `1px solid ${colors.border}`,
								borderRadius: '12px',
								padding: '20px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'flex-start',
								gap: '12px',
								transition: 'all 0.3s ease',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								textDecoration: 'none'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
							}}
						>
							<div style={{
								fontSize: '32px',
								width: '50px',
								height: '50px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
								borderRadius: '10px',
								flexShrink: 0
							}}>🤖</div>
							<div style={{flex: 1}}>
								<div style={{
									color: colors.text,
									fontSize: '16px',
									fontWeight: '700',
									marginBottom: '6px'
								}}>
									Agents Manager
								</div>
								<div style={{
									color: colors.muted,
									fontSize: '13px',
									lineHeight: '1.4'
								}}>
									Manage and monitor AI agents including BIELIK, Gemini, and more
								</div>
							</div>
						</a>

						{/* Admin Panel */}
						<a
							href="/admin"
							style={{
								backgroundColor: colors.primary,
								border: `1px solid ${colors.border}`,
								borderRadius: '12px',
								padding: '20px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'flex-start',
								gap: '12px',
								transition: 'all 0.3s ease',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								textDecoration: 'none'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
							}}
						>
							<div style={{
								fontSize: '32px',
								width: '50px',
								height: '50px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
								borderRadius: '10px',
								flexShrink: 0
							}}>🛡️</div>
							<div style={{flex: 1}}>
								<div style={{
									color: colors.text,
									fontSize: '16px',
									fontWeight: '700',
									marginBottom: '6px'
								}}>
									Admin Panel
								</div>
								<div style={{
									color: colors.muted,
									fontSize: '13px',
									lineHeight: '1.4'
								}}>
									Manage sites, users, statistics, and system configuration
								</div>
							</div>
						</a>

						{/* Advanced Search */}
						<a
							href="/advanced-search"
							style={{
								backgroundColor: colors.primary,
								border: `1px solid ${colors.border}`,
								borderRadius: '12px',
								padding: '20px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'flex-start',
								gap: '12px',
								transition: 'all 0.3s ease',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								textDecoration: 'none'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
							}}
						>
							<div style={{
								fontSize: '32px',
								width: '50px',
								height: '50px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
								borderRadius: '10px',
								flexShrink: 0
							}}>🔍</div>
							<div style={{flex: 1}}>
								<div style={{
									color: colors.text,
									fontSize: '16px',
									fontWeight: '700',
									marginBottom: '6px'
								}}>
									Advanced Search
								</div>
								<div style={{
									color: colors.muted,
									fontSize: '13px',
									lineHeight: '1.4'
								}}>
									Full-featured search with filters, sorting, and pagination
								</div>
							</div>
						</a>

						{/* Search Demo */}
						<a
							href="/search-demo"
							style={{
								backgroundColor: colors.primary,
								border: `1px solid ${colors.border}`,
								borderRadius: '12px',
								padding: '20px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'flex-start',
								gap: '12px',
								transition: 'all 0.3s ease',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								textDecoration: 'none'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
							}}
						>
							<div style={{
								fontSize: '32px',
								width: '50px',
								height: '50px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
								borderRadius: '10px',
								flexShrink: 0
							}}>⚡</div>
							<div style={{flex: 1}}>
								<div style={{
									color: colors.text,
									fontSize: '16px',
									fontWeight: '700',
									marginBottom: '6px'
								}}>
									Search Demo
								</div>
								<div style={{
									color: colors.muted,
									fontSize: '13px',
									lineHeight: '1.4'
								}}>
									Quick search interface for iframe-testable sites
								</div>
							</div>
						</a>

						{/* Debug Console */}
						<a
							href="/debug"
							style={{
								backgroundColor: colors.primary,
								border: `1px solid ${colors.border}`,
								borderRadius: '12px',
								padding: '20px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'flex-start',
								gap: '12px',
								transition: 'all 0.3s ease',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								textDecoration: 'none'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
							}}
						>
							<div style={{
								fontSize: '32px',
								width: '50px',
								height: '50px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
								borderRadius: '10px',
								flexShrink: 0
							}}>🐛</div>
							<div style={{flex: 1}}>
								<div style={{
									color: colors.text,
									fontSize: '16px',
									fontWeight: '700',
									marginBottom: '6px'
								}}>
									Debug Console
								</div>
								<div style={{
									color: colors.muted,
									fontSize: '13px',
									lineHeight: '1.4'
								}}>
									Developer tools, logs, and system diagnostics
								</div>
							</div>
						</a>

						{/* About */}
						<a
							href="/about"
							style={{
								backgroundColor: colors.primary,
								border: `1px solid ${colors.border}`,
								borderRadius: '12px',
								padding: '20px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'flex-start',
								gap: '12px',
								transition: 'all 0.3s ease',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								textDecoration: 'none'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
							}}
						>
							<div style={{
								fontSize: '32px',
								width: '50px',
								height: '50px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
								borderRadius: '10px',
								flexShrink: 0
							}}>ℹ️</div>
							<div style={{flex: 1}}>
								<div style={{
									color: colors.text,
									fontSize: '16px',
									fontWeight: '700',
									marginBottom: '6px'
								}}>
									About
								</div>
								<div style={{
									color: colors.muted,
									fontSize: '13px',
									lineHeight: '1.4'
								}}>
									Learn about ZENO Web Core and its features
								</div>
							</div>
						</a>

						{/* Video Players Demo */}
						<a
							href="/video-demo"
							style={{
								backgroundColor: colors.primary,
								border: `1px solid ${colors.border}`,
								borderRadius: '12px',
								padding: '20px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'flex-start',
								gap: '12px',
								transition: 'all 0.3s ease',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								textDecoration: 'none'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
							}}
						>
							<div style={{
								fontSize: '32px',
								width: '50px',
								height: '50px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
								borderRadius: '10px',
								flexShrink: 0
							}}>🎬</div>
							<div style={{flex: 1}}>
								<div style={{
									color: colors.text,
									fontSize: '16px',
									fontWeight: '700',
									marginBottom: '6px'
								}}>
									Video Players
								</div>
								<div style={{
									color: colors.muted,
									fontSize: '13px',
									lineHeight: '1.4'
								}}>
									Internet Archive, YouTube & Elfsight integration
								</div>
							</div>
						</a>

						{/* Orchestrator */}
						<a
							href="/orchestrator"
							style={{
								backgroundColor: colors.primary,
								border: `1px solid ${colors.border}`,
								borderRadius: '12px',
								padding: '20px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'flex-start',
								gap: '12px',
								transition: 'all 0.3s ease',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								textDecoration: 'none'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
							}}
						>
							<div style={{
								fontSize: '32px',
								width: '50px',
								height: '50px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
								borderRadius: '10px',
								flexShrink: 0
							}}>🎭</div>
							<div style={{flex: 1}}>
								<div style={{
									color: colors.text,
									fontSize: '16px',
									fontWeight: '700',
									marginBottom: '6px'
								}}>
									Orchestrator + AI Assistant
								</div>
								<div style={{
									color: colors.muted,
									fontSize: '13px',
									lineHeight: '1.4'
								}}>
									AI-powered content classification & OpenAI chat
								</div>
							</div>
						</a>

						{/* Home */}
						<a
							href="/"
							style={{
								backgroundColor: colors.primary,
								border: `2px solid ${colors.border}`,
								borderRadius: '12px',
								padding: '20px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'flex-start',
								gap: '12px',
								transition: 'all 0.3s ease',
								boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
								textDecoration: 'none'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
							}}
						>
							<div style={{
								fontSize: '32px',
								width: '50px',
								height: '50px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
								borderRadius: '10px',
								flexShrink: 0
							}}>🏠</div>
							<div style={{flex: 1}}>
								<div style={{
									color: colors.text,
									fontSize: '16px',
									fontWeight: '700',
									marginBottom: '6px'
								}}>
									Home
								</div>
								<div style={{
									color: colors.muted,
									fontSize: '13px',
									lineHeight: '1.4'
								}}>
									Return to main browser interface
								</div>
							</div>
						</a>
					</div>
				</div>
			)}

			<div style={{
				marginTop: showBookmarks || showHistory || showTools ? (showTools ? '420px' : '260px') : '60px',
				marginBottom: '70px', // Space for bottom navigation
				minHeight: 'calc(100vh - 130px)' // Ensure proper height
			}}>
				<WebView
					url={currentUrl}
					isLoading={activeTab?.isLoading || false}
					title={activeTab?.title || ''}
				/>
				
				{isConsoleOpen && (
					<div style={{
						position: 'fixed',
						bottom: 0,
						left: 0,
						right: 0,
						height: '200px',
						backgroundColor: '#0f172a',
						borderTop: '1px solid #334155',
						zIndex: 101,
						color: 'white',
						padding: '16px',
						overflow: 'auto'
					}}>
						<h3>MCP Console</h3>
						<div style={{
							backgroundColor: '#1e293b',
							padding: '8px',
							borderRadius: '4px',
							fontFamily: 'monospace',
							fontSize: '12px',
							marginTop: '8px'
						}}>
							{consoleOutput.map((line, i) => (
								<div key={i}>{line}</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Bottom Navigation Bar */}
			<div style={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				height: '70px',
				background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
				backdropFilter: 'blur(20px)',
				borderTop: `1px solid ${colors.border}`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-around',
				padding: '0 20px',
				zIndex: 1000,
				boxShadow: `0 -4px 20px ${colors.primary}10`
			}}>
				{/* MCP Tools Button */}
				<button
					onClick={() => setIsConsoleOpen(!isConsoleOpen)}
					style={{
						background: isConsoleOpen 
							? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
							: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}40)`,
						border: 'none',
						borderRadius: '15px',
						padding: '12px 16px',
						color: 'white',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '4px',
						fontSize: '11px',
						fontWeight: '500',
						minWidth: '80px',
						transition: 'all 0.3s ease',
						backdropFilter: 'blur(10px)',
						boxShadow: isConsoleOpen ? `0 4px 15px ${colors.primary}40` : 'none'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = `0 6px 20px ${colors.primary}60`;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = isConsoleOpen ? `0 4px 15px ${colors.primary}40` : 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>🔧</span>
					<span>MCP Tools</span>
				</button>

				{/* Bookmarks Button */}
				<button
					onClick={() => setShowBookmarks(!showBookmarks)}
					style={{
						background: showBookmarks 
							? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
							: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}40)`,
						border: 'none',
						borderRadius: '15px',
						padding: '12px 16px',
						color: 'white',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '4px',
						fontSize: '11px',
						fontWeight: '500',
						minWidth: '80px',
						transition: 'all 0.3s ease',
						backdropFilter: 'blur(10px)',
						boxShadow: showBookmarks ? `0 4px 15px ${colors.primary}40` : 'none'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = `0 6px 20px ${colors.primary}60`;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = showBookmarks ? `0 4px 15px ${colors.primary}40` : 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>⭐</span>
					<span>Bookmarks</span>
				</button>

				{/* History Button */}
				<button
					onClick={() => setShowHistory(!showHistory)}
					style={{
						background: showHistory
							? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
							: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}40)`,
						border: 'none',
						borderRadius: '15px',
						padding: '12px 16px',
						color: 'white',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '4px',
						fontSize: '11px',
						fontWeight: '500',
						minWidth: '80px',
						transition: 'all 0.3s ease',
						backdropFilter: 'blur(10px)',
						boxShadow: showHistory ? `0 4px 15px ${colors.primary}40` : 'none'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = `0 6px 20px ${colors.primary}60`;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = showHistory ? `0 4px 15px ${colors.primary}40` : 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>📜</span>
					<span>History</span>
				</button>

				{/* Tools Button */}
				<button
					onClick={() => setShowTools(!showTools)}
					style={{
						background: showTools
							? `linear-gradient(135deg, #f59e0b, #d97706)`
							: `linear-gradient(135deg, #f59e0b40, #d9770640)`,
						border: 'none',
						borderRadius: '15px',
						padding: '12px 16px',
						color: 'white',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '4px',
						fontSize: '11px',
						fontWeight: '500',
						minWidth: '80px',
						transition: 'all 0.3s ease',
						backdropFilter: 'blur(10px)',
						boxShadow: showTools ? '0 4px 15px #f59e0b40' : 'none'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = '0 6px 20px #f59e0b60';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = showTools ? '0 4px 15px #f59e0b40' : 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>🛠️</span>
					<span>Tools</span>
				</button>

				{/* Local Chat Button */}
				<button
					onClick={() => setIsLocalChatOpen(!isLocalChatOpen)}
					style={{
						background: isLocalChatOpen
							? `linear-gradient(135deg, #8b5cf6, #7c3aed)`
							: `linear-gradient(135deg, #8b5cf640, #7c3aed40)`,
						border: 'none',
						borderRadius: '15px',
						padding: '12px 16px',
						color: 'white',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '4px',
						fontSize: '11px',
						fontWeight: '500',
						minWidth: '80px',
						transition: 'all 0.3s ease',
						backdropFilter: 'blur(10px)',
						boxShadow: isLocalChatOpen ? '0 4px 15px #8b5cf640' : 'none'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = '0 6px 20px #8b5cf660';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = isLocalChatOpen ? '0 4px 15px #8b5cf640' : 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>🤖</span>
					<span>Local AI</span>
				</button>

				{/* Add Bookmark Button */}
				<button
					onClick={addBookmark}
					style={{
						background: `linear-gradient(135deg, #10b981, #059669)`,
						border: 'none',
						borderRadius: '15px',
						padding: '12px 16px',
						color: 'white',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '4px',
						fontSize: '11px',
						fontWeight: '500',
						minWidth: '80px',
						transition: 'all 0.3s ease',
						backdropFilter: 'blur(10px)'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = '0 6px 20px #10b98160';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>➕</span>
					<span>Add Bookmark</span>
				</button>

				{/* AI Chat Button */}
				<button
					onClick={() => {
						console.log('AI Chat button clicked, current state:', isChatOpen);
						setIsChatOpen(!isChatOpen);
					}}
					style={{
						background: isChatOpen 
							? `linear-gradient(135deg, #6366f1, #8b5cf6)`
							: `linear-gradient(135deg, #6366f140, #8b5cf640)`,
						border: 'none',
						borderRadius: '15px',
						padding: '12px 16px',
						color: 'white',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '4px',
						fontSize: '11px',
						fontWeight: '500',
						minWidth: '80px',
						transition: 'all 0.3s ease',
						backdropFilter: 'blur(10px)',
						boxShadow: isChatOpen ? `0 4px 15px #6366f140` : 'none'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = `0 6px 20px #6366f160`;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = isChatOpen ? `0 4px 15px #6366f140` : 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>🤖</span>
					<span>AI Chat</span>
				</button>

				{/* Settings Button */}
				<button
					onClick={() => {
						console.log('Settings button clicked');
						setIsSettingsOpen(true);
					}}
					style={{
						background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})`,
						border: 'none',
						borderRadius: '15px',
						padding: '12px 16px',
						color: 'white',
						cursor: 'pointer',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '4px',
						fontSize: '11px',
						fontWeight: '500',
						minWidth: '80px',
						transition: 'all 0.3s ease',
						backdropFilter: 'blur(10px)'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = `0 6px 20px ${colors.accent}60`;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>⚙️</span>
					<span>Settings</span>
				</button>
			</div>

			{/* AI Components */}
			<ChatPanel
				isOpen={isChatOpen}
				onClose={() => setIsChatOpen(false)}
				currentUrl={currentUrl}
				currentTitle={activeTab?.title}
				webContent={activeTab?.url ? `Content from ${activeTab.url}` : undefined}
			/>

			<ProviderSettings
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				onConfigured={() => {
					// Refresh MCP status after configuration
					setConsoleOutput(prev => [...prev, 'MCP service configured successfully']);
				}}
			/>

			{/* Local Model Chatbot */}
			{isLocalChatOpen && (
				<div style={{
					position: 'fixed',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					zIndex: 10000,
					boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
				}}>
					<LocalChatbot onClose={() => setIsLocalChatOpen(false)} />
				</div>
			)}

			{/* Backdrop for Local Chat */}
			{isLocalChatOpen && (
				<div
					onClick={() => setIsLocalChatOpen(false)}
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.7)',
						backdropFilter: 'blur(4px)',
						zIndex: 9999
					}}
				/>
			)}
		</div>
	);
};

export default Browser;