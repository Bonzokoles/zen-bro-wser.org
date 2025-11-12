# Stripe Setup Guide - ZENO Browser

## Quick Setup (30 min)

### 1. Create Stripe Account (5 min)

**Sign up:**
- Go to: https://dashboard.stripe.com/register
- Email: your-email@example.com
- Create account
- Skip verification for test mode

### 2. Get Test API Keys (2 min)

**In Dashboard:**
1. Click "Developers" → "API Keys"
2. Toggle "Test mode" ON (top right)
3. Copy keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (click "Reveal")

### 3. Add to Environment (3 min)

**Create/update `.env` files:**

```bash
# .cloudflare/.env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ZENO_WEB_CORE_APP/.env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 4. Create Products (10 min)

**Option A: Via Dashboard**
1. Go to: https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Create:

```
Product 1: ZENO Browser Pro - Monthly
- Name: ZENO Browser Pro
- Description: Unlimited iframe tests, analytics, priority support
- Price: $5.00 USD / month
- Recurring: Monthly
- ID: prod_zenopro_monthly

Product 2: ZENO Browser Pro - Yearly
- Name: ZENO Browser Pro (Yearly)
- Description: Save 17% with annual billing
- Price: $50.00 USD / year
- Recurring: Yearly
- ID: prod_zenopro_yearly
```

**Option B: Via API (faster)**

Run this script:

```bash
cd V:\PROTO_TYpy\ZENO_web_CORE\.cloudflare
node create-stripe-products.js
```

### 5. Test Checkout (5 min)

**Test card numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`
- Any future date (MM/YY)
- Any 3-digit CVC
- Any ZIP code

### 6. Setup Webhook (5 min)

**For local testing:**
```bash
# Install Stripe CLI if not installed
scoop install stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to https://zeno-browser-api.stolarnia-ams.workers.dev/api/webhook
```

**For production:**
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://zeno-browser-api.stolarnia-ams.workers.dev/api/webhook`
4. Events to listen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

---

## Integration Steps

### Step 1: Add Stripe to Worker

```typescript
// .cloudflare/src/index.ts
import Stripe from 'stripe';

export interface Env {
  // ... existing
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

// In fetch handler:
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});
```

### Step 2: Create Checkout Session

```typescript
// POST /api/checkout
async function handleCheckout(request: Request, env: Env): Promise<Response> {
  const { priceId, userId } = await request.json();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: priceId, // price_xxx from dashboard
      quantity: 1,
    }],
    success_url: 'https://zeno-browser.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://zeno-browser.com/cancel',
    metadata: { userId },
  });
  
  return Response.json({ sessionId: session.id, url: session.url });
}
```

### Step 3: Handle Webhook

```typescript
// POST /api/webhook
async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Generate API key and save to KV
      const apiKey = `zeno_${crypto.randomUUID()}`;
      await env.CACHE.put(`apikey:${apiKey}`, JSON.stringify({
        userId: session.metadata.userId,
        email: session.customer_details.email,
        subscriptionId: session.subscription,
        createdAt: Date.now(),
      }));
      break;
      
    case 'customer.subscription.deleted':
      // Revoke API key
      break;
  }
  
  return Response.json({ received: true });
}
```

### Step 4: Check API Key

```typescript
// Middleware for protected endpoints
async function checkApiKey(request: Request, env: Env): Promise<boolean> {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return false;
  
  const data = await env.CACHE.get(`apikey:${apiKey}`, 'json');
  return data !== null;
}
```

---

## Quick Test Flow

1. **Create checkout:**
```bash
curl -X POST https://zeno-browser-api.stolarnia-ams.workers.dev/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_xxx","userId":"test-user"}'
```

2. **Open URL in browser**
3. **Use test card:** 4242 4242 4242 4242
4. **Complete payment**
5. **Webhook fires** → API key generated
6. **Test API:**
```bash
curl https://zeno-browser-api.stolarnia-ams.workers.dev/api/stats \
  -H "X-API-Key: zeno_xxx"
```

---

## Revenue Tracking

**Store in KV:**
```typescript
// Track purchase
await env.CACHE.put(`purchase:${Date.now()}`, JSON.stringify({
  userId,
  amount: 5.00,
  currency: 'USD',
  plan: 'monthly',
  timestamp: Date.now(),
}));
```

**Get MRR:**
```typescript
// Count active subscriptions
const keys = await env.CACHE.list({ prefix: 'apikey:' });
const mrr = keys.keys.length * 5; // $5 per subscription
```

---

## Dashboard Integration

**Add to analytics page:**
```tsx
// Show MRR and active subscriptions
const [mrr, setMrr] = useState(0);
const [activeUsers, setActiveUsers] = useState(0);

useEffect(() => {
  fetch('/api/revenue-stats')
    .then(r => r.json())
    .then(data => {
      setMrr(data.mrr);
      setActiveUsers(data.activeUsers);
    });
}, []);
```

---

## Next Steps

1. ✅ Get Stripe test keys
2. ✅ Create products
3. ✅ Add to .env
4. ⏳ Implement checkout endpoint
5. ⏳ Implement webhook handler
6. ⏳ Add API key middleware
7. ⏳ Test with test card

**Time estimate:** 30 min setup + 1h implementation

---

## Troubleshooting

**Issue:** Webhook not receiving events
- Check endpoint URL in dashboard
- Verify webhook secret in .env
- Check Stripe CLI logs: `stripe listen`

**Issue:** Payment fails
- Use test card numbers only
- Check Stripe dashboard for error logs
- Verify amount is in cents (500 = $5.00)

**Issue:** API key not working
- Check KV namespace binding
- Verify key format: `zeno_xxx`
- Check expiration in KV

---

## Resources

- Stripe Docs: https://stripe.com/docs
- Test Cards: https://stripe.com/docs/testing
- Webhooks: https://stripe.com/docs/webhooks
- Stripe CLI: https://stripe.com/docs/stripe-cli
