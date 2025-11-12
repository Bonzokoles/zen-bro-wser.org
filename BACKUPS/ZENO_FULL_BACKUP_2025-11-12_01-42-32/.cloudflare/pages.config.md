# 🚀 Cloudflare Pages Configuration
# https://developers.cloudflare.com/pages/configuration/build-configuration/

# This file is used by Cloudflare Pages for deployment configuration
# Some settings can only be configured via the Cloudflare Dashboard

# ============================================
# BUILD SETTINGS (also set in Dashboard)
# ============================================

# Build command: npm run build
# Build output directory: dist
# Root directory: ZENO_WEB_CORE_APP
# Framework preset: Astro

# ============================================
# ENVIRONMENT VARIABLES
# ============================================

# Set these in: Cloudflare Dashboard → Pages → Settings → Environment variables

# Production:
# NODE_VERSION=18
# VITE_API_URL=https://zeno-browser-api.workers.dev
# VITE_ENVIRONMENT=production
# VITE_GEMINI_API_KEY=<your-key>  # Or proxy through Worker

# Preview (branches):
# NODE_VERSION=18
# VITE_API_URL=https://zeno-browser-api-staging.workers.dev
# VITE_ENVIRONMENT=staging

# ============================================
# FUNCTIONS (Cloudflare Pages Functions)
# ============================================

# Location: ZENO_WEB_CORE_APP/functions/
# These run on Cloudflare's edge alongside your static site

# Example: functions/api/hello.ts
# URL: https://your-site.pages.dev/api/hello

# Middleware example: functions/_middleware.ts
# Runs before all functions/routes

# ============================================
# REDIRECTS & HEADERS
# ============================================

# _redirects file location: ZENO_WEB_CORE_APP/public/_redirects
# Format:
# /old-path /new-path 301
# /api/* https://api.example.com/:splat 200

# _headers file location: ZENO_WEB_CORE_APP/public/_headers
# Format:
# /secure/*
#   X-Frame-Options: DENY
#   X-Content-Type-Options: nosniff

# ============================================
# CUSTOM DOMAINS
# ============================================

# Set in: Cloudflare Dashboard → Pages → Custom domains
# 
# Example:
# - zeno-browser.com (apex domain)
# - www.zeno-browser.com (subdomain)
# - app.zeno-browser.com (app subdomain)

# DNS Settings (in Cloudflare DNS):
# Type: CNAME
# Name: @ (for apex) or subdomain
# Content: <your-project>.pages.dev
# Proxy: Enabled (orange cloud)

# ============================================
# BRANCH DEPLOYMENTS
# ============================================

# Production branch: main
# Preview branches: All other branches automatically deployed
# 
# URLs:
# - Production: https://zeno-browser.pages.dev
# - Branch preview: https://<branch>.<project>.pages.dev
# - Commit preview: https://<commit-hash>.<project>.pages.dev

# ============================================
# BUILD CONFIGURATION RULES
# ============================================

# Set in: Dashboard → Pages → Settings → Builds & deployments

# Branch patterns:
# - main → Production
# - staging → Staging environment
# - feature/* → Preview deployments
# - fix/* → Preview deployments

# Skip builds for:
# - [skip ci] in commit message
# - Changes only in specific paths (e.g., docs/)

# ============================================
# DEPLOYMENT HOOKS
# ============================================

# Trigger deployments via API:
# curl -X POST "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/<hook_id>"

# Use cases:
# - CI/CD integration
# - Scheduled rebuilds
# - External triggers

# ============================================
# ADVANCED SETTINGS
# ============================================

# Compatibility Date: 2024-11-01
# Compatibility Flags: []

# Node.js version: 18 (set via NODE_VERSION env var)
# Package manager: npm (auto-detected from lock file)

# ============================================
# ACCESS CONTROL
# ============================================

# Set in: Dashboard → Pages → Settings → Access policies
# 
# Options:
# - Public: Anyone can access
# - Cloudflare Access: Require authentication
# - Preview deployments only: Protect preview branches

# ============================================
# ANALYTICS & MONITORING
# ============================================

# Web Analytics: Enable in Dashboard → Analytics → Web Analytics
# Real User Monitoring: Enable in Dashboard → Speed → Optimization

# Metrics available:
# - Page views
# - Unique visitors
# - Build duration
# - Deployment frequency

# ============================================
# INTEGRATIONS
# ============================================

# GitHub Integration:
# - Automatic deployments on push
# - PR preview comments
# - Deployment status checks

# Sentry (Error Tracking):
# Set SENTRY_DSN environment variable

# Vercel Analytics alternative:
# Cloudflare Web Analytics (built-in, free)

# ============================================
# PAGES FUNCTIONS CONFIGURATION
# ============================================

# functions/_middleware.ts example:
# export async function onRequest(context) {
#   const response = await context.next();
#   response.headers.set('X-Custom-Header', 'value');
#   return response;
# }

# functions/api/proxy.ts example:
# export async function onRequest(context) {
#   const url = new URL(context.request.url);
#   if (url.pathname.startsWith('/api/')) {
#     return fetch(`https://api.worker.dev${url.pathname}`, context.request);
#   }
#   return context.next();
# }

# ============================================
# DEPLOYMENT CHECKLIST
# ============================================

# Before first deploy:
# [ ] Connect GitHub repository
# [ ] Set build command: npm run build
# [ ] Set build output: dist
# [ ] Set root directory: ZENO_WEB_CORE_APP
# [ ] Select framework: Astro
# [ ] Set environment variables (see above)
# [ ] Configure custom domain (optional)
# [ ] Enable Web Analytics

# After first deploy:
# [ ] Verify site loads correctly
# [ ] Test API proxy (if using functions)
# [ ] Check custom domain SSL
# [ ] Enable branch previews
# [ ] Set up deployment notifications
# [ ] Configure access control (if needed)

# ============================================
# TROUBLESHOOTING
# ============================================

# Build fails:
# - Check build logs in Dashboard
# - Verify environment variables are set
# - Ensure all dependencies in package.json
# - Check NODE_VERSION matches local

# 404 errors:
# - Verify build output directory is correct
# - Check _redirects file for conflicts
# - Ensure routes are properly configured in Astro

# API calls fail:
# - Check VITE_API_URL environment variable
# - Verify Worker is deployed and accessible
# - Check CORS headers in Worker response

# ============================================
# USEFUL LINKS
# ============================================

# Dashboard: https://dash.cloudflare.com/pages
# Documentation: https://developers.cloudflare.com/pages
# Community: https://community.cloudflare.com
# Status: https://www.cloudflarestatus.com
