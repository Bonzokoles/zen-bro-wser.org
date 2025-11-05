import type { APIRoute } from 'astro';

// Mock data for MVP - In production, this would query Stripe + KV store
const mockDashboardData = {
  'test-session-123': {
    apiKey: 'zeno_a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    subscription: {
      status: 'active' as const,
      plan: 'monthly' as const,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
    },
    usage: {
      requestsUsed: 42,
      requestsLimit: 1000,
      periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      periodEnd: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    },
    customerPortalUrl: 'https://billing.stripe.com/p/login/test_123',
  },
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For MVP, return mock data
    // In production, this would:
    // 1. Verify session with Stripe
    // 2. Fetch API key from KV store (key: `apikey:${customerId}`)
    // 3. Fetch subscription details from Stripe
    // 4. Fetch usage stats from analytics or KV
    // 5. Generate customer portal URL via Stripe API

    const data = mockDashboardData[sessionId as keyof typeof mockDashboardData];

    if (!data) {
      // Session not found - might be real session from test-webhook-flow.ps1
      // Try to fetch from Worker API (in production)
      return new Response(
        JSON.stringify({
          apiKey: null, // API key pending generation
          subscription: {
            status: 'active',
            plan: 'monthly',
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
          },
          usage: {
            requestsUsed: 0,
            requestsLimit: 1000,
            periodStart: new Date().toISOString(),
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          customerPortalUrl: null,
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
