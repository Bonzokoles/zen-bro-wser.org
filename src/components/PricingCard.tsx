import React, { useState } from 'react';

interface PricingCardProps {
  plan: 'monthly' | 'yearly';
  price: number;
  priceId: string;
  features: string[];
  onCheckout?: (sessionUrl: string) => void;
}

export default function PricingCard({ 
  plan, 
  price, 
  priceId, 
  features,
  onCheckout 
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get or generate user ID
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = `user_${crypto.randomUUID()}`;
        localStorage.setItem('userId', userId);
      }
      
      const email = prompt('Enter your email address:');
      if (!email) {
        setLoading(false);
        return;
      }
      
      // Create checkout session
      const response = await fetch('https://zeno-browser-api.stolarnia-ams.workers.dev/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          plan,
          email,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        // Track checkout start
        const analyticsService = await import('../services/analytics');
        analyticsService.analytics.track({ url: window.location.href, action: 'click', metadata: { event: 'checkout_started', plan, price } });
        
        // Redirect to Stripe Checkout
        if (onCheckout) {
          onCheckout(data.url);
        } else {
          window.location.href = data.url;
        }
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const isYearly = plan === 'yearly';
  const monthlyCost = isYearly ? (price / 12).toFixed(2) : price;
  const savings = isYearly ? Math.round(((5 * 12 - price) / (5 * 12)) * 100) : 0;
  
  return (
    <div 
      className="pricing-card"
      style={{
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        padding: '2rem',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '350px',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
    >
      {isYearly && (
        <div 
          style={{
            position: 'absolute',
            top: '-12px',
            right: '20px',
            backgroundColor: '#10b981',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          SAVE {savings}%
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          color: '#1f2937',
        }}>
          {plan === 'monthly' ? 'Monthly' : 'Yearly'}
        </h3>
        
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold',
            color: '#3b82f6',
          }}>
            ${monthlyCost}
          </span>
          <span style={{ 
            color: '#6b7280',
            fontSize: '1rem',
          }}>
            /month
          </span>
        </div>
        
        {isYearly && (
          <div style={{ 
            color: '#6b7280',
            fontSize: '0.875rem',
          }}>
            Billed ${price} annually
          </div>
        )}
      </div>
      
      <ul style={{ 
        listStyle: 'none', 
        padding: 0,
        marginBottom: '1.5rem',
      }}>
        {features.map((feature, index) => (
          <li 
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.75rem',
              color: '#4b5563',
            }}
          >
            <span style={{ 
              color: '#10b981',
              marginRight: '0.5rem',
              fontSize: '1.25rem',
            }}>
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
      
      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: loading ? '#9ca3af' : '#3b82f6',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }
        }}
      >
        {loading ? 'Loading...' : 'Subscribe Now'}
      </button>
      
      {error && (
        <div 
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}
      
      <div 
        style={{
          marginTop: '1rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#9ca3af',
        }}
      >
        Cancel anytime. No hidden fees.
      </div>
    </div>
  );
}
