# Setup Script - Inicjalizacja infrastruktury Cloudflare
# Uruchamia wszystkie wymagane zasoby

Write-Host "🚀 Zen Browser - Konfiguracja Gateway i WebSockets" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$basePath = $PSScriptRoot

# ============================================
# 1. TWORZENIE BAZY DANYCH D1
# ============================================

Write-Host "📦 Tworzenie bazy danych D1..." -ForegroundColor Yellow

try {
    $d1Output = npx wrangler d1 create zen-browser-db 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Baza D1 utworzona pomyślnie" -ForegroundColor Green
        Write-Host $d1Output
    }
    else {
        Write-Host "⚠️  Baza D1 prawdopodobnie już istnieje" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️  Baza D1 prawdopodobnie już istnieje" -ForegroundColor Yellow
}

# ============================================
# 2. TWORZENIE KV NAMESPACES
# ============================================

Write-Host "`n🗄️  Tworzenie KV Namespaces..." -ForegroundColor Yellow

$namespaces = @("CACHE", "SESSIONS", "METRICS")

foreach ($ns in $namespaces) {
    try {
        $kvOutput = npx wrangler kv:namespace create $ns 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ KV Namespace '$ns' utworzony" -ForegroundColor Green
            Write-Host $kvOutput
        }
    }
    catch {
        Write-Host "⚠️  KV Namespace '$ns' prawdopodobnie już istnieje" -ForegroundColor Yellow
    }
}

# ============================================
# 3. TWORZENIE R2 BUCKET
# ============================================

Write-Host "`n🪣 Tworzenie R2 Bucket..." -ForegroundColor Yellow

try {
    npx wrangler r2 bucket create zen-static-assets
    Write-Host "✅ R2 Bucket utworzony" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  R2 Bucket prawdopodobnie już istnieje" -ForegroundColor Yellow
}

# ============================================
# 4. TWORZENIE VECTORIZE INDEX
# ============================================

Write-Host "`n🔍 Tworzenie Vectorize Index..." -ForegroundColor Yellow

try {
    npx wrangler vectorize create zen-rag-index --dimensions=768 --metric=cosine
    Write-Host "✅ Vectorize Index utworzony" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Vectorize Index prawdopodobnie już istnieje" -ForegroundColor Yellow
}

# ============================================
# 5. INICJALIZACJA SCHEMATÓW BAZY DANYCH
# ============================================

Write-Host "`n🗃️  Inicjalizacja schematów bazy danych..." -ForegroundColor Yellow

$schema = @"
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    metadata TEXT,
    indexed_at TEXT NOT NULL
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Collaboration documents
CREATE TABLE IF NOT EXISTS collab_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    data TEXT,
    read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
);

-- MCP executions log
CREATE TABLE IF NOT EXISTS mcp_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name TEXT NOT NULL,
    arguments TEXT,
    result TEXT,
    created_at TEXT NOT NULL
);

-- Metrics
CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    data TEXT,
    user_id TEXT,
    session_id TEXT,
    created_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_room ON chat_messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(type, created_at);
"@

$schemaFile = Join-Path $basePath "schema.sql"
$schema | Out-File -FilePath $schemaFile -Encoding UTF8

try {
    npx wrangler d1 execute zen-browser-db --file=$schemaFile
    Write-Host "✅ Schematy bazy danych utworzone" -ForegroundColor Green
}
catch {
    Write-Host "❌ Błąd tworzenia schematów" -ForegroundColor Red
}

# ============================================
# 6. CONFIGURATION SECRETS
# ============================================

Write-Host "`n🔐 Configuration secrets..." -ForegroundColor Yellow
Write-Host "Set the following secrets manually:" -ForegroundColor Cyan
Write-Host "  npx wrangler secret put OPENROUTER_API_KEY" -ForegroundColor White
Write-Host "  npx wrangler secret put DEEPSEEK_API_KEY" -ForegroundColor White
Write-Host "  npx wrangler secret put JWT_SECRET" -ForegroundColor White

# ============================================
# 7. SUMMARY
# ============================================

Write-Host "`n✨ Configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update wrangler.gateways.toml with generated IDs" -ForegroundColor White
Write-Host "2. Set secrets (see above)" -ForegroundColor White
Write-Host "3. Deploy workers:" -ForegroundColor White
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env api-gateway" -ForegroundColor Gray
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env static-gateway" -ForegroundColor Gray
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env auth-gateway" -ForegroundColor Gray
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env metrics-gateway" -ForegroundColor Gray
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env deepseek-gateway" -ForegroundColor Gray
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env mcp-gateway" -ForegroundColor Gray
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env rag-gateway" -ForegroundColor Gray
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env chat-ws" -ForegroundColor Gray
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env collab-ws" -ForegroundColor Gray
Write-Host "   npx wrangler deploy --config wrangler.gateways.toml --env notifications-ws" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Endpoints will be available at:" -ForegroundColor Cyan
Write-Host "  api.zen-bro-wser.org        - REST API Gateway"
Write-Host "  static.zen-bro-wser.org     - Static Files CDN"
Write-Host "  auth.zen-bro-wser.org       - Authentication"
Write-Host "  metrics.zen-bro-wser.org    - Analytics and Metrics"
Write-Host "  ai.zen-bro-wser.org         - DeepSeek AI"
Write-Host "  mcp.zen-bro-wser.org        - MCP Integration"
Write-Host "  rag.zen-bro-wser.org        - Vector Search RAG"
Write-Host "  chat.zen-bro-wser.org       - Chat WebSocket"
Write-Host "  collab.zen-bro-wser.org     - Collaboration WS"
Write-Host "  notifications.zen-bro-wser.org - Notifications WS"
Write-Host ""
