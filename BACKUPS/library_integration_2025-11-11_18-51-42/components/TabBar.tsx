import React from 'react';
import type { Tab } from './Browser';

interface TabBarProps {
	tabs: Tab[];
	onCreateTab: () => void;
	onCloseTab: (tabId: string) => void;
	onSwitchTab: (tabId: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({
	tabs,
	onCreateTab,
	onCloseTab,
	onSwitchTab
}) => {
	const truncateTitle = (title: string, maxLength: number = 25) => {
		return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
	};

	return (
		<div className="tab-bar flex items-center bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-slate-600 shadow-lg">
			<div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
				{tabs.map((tab) => (
					<div
						key={tab.id}
						className={`group flex items-center min-w-0 border-r border-slate-600 transition-all duration-200 ${
							tab.isActive
								? 'bg-gradient-to-b from-slate-700/80 to-slate-800/80 text-white border-t-2 border-blue-400 shadow-lg'
								: 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/70 hover:text-white'
						} backdrop-filter backdrop-blur-sm`}
					>
						<button
							onClick={() => onSwitchTab(tab.id)}
							className="flex items-center px-4 py-3 min-w-0 flex-1 focus:outline-none group-hover:scale-[1.02] transition-transform duration-200"
						>
							<div className="flex items-center min-w-0 space-x-2">
								{tab.isLoading ? (
									<div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
								) : (
									<span className="text-lg group-hover:scale-110 transition-transform duration-200">
										{tab.favicon || 
											(tab.url?.includes('github') ? '🐙' :
											 tab.url?.includes('google') ? '🔍' :
											 tab.url?.includes('youtube') ? '📺' :
											 tab.url?.includes('stackoverflow') ? '💻' :
											 tab.url?.includes('docs') ? '📚' :
											 tab.url === 'about:welcome' ? '🚀' : '🌐')
										}
									</span>
								)}
								<span className="text-sm font-medium truncate min-w-0 max-w-32">
									{truncateTitle(tab.title)}
								</span>
							</div>
						</button>
						
						{tabs.length > 1 && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									onCloseTab(tab.id);
								}}
								className="p-1 mr-2 hover:bg-red-600/20 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 text-slate-400 hover:text-red-400"
								title="Close tab"
							>
								<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						)}
					</div>
				))}
			</div>
			
			<button
				onClick={onCreateTab}
				className="p-3 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all duration-200 border-r border-slate-600 hover:scale-105 shadow-lg backdrop-filter backdrop-blur-sm"
				title="New tab (Ctrl+T)"
			>
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
				</svg>
			</button>
		</div>
	);
};

export default TabBar;