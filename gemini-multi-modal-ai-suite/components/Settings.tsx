import React, { useState, useEffect } from 'react';

export const Settings: React.FC = () => {
    const [openRouterKey, setOpenRouterKey] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        const storedKey = localStorage.getItem('openRouterApiKey') || '';
        setOpenRouterKey(storedKey);
    }, []);

    const handleSave = () => {
        setSaveStatus('saving');
        localStorage.setItem('openRouterApiKey', openRouterKey);
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-800">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h2 className="text-xl font-semibold">Settings</h2>
            </header>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-md mx-auto bg-white dark:bg-gray-900 p-6 shadow-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">API Keys</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="openrouter-key" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                                OpenRouter API Key
                            </label>
                            <input
                                type="password"
                                id="openrouter-key"
                                value={openRouterKey}
                                onChange={(e) => setOpenRouterKey(e.target.value)}
                                placeholder="sk-or-..."
                                className="mt-1 block w-full p-3 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Your key is stored securely in your browser's local storage.
                                Get one from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-500 dark:text-indigo-400 hover:underline">OpenRouter</a>.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-500 transition-colors"
                                disabled={saveStatus === 'saving'}
                            >
                                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};