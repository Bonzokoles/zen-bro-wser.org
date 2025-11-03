import React from 'react';

interface ToolbarProps {
	onNewTab: () => void;
	onToggleConsole: () => void;
	mcpToolsCount: number;
	consoleOpen: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
	onNewTab,
	onToggleConsole,
	mcpToolsCount,
	consoleOpen
}) => {
	return (
		<div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-filter backdrop-blur-sm border-b border-slate-600 shadow-lg">
			<div className="flex items-center space-x-6">
				<div className="flex items-center space-x-2 group">
					<div className="w-3 h-3 bg-red-500 rounded-full hover:scale-125 transition-transform duration-200 cursor-pointer shadow-lg"></div>
					<div className="w-3 h-3 bg-yellow-500 rounded-full hover:scale-125 transition-transform duration-200 cursor-pointer shadow-lg"></div>
					<div className="w-3 h-3 bg-green-500 rounded-full hover:scale-125 transition-transform duration-200 cursor-pointer shadow-lg"></div>
				</div>
				
				<div className="flex items-center space-x-2">
					<button
						onClick={onNewTab}
						className="p-2 hover:bg-slate-700/80 rounded-lg text-slate-300 hover:text-white transition-all duration-200 hover:scale-110 backdrop-filter backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 shadow-lg"
						title="New Tab (Ctrl+T)"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
					</button>
					
					<button
						className="p-2 hover:bg-slate-700/80 rounded-lg text-slate-300 hover:text-white transition-all duration-200 hover:scale-110 backdrop-filter backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 shadow-lg"
						title="Back (Alt+←)"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					
					<button
						className="p-2 hover:bg-slate-700/80 rounded-lg text-slate-300 hover:text-white transition-all duration-200 hover:scale-110 backdrop-filter backdrop-blur-sm border border-slate-600/50 hover:border-blue-400/50 shadow-lg"
						title="Forward (Alt+→)"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
					
					<button
						className="p-2 hover:bg-slate-700/80 rounded-lg text-slate-300 hover:text-white transition-all duration-200 hover:scale-110 backdrop-filter backdrop-blur-sm border border-slate-600/50 hover:border-green-400/50 shadow-lg"
						title="Refresh (F5)"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					</button>
				</div>
			</div>

			<div className="flex items-center space-x-6">
				<div className="flex items-center space-x-3 px-4 py-2 bg-slate-700/60 backdrop-filter backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-lg">
					<div className="flex items-center space-x-2">
						<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg"></span>
						<span className="text-sm font-medium text-slate-300">{mcpToolsCount}</span>
						<span className="text-sm text-slate-400">MCP Tools</span>
					</div>
				</div>
				
				<button
					onClick={onToggleConsole}
					className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:scale-105 backdrop-filter backdrop-blur-sm border ${
						consoleOpen
							? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500/50 shadow-blue-500/25'
							: 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/80 hover:text-white border-slate-600/50 hover:border-blue-400/50'
					}`}
					title="Toggle MCP Console (Ctrl+Shift+C)"
				>
					<span className="flex items-center space-x-2">
						<span>🔧</span>
						<span>Console</span>
					</span>
				</button>
			</div>
		</div>
	);
};

export default Toolbar;