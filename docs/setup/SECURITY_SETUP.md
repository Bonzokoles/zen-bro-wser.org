# Security Configuration Guide

## 🔐 API Keys Management

### Current Setup Status
✅ Environment variables configured
✅ .gitignore updated (excludes .env files)
⚠️ GitHub Secrets need to be configured
⚠️ Cloudflare Workers secrets need to be added

---

## 📋 Required GitHub Secrets

Go to: **Settings > Secrets and variables > Actions > New repository secret**

### 1. AI Provider Keys

```bash
OPENAI_API_KEY=sk-proj-...
OPENROUTER_API_KEY=sk-or-...
HUGGINGFACE_API_KEY=hf_...
GOOGLE_GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Stripe Payment Keys

```bash
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
```

### 3. Cloudflare Deployment

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### 4. Optional Services

```bash
TAVILY_API_KEY=tvly-...
SENDGRID_API_KEY=SG...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
```

---

## 🔧 Cloudflare Workers Secrets

Add secrets to your Worker using wrangler CLI:

```powershell
# Navigate to worker directory
cd .cloudflare

# Add each secret individually
echo "sk-proj-..." | wrangler secret put OPENAI_API_KEY
echo "sk-or-..." | wrangler secret put OPENROUTER_API_KEY
echo "hf_..." | wrangler secret put HUGGINGFACE_API_KEY
echo "AIza..." | wrangler secret put GOOGLE_GEMINI_API_KEY
echo "sk-ant-..." | wrangler secret put ANTHROPIC_API_KEY
echo "sk_test_..." | wrangler secret put STRIPE_SECRET_KEY
echo "whsec_..." | wrangler secret put STRIPE_WEBHOOK_SECRET

# List all secrets (doesn't show values)
wrangler secret list
```

---

## 🛡️ Security Best Practices

### 1. **Never Commit Secrets**
- ✅ .env added to .gitignore
- ✅ .env.example created (no actual values)
- ❌ Never use `git add -f .env`

### 2. **Separate Keys by Environment**
```bash
# Development
OPENAI_API_KEY=sk-proj-dev-...

# Staging
OPENAI_API_KEY=sk-proj-staging-...

# Production
OPENAI_API_KEY=sk-proj-prod-...
```

### 3. **Rotate Keys Regularly**
- Rotate every **90 days**
- Immediate rotation if compromised
- Use key expiration dates

### 4. **Monitor API Usage**
- Set up alerts for unusual activity
- Review logs weekly
- Enable rate limiting

### 5. **Access Control**
- Limit team access to production keys
- Use role-based permissions
- Audit access logs

---

## ⚙️ Environment Variables Loading

### Local Development (.env file)
```bash
# Create .env from template
cp .env.example .env

# Edit with actual values
code .env
```

### GitHub Actions (Secrets)
Automatically loaded from repository secrets.

### Cloudflare Workers (wrangler secrets)
Accessed via `env` parameter:
```typescript
export default {
  async fetch(request: Request, env: Env) {
    const apiKey = env.OPENAI_API_KEY;
    // ...
  }
}
```

### Astro App (import.meta.env)
```typescript
// Access in Astro/React components
const apiKey = import.meta.env.VITE_API_URL;
```

---

## 🚨 What to Do if Keys are Exposed

### Immediate Actions:
1. **Revoke compromised key** in provider dashboard
2. **Generate new key**
3. **Update all environments** (GitHub Secrets, Cloudflare, local)
4. **Rotate related keys** (e.g., if Stripe key exposed, rotate webhook secret too)
5. **Check usage logs** for unauthorized activity
6. **Run security scan**: `npm audit`

### GitHub Secret Scanning
- ✅ Enabled automatically
- Blocks pushes with detected secrets
- Alerts sent to repository admins

---

## 📊 Current Configuration

### Files Secured:
- ✅ `.env` (git ignored)
- ✅ `.env.example` (template only, safe to commit)
- ✅ `.cloudflare/create-stripe-products.js` (git ignored)
- ✅ `test-session.json` (git ignored)
- ✅ `MCP_SERVERS_RESTORE.md` (git ignored - contains tokens)

### Email Contact:
- **Support Email:** JimBoZen@proton.me
- Updated in:
  - Dashboard (`/src/pages/dashboard.astro`)
  - Success page (`/src/pages/success.astro`)
  - Pricing page (`/src/pages/pricing.astro`)

---

## 🔍 Verify Security Setup

Run these checks:

```powershell
# 1. Check .gitignore
cat .gitignore | Select-String ".env"

# 2. Verify no secrets in repo
git grep -i "sk-proj" || echo "✓ No OpenAI keys"
git grep -i "sk_test" || echo "✓ No Stripe keys"
git grep -i "whsec" || echo "✓ No webhook secrets"

# 3. List GitHub secrets (names only)
gh secret list

# 4. List Cloudflare secrets (names only)
cd .cloudflare; wrangler secret list

# 5. Scan for vulnerabilities
npm audit --audit-level=moderate
```

---

## 📝 Next Steps

### Before First Deployment:
1. [ ] Add all secrets to GitHub Actions
2. [ ] Add all secrets to Cloudflare Worker
3. [ ] Test deployment in staging
4. [ ] Verify API endpoints work
5. [ ] Enable monitoring/alerts

### Regular Maintenance:
- **Weekly:** Review API usage logs
- **Monthly:** Check for npm vulnerabilities (`npm audit`)
- **Quarterly:** Rotate all API keys
- **Annually:** Security audit

---

## 📞 Support

**Security Issues:** JimBoZen@proton.me  
**Priority:** High (24h response)

---

**Last Updated:** 2025-01-15  
**Version:** 1.0  
**Status:** Configuration Complete
