import React, { useState } from 'react';

interface Bookmark {
    id: string;
    title: string;
    url: string;
    favicon: string;
    category?: string;
    createdAt?: number;
}

interface BrowserBookmarksPanelProps {
    isOpen: boolean;
    onClose: () => void;
    bookmarks: Bookmark[];
    onAddBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
    onRemoveBookmark: (id: string) => void;
    onOpenBookmark: (url: string) => void;
    theme: 'dark' | 'light';
}

export const BrowserBookmarksPanel: React.FC<BrowserBookmarksPanelProps> = ({
    isOpen,
    onClose,
    bookmarks,
    onAddBookmark,
    onRemoveBookmark,
    onOpenBookmark,
    theme
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
    const [newData, setNewData] = useState({
        title: '',
        url: '',
        favicon: '🌐',
        category: 'Inne'
    });

    const categories = ['Praca', 'Hobby', 'Nauka', 'Rozrywka', 'Narzędzia', 'Inne'];

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!newData.title || !newData.url) return;
        onAddBookmark(newData);
        setNewData({ title: '', url: '', favicon: '🌐', category: 'Inne' });
        setIsAdding(false);
    };

    const bgColor = theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95';
    const borderColor = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
    const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';

    return (
        <div className={`fixed top-[120px] left-0 right-0 h-[300px] z-[99] p-5 overflow-y-auto backdrop-blur-md border-b shadow-xl transition-all duration-300 ${bgColor} ${borderColor}`}>

            <div className="flex justify-between items-center mb-5">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${textColor}`}>
                    ⭐ Bookmarks
                </h3>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
                    >
                        ➕ Add New
                    </button>
                    <button
                        onClick={onClose}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className={`p-5 rounded-xl border mb-5 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="grid gap-4">
                        <input
                            type="text"
                            placeholder="Title"
                            value={newData.title}
                            onChange={e => setNewData({ ...newData, title: e.target.value })}
                            className="w-full p-2 rounded-lg bg-transparent border border-slate-500"
                        />
                        <input
                            type="text"
                            placeholder="URL"
                            value={newData.url}
                            onChange={e => setNewData({ ...newData, url: e.target.value })}
                            className="w-full p-2 rounded-lg bg-transparent border border-slate-500"
                        />
                        <div className="flex gap-4">
                            <select
                                value={newData.category}
                                onChange={e => setNewData({ ...newData, category: e.target.value })}
                                className="p-2 rounded-lg bg-transparent border border-slate-500"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button onClick={handleSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Save</button>
                            <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-slate-500 text-white rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {bookmarks
                    .filter(b => selectedCategory === 'Wszystkie' || b.category === selectedCategory)
                    .map(bookmark => (
                        <div
                            key={bookmark.id}
                            onClick={() => onOpenBookmark(bookmark.url)}
                            className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg
                                ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="text-2xl">{bookmark.favicon}</div>
                            <div className="flex-1 min-w-0">
                                <div className={`font-semibold truncate ${textColor}`}>{bookmark.title}</div>
                                <div className="text-xs text-slate-500 truncate">{bookmark.url}</div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveBookmark(bookmark.id);
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
            </div>
        </div>
    );
};
