import React from 'react';
import Skeleton from './Skeleton';

const ChatSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px'
    }}>
      {/* User message skeleton */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <div style={{
          maxWidth: '70%',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '12px 16px'
        }}>
          <Skeleton width="200px" height="14px" />
          <div style={{ marginTop: '8px' }}>
            <Skeleton width="150px" height="14px" />
          </div>
        </div>
      </div>

      {/* AI message skeleton */}
      <div style={{
        display: 'flex',
        gap: '12px'
      }}>
        {/* Avatar */}
        <Skeleton width="40px" height="40px" borderRadius="50%" />
        
        {/* Message content */}
        <div style={{
          flex: 1,
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          padding: '12px 16px'
        }}>
          <Skeleton width="100%" height="14px" />
          <div style={{ marginTop: '8px' }}>
            <Skeleton width="90%" height="14px" />
          </div>
          <div style={{ marginTop: '8px' }}>
            <Skeleton width="95%" height="14px" />
          </div>
          <div style={{ marginTop: '8px' }}>
            <Skeleton width="60%" height="14px" />
          </div>
        </div>
      </div>

      {/* Typing indicator skeleton */}
      <div style={{
        display: 'flex',
        gap: '12px'
      }}>
        <Skeleton width="40px" height="40px" borderRadius="50%" />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          padding: '16px'
        }}>
          <Skeleton width="8px" height="8px" borderRadius="50%" />
          <Skeleton width="8px" height="8px" borderRadius="50%" />
          <Skeleton width="8px" height="8px" borderRadius="50%" />
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;
