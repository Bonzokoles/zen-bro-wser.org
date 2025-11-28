import React from 'react';

interface BrowserToolsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    theme: 'dark' | 'light';
}

export const BrowserToolsPanel: React.FC<BrowserToolsPanelProps> = ({
    isOpen,
    onClose,
    theme
}) => {
    if (!isOpen) return null;

    const bgColor = theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95';
    const borderColor = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
    const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';

    const tools = [
        { href: '/iframe-tester', icon: '🧪', title: 'Iframe Tester', desc: 'Test iframe compatibility & load times', color: 'from-indigo-500 to-purple-600' },
        { href: '/agents', icon: '🤖', title: 'Agents Manager', desc: 'Manage AI agents (BIELIK, Gemini)', color: 'from-fuchsia-400 to-pink-500' },
        { href: '/admin', icon: '🛡️', title: 'Admin Panel', desc: 'System configuration & stats', color: 'from-rose-400 to-orange-400' },
        { href: '/advanced-search', icon: '🔍', title: 'Advanced Search', desc: 'Full-featured search with filters', color: 'from-sky-400 to-cyan-400' },
        { href: '/search-demo', icon: '⚡', title: 'Search Demo', desc: 'Quick search interface', color: 'from-teal-400 to-emerald-400' },
        {
            href: '#',
            icon: '🌐',
            title: 'CAYD Browser',
            desc: 'Launch standalone local browser',
            color: 'from-blue-500 to-indigo-600',
            onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                alert('To launch the standalone CAYD Browser, please run the "LAUNCH_CAYD.bat" file located in your project root folder.');
            }
        },
        { href: '/debug', icon: '🐛', title: 'Debug Console', desc: 'Developer tools & diagnostics', color: 'from-red-400 to-pink-400' },
        { href: '/about', icon: 'ℹ️', title: 'About', desc: 'Learn about ZENO Web Core', color: 'from-green-400 to-cyan-400' },
        { href: '/video-demo', icon: '🎬', title: 'Video Players', desc: 'YouTube & Internet Archive', color: 'from-violet-400 to-indigo-400' },
        { href: '/orchestrator', icon: '🎭', title: 'Orchestrator', desc: 'AI content classification', color: 'from-purple-400 to-fuchsia-400' },
        { href: '/', icon: '🏠', title: 'Home', desc: 'Return to main interface', color: 'from-slate-500 to-slate-600' },
    ];

    return (
        <div className={`fixed top-[120px] left-0 right-0 h-[500px] z-[99] p-5 overflow-y-auto backdrop-blur-md border-b shadow-xl transition-all duration-300 ${bgColor} ${borderColor}`}>

            <div className="flex justify-between items-center mb-5">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${textColor}`}>
                    🛠️ Tools & Features
                </h3>
                <button
                    onClick={onClose}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                >
                    ✕
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tools.map((tool, index) => (
                    <a
                        key={index}
                        href={tool.href}
                        onClick={tool.onClick}
                        className={`group p-4 rounded-xl border flex items-start gap-3 transition-all hover:-translate-y-1 hover:shadow-lg no-underline cursor-pointer
                            ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${tool.color} text-white shadow-lg`}>
                            {tool.icon}
                        </div>
                        <div className="flex-1">
                            <div className={`font-bold mb-1 group-hover:text-indigo-500 transition-colors ${textColor}`}>
                                {tool.title}
                            </div>
                            <div className="text-xs text-slate-500 leading-relaxed">
                                {tool.desc}
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
