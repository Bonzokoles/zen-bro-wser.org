import React from 'react';
import { useLanguage } from '../context/LanguageProvider';

export const LanguageSwitcher: React.FC = () => {
    const { locale, setLocale } = useLanguage();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocale(e.target.value as 'en' | 'pl');
    };

    return (
        <div className="relative">
            <select
                value={locale}
                onChange={handleLanguageChange}
                className="appearance-none bg-slate-800 border border-slate-700 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-3 pr-10 py-2"
                aria-label="Select language"
            >
                <option value="en">EN</option>
                <option value="pl">PL</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
            </div>
        </div>
    );
};