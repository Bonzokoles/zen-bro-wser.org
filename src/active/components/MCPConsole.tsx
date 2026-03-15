import React, { useState, useRef, useEffect } from 'react';
import type { MCPTool } from '../services/mcpService';

interface MCPConsoleProps {
	output: string[];
	tools: (MCPTool & { status?: 'connected' | 'disconnected' | 'error'; server?: string })[];
	onCommand: (command: string) => void;
	onClose: () => void;
}

const MCPConsole: React.FC<MCPConsoleProps> = ({
	output,
	tools,
	onCommand,
	onClose
}) => {
	const [command, setCommand] = useState('');
	const [commandHistory, setCommandHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [activeTab, setActiveTab] = useState<'output' | 'tools'>('output');
	const outputRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (outputRef.current) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight;
		}
	}, [output]);

	useEffect(() => {
		// Focus input when console opens
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!command.trim()) return;

		setCommandHistory(prev => [...prev, command]);
		setHistoryIndex(-1);
		onCommand(command);
		setCommand('');
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (commandHistory.length > 0) {
				const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
				setHistoryIndex(newIndex);
				setCommand(commandHistory[newIndex]);
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (historyIndex >= 0) {
				const newIndex = historyIndex + 1;
				if (newIndex >= commandHistory.length) {
					setHistoryIndex(-1);
					setCommand('');
				} else {
					setHistoryIndex(newIndex);
					setCommand(commandHistory[newIndex]);
				}
			}
		}
	};

	const getStatusColor = (status: MCPTool['status']) => {
		switch (status) {
			case 'connected': return 'text-green-400';
			case 'disconnected': return 'text-slate-400';
			case 'error': return 'text-red-400';
			default: return 'text-slate-400';
		}
	};

	const getStatusIcon = (status: MCPTool['status']) => {
		switch (status) {
			case 'connected':
				return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
			case 'disconnected':
				return <div className="w-2 h-2 bg-slate-400 rounded-full"></div>;
			case 'error':
				return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
			default:
				return <div className="w-2 h-2 bg-slate-400 rounded-full"></div>;
		}
	};

	return (
		<div className="mcp-console h-80 bg-slate-900 border-t border-slate-600 flex flex-col">
			{/* Console Header */}
			<div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-600">
				<div className="flex items-center space-x-4">
					<h3 className="text-white font-medium">MCP Console</h3>
					<div className="flex space-x-1">
						<button
							onClick={() => setActiveTab('output')}
							className={`px-3 py-1 rounded text-sm transition-colors ${
								activeTab === 'output'
									? 'bg-blue-600 text-white'
									: 'text-slate-400 hover:text-white'
							}`}
						>
							Output
						</button>
						<button
							onClick={() => setActiveTab('tools')}
							className={`px-3 py-1 rounded text-sm transition-colors ${
								activeTab === 'tools'
									? 'bg-blue-600 text-white'
									: 'text-slate-400 hover:text-white'
							}`}
						>
							Tools ({tools.length})
						</button>
					</div>
				</div>
				
				<button
					onClick={onClose}
					className="text-slate-400 hover:text-white transition-colors"
					title="Close console"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{/* Console Content */}
			<div className="flex-1 overflow-hidden">
				{activeTab === 'output' ? (
					<div className="h-full flex flex-col">
						{/* Output Area */}
						<div
							ref={outputRef}
							className="flex-1 overflow-y-auto p-4 mcp-output text-slate-300 text-sm"
						>
							{output.map((line, index) => (
								<div key={index} className="mb-1 font-mono">
									{line}
								</div>
							))}
						</div>

						{/* Command Input */}
						<div className="border-t border-slate-600 p-4">
							<form onSubmit={handleSubmit} className="flex items-center space-x-2">
								<span className="text-green-400 font-mono">$</span>
								<input
									ref={inputRef}
									type="text"
									value={command}
									onChange={(e) => setCommand(e.target.value)}
									onKeyDown={handleKeyDown}
									className="flex-1 bg-transparent text-white border-none outline-none font-mono"
									placeholder="Enter MCP command..."
									autoComplete="off"
								/>
								<button
									type="submit"
									className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
								>
									Run
								</button>
							</form>
						</div>
					</div>
				) : (
					/* Tools List */
					<div className="h-full overflow-y-auto p-4">
						<div className="space-y-3">
							{tools.map((tool) => (
								<div
									key={tool.id}
									className="bg-slate-800 rounded-lg p-4 border border-slate-700"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-2">
												{getStatusIcon(tool.status)}
												<h4 className="text-white font-medium">{tool.name}</h4>
												<span className="text-xs text-slate-500">({tool.server})</span>
											</div>
											<p className="text-slate-400 text-sm">{tool.description}</p>
										</div>
										<span className={`text-sm ${getStatusColor(tool.status)}`}>
											{tool.status}
										</span>
									</div>
								</div>
							))}
						</div>
						
						{tools.length === 0 && (
							<div className="text-center text-slate-500 mt-8">
								<div className="text-4xl mb-4">🔧</div>
								<p>No MCP tools available</p>
								<p className="text-sm mt-2">Check your MCP server configuration</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default MCPConsole;