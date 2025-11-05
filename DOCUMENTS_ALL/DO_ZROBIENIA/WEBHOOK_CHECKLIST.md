# Webhook Configuration Checklist

## ⏸️ CURRENTLY AT: Step 2 - Configure Webhook in Stripe

**Date:** November 5, 2025  
**Time:** ~10 minutes needed

---

## ✅ COMPLETED

- [x] Worker deployed with webhook handler
- [x] Webhook endpoint ready: `/api/webhook`
- [x] Event handling implemented (5 types)
- [x] API key generation logic ready
- [x] Test script created
- [x] Documentation prepared

---

## 🔄 IN PROGRESS

### Action: Configure Webhook in Stripe Dashboard

**URL:** https://dashboard.stripe.com/test/webhooks

**Steps to complete:**

1. **Open Stripe Dashboard**
   - Navigate to: Developers → Webhooks
   - Click "Add endpoint"

2. **Enter Endpoint URL**
   ```
   https://zeno-browser-api.stolarnia-ams.workers.dev/api/webhook
   ```

3. **Select Events** (6 events):
   - [x] `checkout.session.completed`
   - [x] `customer.subscription.created`
   - [x] `customer.subscription.updated`
   - [x] `customer.subscription.deleted`
   - [x] `invoice.payment_succeeded`
   - [x] `invoice.payment_failed`

4. **Create Endpoint**
   - Click "Add endpoint"
   - Copy the **Signing Secret** (whsec_...)

5. **Add Secret to Worker**
   ```powershell
   cd V:\PROTO_TYpy\ZENO_web_CORE\.cloudflare
   echo "whsec_YOUR_SECRET" | wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

6. **Test Webhook**
   ```powershell
   # Option A: Stripe Dashboard test
   # Click "Send test webhook" in endpoint details
   
   # Option B: Real payment test
   .\test-webhook-flow.ps1
   ```

---

## ⏳ PENDING

- [ ] Webhook signing secret added to Worker
- [ ] Test webhook sent from Stripe
- [ ] API key generated on successful payment
- [ ] Logs verified (`wrangler tail`)
- [ ] KV storage checked for API keys

---

## 🎯 SUCCESS CRITERIA

When webhook is working correctly:

1. ✅ Stripe shows webhook as "Active" with green dot
2. ✅ Test event returns `200 OK`
3. ✅ Logs show: `API key generated: zeno_xxx`
4. ✅ KV contains key: `apikey:zeno_xxx`
5. ✅ User receives email with API key (future)

---

## 🐛 IF WEBHOOK FAILS

### Check 1: Signing Secret
```powershell
wrangler secret list
# Should show: STRIPE_WEBHOOK_SECRET
```

### Check 2: Worker Deployed
```powershell
curl https://zeno-browser-api.stolarnia-ams.workers.dev/health
# Should return: {"status":"ok","timestamp":...}
```

### Check 3: Stripe Logs
- Go to: https://dashboard.stripe.com/test/webhooks
- Click endpoint → "Events" tab
- Check status codes and error messages

### Check 4: Worker Logs
```powershell
wrangler tail
# Watch for: "Webhook event: checkout.session.completed"
```

---

## 📞 QUICK FIX

If nothing works:
1. Delete webhook in Stripe
2. Create new webhook endpoint
3. Copy NEW signing secret
4. Update Worker secret
5. Test again

**Most common issue:** Old/wrong signing secret

---

## ⏭️ NEXT AFTER WEBHOOK WORKS

1. **C) Build User Dashboard** - Display API key
2. **D) Invite Beta Testers** - 5 users
3. **E) Monitor First Payments** - Track MRR
4. **F) Setup Email Notifications** - Send API key

**Estimated time:** Day 3 (3-4 hours)

---

**CURRENT ACTION:** Configure webhook in Stripe Dashboard  
**ETA:** 5-10 minutes  
**Documentation:** WEBHOOK_SETUP_GUIDE.md
