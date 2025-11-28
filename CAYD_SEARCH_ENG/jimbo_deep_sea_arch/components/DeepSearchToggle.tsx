
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface DeepSearchToggleProps {
    isDeepSearch: boolean;
    setIsDeepSearch: (isDeep: boolean) => void;
    disabled: boolean;
}

export const DeepSearchToggle: React.FC<DeepSearchToggleProps> = ({ isDeepSearch, setIsDeepSearch, disabled }) => {
    const toggleClasses = isDeepSearch ? 'bg-cyan-500' : 'bg-slate-700';
    const switchClasses = isDeepSearch ? 'translate-x-full' : 'translate-x-0';

    return (
        <button
            onClick={() => setIsDeepSearch(!isDeepSearch)}
            disabled={disabled}
            className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 ${toggleClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title="Toggle Deep Search"
        >
            <span className="sr-only">Toggle Deep Search</span>
            <span
                className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ease-in-out mx-1 flex items-center justify-center ${switchClasses}`}
            >
              {isDeepSearch && <SparklesIcon className="w-4 h-4 text-cyan-500" />}
            </span>
        </button>
    );
};