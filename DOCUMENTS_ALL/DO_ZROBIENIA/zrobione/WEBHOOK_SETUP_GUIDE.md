# Stripe Webhook Setup - Step by Step

**Status:** 🔄 IN PROGRESS  
**Date:** November 5, 2025

---

## ✅ PREREQUISITES COMPLETED

- [x] Stripe account created
- [x] Test API keys obtained
- [x] Products created (Monthly $5, Yearly $50)
- [x] Worker deployed with webhook handler
- [x] Webhook endpoint: `https://zeno-browser-api.stolarnia-ams.workers.dev/api/webhook`

---

## 📋 STEP-BY-STEP GUIDE

### Step 1: Open Stripe Webhooks Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Make sure you're in **Test mode** (toggle in top-right)
3. Click **"Add endpoint"** button

### Step 2: Configure Endpoint

**Endpoint URL:**
```
https://zeno-browser-api.stolarnia-ams.workers.dev/api/webhook
```

**Description:**
```
ZENO Browser - Payment & Subscription Events
```

**Version:**
```
Latest API version (2024-11-20.acacia)
```

### Step 3: Select Events to Listen

Select these 5 critical events:

- ✅ `checkout.session.completed` - When payment succeeds
- ✅ `customer.subscription.created` - When subscription starts
- ✅ `customer.subscription.updated` - When subscription changes
- ✅ `customer.subscription.deleted` - When subscription cancels
- ✅ `invoice.payment_succeeded` - When invoice is paid
- ✅ `invoice.payment_failed` - When payment fails

**Quick select:** Click "Select events" → Search for each event → Check box

### Step 4: Create Endpoint

1. Click **"Add endpoint"**
2. Copy the **Signing secret** (starts with `whsec_...`)
3. Save it immediately!

---

## 🔐 ADD SIGNING SECRET TO WORKER

```bash
cd V:\PROTO_TYpy\ZENO_web_CORE\.cloudflare

# Replace 'whsec_YOUR_SECRET_HERE' with actual secret from Step 4
echo "whsec_YOUR_SECRET_HERE" | wrangler secret put STRIPE_WEBHOOK_SECRET
```

**Verify:**
```bash
wrangler secret list
# Should show: STRIPE_WEBHOOK_SECRET (set)
```

---

## 🧪 TEST THE WEBHOOK

### Option A: Use Stripe Dashboard (Easiest)

1. In webhook details page, click **"Send test webhook"**
2. Select event: `checkout.session.completed`
3. Click **"Send test webhook"**
4. Check response: Should return `200 OK` with `{"received": true}`

### Option B: Real Payment Test

```bash
# Create checkout session
cd V:\PROTO_TYpy\ZENO_web_CORE\.cloudflare
node test-webhook-flow.js
```

Then:
1. Open returned URL in browser
2. Use test card: `4242 4242 4242 4242`
3. Complete payment
4. Webhook fires automatically → API key generated

---

## 📊 VERIFY API KEY GENERATION

After successful payment, check KV storage:

```bash
# List all API keys
wrangler kv:key list --binding=CACHE --prefix=apikey:

# Get specific key details
wrangler kv:key get --binding=CACHE "apikey:zeno_xxxxx"
```

**Expected output:**
```json
{
  "userId": "test-user-1234",
  "email": "test@example.com",
  "subscriptionId": "sub_xxxxx",
  "plan": "monthly",
  "status": "active",
  "createdAt": 1730784000000
}
```

---

## 🔍 DEBUGGING WEBHOOKS

### Check Webhook Logs in Stripe

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your endpoint
3. View **"Events"** tab
4. Check status codes and response times

### Check Worker Logs

```bash
# Real-time logs
wrangler tail

# Recent deployments
wrangler deployments list
```

### Common Issues

**1. "Invalid signature" error**
- ✅ Solution: Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Command: `wrangler secret list`

**2. "Webhook endpoint not responding"**
- ✅ Solution: Check Worker is deployed and running
- Test: `curl https://zeno-browser-api.stolarnia-ams.workers.dev/health`

**3. "API key not generated"**
- ✅ Solution: Check webhook received `checkout.session.completed` event
- Look for: `console.log('API key generated:', apiKey)` in logs

---

## 📝 WEBHOOK HANDLER CODE REFERENCE

Current implementation in `.cloudflare/src/index.ts`:

```typescript
// POST /api/webhook
async function handleWebhook(request: Request, env: Env): Promise<Response> {
  // 1. Verify signature
  const signature = request.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  
  // 2. Handle events
  switch (event.type) {
    case 'checkout.session.completed':
      // Generate API key: zeno_<uuid>
      // Store in KV with metadata
      break;
    
    case 'customer.subscription.deleted':
      // Revoke API key
      break;
  }
  
  return Response.json({ received: true });
}
```

---

## ✅ SUCCESS CRITERIA

- [ ] Webhook endpoint created in Stripe
- [ ] Signing secret added to Worker
- [ ] Test webhook returns 200 OK
- [ ] Real payment generates API key
- [ ] API key stored in KV
- [ ] Logs show successful processing

---

## 🎯 NEXT STEPS AFTER WEBHOOK WORKS

1. **Test complete flow:** Pricing → Checkout → Payment → API key
2. **Verify email:** Test with real email address
3. **Check cancellation:** Cancel subscription and verify API key revoked
4. **Monitor logs:** Watch for errors in production
5. **Setup alerts:** Notify on webhook failures

---

## 🔗 USEFUL LINKS

- Webhook Dashboard: https://dashboard.stripe.com/test/webhooks
- Stripe Docs: https://stripe.com/docs/webhooks
- Test Cards: https://stripe.com/docs/testing
- Worker Logs: `wrangler tail`
- KV Browser: `wrangler kv:key list`

---

## 📞 SUPPORT

If webhook fails:
1. Check Stripe event logs
2. Run `wrangler tail` for real-time logs
3. Verify signing secret matches
4. Test with simple event first
5. Check CORS headers in Worker

**Most common fix:** Re-create webhook endpoint with fresh signing secret

---

**READY?** Follow steps above, then test with real payment! 🚀
