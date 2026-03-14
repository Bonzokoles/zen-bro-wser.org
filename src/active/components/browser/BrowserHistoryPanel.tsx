import React from 'react';

interface HistoryItem {
    id: string;
    url: string;
    title: string;
    visitedAt: Date;
    favicon: string;
}

interface BrowserHistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onClearHistory: () => void;
    onOpenHistoryItem: (url: string) => void;
    theme: 'dark' | 'light';
}

export const BrowserHistoryPanel: React.FC<BrowserHistoryPanelProps> = ({
    isOpen,
    onClose,
    history,
    onClearHistory,
    onOpenHistoryItem,
    theme
}) => {
    if (!isOpen) return null;

    const bgColor = theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95';
    const borderColor = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
    const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';

    return (
        <div className={`fixed top-[120px] left-0 right-0 h-[400px] z-[99] p-5 overflow-y-auto backdrop-blur-md border-b shadow-xl transition-all duration-300 ${bgColor} ${borderColor}`}>

            <div className="flex justify-between items-center mb-5">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${textColor}`}>
                    📜 History
                </h3>
                <div className="flex gap-3">
                    <button
                        onClick={onClearHistory}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onClose}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {history.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                        No history yet. Start browsing!
                    </div>
                ) : (
                    history.map(item => (
                        <div
                            key={item.id}
                            onClick={() => onOpenHistoryItem(item.url)}
                            className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all hover:translate-x-1
                                ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                        >
                            <span className="text-xl">{item.favicon}</span>
                            <div className="flex-1 min-w-0">
                                <div className={`font-medium truncate ${textColor}`}>{item.title}</div>
                                <div className="text-xs text-slate-500 truncate">{item.url}</div>
                            </div>
                            <div className="text-xs text-slate-500 whitespace-nowrap">
                                {new Date(item.visitedAt).toLocaleTimeString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
