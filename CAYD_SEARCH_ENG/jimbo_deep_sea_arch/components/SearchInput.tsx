import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { useLanguage } from '../context/LanguageProvider';

interface SearchInputProps {
    onSearch: (topic: string) => void;
    isLoading: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading }) => {
    const [topic, setTopic] = useState('');
    const { t } = useLanguage();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim() && !isLoading) {
            onSearch(topic.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t('searchInputPlaceholder')}
                disabled={isLoading}
                className="flex-grow bg-slate-800 text-white placeholder-slate-500 border border-slate-700 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-600 disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
                ) : (
                    <>
                        <SearchIcon className="h-5 w-5 mr-2" />
                        {t('searchButtonText')}
                    </>
                )}
            </button>
        </form>
    );
};