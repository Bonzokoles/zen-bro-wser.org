# 🔑 GitHub Secrets Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get Cloudflare Account ID

```powershell
# Run this in terminal:
wrangler whoami
```

**Output will show:**
```
👋 You are logged in with...
┌────────────────────┬──────────────────────────────────┐
│ Account Name       │ Account ID                       │
├────────────────────┼──────────────────────────────────┤
│ Your Account       │ abc123def456...                  │
└────────────────────┴──────────────────────────────────┘
```

**Copy the Account ID** (32-character hex string)

---

### Step 2: Create Cloudflare API Token

1. **Go to:** https://dash.cloudflare.com/profile/api-tokens
2. **Click:** "Create Token"
3. **Choose:** "Edit Cloudflare Workers" template
4. **Or create custom token with these permissions:**

```yaml
Account Permissions:
  ✅ Workers Scripts - Edit
  ✅ Cloudflare Pages - Edit
  ✅ Workers KV Storage - Edit
  ✅ D1 - Edit

Zone Permissions:
  ✅ Zone - Read (for your domain)
  ✅ DNS - Edit (if using custom domain)
```

5. **Set Account Resources:**
   - Include: Your account (select from dropdown)

6. **Set Zone Resources:**
   - Include: `zenbrowsers.org`

7. **Client IP Address Filtering:** (Optional)
   - Leave as "All IPs" for GitHub Actions

8. **TTL:** (Optional)
   - Leave blank for no expiration
   - Or set expiration date if preferred

9. **Click:** "Continue to summary"
10. **Click:** "Create Token"
11. **COPY THE TOKEN** (you'll only see it once!)

---

### Step 3: Add Secrets to GitHub

1. **Go to your repository:**
   - https://github.com/Bonzokoles/zen-bro-wser.org

2. **Navigate to:**
   - Settings → Secrets and variables → Actions

3. **Click:** "New repository secret"

4. **Add these 3 secrets:**

#### Secret 1: `CLOUDFLARE_API_TOKEN`
```
Name: CLOUDFLARE_API_TOKEN
Value: [paste your API token from Step 2]
```

#### Secret 2: `CLOUDFLARE_ACCOUNT_ID`
```
Name: CLOUDFLARE_ACCOUNT_ID
Value: [paste your Account ID from Step 1]
```

#### Secret 3: `VITE_API_URL` (after Worker deployment)
```
Name: VITE_API_URL
Value: https://zeno-browser-api.<your-subdomain>.workers.dev
```

*Note: You'll get the Worker URL after first deployment*

---

## 🔍 Verification

After adding secrets, they should appear in:
**Settings → Secrets and variables → Actions → Repository secrets**

✅ **You should see:**
```
CLOUDFLARE_API_TOKEN     • Updated X minutes ago
CLOUDFLARE_ACCOUNT_ID    • Updated X minutes ago
VITE_API_URL            • Updated X minutes ago
```

---

## 🚀 Test Deployment

1. **Make a small change** (e.g., edit README.md)
2. **Commit and push:**
   ```powershell
   git add .
   git commit -m "test: trigger deployment"
   git push origin main
   ```
3. **Watch deployment:**
   - Go to: https://github.com/Bonzokoles/zen-bro-wser.org/actions
   - Click on the latest workflow run
   - Monitor build logs

---

## ✅ Success Indicators

### GitHub Actions:
- ✅ Workflow runs without errors
- ✅ All steps show green checkmarks
- ✅ "Deploy to Cloudflare Pages" step succeeds
- ✅ "Deploy Worker API" step succeeds

### Cloudflare Dashboard:
- ✅ New deployment appears in Pages
- ✅ Worker shows as "deployed" in Workers tab
- ✅ Site loads at https://zenbrowsers.org

### API Test:
```powershell
# Test Worker health endpoint
curl https://zeno-browser-api.<your-subdomain>.workers.dev/health

# Expected response:
# {"status":"ok","timestamp":"2024-11-04T..."}
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use API tokens instead of API keys
- Set minimal required permissions
- Use IP filtering if deploying from fixed IPs
- Set token expiration dates
- Rotate tokens periodically
- Review token usage in Cloudflare dashboard

### ❌ DON'T:
- Share API tokens publicly
- Commit tokens to Git
- Use Global API Key
- Give unnecessary permissions
- Use tokens across multiple projects

---

## 🐛 Common Issues

### Issue: "Invalid API token"
**Cause:** Token doesn't have correct permissions

**Solution:**
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Find your token
3. Click "Edit"
4. Ensure these permissions are enabled:
   - Workers Scripts → Edit ✅
   - Cloudflare Pages → Edit ✅
   - Workers KV Storage → Edit ✅
   - D1 → Edit ✅

---

### Issue: "Account not found"
**Cause:** Wrong Account ID

**Solution:**
```powershell
# Get correct Account ID
wrangler whoami

# Update GitHub secret with new ID
```

---

### Issue: "Project not found"
**Cause:** Cloudflare Pages project doesn't exist

**Solution:**
1. Go to: https://dash.cloudflare.com/pages
2. Create new project manually
3. Or let GitHub Action create it on first deploy

---

### Issue: Workflow runs but deployment fails
**Cause:** D1 or KV resources missing

**Solution:**
```powershell
# Check resources exist
wrangler d1 list
wrangler kv:namespace list

# If missing, run setup:
cd .cloudflare
.\setup.ps1
```

---

## 🔄 Updating Secrets

To update a secret:

1. Go to: **Settings → Secrets and variables → Actions**
2. Click the secret name
3. Click "Update secret"
4. Enter new value
5. Click "Update secret"

Changes take effect on next workflow run.

---

## 📊 Monitoring Token Usage

Check token activity:

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click on your token
3. Scroll to "Activity Log"
4. View recent API calls made with token

---

## 🗑️ Revoking Tokens

If token is compromised:

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Find the token
3. Click "Roll" (regenerate) or "Delete"
4. Update GitHub secret with new token

---

## 📝 Quick Reference

### Required Secrets:
| Name | Type | Required | Example |
|------|------|----------|---------|
| `CLOUDFLARE_API_TOKEN` | Token | ✅ Yes | `abc123...xyz789` |
| `CLOUDFLARE_ACCOUNT_ID` | ID | ✅ Yes | `1a2b3c4d5e6f...` |
| `VITE_API_URL` | URL | ⚠️ Optional | `https://api.example.com` |

### Useful Commands:
```powershell
# Get Account ID
wrangler whoami

# Test API token (local)
wrangler deploy --dry-run

# View deployments
wrangler deployments list

# View logs
wrangler tail
```

### Important Links:
- API Tokens: https://dash.cloudflare.com/profile/api-tokens
- GitHub Secrets: https://github.com/Bonzokoles/zen-bro-wser.org/settings/secrets/actions
- GitHub Actions: https://github.com/Bonzokoles/zen-bro-wser.org/actions
- Cloudflare Pages: https://dash.cloudflare.com/pages
- Cloudflare Workers: https://dash.cloudflare.com/workers

---

## ✅ Setup Complete!

Once all secrets are added and workflow runs successfully, you have:

🎉 **Fully automated CI/CD pipeline!**

Every `git push origin main` will:
1. ✅ Build your Astro app
2. ✅ Deploy to Cloudflare Pages
3. ✅ Deploy Worker API
4. ✅ Update https://zenbrowsers.org
5. ✅ Send deployment notifications

**No manual deployment needed!** 🚀
