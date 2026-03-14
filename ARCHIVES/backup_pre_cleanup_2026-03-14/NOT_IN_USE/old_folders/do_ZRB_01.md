Poniżej propozycja gotowych Reactowych komponentów do osadzania i zarządzania iframe dla trzech typowych archiwów filmowych / odtwarzaczy z iframe-friendly API: Internet Archive, YouTube i Elfsight Movie Widget. Komponenty dają też możliwość podstawowej kontroli i przekazywania parametrów.

1. InternetArchivePlayer.tsx
tsx
import React from 'react';

interface InternetArchivePlayerProps {
  identifier: string; // unikalny identyfikator filmu na archive.org
  width?: number;
  height?: number;
}

export const InternetArchivePlayer: React.FC<InternetArchivePlayerProps> = ({
  identifier,
  width = 640,
  height = 360,
}) => {
  const src = `https://archive.org/embed/${identifier}`;

  return (
    <iframe
      title="Internet Archive Video Player"
      src={src}
      width={width}
      height={height}
      frameBorder="0"
      allowFullScreen
      allow="autoplay; encrypted-media"
      style={{ borderRadius: '8px' }}
    />
  );
};
2. YouTubePlayer.tsx
tsx
import React, { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string; // ID video na YouTube
  width?: number;
  height?: number;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  width = 560,
  height = 315,
  onReady,
  onPlay,
  onPause,
  onEnd,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    };

    loadYouTubeAPI();

    let player: any;

    (window as any).onYouTubeIframeAPIReady = () => {
      player = new (window as any).YT.Player(iframeRef.current, {
        videoId,
        events: {
          onReady: () => onReady && onReady(),
          onStateChange: (event: any) => {
            switch (event.data) {
              case (window as any).YT.PlayerState.PLAYING:
                onPlay && onPlay();
                break;
              case (window as any).YT.PlayerState.PAUSED:
                onPause && onPause();
                break;
              case (window as any).YT.PlayerState.ENDED:
                onEnd && onEnd();
                break;
            }
          }
        }
      });
    };

    return () => {
      if (player) player.destroy();
    };
  }, [videoId]);

  return (
    <div>
      <div id="youtube-player" />
      <iframe
        ref={iframeRef}
        title="YouTube Video Player"
        width={width}
        height={height}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};
3. ElfsightMovieWidget.tsx
tsx
import React from 'react';

interface ElfsightMovieWidgetProps {
  widgetId: string; // ID widgeta z panelu Elfsight
  width?: number | string;
  height?: number | string;
}

export const ElfsightMovieWidget: React.FC<ElfsightMovieWidgetProps> = ({
  widgetId,
  width = '100%',
  height = 450,
}) => {
  const src = `https://apps.elfsight.com/widget/${widgetId}/iframe`;

  return (
    <iframe
      title="Elfsight Movie Widget"
      src={src}
      style={{ width, height, border: 'none', borderRadius: 8, overflow: 'hidden' }}
      allowFullScreen
      scrolling="no"
      frameBorder="0"
    />
  );
};
Podsumowanie
Komponenty obsługują podstawowe parametry iframe i pozwalają na eventy (YouTube).

Możesz je łatwo rozszerzyć o dalsze callbacki, style, efekty ładowania itp.

Integracja jest szybka, każdy można użyć przez import i podanie ID zasobu do odtworzenia.

Przykładowo:

tsx
<InternetArchivePlayer identifier="sample-video-id" />
<YouTubePlayer videoId="dQw4w9WgXcQ" />
<ElfsightMovieWidget widgetId="xxxxxx" />