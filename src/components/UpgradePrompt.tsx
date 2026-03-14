/**
 * UpgradePrompt Component
 * Shows when user tries to access premium features
 */

import React from 'react';
import { PRICING, type PlanType } from '../config/features';

interface UpgradePromptProps {
  featureName: string;
  featureIcon: string;
  requiredPlan: PlanType;
  onClose: () => void;
  onUpgrade?: () => void;
  showInline?: boolean; // Show as inline banner instead of modal
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  featureName,
  featureIcon,
  requiredPlan,
  onClose,
  onUpgrade,
  showInline = false
}) => {
  const pricing = PRICING[requiredPlan];

  if (showInline) {
    // Inline banner version
    return (
      <div style={{
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        border: '2px solid #667eea',
        borderRadius: '12px',
        padding: '16px 20px',
        margin: '12px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ fontSize: '32px' }}>{featureIcon}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            color: '#667eea',
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '4px'
          }}>
            {featureName}
          </div>
          <div style={{ color: '#64748b', fontSize: '14px' }}>
            Requires {requiredPlan} plan • {pricing.label}
          </div>
        </div>
        <button
          onClick={onUpgrade}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Upgrade Now
        </button>
      </div>
    );
  }

  // Modal version
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />

      {/* Modal Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          zIndex: 100000,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            color: '#94a3b8',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.color = '#64748b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          ✕
        </button>

        {/* Icon */}
        <div style={{
          fontSize: '64px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          {featureIcon}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: '800',
          color: '#1e293b',
          textAlign: 'center',
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Unlock {featureName}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          This feature requires a <strong style={{ color: '#667eea' }}>{requiredPlan}</strong> plan to use.
          <br />
          Upgrade now to unlock this and many more features!
        </p>

        {/* Pricing Card */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: '800',
            marginBottom: '8px'
          }}>
            {pricing.label}
          </div>
          {pricing.savings && (
            <div style={{
              fontSize: '14px',
              opacity: 0.9,
              fontWeight: '600'
            }}>
              {pricing.savings}
            </div>
          )}
        </div>

        {/* Features Preview */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#64748b',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            {requiredPlan === 'monthly' && 'Monthly Plan includes:'}
            {requiredPlan === 'yearly' && 'Yearly Plan includes:'}
            {requiredPlan === 'lifetime' && 'Lifetime Plan includes:'}
          </div>
          <div style={{
            display: 'grid',
            gap: '8px',
            fontSize: '14px',
            color: '#475569'
          }}>
            {requiredPlan === 'monthly' && (
              <>
                <div>✓ Unlimited tabs</div>
                <div>✓ AI Assistant (Claude, Gemini, OpenAI)</div>
                <div>✓ Advanced bookmarks with folders</div>
                <div>✓ MCP Tools integration</div>
                <div>✓ Local Ollama models</div>
              </>
            )}
            {requiredPlan === 'yearly' && (
              <>
                <div>✓ All Monthly features</div>
                <div>✓ Advanced search with filters</div>
                <div>✓ API access (10,000 req/day)</div>
                <div>✓ Priority support (24h)</div>
                <div>✓ Team features (5 users)</div>
                <div>✓ Multi-device sync</div>
              </>
            )}
            {requiredPlan === 'lifetime' && (
              <>
                <div>✓ All Yearly features</div>
                <div>✓ Beta access to new features</div>
                <div>✓ Unlimited API access</div>
                <div>✓ VIP support</div>
                <div>✓ Custom integrations</div>
                <div>✓ Pay once, use forever!</div>
              </>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onUpgrade}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            🚀 Upgrade to {requiredPlan}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 0.5,
              background: 'transparent',
              border: '2px solid #e2e8f0',
              color: '#64748b',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            Maybe Later
          </button>
        </div>

        {/* Money-back guarantee */}
        <p style={{
          fontSize: '12px',
          color: '#94a3b8',
          textAlign: 'center',
          marginTop: '16px',
          fontStyle: 'italic'
        }}>
          💯 14-day money-back guarantee • Secure payment via Stripe
        </p>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
};

export default UpgradePrompt;
