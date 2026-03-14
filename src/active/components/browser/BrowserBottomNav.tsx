import React from 'react';

interface BrowserBottomNavProps {
    theme: 'dark' | 'light';
    states: {
        isConsoleOpen: boolean;
        showBookmarks: boolean;
        showHistory: boolean;
        showTools: boolean;
        isLocalChatOpen: boolean;
        isWikipediaOpen: boolean;
        isOnThisDayOpen: boolean;
        isBirthdaySongOpen: boolean;
        isChatOpen: boolean;
        isMusicPlayerOpen: boolean;
        isVideoPlayerOpen: boolean;
        isAdminPanelOpen: boolean;
        isSettingsOpen: boolean;
    };
    actions: {
        toggleConsole: () => void;
        toggleBookmarks: () => void;
        toggleHistory: () => void;
        toggleTools: () => void;
        toggleLocalChat: () => void;
        toggleWikipedia: () => void;
        toggleOnThisDay: () => void;
        toggleBirthdaySong: () => void;
        toggleChat: () => void;
        toggleMusicPlayer: () => void;
        toggleVideoPlayer: () => void;
        openAdminPanel: () => void;
        openWidgets: () => void;
        openSettings: () => void;
        addBookmark: () => void;
    };
}

interface NavButtonProps {
    isActive?: boolean;
    onClick: () => void;
    icon: string;
    label: string;
    colorClass?: string; // e.g. 'from-indigo-500 to-purple-600'
    theme: 'dark' | 'light';
}

const NavButton: React.FC<NavButtonProps> = ({ isActive, onClick, icon, label, colorClass = 'from-slate-500 to-slate-600', theme }) => {
    const activeBg = `bg-gradient-to-br ${colorClass}`;
    const inactiveBg = theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10';

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl min-w-[80px] transition-all duration-300 border-none cursor-pointer backdrop-blur-md
                ${isActive ? `${activeBg} text-white shadow-lg scale-105` : `${inactiveBg} text-current hover:-translate-y-0.5`}`}
        >
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
};

export const BrowserBottomNav: React.FC<BrowserBottomNavProps> = ({ theme, states, actions }) => {
    const containerClass = theme === 'dark'
        ? 'bg-slate-900/80 border-slate-700 text-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.5)]'
        : 'bg-white/80 border-slate-200 text-slate-700 shadow-[0_-4px_20px_rgba(255,255,255,0.5)]';

    return (
        <div className={`fixed bottom-0 left-0 right-0 h-[80px] backdrop-blur-xl border-t flex items-center justify-around px-5 z-[1000] ${containerClass}`}>

            <NavButton
                theme={theme}
                isActive={states.isConsoleOpen}
                onClick={actions.toggleConsole}
                icon="🔧"
                label="MCP Tools"
                colorClass="from-slate-600 to-slate-800"
            />

            <NavButton
                theme={theme}
                isActive={states.showBookmarks}
                onClick={actions.toggleBookmarks}
                icon="⭐"
                label="Bookmarks"
                colorClass="from-yellow-400 to-orange-500"
            />

            <NavButton
                theme={theme}
                isActive={states.showHistory}
                onClick={actions.toggleHistory}
                icon="📜"
                label="History"
                colorClass="from-blue-400 to-indigo-500"
            />

            <NavButton
                theme={theme}
                isActive={states.showTools}
                onClick={actions.toggleTools}
                icon="🛠️"
                label="Tools"
                colorClass="from-amber-500 to-orange-600"
            />

            <NavButton
                theme={theme}
                isActive={states.isLocalChatOpen}
                onClick={actions.toggleLocalChat}
                icon="🦙"
                label="Local AI"
                colorClass="from-violet-500 to-purple-600"
            />

            <NavButton
                theme={theme}
                isActive={states.isWikipediaOpen}
                onClick={actions.toggleWikipedia}
                icon="📚"
                label="Wikipedia"
                colorClass="from-blue-500 to-cyan-600"
            />

            <NavButton
                theme={theme}
                isActive={states.isOnThisDayOpen}
                onClick={actions.toggleOnThisDay}
                icon="📅"
                label="On This Day"
                colorClass="from-blue-600 to-indigo-700"
            />

            <NavButton
                theme={theme}
                isActive={states.isBirthdaySongOpen}
                onClick={actions.toggleBirthdaySong}
                icon="🎵"
                label="Birthday"
                colorClass="from-pink-500 to-rose-600"
            />

            <NavButton
                theme={theme}
                onClick={actions.addBookmark}
                icon="➕"
                label="Add"
                colorClass="from-emerald-500 to-teal-600"
            />

            <NavButton
                theme={theme}
                isActive={states.isChatOpen}
                onClick={actions.toggleChat}
                icon="🤖"
                label="AI Chat"
                colorClass="from-indigo-500 to-violet-600"
            />

            <NavButton
                theme={theme}
                isActive={states.isMusicPlayerOpen}
                onClick={actions.toggleMusicPlayer}
                icon="🎵"
                label="Music"
                colorClass="from-fuchsia-400 to-pink-500"
            />

            <NavButton
                theme={theme}
                isActive={states.isVideoPlayerOpen}
                onClick={actions.toggleVideoPlayer}
                icon="🎬"
                label="Video"
                colorClass="from-amber-500 to-yellow-600"
            />

            <NavButton
                theme={theme}
                isActive={states.isAdminPanelOpen}
                onClick={actions.openAdminPanel}
                icon="🔐"
                label="Admin"
                colorClass="from-red-600 to-red-800"
            />

            <NavButton
                theme={theme}
                onClick={actions.openWidgets}
                icon="🎨"
                label="Widgets"
                colorClass="from-violet-500 to-purple-700"
            />

            <NavButton
                theme={theme}
                isActive={states.isSettingsOpen}
                onClick={actions.openSettings}
                icon="⚙️"
                label="Settings"
                colorClass="from-slate-500 to-slate-700"
            />
        </div>
    );
};
