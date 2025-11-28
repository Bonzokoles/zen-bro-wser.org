import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';
import { FilterOptions, DateFilter, ContentTypeFilter } from '../types';
import { useLanguage } from '../context/LanguageProvider';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: FilterOptions;
    onSave: (newFilters: FilterOptions) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentFilters, onSave }) => {
    const [filters, setFilters] = useState<FilterOptions>(currentFilters);
    const { t } = useLanguage();

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(filters);
        onClose();
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, date: e.target.value as DateFilter }));
    };
    
    const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, contentType: e.target.value as ContentTypeFilter }));
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 shadow-xl p-8 max-w-md w-full mx-4 relative border border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    aria-label="Close modal"
                >
                    <XIcon className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-white mb-6">{t('settingsTitle')}</h2>
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="date-filter" className="block text-sm font-medium text-slate-300 mb-2">
                            {t('dateFilter')}
                        </label>
                        <select
                            id="date-filter"
                            value={filters.date}
                            onChange={handleDateChange}
                            className="appearance-none bg-slate-800 border border-slate-700 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                        >
                            <option value="any">{t('anyTime')}</option>
                            <option value="day">{t('pastDay')}</option>
                            <option value="week">{t('pastWeek')}</option>
                            <option value="month">{t('pastMonth')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="content-type-filter" className="block text-sm font-medium text-slate-300 mb-2">
                            {t('contentTypeFilter')}
                        </label>
                        <select
                            id="content-type-filter"
                            value={filters.contentType}
                            onChange={handleContentTypeChange}
                            className="appearance-none bg-slate-800 border border-slate-700 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                        >
                            <option value="any">{t('anyType')}</option>
                            <option value="articles">{t('articles')}</option>
                            <option value="blogs">{t('blogs')}</option>
                            <option value="forums">{t('forums')}</option>
                            <option value="academic">{t('academic')}</option>
                        </select>
                    </div>
                </div>

                <div className="mt-8 text-right">
                    <button
                        onClick={handleSave}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 transition-colors"
                    >
                        {t('saveSettings')}
                    </button>
                </div>
            </div>
        </div>
    );
};