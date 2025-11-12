import { useState, useEffect } from 'react';

interface DashboardData {
  apiKey: string | null;
  subscription: {
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    plan: 'monthly' | 'yearly';
    renewalDate: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  usage: {
    requestsUsed: number;
    requestsLimit: number;
    periodStart: string;
    periodEnd: string;
  } | null;
  customerPortalUrl: string | null;
}

export default function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // For MVP, check localStorage for session ID
      const sessionId = localStorage.getItem('zeno_session_id');
      
      if (!sessionId) {
        setError('No active session. Please complete payment first.');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/dashboard?sessionId=${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function copyApiKey() {
    if (!data?.apiKey) return;
    
    try {
      await navigator.clipboard.writeText(data.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy API key');
    }
  }

  if (loading) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        <p className="text-white mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full">
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-white font-semibold text-xl mb-2">Error Loading Dashboard</h3>
          <p className="text-red-200 mb-4">{error}</p>
          <a href="/pricing" className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
            Go to Pricing
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* API Key Card */}
      <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Your API Key</h2>
            <p className="text-purple-200 mb-4">Use this key to authenticate API requests</p>
            {data?.apiKey ? (
              <div className="flex items-center gap-3">
                <code className="bg-black/30 px-4 py-2 rounded-lg text-purple-300 font-mono text-sm">
                  {data.apiKey}
                </code>
                <button
                  onClick={copyApiKey}
                  className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            ) : (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                <p className="text-yellow-200">
                  ⏳ Your API key is being generated. This usually takes a few seconds after payment.
                </p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-3 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
          <div className="text-5xl">🔑</div>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="bg-white/10 rounded-xl p-6 border border-white/20">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Subscription</h3>
          <div className="text-3xl">
            {data?.subscription?.status === 'active' ? '✅' : 
             data?.subscription?.status === 'cancelled' ? '⚠️' : '❌'}
          </div>
        </div>
        
        {data?.subscription ? (
          <>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-purple-200">Status:</span>
                <span className={`font-semibold ${
                  data.subscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {data.subscription.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Plan:</span>
                <span className="text-white font-semibold">
                  {data.subscription.plan === 'monthly' ? 'Monthly ($5)' : 'Yearly ($50)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">
                  {data.subscription.cancelAtPeriodEnd ? 'Expires:' : 'Renews:'}
                </span>
                <span className="text-white font-semibold">
                  {new Date(data.subscription.renewalDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {data.customerPortalUrl && (
              <a
                href={data.customerPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold"
              >
                Manage Subscription
              </a>
            )}
          </>
        ) : (
          <p className="text-purple-200">No active subscription</p>
        )}
      </div>

      {/* Usage Stats Card */}
      <div className="bg-white/10 rounded-xl p-6 border border-white/20">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white">API Usage</h3>
          <div className="text-3xl">📊</div>
        </div>
        
        {data?.usage ? (
          <>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-purple-200">Requests Used</span>
                <span className="text-white font-bold">
                  {data.usage.requestsUsed.toLocaleString()} / {data.usage.requestsLimit.toLocaleString()}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    (data.usage.requestsUsed / data.usage.requestsLimit) > 0.9
                      ? 'bg-red-500'
                      : (data.usage.requestsUsed / data.usage.requestsLimit) > 0.7
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((data.usage.requestsUsed / data.usage.requestsLimit) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-200">Period Start:</span>
                <span className="text-white">
                  {new Date(data.usage.periodStart).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Period End:</span>
                <span className="text-white">
                  {new Date(data.usage.periodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-purple-200">No usage data available</p>
        )}
      </div>

      {/* Quick Stats Card */}
      <div className="bg-white/10 rounded-xl p-6 border border-white/20">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Quick Stats</h3>
          <div className="text-3xl">⚡</div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-purple-200">Account Type</span>
            <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-semibold">
              {data?.subscription?.plan === 'yearly' ? 'PRO Yearly' : 'PRO Monthly'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-200">Features</span>
            <span className="text-white font-semibold">All Unlocked</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-200">Support</span>
            <span className="text-green-400 font-semibold">Priority</span>
          </div>
        </div>
      </div>
    </>
  );
}
