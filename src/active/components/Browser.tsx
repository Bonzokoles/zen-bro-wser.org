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
import { mcpService, type MCPTool } from '../services/mcpService';
import { analytics } from '../services/analytics';
import { licenseManager, getLicensePlan } from '../services/security/licenseManager';
import { hasFeatureAccess, TAB_LIMITS, FEATURES, type PlanType } from '../config/features';
import { useWindowManager, type WindowType } from '../hooks/useWindowManager';
import { FeatureDock } from './FeatureDock';

// New Components
import { BrowserHeader } from './browser/BrowserHeader';
import { BrowserTabs } from './browser/BrowserTabs';
import { BrowserBookmarksPanel } from './browser/BrowserBookmarksPanel';
import { BrowserHistoryPanel } from './browser/BrowserHistoryPanel';
import { BrowserToolsPanel } from './browser/BrowserToolsPanel';

export interface Tab {
	id: string;
	title: string;
	url: string;
	isActive: boolean;
	isLoading: boolean;
	favicon?: string;
}

export type { MCPTool } from '../services/mcpService';

export interface Bookmark {
	id: string;
	title: string;
	url: string;
	favicon: string;
	category?: string;
	createdAt?: number;
}

export interface HistoryEntry {
	id: string;
	url: string;
	title: string;
	visitedAt: Date;
	favicon: string;
}
/** @deprecated Use HistoryEntry */
type HistoryItem = HistoryEntry;

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

	// Removed local bookmark form state as it's now in BrowserBookmarksPanel

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

	// License & Feature Gates
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
			const isValid = licenseManager.isValid();
			setIsLicenseValid(isValid);
				const plan = getLicensePlan();
				setCurrentPlan(plan);

				if (isValid) {
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

	// Floating windows state (external URLs opened via navigation)
	interface FloatingWindowData {
		id: string;
		url: string;
		title: string;
	}
	const [floatingWindows, setFloatingWindows] = useState<FloatingWindowData[]>([]);

	// Feature windows managed by WindowManager (AI Chat, Local AI, etc.)
	const {
		windows: managedWindows,
		openWindow,
		closeWindow,
		isOpen: isManagedOpen,
	} = useWindowManager();

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

	// ── FeatureDock handlers ──────────────────────────────────────────────────────
	/** Route dock button click: floating windows go to WindowManager, panels use local state */
	const handleDockOpen = (type: WindowType) => {
		switch (type) {
			case 'bookmarks':    setShowBookmarks(v => !v); break;
			case 'history':      setShowHistory(v => !v); break;
			case 'tools':        setShowTools(v => !v); break;
			case 'mcp-console':  setIsConsoleOpen(v => !v); break;
			case 'music':        setIsMusicPlayerOpen(v => !v); break;
			case 'video':        setIsVideoPlayerOpen(v => !v); break;
			case 'admin':        setIsAdminPanelOpen(true); break;
			case 'wikipedia':    setIsWikipediaOpen(v => !v); break;
			case 'on-this-day':  setIsOnThisDayOpen(v => !v); break;
			case 'birthday':     setIsBirthdaySongOpen(v => !v); break;
			case 'clock':        setIsClockWidgetOpen(v => !v); break;
			case 'shortcuts':    setIsShortcutsWidgetOpen(v => !v); break;
			case 'music-widget': setIsMusicWidgetOpen(v => !v); break;
			case 'settings':     setIsSettingsOpen(v => !v); break;
			default:
				// 'ai-chat', 'local-ai', 'iframe' → managed floating windows
				openWindow(type);
		}
	};

	/** Returns whether a given dock item is currently active/open */
	const handleDockIsOpen = (type: WindowType): boolean => {
		switch (type) {
			case 'bookmarks':    return showBookmarks;
			case 'history':      return showHistory;
			case 'tools':        return showTools;
			case 'mcp-console':  return isConsoleOpen;
			case 'music':        return isMusicPlayerOpen;
			case 'video':        return isVideoPlayerOpen;
			case 'admin':        return isAdminPanelOpen;
			case 'settings':     return isSettingsOpen;
			case 'wikipedia':    return isWikipediaOpen;
			case 'on-this-day':  return isOnThisDayOpen;
			case 'birthday':     return isBirthdaySongOpen;
			case 'clock':        return isClockWidgetOpen;
			case 'shortcuts':    return isShortcutsWidgetOpen;
			case 'music-widget': return isMusicWidgetOpen;
			default:             return isManagedOpen(type);
		}
	};

	return (
		<div className={`relative min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
			<BrowserHeader
				theme={theme}
				toggleTheme={toggleTheme}
				currentPlan={currentPlan}
				inputUrl={inputUrl}
				setInputUrl={setInputUrl}
				handleUrlSubmit={handleUrlSubmit}
			/>

			<div className="pt-[72px]">
				<BrowserTabs
					tabs={tabs}
					activeTabId={activeTab?.id}
					onSwitchTab={handleSwitchTab}
					onCloseTab={handleCloseTab}
					onCreateTab={() => handleCreateTab()}
					theme={theme}
				/>
			</div>

			<BrowserBookmarksPanel
				isOpen={showBookmarks}
				onClose={() => setShowBookmarks(false)}
				bookmarks={bookmarks}
				onAddBookmark={(data) => {
					const newBookmark = {
						id: Date.now().toString(),
						...data,
						createdAt: Date.now()
					};
					setBookmarks(prev => [...prev, newBookmark]);
					addConsoleMessage(`✅ Bookmark added: ${newBookmark.title}`);
				}}
				onRemoveBookmark={removeBookmark}
				onOpenBookmark={openBookmark}
				theme={theme}
			/>

			<BrowserHistoryPanel
				isOpen={showHistory}
				onClose={() => setShowHistory(false)}
				history={history}
				onClearHistory={clearHistory}
				onOpenHistoryItem={openFromHistory}
				theme={theme}
			/>

			<BrowserToolsPanel
				isOpen={showTools}
				onClose={() => setShowTools(false)}
				theme={theme}
			/>

			<WebView
				url={currentUrl}
				isLoading={activeTab?.isLoading || false}
				title={activeTab?.title || ''}
				topOffset={showTools ? 480 : (showBookmarks || showHistory ? 320 : 120)}
			/>

			{isConsoleOpen && (
				<div className="fixed bottom-[80px] left-0 right-0 h-[200px] bg-slate-900 border-t border-slate-700 z-[101] text-white p-4 overflow-auto">
					<h3>MCP Console</h3>
					<div className="bg-slate-800 p-2 rounded mt-2 font-mono text-xs">
						{consoleOutput.map((line, i) => (
							<div key={i}>{line}</div>
						))}
					</div>
				</div>
			)}

			<FeatureDock
				theme={theme}
				onOpen={handleDockOpen}
				isOpen={handleDockIsOpen}
				onAddBookmark={addBookmark}
			/>

			{/* Settings panel (slide-in) */}
			<ProviderSettings
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				onConfigured={() => {
					setConsoleOutput(prev => [...prev, 'MCP service configured successfully']);
				}}
			/>

			{/* Widget overlays */}
			{isWikipediaOpen && <WikipediaWidget onClose={() => setIsWikipediaOpen(false)} />}
			{isOnThisDayOpen && <OnThisDayWidget onClose={() => setIsOnThisDayOpen(false)} />}
			{isBirthdaySongOpen && <BirthdaySongWidget onClose={() => setIsBirthdaySongOpen(false)} />}

			{isMusicPlayerOpen && <MusicPlayer onClose={() => setIsMusicPlayerOpen(false)} />}

			{/* External URL floating windows (opened via navigation bar) */}
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

			{/* Feature floating windows managed by WindowManager */}
			{managedWindows.map(win => (
				<FloatingWindow
					key={win.id}
					title={win.title}
					icon={win.icon}
					url={win.type === 'iframe' ? win.url : undefined}
					zIndex={win.zIndex}
					onClose={() => closeWindow(win.id)}
					initialWidth={win.initialWidth}
					initialHeight={win.initialHeight}
					initialX={win.initialX}
					initialY={win.initialY}
				>
					{win.type === 'ai-chat' && (
						<ChatPanel
							isOpen
							embedded
							onClose={() => closeWindow(win.id)}
							currentUrl={currentUrl}
							currentTitle={activeTab?.title}
							webContent={activeTab?.url ? `Content from ${activeTab.url}` : undefined}
						/>
					)}
					{win.type === 'local-ai' && (
						<OllamaChatbot
							embedded
							onClose={() => closeWindow(win.id)}
						/>
					)}
				</FloatingWindow>
			))}

			<AdminPanel
				isOpen={isAdminPanelOpen}
				onClose={() => setIsAdminPanelOpen(false)}
				onPlanChange={(plan) => {
					setCurrentPlan(plan);
					addConsoleMessage(`✅ Plan changed to: ${plan.toUpperCase()}`);
				}}
			/>

			{isVideoPlayerOpen && <VideoPlayerPanel onClose={() => setIsVideoPlayerOpen(false)} />}

			{isClockWidgetOpen && <ClockWidget onClose={() => setIsClockWidgetOpen(false)} />}
			{isShortcutsWidgetOpen && <ShortcutsWidget onClose={() => setIsShortcutsWidgetOpen(false)} />}
			{isMusicWidgetOpen && <MusicPlayerWidget onClose={() => setIsMusicWidgetOpen(false)} />}

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