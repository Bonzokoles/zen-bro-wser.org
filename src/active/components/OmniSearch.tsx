// src/active/components/OmniSearch.tsx
import React, { useState, useEffect } from 'react';
import type { SearchResult } from '../services/omnisearch';

interface OmniSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
  searchFunction: (query: string) => Promise<SearchResult[]>;
}

const OmniSearch: React.FC<OmniSearchProps> = ({ isOpen, onClose, onNavigate, searchFunction }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const performSearch = async () => {
      if (query.length > 1) {
        const searchResults = await searchFunction(query);
        setResults(searchResults);
      } else {
        setResults([]);
      }
    };
    performSearch();
  }, [query, searchFunction]);

  const handleResultClick = (url: string) => {
    onNavigate(url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
      width: '600px', zIndex: 3000,
    }}>
      <div style={{
        background: '#1e293b', borderRadius: '12px', border: '1px solid #334155',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tabs, bookmarks, and history..."
          autoFocus
          style={{
            width: '100%', padding: '16px', fontSize: '18px',
            background: 'transparent', border: 'none', color: 'white',
            borderBottom: '1px solid #334155'
          }}
        />
        {results.length > 0 && (
          <div style={{ padding: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {results.map((result, i) => (
              <div
                key={i}
                onClick={() => handleResultClick(result.url)}
                style={{
                  padding: '12px', borderRadius: '8px', display: 'flex',
                  alignItems: 'center', gap: '12px', cursor: 'pointer'
                }}
                className="omni-search-result"
              >
                <img src={result.favicon} style={{ width: '20px', height: '20px' }} alt="" />
                <div>
                  <div style={{ color: 'white', fontSize: '15px' }}>{result.title}</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>{result.url}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#334155', padding: '4px 6px', borderRadius: '4px', color: '#cbd5e1' }}>
                  {result.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OmniSearch;
