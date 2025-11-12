import React, { useState } from 'react';

interface SearchPageProps {
  onSearch: (query: string) => void;
}

export default function SearchPage({ onSearch }: SearchPageProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginBottom: '3rem',
        }}
      >
        <h1
          style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem',
            textShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          🔍 ZENO Search
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          Powered by Tavily AI - Search the web with advanced AI capabilities
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '700px',
        }}
      >
        <div
          style={{
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            borderRadius: '50px',
            overflow: 'hidden',
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web with AI..."
            autoFocus
            style={{
              width: '100%',
              padding: '1.5rem 5rem 1.5rem 2rem',
              fontSize: '1.1rem',
              border: 'none',
              outline: 'none',
              background: 'white',
              color: '#333',
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '0.8rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            Search
          </button>
        </div>
      </form>

      <div
        style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: '700px',
        }}
      >
        {[
          { icon: '🌐', text: 'Web Search', desc: 'Search entire web' },
          { icon: '📰', text: 'News', desc: 'Latest news' },
          { icon: '📚', text: 'Deep Research', desc: 'Detailed analysis' },
          { icon: '🖼️', text: 'With Images', desc: 'Image results' },
        ].map((feature, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              padding: '1.5rem',
              borderRadius: '15px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {feature.icon}
            </div>
            <div
              style={{
                color: 'white',
                fontWeight: '600',
                marginBottom: '0.25rem',
              }}
            >
              {feature.text}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
              {feature.desc}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '3rem',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '0.9rem',
          textAlign: 'center',
        }}
      >
        <p>
          🚀 Advanced features: Time filters, Domain search, Topic filtering
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          💡 Just type your query and we'll handle the rest
        </p>
      </div>
    </div>
  );
}
