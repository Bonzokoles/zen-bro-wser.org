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
  }, [videoId, onReady, onPlay, onPause, onEnd]);

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
        style={{ border: '2px solid #000000' }}
      />
    </div>
  );
};
