// src/active/components/ReaderMode.tsx
import React, { useState, useEffect } from 'react';
import { ReaderMode as ReaderModeService, ReaderContent } from '../services/reader-mode';

interface ReaderModeProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const ReaderMode: React.FC<ReaderModeProps> = ({ isOpen, onClose, url }) => {
  const [article, setArticle] = useState<ReaderContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');

  useEffect(() => {
    if (!isOpen || !url) {
      setArticle(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const readerService = new ReaderModeService();
    setIsLoading(true);
    setError(null);
    setArticle(null);

    readerService.extractArticle(url)
      .then(content => {
        setArticle(content);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, url]);

  const themeStyles = {
    light: { background: '#ffffff', text: '#1e293b' },
    sepia: { background: '#f4ecd8', text: '#5b4636' },
    dark: { background: '#1a202c', text: '#e2e8f0' }
  };

  const currentTheme = themeStyles[theme];

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: currentTheme.background, zIndex: 2500,
      overflowY: 'auto', color: currentTheme.text,
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Controls */}
      <div style={{
        position: 'sticky', top: 0, padding: '16px', borderBottom: '1px solid #e2e8f0',
        backgroundColor: `${currentTheme.background}e0`, backdropFilter: 'blur(8px)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <button
            onClick={onClose}
            style={{
              background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px',
              padding: '8px 16px', cursor: 'pointer', fontSize: '14px'
            }}
          >
            ← Back to Browser
          </button>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setFontSize(s => Math.max(s - 2, 12))}
                style={{ background: '#334155', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(s => Math.min(s + 2, 32))}
                style={{ background: '#334155', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}
              >
                A+
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {(['light', 'sepia', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    padding: '6px 12px', borderRadius: '4px', border: 'none',
                    background: theme === t ? '#6366f1' : '#334155',
                    color: 'white', cursor: 'pointer', fontSize: '13px'
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        {isLoading && <p style={{ textAlign: 'center' }}>Loading reading mode...</p>}
        {error && <p style={{ textAlign: 'center', color: '#ef4444' }}>Error: {error}</p>}
        {article && (
          <>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>{article.title}</h1>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              {article.author && <span style={{ marginRight: '16px' }}>By {article.author}</span>}
              {article.publishedDate && <span style={{ marginRight: '16px' }}>{new Date(article.publishedDate).toLocaleDateString()}</span>}
              <span>{article.readingTime} min read</span>
            </div>
            <div
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </>
        )}
      </article>
    </div>
  );
};

export default ReaderMode;
