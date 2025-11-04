import React from 'react';
import Skeleton from './Skeleton';

const TabSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '12px',
      backgroundColor: '#0f172a',
      borderRadius: '12px'
    }}>
      {/* Favicon skeleton */}
      <Skeleton width="20px" height="20px" borderRadius="4px" />
      
      {/* Title skeleton */}
      <div style={{ flex: 1 }}>
        <Skeleton width="70%" height="16px" />
      </div>
      
      {/* Close button skeleton */}
      <Skeleton width="20px" height="20px" borderRadius="4px" />
    </div>
  );
};

export default TabSkeleton;
