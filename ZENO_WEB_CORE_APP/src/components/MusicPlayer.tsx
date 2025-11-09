/**
 * MusicPlayer Component - Webamp Integration with Widget System
 * Classic Winamp-style music player with skin support and always-on-top
 */

import React, { useEffect, useRef, useState } from 'react';
import Webamp from 'webamp';
import { WIDGET_SKINS } from './widgets/WidgetContainer';
import type { WidgetSkin } from './widgets/WidgetContainer';

interface MusicPlayerProps {
  onClose?: () => void;
  initialSkin?: WidgetSkin;
}

// Popular Winamp skins from the Webamp skin museum
const CLASSIC_SKINS = [
  {
    name: 'Base (Default)',
    url: null, // Default skin
  },
  {
    name: 'Topaz',
    url: 'https://cdn.webampskins.org/skins/fdc0e5a086e44b34b9d3a3bceebc4c88.wsz',
  },
  {
    name: 'Vizor',
    url: 'https://cdn.webampskins.org/skins/4fb0f72e0c38b6df1a85c11a05a07127.wsz',
  },
  {
    name: 'MacOSX',
    url: 'https://cdn.webampskins.org/skins/5e4d10275dcb1da363f23f5bd9d6e4eb.wsz',
  },
  {
    name: 'Skinner',
    url: 'https://cdn.webampskins.org/skins/08d407e39ab18ba5c88bf3d33b8e48d1.wsz',
  },
  {
    name: 'Nucleo NLog v2.06',
    url: 'https://cdn.webampskins.org/skins/5e4fde7fba7befd10a43cd4bba3c3382.wsz',
  },
  {
    name: 'Zelda Amp',
    url: 'https://cdn.webampskins.org/skins/7d9e8f8e26afc84c4b0a7b40c0e44d85.wsz',
  },
  {
    name: 'MMD3',
    url: 'https://cdn.webampskins.org/skins/4fb0f72e0c38b6df1a85c11a05a07127.wsz',
  },
];

// Demo tracks (royalty-free music)
const DEMO_TRACKS = [
  {
    metaData: {
      artist: 'Jingle Punks',
      title: 'Wallpaper',
    },
    url: 'https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3',
    duration: 5.322286,
  },
  {
    metaData: {
      artist: 'Awesome Band',
      title: 'Demo Track',
    },
    url: 'https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3',
    duration: 5.322286,
  },
];

const MusicPlayer: React.FC<MusicPlayerProps> = ({ onClose, initialSkin = 'modern' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const webampRef = useRef<Webamp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [skin, setSkin] = useState<WidgetSkin>(initialSkin);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const theme = WIDGET_SKINS[skin];

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, select')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (!containerRef.current) return;

    const initWebamp = async () => {
      try {
        // Initialize Webamp - bez zewnętrznych skórek (tylko domyślny)
        const webamp = new Webamp({
          initialTracks: DEMO_TRACKS,
          // Usuń initialSkin - użyj domyślnego built-in
          // availableSkins: [], // Wyłącz skin selector
          enableHotkeys: true,
          zIndex: 10000,
        });

        // Render to container
        if (containerRef.current) {
          await webamp.renderWhenReady(containerRef.current);
          webampRef.current = webamp;
          setIsLoading(false);

          // Optional: Auto-play first track
          // webamp.play();
        }
      } catch (error) {
        console.error('Failed to initialize Webamp:', error);
        setIsLoading(false);
      }
    };

    initWebamp();

    // Cleanup
    return () => {
      if (webampRef.current) {
        webampRef.current.dispose();
        webampRef.current = null;
      }
    };
  }, []); // Only run once on mount

  const changeSkin = async (skinUrl: string | null) => {
    if (!webampRef.current) return;

    try {
      if (skinUrl) {
        await webampRef.current.setSkinFromUrl(skinUrl);
      } else {
        // Reset to default skin
        await webampRef.current.setSkinFromUrl('https://cdn.webampskins.org/skins/base-2.91.wsz');
      }
      setCurrentSkin(skinUrl);
      setShowSkinSelector(false);
    } catch (error) {
      console.error('Failed to change skin:', error);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: 'transparent',
        padding: '20px',
        minHeight: '400px',
        minWidth: '600px',
      }}
    >
      {/* Header with close button and skin selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🎵</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '18px' }}>ZENO Music Player</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Powered by Webamp</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowSkinSelector(!showSkinSelector)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            🎨 Skins
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Skin Selector Dropdown */}
      {showSkinSelector && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            padding: '16px',
            zIndex: 10001,
            maxHeight: '400px',
            overflowY: 'auto',
            minWidth: '250px',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '700',
              color: '#1e293b',
            }}
          >
            Choose a Skin
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {CLASSIC_SKINS.map((skin) => (
              <button
                key={skin.name}
                onClick={() => changeSkin(skin.url)}
                style={{
                  background:
                    currentSkin === skin.url
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: currentSkin === skin.url ? 'white' : '#1e293b',
                  fontSize: '14px',
                  fontWeight: currentSkin === skin.url ? '600' : '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (currentSkin !== skin.url) {
                    e.currentTarget.style.background = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentSkin !== skin.url) {
                    e.currentTarget.style.background = '#f1f5f9';
                  }
                }}
              >
                {currentSkin === skin.url && '✓ '}
                {skin.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
            color: '#64748b',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
              animation: 'pulse 2s infinite',
            }}
          >
            🎵
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Loading Webamp...</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Initializing classic music player
          </div>
        </div>
      )}

      {/* Webamp Container */}
      <div ref={containerRef} style={{ position: 'relative' }} />

      {/* Info Box */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
          borderRadius: '12px',
          border: '2px solid #cbd5e1',
        }}
      >
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
          💡 How to use:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569' }}>
          <li>Click "Skins" to change the player appearance</li>
          <li>Drag files onto the player to add your own music</li>
          <li>Right-click for more options</li>
          <li>Double-click the title bar to shade/unshade</li>
          <li>All classic Winamp shortcuts work!</li>
        </ul>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default MusicPlayer;
