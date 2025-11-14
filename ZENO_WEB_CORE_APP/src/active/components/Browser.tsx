import React, { useState, useEffect, useMemo } from 'react';
import WebView from './WebView';
import ChatPanel from './ChatPanel';
import ProviderSettings from './ProviderSettings';
import FloatingWindow from './FloatingWindow';
import UpgradePrompt from './UpgradePrompt';
import MusicPlayer from './MusicPlayer';
import AdminPanel from './AdminPanel';
import VideoPlayerPanel from './VideoPlayerPanel';
import ClockWidget from './widgets/ClockWidget';
import ShortcutsWidget from './widgets/ShortcutsWidget';
import MusicPlayerWidget from './widgets/MusicPlayerWidget';
import { InternetArchivePlayer } from './iframe/InternetArchivePlayer';
import { YouTubePlayer } from './iframe/YouTubePlayer';
// import LocalChatbot from './LocalChatbot'; // Moved to NOT_IN_USE
import OllamaChatbot from './OllamaChatbot';
import WikipediaWidget from './widgets/WikipediaWidget';
import OnThisDayWidget from './widgets/OnThisDayWidget';
import BirthdaySongWidget from './widgets/BirthdaySongWidget';
import { mcpService } from '../services/mcpService';
import { analytics } from '../services/analytics';
import { licenseManager, getLicensePlan } from '../services/security/licenseManager';
import { hasFeatureAccess, TAB_LIMITS, FEATURES, type PlanType } from '../config/features';

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
	category?: string; // e.g. 'Praca', 'Hobby', 'Nauka', 'Rozrywka'
	createdAt?: number; // timestamp
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
	const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
	const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
	const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
	const [isClockWidgetOpen, setIsClockWidgetOpen] = useState(false);
	const [isShortcutsWidgetOpen, setIsShortcutsWidgetOpen] = useState(false);
	const [isMusicWidgetOpen, setIsMusicWidgetOpen] = useState(false);
	const [isWikipediaOpen, setIsWikipediaOpen] = useState(false);
	const [isOnThisDayOpen, setIsOnThisDayOpen] = useState(false);
	const [isBirthdaySongOpen, setIsBirthdaySongOpen] = useState(false);
	const [theme, setTheme] = useState<Theme>('dark');
	const [isAddingBookmark, setIsAddingBookmark] = useState(false);
	const [bookmarkCategories, setBookmarkCategories] = useState<string[]>([
		'Praca', 'Hobby', 'Nauka', 'Rozrywka', 'Narzędzia', 'Inne'
	]);
	const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie');
	const [newBookmarkData, setNewBookmarkData] = useState({
		title: '',
		url: '',
		favicon: '🌐',
		category: 'Inne'
	});
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
		{ id: '4', title: 'ZENO Search', url: 'about:search', favicon: '🔍' }
	]);

	const [history, setHistory] = useState<HistoryItem[]>([]);

	// License & Feature Gates - WSZYSTKO DOSTĘPNE (lifetime plan)
	const [currentPlan, setCurrentPlan] = useState<PlanType>('lifetime');
	const [isLicenseValid, setIsLicenseValid] = useState(true);
	const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
	const [upgradeFeature, setUpgradeFeature] = useState<{
		name: string;
		icon: string;
		requiredPlan: PlanType;
	} | null>(null);

	// Load bookmarks and history from localStorage on mount
	useEffect(() => {
		const loadData = () => {
			try {
				// Load bookmarks
				const savedBookmarks = localStorage.getItem('zeno_bookmarks');
				if (savedBookmarks) {
					const parsed = JSON.parse(savedBookmarks);
					setBookmarks(parsed);
					console.log(`✅ Loaded ${parsed.length} bookmarks from storage`);
				}

				// Load history
				const savedHistory = localStorage.getItem('zeno_history');
				if (savedHistory) {
					const parsed = JSON.parse(savedHistory);
					// Convert date strings back to Date objects
					const historyWithDates = parsed.map((item: any) => ({
						...item,
						visitedAt: new Date(item.visitedAt)
					}));
					setHistory(historyWithDates);
					console.log(`✅ Loaded ${historyWithDates.length} history items from storage`);
				}
			} catch (error) {
				console.error('Failed to load data from localStorage:', error);
			}
		};

		loadData();
	}, []);

	// Save bookmarks to localStorage whenever they change
	useEffect(() => {
		try {
			localStorage.setItem('zeno_bookmarks', JSON.stringify(bookmarks));
		} catch (error) {
			console.error('Failed to save bookmarks:', error);
		}
	}, [bookmarks]);

	// Save history to localStorage whenever it changes
	useEffect(() => {
		try {
			localStorage.setItem('zeno_history', JSON.stringify(history));
		} catch (error) {
			console.error('Failed to save history:', error);
		}
	}, [history]);

	// Check license on mount
	useEffect(() => {
		const checkLicense = async () => {
			try {
				const validation = await licenseManager.validateLicense();
				setIsLicenseValid(validation.isValid);
				const plan = getLicensePlan();
				setCurrentPlan(plan);

				if (validation.isValid) {
					addConsoleMessage(`✅ License activated - ${plan} plan`);
				} else {
					addConsoleMessage('ℹ️ Using Free plan - Upgrade to unlock premium features');
				}
			} catch (error) {
				console.error('License check failed:', error);
				setCurrentPlan('free');
				setIsLicenseValid(false);
			}
		};

		checkLicense();
	}, []);

	// Floating windows state
	interface FloatingWindowData {
		id: string;
		url: string;
		title: string;
	}
	const [floatingWindows, setFloatingWindows] = useState<FloatingWindowData[]>([]);

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
			switch (e.key.toLowerCase()) {
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

	// Listen for search events from AddressBar
	useEffect(() => {
		const handleSearch = (e: CustomEvent) => {
			const query = e.detail.query;
			addConsoleMessage(`🔍 Searching with Tavily: "${query}"`);
			handleMCPCommand(`web_search: ${query}`);
		};

		const handleCAYDResults = (e: CustomEvent) => {
			const results = e.detail;
			addConsoleMessage(`📚 CAYD found ${results.count} results in library`);
			console.log('CAYD Results:', results);

			// Show results in new tab or console
			if (results.results && results.results.length > 0) {
				// Create formatted output
				const output = results.results.slice(0, 10).map((r: any, i: number) =>
					`${i + 1}. ${r.name} (${r.type})\n   Path: ${r.path}`
				).join('\n\n');

				addConsoleMessage(`\n📋 Top 10 CAYD Results:\n${output}`);
			}
		};

		const handleUnifiedSearch = (e: CustomEvent) => {
			const results = e.detail;
			const stats = results.stats;

			addConsoleMessage(
				`🎯 Unified Search Complete:\n` +
				`   Sources: ${results.sources_used.join(', ')}\n` +
				`   CAYD: ${stats.cayd_count} results\n` +
				`   Web: ${stats.tavily_count} results\n` +
				`   Total: ${stats.total_count} results\n` +
				`   Time: ${stats.response_time_ms}ms`
			);

			console.log('Unified Search Results:', results);
		};

		window.addEventListener('zeno-search', handleSearch as EventListener);
		window.addEventListener('cayd-search-results', handleCAYDResults as EventListener);
		window.addEventListener('unified-search-complete', handleUnifiedSearch as EventListener);

		return () => {
			window.removeEventListener('zeno-search', handleSearch as EventListener);
			window.removeEventListener('cayd-search-results', handleCAYDResults as EventListener);
			window.removeEventListener('unified-search-complete', handleUnifiedSearch as EventListener);
		};
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
			favicon: activeTab.favicon || '🌐',
			category: 'Inne', // Default category
			createdAt: Date.now()
		};

		setBookmarks(prev => [...prev, newBookmark]);
		addConsoleMessage(`Bookmark added: ${newBookmark.title} [${newBookmark.category}]`);
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

	const addNewBookmarkManually = () => {
		if (!newBookmarkData.title || !newBookmarkData.url) {
			addConsoleMessage('⚠️ Title and URL are required');
			return;
		}

		// Validate URL
		try {
			new URL(newBookmarkData.url.startsWith('http') ? newBookmarkData.url : `https://${newBookmarkData.url}`);
		} catch {
			addConsoleMessage('⚠️ Invalid URL format');
			return;
		}

		const existingBookmark = bookmarks.find(b => b.url === newBookmarkData.url);
		if (existingBookmark) {
			addConsoleMessage('Page already bookmarked');
			return;
		}

		const newBookmark: Bookmark = {
			id: Date.now().toString(),
			title: newBookmarkData.title,
			url: newBookmarkData.url.startsWith('http') ? newBookmarkData.url : `https://${newBookmarkData.url}`,
			favicon: newBookmarkData.favicon || '🌐',
			category: newBookmarkData.category || 'Inne',
			createdAt: Date.now()
		};

		setBookmarks(prev => [...prev, newBookmark]);
		addConsoleMessage(`✅ Bookmark added: ${newBookmark.title} [${newBookmark.category}]`);

		// Reset form
		setNewBookmarkData({ title: '', url: '', favicon: '🌐', category: 'Inne' });
		setIsAddingBookmark(false);
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

		// Otherwise, it's a search query - use Tavily API for search
		addConsoleMessage(`Searching with Tavily: "${query}"`);
		handleMCPCommand(`web_search: ${query}`);
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

		// Close ALL panels when navigating
		setShowBookmarks(false);
		setShowHistory(false);
		setShowTools(false);
		setIsConsoleOpen(false);

		// If it's an external URL (not about:), open in floating window
		if (!finalUrl.startsWith('about:')) {
			const windowId = Date.now().toString();
			setFloatingWindows(prev => [...prev, {
				id: windowId,
				url: finalUrl,
				title: pageTitle
			}]);
			addToHistory(finalUrl, pageTitle, getPageFavicon(finalUrl));
			addConsoleMessage(`Opening in floating window: ${finalUrl}`);
			return;
		}

		// For about: pages, use the traditional tab system
		setCurrentUrl(finalUrl);
		setInputUrl(finalUrl);
		setTabs(prev => prev.map(tab =>
			tab.isActive
				? { ...tab, url: finalUrl, isLoading: true, title: 'Loading...', favicon: getPageFavicon(finalUrl) }
				: tab
		));

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

	// Feature gate helper functions
	const checkFeatureAccess = (featureId: string): boolean => {
		// WSZYSTKO DOSTĘPNE - system subskrypcji wyłączony
		return true;
	};

	const promptUpgrade = (featureName: string, featureIcon: string, requiredPlan: PlanType) => {
		setUpgradeFeature({ name: featureName, icon: featureIcon, requiredPlan });
		setShowUpgradePrompt(true);
		addConsoleMessage(`🔒 ${featureName} requires ${requiredPlan} plan`);
	};

	const handleUpgrade = () => {
		// Redirect to pricing page or show payment modal
		window.open('/pricing', '_blank');
		setShowUpgradePrompt(false);
	};

	// Override create tab to enforce tab limits
	const handleCreateTabGated = (url: string = 'about:blank') => {
		const tabLimit = TAB_LIMITS[currentPlan];

		if (tabs.length >= tabLimit) {
			if (currentPlan === 'free') {
				promptUpgrade('Unlimited Tabs', '∞', 'monthly');
				return;
			}
		}

		handleCreateTab(url);
	};



	return (
		<div style={{ position: 'relative', zIndex: 1 }}>
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
						<span style={{ color: colors.text }}>ZENO_WEB_CORE</span>
					</div>

					{/* Plan Badge */}
					<div
						onClick={() => {
							if (currentPlan === 'free') {
								window.open('/pricing', '_blank');
							}
						}}
						style={{
							background: currentPlan === 'free'
								? 'linear-gradient(135deg, #94a3b8, #64748b)'
								: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							border: 'none',
							borderRadius: '10px',
							padding: '8px 16px',
							color: 'white',
							fontWeight: '700',
							fontSize: '12px',
							cursor: currentPlan === 'free' ? 'pointer' : 'default',
							transition: 'all 0.3s ease',
							boxShadow: currentPlan === 'free'
								? '0 2px 10px rgba(148, 163, 184, 0.3)'
								: '0 4px 15px rgba(102, 126, 234, 0.4)',
							textTransform: 'uppercase',
							letterSpacing: '0.5px',
							display: 'flex',
							alignItems: 'center',
							gap: '6px'
						}}
						onMouseEnter={(e) => {
							if (currentPlan === 'free') {
								e.currentTarget.style.transform = 'scale(1.05)';
								e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
							}
						}}
						onMouseLeave={(e) => {
							if (currentPlan === 'free') {
								e.currentTarget.style.transform = 'scale(1)';
								e.currentTarget.style.boxShadow = '0 2px 10px rgba(148, 163, 184, 0.3)';
							}
						}}
					>
						{currentPlan === 'free' && '⬆️'}
						{currentPlan === 'monthly' && '⭐'}
						{currentPlan === 'yearly' && '🚀'}
						{currentPlan === 'lifetime' && '👑'}
						{currentPlan.toUpperCase()}
						{currentPlan === 'free' && ' - Upgrade'}
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
					<form onSubmit={handleUrlSubmit} style={{ flex: 1, maxWidth: '600px' }}>
						<div style={{ position: 'relative' }}>
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
						<h3 style={{ color: colors.text, fontSize: '20px', margin: 0, fontWeight: '600' }}>� Bookmarks</h3>
						<div style={{ display: 'flex', gap: '12px' }}>
							<button
								onClick={() => setIsAddingBookmark(true)}
								style={{
									background: 'linear-gradient(135deg, #10b981, #059669)',
									border: 'none',
									color: 'white',
									fontSize: '14px',
									cursor: 'pointer',
									borderRadius: '8px',
									padding: '8px 16px',
									fontWeight: '600',
									transition: 'all 0.3s ease'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = 'scale(1.05)';
									e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = 'scale(1)';
									e.currentTarget.style.boxShadow = 'none';
								}}
							>
								➕ Add New
							</button>
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
					</div>

					{/* Add Bookmark Form */}
					{isAddingBookmark && (
						<div style={{
							backgroundColor: colors.primary,
							border: `2px solid ${colors.border}`,
							borderRadius: '12px',
							padding: '20px',
							marginBottom: '20px'
						}}>
							<h4 style={{ color: colors.text, fontSize: '16px', margin: '0 0 16px 0', fontWeight: '600' }}>
								Add New Bookmark
							</h4>
							<div style={{ display: 'grid', gap: '12px' }}>
								<div>
									<label style={{ color: colors.muted, fontSize: '12px', display: 'block', marginBottom: '6px' }}>
										Title *
									</label>
									<input
										type="text"
										value={newBookmarkData.title}
										onChange={(e) => setNewBookmarkData({ ...newBookmarkData, title: e.target.value })}
										placeholder="e.g., My Favorite Site"
										style={{
											width: '100%',
											backgroundColor: colors.accent,
											border: `1px solid ${colors.border}`,
											borderRadius: '8px',
											padding: '10px 12px',
											color: colors.text,
											fontSize: '14px',
											outline: 'none'
										}}
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												addNewBookmarkManually();
											}
										}}
									/>
								</div>
								<div>
									<label style={{ color: colors.muted, fontSize: '12px', display: 'block', marginBottom: '6px' }}>
										URL *
									</label>
									<input
										type="text"
										value={newBookmarkData.url}
										onChange={(e) => setNewBookmarkData({ ...newBookmarkData, url: e.target.value })}
										placeholder="e.g., https://example.com"
										style={{
											width: '100%',
											backgroundColor: colors.accent,
											border: `1px solid ${colors.border}`,
											borderRadius: '8px',
											padding: '10px 12px',
											color: colors.text,
											fontSize: '14px',
											outline: 'none',
											fontFamily: 'monospace'
										}}
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												addNewBookmarkManually();
											}
										}}
									/>
								</div>
								<div>
									<label style={{ color: colors.muted, fontSize: '12px', display: 'block', marginBottom: '6px' }}>
										Emoji/Icon (optional)
									</label>
									<input
										type="text"
										value={newBookmarkData.favicon}
										onChange={(e) => setNewBookmarkData({ ...newBookmarkData, favicon: e.target.value })}
										placeholder="🌐"
										maxLength={2}
										style={{
											width: '80px',
											backgroundColor: colors.accent,
											border: `1px solid ${colors.border}`,
											borderRadius: '8px',
											padding: '10px 12px',
											color: colors.text,
											fontSize: '20px',
											outline: 'none',
											textAlign: 'center'
										}}
									/>
								</div>
								<div>
									<label style={{ color: colors.muted, fontSize: '12px', display: 'block', marginBottom: '6px' }}>
										Kategoria *
									</label>
									<select
										value={newBookmarkData.category}
										onChange={(e) => setNewBookmarkData({ ...newBookmarkData, category: e.target.value })}
										style={{
											width: '100%',
											backgroundColor: colors.accent,
											border: `1px solid ${colors.border}`,
											borderRadius: '8px',
											padding: '10px 12px',
											color: colors.text,
											fontSize: '14px',
											outline: 'none',
											cursor: 'pointer'
										}}
									>
										{bookmarkCategories.map(cat => (
											<option key={cat} value={cat}>{cat}</option>
										))}
									</select>
								</div>
								<div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
									<button
										onClick={addNewBookmarkManually}
										style={{
											flex: 1,
											background: 'linear-gradient(135deg, #10b981, #059669)',
											border: 'none',
											color: 'white',
											padding: '12px',
											borderRadius: '8px',
											fontSize: '14px',
											fontWeight: '600',
											cursor: 'pointer',
											transition: 'all 0.3s ease'
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = 'scale(1.02)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = 'scale(1)';
										}}
									>
										✓ Save Bookmark
									</button>
									<button
										onClick={() => {
											setIsAddingBookmark(false);
											setNewBookmarkData({ title: '', url: '', favicon: '🌐', category: 'Inne' });
										}}
										style={{
											flex: 1,
											background: colors.accent,
											border: `1px solid ${colors.border}`,
											color: colors.muted,
											padding: '12px',
											borderRadius: '8px',
											fontSize: '14px',
											fontWeight: '600',
											cursor: 'pointer',
											transition: 'all 0.3s ease'
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = colors.secondary;
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = colors.accent;
										}}
									>
										✕ Cancel
									</button>
								</div>
							</div>
						</div>
					)}

					<div style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
						gap: '16px'
					}}>
						{bookmarks
							.filter(b => selectedCategory === 'Wszystkie' || b.category === selectedCategory)
							.map(bookmark => (
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
									<div style={{ flex: 1, overflow: 'hidden' }}>
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
						<h3 style={{ color: colors.text, fontSize: '20px', margin: 0, fontWeight: '600' }}>📈 History</h3>
						<div style={{ display: 'flex', gap: '8px' }}>
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
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
									<span style={{ fontSize: '20px' }}>{item.favicon}</span>
									<div style={{ flex: 1, overflow: 'hidden' }}>
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
						<h3 style={{ color: colors.text, fontSize: '20px', margin: 0, fontWeight: '600' }}>🛠️ Tools & Features</h3>
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
							<div style={{ flex: 1 }}>
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
							<div style={{ flex: 1 }}>
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
							<div style={{ flex: 1 }}>
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
							<div style={{ flex: 1 }}>
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
							<div style={{ flex: 1 }}>
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
							<div style={{ flex: 1 }}>
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
							<div style={{ flex: 1 }}>
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
							<div style={{ flex: 1 }}>
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
							<div style={{ flex: 1 }}>
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
							<div style={{ flex: 1 }}>
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

			{/* WebView renders with position: fixed, no wrapper needed */}
			<WebView
				url={currentUrl}
				isLoading={activeTab?.isLoading || false}
				title={activeTab?.title || ''}
				topOffset={showTools ? 480 : (showBookmarks || showHistory ? 320 : 80)}
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
					onClick={() => {
						// Check if user has access to MCP tools
						if (!checkFeatureAccess('mcp_tools')) {
							promptUpgrade('MCP Tools Integration', '🔧', 'monthly');
							return;
						}
						setIsConsoleOpen(!isConsoleOpen);
					}}
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
					onClick={() => {
						// Check if user has access to Ollama integration
						if (!checkFeatureAccess('ollama_integration')) {
							promptUpgrade('Local Ollama Models', '🦙', 'monthly');
							return;
						}
						setIsLocalChatOpen(!isLocalChatOpen);
					}}
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

				{/* Wikipedia Widget Button */}
				<button
					onClick={() => setIsWikipediaOpen(!isWikipediaOpen)}
					style={{
						background: isWikipediaOpen
							? `linear-gradient(135deg, #3b82f6, #2563eb)`
							: `linear-gradient(135deg, #3b82f640, #2563eb40)`,
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
						boxShadow: isWikipediaOpen ? '0 4px 15px #3b82f640' : 'none'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = '0 6px 20px #3b82f660';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = isWikipediaOpen ? '0 4px 15px #3b82f640' : 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>📚</span>
					<span>Wikipedia</span>
				</button>

				{/* On This Day Widget Button */}
				<button
					onClick={() => setIsOnThisDayOpen(!isOnThisDayOpen)}
					style={{
						background: isOnThisDayOpen
							? `linear-gradient(135deg, #3b82f6, #1e40af)`
							: `linear-gradient(135deg, #3b82f640, #1e40af40)`,
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
						boxShadow: isOnThisDayOpen ? '0 4px 15px #3b82f640' : 'none'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = '0 6px 20px #3b82f660';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = isOnThisDayOpen ? '0 4px 15px #3b82f640' : 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>📅</span>
					<span>W tym dniu</span>
				</button>

				{/* Birthday Song Widget Button */}
				<button
					onClick={() => setIsBirthdaySongOpen(!isBirthdaySongOpen)}
					style={{
						background: isBirthdaySongOpen
							? `linear-gradient(135deg, #ec4899, #db2777)`
							: `linear-gradient(135deg, #ec489940, #db277740)`,
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
						boxShadow: isBirthdaySongOpen ? '0 4px 15px #ec489940' : 'none'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = '0 6px 20px #ec489960';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = isBirthdaySongOpen ? '0 4px 15px #ec489940' : 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>🎵</span>
					<span>Urodziny</span>
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
						// Check if user has access to AI assistant
						if (!checkFeatureAccess('ai_assistant')) {
							promptUpgrade('AI Assistant', '🤖', 'monthly');
							return;
						}
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

				{/* Music Player Button */}
				<button
					onClick={() => setIsMusicPlayerOpen(!isMusicPlayerOpen)}
					style={{
						background: isMusicPlayerOpen
							? `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`
							: `linear-gradient(135deg, #f093fb40, #f5576c40)`,
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
						boxShadow: isMusicPlayerOpen ? '0 4px 15px #f093fb40' : 'none'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = '0 6px 20px #f093fb60';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = isMusicPlayerOpen ? '0 4px 15px #f093fb40' : 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>🎵</span>
					<span>Music</span>
				</button>

				{/* Video Player Button */}
				<button
					onClick={() => setIsVideoPlayerOpen(!isVideoPlayerOpen)}
					style={{
						background: isVideoPlayerOpen
							? `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`
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
						boxShadow: isVideoPlayerOpen ? '0 4px 15px #f59e0b40' : 'none'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = '0 6px 20px #f59e0b60';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = isVideoPlayerOpen ? '0 4px 15px #f59e0b40' : 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>🎬</span>
					<span>Video</span>
				</button>

				{/* Admin Panel Button (Hidden - accessible via keyboard shortcut) */}
				<button
					onClick={() => setIsAdminPanelOpen(true)}
					style={{
						background: `linear-gradient(135deg, #dc2626 0%, #991b1b 100%)`,
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
						e.currentTarget.style.boxShadow = '0 6px 20px #dc262660';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>🔐</span>
					<span>Admin</span>
				</button>

				{/* Widget Panel Button - Rainmeter-style */}
				<button
					onClick={() => {
						setIsClockWidgetOpen(true);
						setIsShortcutsWidgetOpen(true);
						setIsMusicWidgetOpen(true);
					}}
					style={{
						background: `linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)`,
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
						e.currentTarget.style.boxShadow = '0 6px 20px #8b5cf660';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = 'none';
					}}
				>
					<span style={{ fontSize: '16px' }}>🎨</span>
					<span>Widgets</span>
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

			{/* Ollama Chatbot */}
			{isLocalChatOpen && (
				<OllamaChatbot onClose={() => setIsLocalChatOpen(false)} />
			)}

			{/* Wikipedia Widget */}
			{isWikipediaOpen && (
				<WikipediaWidget onClose={() => setIsWikipediaOpen(false)} />
			)}

			{/* On This Day Widget */}
			{isOnThisDayOpen && (
				<OnThisDayWidget onClose={() => setIsOnThisDayOpen(false)} />
			)}

			{/* Birthday Song Widget */}
			{isBirthdaySongOpen && (
				<BirthdaySongWidget onClose={() => setIsBirthdaySongOpen(false)} />
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

			{/* Music Player (Webamp) - FLOATING BEZ BACKDROP */}
			{isMusicPlayerOpen && (
				<MusicPlayer onClose={() => setIsMusicPlayerOpen(false)} />
			)}			{/* Floating Windows */}
			{floatingWindows.map(window => (
				<FloatingWindow
					key={window.id}
					url={window.url}
					title={window.title}
					onClose={() => {
						setFloatingWindows(prev => prev.filter(w => w.id !== window.id));
						addConsoleMessage(`Closed window: ${window.title}`);
					}}
					initialWidth={900}
					initialHeight={700}
					initialX={100 + (floatingWindows.findIndex(w => w.id === window.id) * 30)}
					initialY={120 + (floatingWindows.findIndex(w => w.id === window.id) * 30)}
				/>
			))}

			{/* Admin Panel */}
			<AdminPanel
				isOpen={isAdminPanelOpen}
				onClose={() => setIsAdminPanelOpen(false)}
				onPlanChange={(plan) => {
					setCurrentPlan(plan);
					addConsoleMessage(`✅ Plan changed to: ${plan.toUpperCase()}`);
				}}
			/>

			{/* Video Player Panel (Floating) */}
			{isVideoPlayerOpen && (
				<VideoPlayerPanel onClose={() => setIsVideoPlayerOpen(false)} />
			)}

			{/* Widget Panel (Rainmeter-style) */}
			{isClockWidgetOpen && (
				<ClockWidget onClose={() => setIsClockWidgetOpen(false)} />
			)}
			{isShortcutsWidgetOpen && (
				<ShortcutsWidget onClose={() => setIsShortcutsWidgetOpen(false)} />
			)}
			{isMusicWidgetOpen && (
				<MusicPlayerWidget onClose={() => setIsMusicWidgetOpen(false)} />
			)}

			{/* Upgrade Prompt Modal */}
			{showUpgradePrompt && upgradeFeature && (
				<UpgradePrompt
					featureName={upgradeFeature.name}
					featureIcon={upgradeFeature.icon}
					requiredPlan={upgradeFeature.requiredPlan}
					onClose={() => setShowUpgradePrompt(false)}
					onUpgrade={handleUpgrade}
				/>
			)}
		</div>
	);
};

export default Browser;