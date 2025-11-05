import React, { useState, useEffect } from 'react';

interface AddressBarProps {
	url: string;
	isLoading: boolean;
	onNavigate: (url: string) => void;
}

const AddressBar: React.FC<AddressBarProps> = ({
	url,
	isLoading,
	onNavigate
}) => {
	const [inputUrl, setInputUrl] = useState(url);
	const [isSecure, setIsSecure] = useState(false);

	useEffect(() => {
		setInputUrl(url);
		setIsSecure(url.startsWith('https://'));
	}, [url]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		let finalUrl = inputUrl.trim();
		
		if (!finalUrl) return;
		
		// Add protocol if missing
		if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('about:')) {
			// Check if it looks like a domain
			if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
				finalUrl = 'https://' + finalUrl;
			} else {
				// Treat as search query
				finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}`;
			}
		}
		
		onNavigate(finalUrl);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputUrl(e.target.value);
	};

	const getSecurityIcon = () => {
		if (url.startsWith('about:')) {
			return (
				<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			);
		}
		
		return isSecure ? (
			<svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
			</svg>
		) : (
			<svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
		);
	};

	return (
		<div className="address-bar">
			<form onSubmit={handleSubmit} className="flex items-center space-x-3">
				<div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-slate-700/80 to-slate-800/80 backdrop-filter backdrop-blur-sm border border-slate-600 rounded-xl flex-1 min-w-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-blue-400/50">
					<div className="flex-shrink-0 hover:scale-110 transition-transform duration-200">
						{getSecurityIcon()}
					</div>
					
					<input
						type="text"
						value={inputUrl}
						onChange={handleInputChange}
						className="flex-1 bg-transparent text-white placeholder-slate-400 border-none outline-none text-sm min-w-0 font-medium"
						placeholder="🔍 Search or enter website address..."
						spellCheck={false}
					/>
					
					{isLoading && (
						<div className="flex-shrink-0">
							<div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
						</div>
					)}
				</div>
				
				<button
					type="submit"
					className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 backdrop-filter backdrop-blur-sm border border-blue-500/20"
				>
					<span className="flex items-center space-x-2">
						<span>Go</span>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</span>
				</button>
			</form>
		</div>
	);
};

export default AddressBar;