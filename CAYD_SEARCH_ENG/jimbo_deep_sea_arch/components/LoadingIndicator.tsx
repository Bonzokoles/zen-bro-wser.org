import React from 'react';
import { useLanguage } from '../context/LanguageProvider';

export const LoadingIndicator: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center p-8 mt-10">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-500 mb-4"></div>
            <p className="text-slate-300">{t('loading')}</p>
        </div>
    );
};
