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
      style={{ width, height, border: '2px solid #000000', overflow: 'hidden' }}
      allowFullScreen
      scrolling="no"
      frameBorder="0"
    />
  );
};
