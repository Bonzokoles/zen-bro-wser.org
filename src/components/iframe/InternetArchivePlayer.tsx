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
      style={{ border: '2px solid #000000' }}
    />
  );
};
