import React from 'react';

interface BrowserHeaderProps {
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    currentPlan: string;
    inputUrl: string;
    setInputUrl: (url: string) => void;
    handleUrlSubmit: (e: React.FormEvent) => void;
}

export const BrowserHeader: React.FC<BrowserHeaderProps> = ({
    theme,
    toggleTheme,
    currentPlan,
    inputUrl,
    setInputUrl,
    handleUrlSubmit
}) => {
    return (
        <div className={`fixed top-0 left-0 right-0 z-[100] px-5 py-3 border-b backdrop-blur-md shadow-lg transition-colors duration-300
            ${theme === 'dark' ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
            
            <div className="flex items-center gap-5">
                {/* Logo */}
                <div className={`flex items-center gap-3 font-bold text-lg ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/40 bg-gradient-to-br from-indigo-500 to-purple-600">
                        ⚡
                    </div>
                    <span>ZENO_WEB_CORE</span>
                </div>

                {/* Plan Badge */}
                <div
                    onClick={() => {
                        if (currentPlan === 'free') {
                            window.open('/pricing', '_blank');
                        }
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wide cursor-default transition-all duration-300 flex items-center gap-1.5 shadow-md
                        ${currentPlan === 'free' 
                            ? 'bg-gradient-to-br from-slate-400 to-slate-500 cursor-pointer hover:scale-105 hover:shadow-indigo-500/40' 
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/40'}`}
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
                    className="px-4 py-2 rounded-lg text-white font-semibold cursor-pointer transition-all duration-300 shadow-md hover:scale-105 bg-gradient-to-br from-yellow-300 to-orange-400 shadow-yellow-300/40 border-none"
                >
                    {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </button>

                {/* Search Bar */}
                <form onSubmit={handleUrlSubmit} className="flex-1 max-w-2xl relative">
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        className={`w-full border-2 rounded-full py-3.5 pl-5 pr-14 text-base outline-none transition-all duration-300 shadow-sm focus:border-indigo-500 focus:shadow-md
                            ${theme === 'dark' 
                                ? 'bg-slate-950 text-slate-100 border-slate-700 placeholder-slate-500' 
                                : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'}`}
                        placeholder="Search or enter URL..."
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-300 hover:scale-110 bg-gradient-to-br from-indigo-500 to-purple-600 border-none"
                    >
                        🔍
                    </button>
                </form>
            </div>
        </div>
    );
};
