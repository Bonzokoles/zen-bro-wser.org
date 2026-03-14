import React, { useEffect, useState } from 'react';
import { analytics } from '../services/analytics';

interface AnalyticsStats {
  total: number;
  uniqueIps: number;
  byAction: Record<string, number>;
  byUrl: Record<string, number>;
  byCountry: Record<string, number>;
  topUrls: Array<{ url: string; count: number }>;
  recent: Array<{
    url: string;
    action: string;
    country: string;
    timestamp: string;
  }>;
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'1d' | '7d' | '30d'>('7d');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    const data = await analytics.getStats(period);
    if (data?.success) {
      setStats(data.stats);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>📊</div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: 0 }}>📊 Analytics Dashboard</h1>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value as any)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        >
          <option value="1d">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <Card title="Total Events" value={stats.total} icon="📈" />
        <Card title="Unique Visitors" value={stats.uniqueIps} icon="👥" />
        <Card 
          title="Page Views" 
          value={stats.byAction.page_view || 0} 
          icon="👀" 
        />
        <Card 
          title="Iframe Loads" 
          value={stats.byAction.iframe_load || 0} 
          icon="🖼️" 
        />
      </div>

      {/* Charts Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* By Action */}
        <div style={{ 
          background: '#f9fafb', 
          padding: '1.5rem', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0 }}>Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(stats.byAction).map(([action, count]) => (
              <div key={action} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ textTransform: 'capitalize' }}>
                  {action.replace('_', ' ')}
                </span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* By Country */}
        <div style={{ 
          background: '#f9fafb', 
          padding: '1.5rem', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0 }}>Countries</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(stats.byCountry)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([country, count]) => (
                <div key={country} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{country}</span>
                  <strong>{count}</strong>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top URLs */}
      <div style={{ 
        background: '#f9fafb', 
        padding: '1.5rem', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginTop: 0 }}>Top URLs</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>URL</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Views</th>
              </tr>
            </thead>
            <tbody>
              {stats.topUrls.map(({ url, count }) => (
                <tr key={url} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.5rem', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {url}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                    {count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Events */}
      <div style={{ 
        background: '#f9fafb', 
        padding: '1.5rem', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Time</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Action</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>URL</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Country</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((event, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{ 
                      background: '#dbeafe', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}>
                      {event.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {event.url}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{event.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refresh Button */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={loadStats}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          🔄 Refresh Stats
        </button>
      </div>
    </div>
  );
}

// Helper Card Component
function Card({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div style={{ 
      background: 'white', 
      padding: '1.5rem', 
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
        {value.toLocaleString()}
      </div>
      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{title}</div>
    </div>
  );
}
