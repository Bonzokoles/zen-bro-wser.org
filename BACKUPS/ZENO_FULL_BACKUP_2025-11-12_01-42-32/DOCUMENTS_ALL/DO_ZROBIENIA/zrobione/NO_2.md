// /api/track endpoint
app.post('/api/track', async (c) => {
  const { url, action } = await c.req.json()
  const key = `track:${Date.now()}:${crypto.randomUUID()}`
  await c.env.EDGE_CACHE.put(key, JSON.stringify({
    url, action,
    ip: c.req.header('CF-Connecting-IP'),
    country: c.req.header('CF-IPCountry'),
    ts: Date.now()
  }), { expirationTtl: 86400 * 7 })
  return c.json({ ok: true })
})

// /stats endpoint  
app.get('/stats', async (c) => {
  const keys = await c.env.EDGE_CACHE.list({ prefix: 'track:' })
  const data = await Promise.all(
    keys.keys.slice(0, 100).map(k => c.env.EDGE_CACHE.get(k.name, 'json'))
  )
  
  const stats = {
    total: data.length,
    byUrl: data.reduce((acc, d) => {
      acc[d.url] = (acc[d.url] || 0) + 1
      return acc
    }, {}),
    byCountry: data.reduce((acc, d) => {
      acc[d.country] = (acc[d.country] || 0) + 1
      return acc
    }, {})
  }
  
  return c.json(stats)
})
```

### Realistyczny Timeline:

**Week 1 (4-7 Nov):**
- ✅ Day 1: Analytics + backup (DZIŚ)
- Day 2: Test analytics, Stripe setup
- Day 3: Paywall MVP (bez email, tylko KV check)
- Day 4: Affiliate links

**Week 2 (8-14 Nov):**
- Day 5-7: Cleanup (workers, KV, D1, R2)
- Day 8-10: ZenProxy MVP (bez landing page, tylko API)
- Day 11: Test API z 10 klientami ręcznie

**Week 3 (15-18 Nov):**
- Day 12-14: Landing page + Stripe
- Day 15: Soft launch (Twitter, no ProductHunt yet)
- Day 16-18: Bug fixes, optimizacja

**💰 Conservative Revenue:**
```
Week 1: $0 (testing)
Week 2: $10 (2 early customers)
Week 3: $25 (5 customers × $5)
Month 2: $100 (organic growth)

🚨 CRITICAL PATH (musisz to zrobić DZIŚ!):

✅ Backup wszystkich workerów (już masz MCP access)
⚠️ Przeczytaj Cloudflare ToS sekcja "Proxying"
✅ Setup Stripe test mode
✅ Deploy analytics endpoint