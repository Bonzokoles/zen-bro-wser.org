/**
 * Address Bar Component
 */

import React, { useState, useEffect } from 'react';

interface AddressBarProps {
  url: string;
  onNavigate: (url: string) => void;
  loading: boolean;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  url,
  onNavigate,
  loading,
}) => {
  const [input, setInput] = useState(url);

  useEffect(() => {
    setInput(url);
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = input;

    // Add http:// if no protocol
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    onNavigate(finalUrl);
  };

  return (
    <form className="address-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter URL or search..."
        disabled={loading}
        className="address-input"
      />
      <button type="submit" disabled={loading} className="btn-navigate">
        {loading ? (
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.9s linear infinite', display: 'block' }}>
            <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
          </svg>
        ) : (
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
            <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
          </svg>
        )}
      </button>
    </form>
  );
};