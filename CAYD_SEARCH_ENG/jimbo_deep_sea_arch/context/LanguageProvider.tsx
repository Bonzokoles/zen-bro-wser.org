import React, { createContext, useState, useContext, ReactNode } from 'react';
import { en } from '../locales/en';
import { pl } from '../locales/pl';

type Locale = 'en' | 'pl';
type TranslationKey = keyof typeof en;

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKey) => string;
}

const translations = { en, pl };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocale] = useState<Locale>('en');

    const t = (key: TranslationKey): string => {
        return translations[locale][key] || translations['en'][key];
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
