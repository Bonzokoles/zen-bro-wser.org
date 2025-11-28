import React from 'react';
import { XIcon } from './icons/XIcon';
import { useLanguage } from '../context/LanguageProvider';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 shadow-xl p-8 max-w-2xl w-full mx-4 relative border border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    aria-label="Close modal"
                >
                    <XIcon className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-white mb-4">{t('aboutTitle')}</h2>
                <p className="text-slate-300 leading-relaxed">
                    {t('aboutText')}
                </p>
            </div>
        </div>
    );
};