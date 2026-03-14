import React, { useState } from 'react';

export interface Instruction {
  step: number;
  title: string;
  description: string;
  shortcut?: string;
}

interface InstructionsPanelProps {
  title: string;
  instructions: Instruction[];
  defaultOpen?: boolean;
}

export const InstructionsPanel: React.FC<InstructionsPanelProps> = ({
  title,
  instructions,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      maxWidth: isOpen ? '400px' : '60px',
      transition: 'all 0.3s ease'
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          top: isOpen ? '10px' : '0',
          right: isOpen ? '10px' : '0',
          background: '#FF0000',
          color: '#FFFFFF',
          border: '3px solid #000000',
          padding: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
          width: isOpen ? 'auto' : '60px',
          height: isOpen ? 'auto' : '60px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.8)'
        }}
      >
        {isOpen ? '✕' : '?'}
      </button>

      {/* Instructions Panel */}
      {isOpen && (
        <div style={{
          background: '#FFFFFF',
          border: '4px solid #000000',
          padding: '20px',
          paddingTop: '50px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          <h2 style={{
            color: '#000000',
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '20px',
            borderBottom: '3px solid #000000',
            paddingBottom: '10px'
          }}>
            📘 {title}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {instructions.map((instruction) => (
              <div
                key={instruction.step}
                style={{
                  background: '#F0F0F0',
                  border: '2px solid #000000',
                  padding: '15px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    background: '#000000',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    fontWeight: 'bold',
                    marginRight: '10px',
                    fontSize: '14px'
                  }}>
                    {instruction.step}
                  </span>
                  <span style={{
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    flex: 1
                  }}>
                    {instruction.title}
                  </span>
                  {instruction.shortcut && (
                    <span style={{
                      background: '#FFFF00',
                      color: '#000000',
                      padding: '2px 8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: '2px solid #000000'
                    }}>
                      {instruction.shortcut}
                    </span>
                  )}
                </div>
                <p style={{
                  color: '#333333',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {instruction.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
