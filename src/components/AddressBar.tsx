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
        {loading ? '⟳' : '→'}
      </button>
    </form>
  );
};