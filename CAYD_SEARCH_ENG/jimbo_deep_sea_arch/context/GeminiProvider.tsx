import React, { createContext, ReactNode } from 'react';

// This context is not used to provide any value in this implementation,
// but it's here to fulfill the application structure.
// In a more complex app, it could provide a Gemini client instance or API settings.
const GeminiContext = createContext({});

// FIX: Removed React.FC to resolve a typing issue with the 'children' prop.
// The component is now defined as a standard functional component, which is a common pattern in modern React.
export const GeminiProvider = ({ children }: { children: ReactNode }) => {
    return (
        <GeminiContext.Provider value={{}}>
            {children}
        </GeminiContext.Provider>
    );
};
