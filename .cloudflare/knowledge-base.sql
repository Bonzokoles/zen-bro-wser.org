-- Knowledge Base dla ZENO Browser
-- Baza wiedzy o aplikacji do RAG

CREATE TABLE IF NOT EXISTS knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT, -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeks dla szybkiego wyszukiwania
CREATE INDEX idx_kb_category ON knowledge_base(category);
CREATE INDEX idx_kb_title ON knowledge_base(title);

-- Podstawowe dane o ZENO Browser
INSERT INTO knowledge_base (category, title, content, keywords) VALUES
('overview', 'Co to jest ZENO Browser', 
'ZENO Browser to nowoczesna przeglądarka internetowa zbudowana na technologiach Astro 5 i React 19. Oferuje zaawansowane funkcje jak multi-tab management, AI chat integration, i MCP (Model Context Protocol) tools. Zapewnia szybkie przeglądanie stron z naciskiem na prywatność i wydajność.',
'["przeglądarka", "astro", "react", "ai", "mcp", "prywatność"]'),

('features', 'AI Assistant', 
'ZENO Browser zawiera wbudowanego AI asystenta wykorzystującego Cloudflare Workers AI. Dostępne modele to Mistral 7B, Llama 3.1 8B, Gemma 7B, Qwen 7B. System automatycznie tłumaczy polskie pytania na angielski i odpowiedzi z powrotem na polski używając modelu m2m100-1.2b.',
'["ai", "assistant", "mistral", "llama", "gemma", "tłumaczenie", "workers ai"]'),

('features', 'Multi-Tab System', 
'Zaawansowany system zarządzania zakładkami z funkcjami: tworzenie, zamykanie, przełączanie między zakładkami. Każda zakładka ma własną historię i stan. Obsługa keyboard shortcuts (Ctrl+T, Ctrl+W, Ctrl+Tab).',
'["zakładki", "tabs", "multi-tab", "shortcuts", "keyboard"]'),

('features', 'MCP Tools', 
'Model Context Protocol zapewnia 6 narzędzi: web_search, content_analysis, bookmark_manager, page_summarizer, link_extractor, web_navigation. Integracja z Tavily Search API dla wyszukiwania w sieci.',
'["mcp", "tools", "search", "tavily", "bookmarks", "navigation"]'),

('features', 'Iframe Testing', 
'Zaawansowany system testowania stron w iframe z metrykami wydajności (DNS, TCP, TLS, Request, Response), wykrywaniem błędów CORS, X-Frame-Options, timeout handling, i analizą zawartości.',
'["iframe", "testing", "performance", "cors", "metrics"]'),

('tech', 'Stack Technologiczny', 
'Frontend: Astro 5.14.8, React 19.2, TypeScript, Tailwind CSS. Backend: Cloudflare Workers, D1 Database (SQLite), KV Cache, Workers AI. Deployment: Cloudflare Pages. Search: Tavily API.',
'["astro", "react", "typescript", "cloudflare", "d1", "workers", "deployment"]'),

('api', 'REST API Endpoints', 
'Worker API dostępne pod https://zeno-browser-api.stolarnia-ams.workers.dev. Endpointy: GET /health, GET /api/iframe/sites (search z cache), POST /api/ai-assistant, GET/POST/PUT/DELETE /api/admin/sites, GET /api/admin/users.',
'["api", "rest", "endpoints", "worker", "cloudflare"]'),

('usage', 'Jak używać Quick Chat', 
'Kliknij przycisk 🤖 w prawym dolnym rogu aby otworzyć Quick Chat. Wpisz pytanie po polsku lub angielsku. Wybierz model z listy (domyślnie Mistral 7B). System automatycznie przetłumaczy pytanie i odpowiedź.',
'["chat", "quick chat", "ai", "użycie", "instrukcja"]'),

('usage', 'Otwieranie stron', 
'Wpisz URL w pasku adresu lub wybierz z listy popularnych stron. Wspierane formaty: pełny URL (https://...), domena (google.com), skrót (/search). Parser automatycznie dopełnia protokół.',
'["url", "strony", "nawigacja", "parser", "adresy"]'),

('deployment', 'Gdzie jest wdrożony', 
'Frontend: https://zeno-browser.pages.dev i www.zenbrowsers.org. Backend Worker API: https://zeno-browser-api.stolarnia-ams.workers.dev. Localhost dev: http://localhost:4378.',
'["deployment", "hosting", "cloudflare", "pages", "url", "produkcja"]');
