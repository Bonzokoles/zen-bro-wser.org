import React, { useState, useRef, useCallback } from 'react';
import { SearchInput } from './components/SearchInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingIndicator } from './components/LoadingIndicator';
import { DeepSearchToggle } from './components/DeepSearchToggle';
import { AboutModal } from './components/AboutModal';
import { SettingsModal } from './components/SettingsModal';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { GeminiProvider } from './context/GeminiProvider';
import { LanguageProvider, useLanguage } from './context/LanguageProvider';
import { performSearch, SearchResult } from './services/geminiService';
import { FilterOptions } from './types';
import { InfoIcon } from './components/icons/InfoIcon';
import { SettingsIcon } from './components/icons/SettingsIcon';

const AppContent: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [result, setResult] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDeepSearch, setIsDeepSearch] = useState(false);
    
    const [isAboutModalOpen, setAboutModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

    const [filters, setFilters] = useState<FilterOptions>({
        date: 'any',
        contentType: 'any',
    });

    const abortControllerRef = useRef<AbortController | null>(null);
    const { t } = useLanguage();

    const handleSearch = useCallback(async (searchTopic: string) => {
        if (isLoading) {
            // Cancel previous request if a new one is started
            abortControllerRef.current?.abort();
        }

        setIsLoading(true);
        setError(null);
        setResult(null);
        setTopic(searchTopic);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const searchResult = await performSearch(searchTopic, isDeepSearch, filters, controller.signal);
            setResult(searchResult);
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err.message || t('errorMessage'));
            }
        } finally {
            setIsLoading(false);
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
    }, [isLoading, isDeepSearch, filters, t]);

    return (
        <div className="bg-slate-950 min-h-screen text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        {/* Placeholder for the logo */}
                        <div className="w-10 h-10 bg-slate-700 border-2 border-slate-600 animate-pulse flex items-center justify-center">
                            <span className="text-xs text-slate-500">.png</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white">{t('appTitle')}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                         <button 
                            onClick={() => setSettingsModalOpen(true)} 
                            className="p-2 hover:bg-slate-800 transition-colors"
                            title={t('settingsButton')}
                         >
                           <SettingsIcon className="h-6 w-6 text-slate-400" />
                        </button>
                        <button 
                            onClick={() => setAboutModalOpen(true)} 
                            className="p-2 hover:bg-slate-800 transition-colors"
                            title={t('aboutButton')}
                        >
                            <InfoIcon className="h-6 w-6 text-slate-400" />
                        </button>
                    </div>
                </header>

                <p className="text-slate-400 mb-8">{t('appDescription')}</p>

                <div className="bg-slate-900 p-6 shadow-lg border border-slate-700">
                    <SearchInput onSearch={handleSearch} isLoading={isLoading} />
                    <div className="flex items-center gap-4 mt-4">
                        <DeepSearchToggle isDeepSearch={isDeepSearch} setIsDeepSearch={setIsDeepSearch} disabled={isLoading} />
                        <label className="text-sm text-slate-300">{t('deepSearchLabel')}</label>
                    </div>
                </div>

                {isLoading && <LoadingIndicator />}
                {error && (
                    <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 p-4">
                        <h3 className="font-bold">{t('errorTitle')}</h3>
                        <p>{error}</p>
                    </div>
                )}
                
                {result && <ResultsDisplay result={result} topic={topic} />}

                <AboutModal isOpen={isAboutModalOpen} onClose={() => setAboutModalOpen(false)} />
                <SettingsModal 
                    isOpen={isSettingsModalOpen} 
                    onClose={() => setSettingsModalOpen(false)}
                    currentFilters={filters}
                    onSave={setFilters}
                />
            </div>
        </div>
    );
};


const App: React.FC = () => {
  return (
    <LanguageProvider>
      <GeminiProvider>
        <AppContent />
      </GeminiProvider>
    </LanguageProvider>
  );
};

export default App;