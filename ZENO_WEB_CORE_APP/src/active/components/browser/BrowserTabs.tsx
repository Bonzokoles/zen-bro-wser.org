import React from 'react';

export interface Tab {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
    isLoading: boolean;
    favicon?: string;
}

interface BrowserTabsProps {
    tabs: Tab[];
    activeTabId?: string;
    onSwitchTab: (id: string) => void;
    onCloseTab: (id: string) => void;
    onCreateTab: () => void;
    theme: 'dark' | 'light';
}

export const BrowserTabs: React.FC<BrowserTabsProps> = ({
    tabs,
    activeTabId,
    onSwitchTab,
    onCloseTab,
    onCreateTab,
    theme
}) => {
    return (
        <div className={`flex items-center gap-1 px-2 pt-2 overflow-x-auto no-scrollbar select-none
            ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>

            {tabs.map(tab => (
                <div
                    key={tab.id}
                    onClick={() => onSwitchTab(tab.id)}
                    className={`group relative flex items-center gap-2 px-3 py-2 rounded-t-lg min-w-[160px] max-w-[240px] cursor-pointer transition-all duration-200 border-b-0
                        ${tab.isActive
                            ? (theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-sm')
                            : (theme === 'dark' ? 'bg-transparent text-slate-400 hover:bg-slate-800/50' : 'bg-transparent text-slate-500 hover:bg-slate-200')
                        }`}
                >
                    {/* Favicon / Loading Spinner */}
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {tab.isLoading ? (
                            <div className={`w-3 h-3 border-2 border-t-transparent rounded-full animate-spin
                                ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`} />
                        ) : (
                            <span className="text-sm">{tab.favicon || '📄'}</span>
                        )}
                    </div>

                    {/* Title */}
                    <span className="text-xs font-medium truncate flex-1">
                        {tab.title || 'New Tab'}
                    </span>

                    {/* Close Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCloseTab(tab.id);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
                            ${theme === 'dark' ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-slate-300 text-slate-600'}`}
                    >
                        ×
                    </button>

                    {/* Active Indicator Line */}
                    {tab.isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                </div>
            ))}

            {/* New Tab Button */}
            <button
                onClick={onCreateTab}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ml-1
                    ${theme === 'dark'
                        ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
                title="New Tab"
            >
                +
            </button>
        </div>
    );
};
