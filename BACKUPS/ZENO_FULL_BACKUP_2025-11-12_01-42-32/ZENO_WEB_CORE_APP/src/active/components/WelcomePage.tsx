import React, { useState, useRef, useEffect } from 'react';

const WelcomePage: React.FC = () => {
  const [showMoreSites, setShowMoreSites] = useState(false);
  const [activeTab, setActiveTab] = useState<'popular' | 'niche'>('popular');

  // Inject keyframes for logo pulse animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes logoPulse {
        0%, 100% {
          filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.8));
        }
        50% {
          filter: drop-shadow(0 0 35px rgba(96, 165, 250, 1));
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // AI Assistant state
  const [showQuickChat, setShowQuickChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemma-7b');
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Function to send message to AI
  const handleSendToAI = async () => {
    if (!chatInput.trim() || isAiLoading) return;

    setIsAiLoading(true);
    setAiResponse('');

    try {
      // Use RAG to enhance prompt
      const { getRAG } = await import('../../services/simpleRagService');
      const rag = getRAG();

      // Initialize RAG if not already
      await rag.init();

      // Build prompt with context
      const enhancedPrompt = rag.buildPrompt(chatInput);

      // Call AI
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          model: selectedModel,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI request failed');
      }

      const data = await response.json();
      setAiResponse(data.response);

    } catch (error: any) {
      console.error('AI error:', error);
      setAiResponse(`❌ Błąd: ${error.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ height: '100%', overflow: 'auto', paddingTop: '120px', paddingBottom: '90px' }}>
      <div className="page-header" style={{
        textAlign: 'center',
        margin: '2rem 0 3rem 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '1rem' }}>
          <img
            src="/apple-touch-icon.png"
            alt="ZENO Logo"
            style={{
              width: '120px',
              height: '120px',
              animation: 'logoPulse 3s ease-in-out infinite'
            }}
          />
          <h1 style={{
            fontSize: '5.625rem',
            fontWeight: '800',
            margin: '0',
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            ZENO_BRO_wser_CORE
          </h1>
        </div>
        <p style={{
          color: '#94a3b8',
          fontSize: '1.2rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Advanced_Web_IfrAME_BRO_wser_MCP_AGENTAMI_from_deep_side_of_net
        </p>
      </div>

      {/* Search Island - Osobna wyspa wyszukiwania */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto -3px',
        padding: '0px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
        border: '2px solid rgba(96, 165, 250, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{
          color: '#60a5fa',
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: '700',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          🔍 Centrum Wyszukiwania
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          {/* LOKALNA Wyszukiwarka */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>📚</span>
              <h4 style={{
                color: '#10b981',
                fontSize: '14px',
                fontWeight: '700',
                margin: 0
              }}>
                LOKALNA BIBLIOTEKA
              </h4>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector('input');
                if (input && input.value.trim()) {
                  const event = new CustomEvent('navigate', {
                    detail: { url: `about:local-search?q=${encodeURIComponent(input.value)}` }
                  });
                  window.dispatchEvent(event);
                }
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                placeholder="Szukaj w LIBRARIES/..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '14px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Szukaj
              </button>
            </form>
          </div>

          {/* WEBOWA Wyszukiwarka */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>🌐</span>
              <h4 style={{
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: '700',
                margin: 0
              }}>
                WYSZUKIWARKA INTERNETOWA
              </h4>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                if (input && input.value.trim()) {
                  try {
                    // Search in CAYD library
                    const response = await fetch(`/api/cayd/search?q=${encodeURIComponent(input.value)}`);
                    if (response.ok) {
                      const results = await response.json();
                      // Show results in library panel
                      const event = new CustomEvent('cayd-search-results', { detail: results });
                      window.dispatchEvent(event);
                    } else {
                      // Fallback to Google search
                      const event = new CustomEvent('navigate', {
                        detail: { url: `https://www.google.com/search?q=${encodeURIComponent(input.value)}` }
                      });
                      window.dispatchEvent(event);
                    }
                  } catch (error) {
                    console.error('Search error:', error);
                    // Fallback to Google
                    const event = new CustomEvent('navigate', {
                      detail: { url: `https://www.google.com/search?q=${encodeURIComponent(input.value)}` }
                    });
                    window.dispatchEvent(event);
                  }
                }
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                placeholder="Szukaj w CAYD_search_hub..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '14px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Szukaj
              </button>
            </form>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '-35px',
        backgroundColor: 'transparent',
        padding: '24px',
        textAlign: 'left'
      }}>
        <h3 style={{
          fontSize: '35px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '16px'
        }}>
          🎯 Strony do przetestowania
        </h3>
        <p style={{
          color: '#94a3b8',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          ⚠️ Google, Facebook, YouTube, Twitter blokują iframe (X-Frame-Options).
          <br />Poniższe strony <strong>działają</strong> bez ograniczeń:
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '16px'
        }}>
          {[
            { name: '🌐 Example.com', url: 'https://example.com' },
            { name: '🔧 HTTPBin API', url: 'https://httpbin.org' },
            { name: '📰 Wikipedia', url: 'https://en.wikipedia.org' },
            { name: '📚 Archive Blog', url: 'https://blog.archive.org' },
            { name: '🎨 Art UK', url: 'https://artuk.org' },
            { name: '💻 Carbon', url: 'https://carbon.now.sh' },
            { name: '� CSS Tricks', url: 'https://css-tricks.com' },
            { name: '📺 Dailymotion', url: 'https://www.dailymotion.com' },
            { name: '🖼️ Digital Art', url: 'https://digitalartarchive.at/home/' },
            { name: '🎬 Movie Widget', url: 'https://elfsight.com/movie-widget/iframe/' },
            { name: '⏱️ Epoch Conv', url: 'https://www.epochconverter.com' },
            { name: '🏛️ Europeana', url: 'https://www.europeana.eu' },
            { name: '⚡ Glitch', url: 'https://glitch.com' },
            { name: '⚡ JSFiddle', url: 'https://jsfiddle.net' },
            { name: '🔍 DuckDuckGo', url: 'https://duckduckgo.com/?kae=d' }
          ].map(site => (
            <button
              key={site.url}
              onClick={() => {
                const event = new CustomEvent('navigate', { detail: { url: site.url } });
                window.dispatchEvent(event);
              }}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                padding: '12px',
                border: '2px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '0',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.2)';
                e.currentTarget.style.borderColor = '#60a5fa';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {site.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowMoreSites(true)}
          style={{
            marginTop: '16px',
            width: '100%',
            background: 'transparent',
            color: 'white',
            padding: '14px',
            border: '2px solid transparent',
            borderImage: 'linear-gradient(135deg, #60a5fa, #a78bfa) 1',
            borderRadius: '0',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(167, 139, 250, 0.2))';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          📋 Pełna lista sprawdzonych stron
        </button>
      </div>

      {showMoreSites && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflow: 'hidden'
        }} onClick={() => setShowMoreSites(false)}>
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '2px solid transparent',
            borderImage: 'linear-gradient(135deg, #60a5fa, #a78bfa) 1',
            padding: '0',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            borderRadius: '0'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header - fixed */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '2px solid rgba(148, 163, 184, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'transparent'
            }}>
              <h2 style={{
                color: 'white',
                margin: 0,
                fontSize: '24px',
                fontWeight: '700'
              }}>
                📋 Sprawdzone strony bez X-Frame-Options
              </h2>
              <button
                onClick={() => setShowMoreSites(false)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                ✕
              </button>
            </div>

            {/* Advanced Search Button */}
            <div style={{
              padding: '16px 32px',
              borderBottom: '2px solid rgba(148, 163, 184, 0.3)',
              backgroundColor: 'transparent'
            }}>
              <a
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '0',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  border: '2px solid #60a5fa'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🔍 Przejdź do wyszukiwarki
              </a>
              <p style={{
                color: '#94a3b8',
                fontSize: '13px',
                margin: '8px 0 0 0'
              }}>
                Szukaj, filtruj i sortuj strony z zaawansowanymi opcjami
              </p>
            </div>

            {/* Scrollable Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '24px 32px'
            }}>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                borderBottom: '2px solid rgba(148, 163, 184, 0.3)',
                position: 'sticky',
                top: '-24px',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(10px)',
                zIndex: 10,
                paddingTop: '8px',
                marginTop: '-8px'
              }}>
                <button
                  onClick={() => setActiveTab('popular')}
                  style={{
                    backgroundColor: activeTab === 'popular' ? '#3b82f6' : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  🔥 Popularne (38)
                </button>
                <button
                  onClick={() => setActiveTab('niche')}
                  style={{
                    backgroundColor: activeTab === 'niche' ? '#3b82f6' : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  💎 Niszowe (30)
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '12px'
              }}>
                {(activeTab === 'popular' ? [
                  {
                    cat: '🇵🇱 Polskie strony', sites: [
                      { name: 'Onet.pl', url: 'https://www.onet.pl' },
                      { name: 'Interia.pl', url: 'https://www.interia.pl' },
                      { name: 'Wp.pl', url: 'https://www.wp.pl' },
                      { name: 'Gazeta.pl', url: 'https://www.gazeta.pl' },
                      { name: 'Allegro.pl', url: 'https://allegro.pl' },
                      { name: 'OLX.pl', url: 'https://www.olx.pl' },
                      { name: 'Filmweb.pl', url: 'https://www.filmweb.pl' },
                      { name: 'Wykop.pl', url: 'https://www.wykop.pl' },
                      { name: 'TVP VOD', url: 'https://vod.tvp.pl' },
                      { name: 'Niebezpiecznik.pl', url: 'https://niebezpiecznik.pl' }
                    ]
                  },
                  {
                    cat: '⚡ Code Playgrounds', sites: [
                      { name: 'CodeSandbox', url: 'https://codesandbox.io' },
                      { name: 'StackBlitz', url: 'https://stackblitz.com' },
                      { name: 'JSFiddle', url: 'https://jsfiddle.net' },
                      { name: 'JSBin', url: 'https://jsbin.com' },
                      { name: 'Replit', url: 'https://replit.com' },
                      { name: 'RunKit Embed', url: 'https://runkit.com/embed' }
                    ]
                  },
                  {
                    cat: '🔧 API & Dev Tools', sites: [
                      { name: 'HTTPBin', url: 'https://httpbin.org' },
                      { name: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com' },
                      { name: 'Swagger Petstore', url: 'https://petstore.swagger.io' },
                      { name: 'GraphQL Playground', url: 'https://graphql.org/swapi-graphql' },
                      { name: 'APIs.guru Browser', url: 'https://apis.guru/browse-apis' },
                      { name: 'SQL Fiddle', url: 'http://sqlfiddle.com' }
                    ]
                  },
                  {
                    cat: '🎓 Edukacja & Docs', sites: [
                      { name: 'Wikipedia', url: 'https://en.wikipedia.org' },
                      { name: 'W3Schools Tryit', url: 'https://www.w3schools.com/html/tryit.asp' },
                      { name: 'Observable HQ', url: 'https://observablehq.com' },
                      { name: 'D3.js Gallery', url: 'https://observablehq.com/@d3/gallery' },
                      { name: 'Jupyter nbviewer', url: 'https://nbviewer.jupyter.org' },
                      { name: 'Scratch MIT', url: 'https://scratch.mit.edu' }
                    ]
                  },
                  {
                    cat: '🗺️ Mapy & Media', sites: [
                      { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org/export/embed.html' },
                      { name: 'Google Maps Embed', url: 'https://www.google.com/maps/embed' },
                      { name: 'YouTube Embed', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
                      { name: 'Vimeo Player', url: 'https://player.vimeo.com/video/148751763' },
                      { name: 'Spotify Playlist', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M' }
                    ]
                  },
                  {
                    cat: '🌐 Testowe & Utilities', sites: [
                      { name: 'Example.com', url: 'https://example.com' },
                      { name: 'IframeTester', url: 'https://iframetester.com' },
                      { name: 'Webhook.site', url: 'https://webhook.site' },
                      { name: 'H5P Interactive', url: 'https://h5p.org' },
                      { name: 'DuckDuckGo', url: 'https://duckduckgo.com' }
                    ]
                  }
                ] : [
                  {
                    cat: '🎨 Design & 3D', sites: [
                      { name: 'Glitch', url: 'https://glitch.com' },
                      { name: 'Draw.io Diagrams', url: 'https://app.diagrams.net' },
                      { name: 'Figma Embed', url: 'https://www.figma.com/embed' },
                      { name: 'Tinkercad 3D', url: 'https://www.tinkercad.com/embed' }
                    ]
                  },
                  {
                    cat: '📚 Edukacja & Kursy', sites: [
                      { name: 'Exercism', url: 'https://exercism.io' },
                      { name: 'The Odin Project', url: 'https://www.theodinproject.com' },
                      { name: 'FreeCodeCamp', url: 'https://freecodecamp.org' },
                      { name: 'Codewars', url: 'https://www.codewars.com' },
                      { name: 'Katacoda DevOps', url: 'https://www.katacoda.com' }
                    ]
                  },
                  {
                    cat: '⚡ Code Interpreters', sites: [
                      { name: 'JS Tutor Visualizer', url: 'http://pythontutor.com/javascript.html' },
                      { name: 'RunJS Playground', url: 'https://runjs.app' },
                      { name: 'Observable Plot', url: 'https://observablehq.com/@observablehq/plot' },
                      { name: 'Circuit Simulator', url: 'https://www.falstad.com/circuit' }
                    ]
                  },
                  {
                    cat: '🔧 Dev & Testing Tools', sites: [
                      { name: 'Can I Use', url: 'https://caniuse.com' },
                      { name: 'JSON Formatter', url: 'https://jsonformatter.curiousconcept.com' },
                      { name: 'Applitools Demo', url: 'https://applitools.com/demo' },
                      { name: 'Postman Docs', url: 'https://learning.postman.com/docs' },
                      { name: 'IP Info API', url: 'https://ipinfo.io/developers/embed' }
                    ]
                  },
                  {
                    cat: '📝 Productivity & Forms', sites: [
                      { name: 'Overleaf LaTeX', url: 'https://www.overleaf.com/docs' },
                      { name: 'Typeform', url: 'https://www.typeform.com/help/embed-form' },
                      { name: 'Calendly', url: 'https://calendly.com/embed' },
                      { name: 'Workflowy', url: 'https://workflowy.com/embed' },
                      { name: 'Glide Apps', url: 'https://www.glideapps.com/embed' }
                    ]
                  },
                  {
                    cat: '🌍 Widgets & Data', sites: [
                      { name: 'Air Visual', url: 'https://www.iqair.com/world-air-quality' },
                      { name: 'OpenWeatherMap', url: 'https://openweathermap.org/widgets' },
                      { name: 'DuckDuckGo Search', url: 'https://duckduckgo.com/search_box.html' },
                      { name: 'Scratch MIT', url: 'https://scratch.mit.edu/projects/embed' },
                      { name: 'Amazon Honeycode', url: 'https://www.honeycode.aws/embed' }
                    ]
                  }
                ]).map(category => (
                  <div key={category.cat} style={{
                    backgroundColor: 'transparent',
                    border: '2px solid rgba(148, 163, 184, 0.3)',
                    padding: '16px',
                    borderRadius: '0'
                  }}>
                    <h3 style={{
                      color: '#60a5fa',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginBottom: '12px'
                    }}>
                      {category.cat}
                    </h3>
                    {category.sites.map(site => (
                      <button
                        key={site.url}
                        onClick={() => {
                          const event = new CustomEvent('navigate', { detail: { url: site.url } });
                          window.dispatchEvent(event);
                          setShowMoreSites(false);
                        }}
                        style={{
                          width: '100%',
                          backgroundColor: 'transparent',
                          color: 'white',
                          padding: '10px',
                          border: '2px solid rgba(148, 163, 184, 0.3)',
                          borderRadius: '0',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          marginBottom: '8px',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.2)';
                          e.currentTarget.style.borderColor = '#60a5fa';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {site.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{
                backgroundColor: 'transparent',
                border: '2px solid rgba(148, 163, 184, 0.3)',
                padding: '16px',
                borderRadius: '0',
                marginTop: '24px',
                textAlign: 'center'
              }}>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  💡 <strong style={{ color: '#60a5fa' }}>Razem 68 stron!</strong> Popularne playgrounds, API tools, edukacja, design, widgets i więcej.
                  <br />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Źródło: Perplexity AI + ręczna weryfikacja iframe policies</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ SIMPLE AI ASSISTANT ============ */}
      {showQuickChat && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '700px',
          zIndex: 9999,
          backgroundColor: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(12px)',
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, #3b82f6, #8b5cf6) 1',
          padding: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{ fontSize: '28px', flexShrink: 0 }}>🤖</div>

            <div style={{ flex: 1 }}>
              <textarea
                ref={chatInputRef}
                placeholder="Zapytaj o funkcje aplikacji, dokumentację lub zasoby..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendToAI();
                  }
                }}
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '12px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '0',
                  color: '#f8fafc',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />

              {aiResponse && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '4px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#e2e8f0',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#60a5fa'
                  }}>
                    Odpowiedź AI ({selectedModel}):
                  </div>
                  {aiResponse}
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <button
                onClick={handleSendToAI}
                disabled={isAiLoading || !chatInput.trim()}
                style={{
                  padding: '12px 20px',
                  backgroundColor: isAiLoading ? '#64748b' : '#3b82f6',
                  border: 'none',
                  color: 'white',
                  cursor: isAiLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  opacity: !chatInput.trim() ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isAiLoading && chatInput.trim()) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAiLoading) {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {isAiLoading ? '⟳' : '→'} Wyślij
              </button>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{
                  padding: '8px',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#f8fafc',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                <option value="llama-3.2-1b">Llama 3.2 1B (szybki)</option>
                <option value="llama-3.2-3b">Llama 3.2 3B (zbalansowany)</option>
                <option value="gemma-7b">Gemma 7B (dobry)</option>
                <option value="gemma-12b">Gemma 12B (najlepszy)</option>
                <option value="qwen-7b">Qwen 7B (alternatywny)</option>
              </select>

              <button
                onClick={() => setShowQuickChat(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
                title="Zamknij"
              >
                ✕
              </button>
            </div>
          </div>

          <div style={{
            marginTop: '12px',
            fontSize: '11px',
            color: '#64748b',
            textAlign: 'center'
          }}>
            Używa darmowych modeli Cloudflare Workers AI · Shift+Enter = nowa linia
          </div>
        </div>
      )}

      {/* Quick AI Button */}
      {!showQuickChat && (
        <button
          onClick={() => setShowQuickChat(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            border: '2px solid #60a5fa',
            color: 'white',
            fontSize: '28px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
            zIndex: 9998,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)';
          }}
          title="Otwórz Asystenta AI"
        >
          🤖
        </button>
      )}
      {/* ============ END AI ASSISTANT ============ */}

      {/* Right Sidebar with Buttons */}
      <div style={{
        position: 'fixed',
        right: '20px',
        top: '70px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1001
      }}>
        {/* Wikipedia Widget Button */}
        <button
          onClick={() => window.open('https://pl.wikipedia.org', '_blank')}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '12px',
            color: '#93c5fd',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            minWidth: '160px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.transform = 'translateX(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
          }}
          title="Wyszukaj w Wikipedii"
        >
          <span style={{ fontSize: '16px' }}>📖</span>
          <span>Wikipedia</span>
        </button>

        {/* On This Day Widget Button */}
        <button
          onClick={() => window.open('https://en.wikipedia.org/wiki/Wikipedia:On_this_day/Today', '_blank')}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(34, 197, 94, 0.5)',
            borderRadius: '12px',
            color: '#86efac',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
            minWidth: '160px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.3)';
            e.currentTarget.style.transform = 'translateX(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
          }}
          title="Wydarzenia z tego dnia"
        >
          <span style={{ fontSize: '16px' }}>📅</span>
          <span>On This Day</span>
        </button>

        {/* Birthday Song Widget Button */}
        <button
          onClick={() => window.open('https://playback.fm', '_blank')}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(236, 72, 153, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(236, 72, 153, 0.5)',
            borderRadius: '12px',
            color: '#f9a8d4',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
            minWidth: '160px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(236, 72, 153, 0.3)';
            e.currentTarget.style.transform = 'translateX(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(236, 72, 153, 0.2)';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.3)';
          }}
          title="Piosenka #1 w dniu Twoich urodzin"
        >
          <span style={{ fontSize: '16px' }}>🎵</span>
          <span>Birthday Song</span>
        </button>

        {/* Contact Button */}
        <button
          onClick={() => window.location.href = '/contact'}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            borderRadius: '12px',
            color: '#c7d2fe',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
            minWidth: '160px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.3)';
            e.currentTarget.style.transform = 'translateX(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
          }}
          title="Kontakt: JimBoZen@proton.me"
        >
          <span style={{ fontSize: '16px' }}>📧</span>
          <span>Kontakt</span>
        </button>

        {/* RETRO MODE Button */}
        <button
          onClick={() => window.location.href = 'https://zeno-retro.pages.dev?v=' + Date.now()}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            borderRadius: '12px',
            color: '#e9d5ff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
            minWidth: '160px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.3)';
            e.currentTarget.style.transform = 'translateX(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(168, 85, 247, 0.3)';
          }}
          title="Przejdź do RETRO MODE"
        >
          <span style={{ fontSize: '16px' }}>🕹️</span>
          <span>RETRO MODE</span>
        </button>

        {/* Music Player Button */}
        <button
          onClick={() => window.open('https://music.youtube.com', '_blank')}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(244, 114, 182, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(244, 114, 182, 0.5)',
            borderRadius: '12px',
            color: '#fbcfe8',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(244, 114, 182, 0.3)',
            minWidth: '160px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(244, 114, 182, 0.3)';
            e.currentTarget.style.transform = 'translateX(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(244, 114, 182, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(244, 114, 182, 0.2)';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 114, 182, 0.3)';
          }}
          title="Music Player"
        >
          <span style={{ fontSize: '16px' }}>🎵</span>
          <span>Music Player</span>
        </button>

        {/* Video Player Button */}
        <button
          onClick={() => window.open('https://archive.org/details/movies', '_blank')}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(251, 146, 60, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(251, 146, 60, 0.5)',
            borderRadius: '12px',
            color: '#fed7aa',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(251, 146, 60, 0.3)',
            minWidth: '160px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(251, 146, 60, 0.3)';
            e.currentTarget.style.transform = 'translateX(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 146, 60, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(251, 146, 60, 0.2)';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(251, 146, 60, 0.3)';
          }}
          title="Video Player - Archive.org"
        >
          <span style={{ fontSize: '16px' }}>🎬</span>
          <span>Video Player</span>
        </button>

        {/* Biblioteka CAYD Button */}
        <button
          onClick={() => {
            const event = new CustomEvent('navigate', {
              detail: { url: 'about:library' }
            });
            window.dispatchEvent(event);
          }}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '12px',
            color: '#fde68a',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
            minWidth: '160px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.3)';
            e.currentTarget.style.transform = 'translateX(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)';
          }}
          title="Biblioteka CAYD - Przeglądaj pliki"
        >
          <span style={{ fontSize: '16px' }}>📚</span>
          <span>Biblioteka</span>
        </button>

        {/* MCP Tools Button */}
        <button
          onClick={() => {
            const event = new CustomEvent('navigate', {
              detail: { url: 'about:mcp-tools' }
            });
            window.dispatchEvent(event);
          }}
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(34, 197, 94, 0.5)',
            borderRadius: '12px',
            color: '#bbf7d0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
            minWidth: '160px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.3)';
            e.currentTarget.style.transform = 'translateX(-5px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
          }}
          title="MCP Tools Panel"
        >
          <span style={{ fontSize: '16px' }}>🛠️</span>
          <span>MCP Tools</span>
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;
