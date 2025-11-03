import React from 'react';

const SimpleBrowser: React.FC = () => {
	return (
		<div className="min-h-screen text-white p-8 relative z-10">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold mb-6">
					🚀 ZENO Browser - Simple Version
				</h1>
				
				<div className="bg-slate-800/80 backdrop-blur-lg rounded-lg p-6 mb-6 border border-slate-600/30">
					<h2 className="text-2xl mb-4">Browser Interface</h2>
					<div className="bg-slate-700/80 backdrop-blur-sm rounded p-4 mb-4 border border-slate-500/30">
						<input 
							type="text" 
							placeholder="Enter URL or search term..."
							className="w-full bg-slate-600 text-white p-2 rounded"
						/>
					</div>
					<div className="bg-white text-black p-8 rounded min-h-64 flex items-center justify-center">
						<div className="text-center">
							<h3 className="text-2xl mb-2">Welcome to ZENO Browser</h3>
							<p>Enter a URL above to start browsing</p>
						</div>
					</div>
				</div>
				
				<div className="bg-slate-800/80 backdrop-blur-lg rounded-lg p-4 border border-slate-600/30">
					<h3 className="text-lg mb-2">Status</h3>
					<p className="text-green-400">✅ React component loaded successfully</p>
					<p className="text-blue-400">✅ Tailwind CSS working</p>
					<p className="text-purple-400">✅ Astro integration functional</p>
				</div>
			</div>
		</div>
	);
};

export default SimpleBrowser;