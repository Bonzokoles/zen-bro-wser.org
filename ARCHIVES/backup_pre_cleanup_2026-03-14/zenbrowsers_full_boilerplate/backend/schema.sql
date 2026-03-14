-- ZENO Browser - Cloudflare D1 Database Schema
-- Run: wrangler d1 execute zeno-browser-db --file=./schema.sql

-- Sites table (23 iframe-friendly sites)
CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  description TEXT,
  sandbox TEXT,
  height INTEGER DEFAULT 500,
  iframe_allowed INTEGER DEFAULT 1,
  added_at TEXT DEFAULT CURRENT_TIMESTAMP,
  test_count INTEGER DEFAULT 0,
  tags TEXT  -- JSON array as string
);

-- Indexes dla performance
CREATE INDEX IF NOT EXISTS idx_category ON sites(category);
CREATE INDEX IF NOT EXISTS idx_iframe_allowed ON sites(iframe_allowed);
CREATE INDEX IF NOT EXISTS idx_added_at ON sites(added_at DESC);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK(role IN ('admin', 'tester', 'viewer')) NOT NULL DEFAULT 'viewer',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Test results table (history)
CREATE TABLE IF NOT EXISTS test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  success INTEGER NOT NULL,
  load_time INTEGER,
  error_type TEXT,
  error_message TEXT,
  tested_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_test_site ON test_results(site_id);
CREATE INDEX IF NOT EXISTS idx_test_date ON test_results(tested_at DESC);

-- ============================================
-- SEED DATA - 23 Sites
-- ============================================

-- Development (5)
INSERT INTO sites (id, name, url, category, description, sandbox, iframe_allowed, test_count, tags) VALUES
(1, 'Wikipedia', 'https://en.wikipedia.org', 'reference', 'Free encyclopedia', 'allow-scripts allow-same-origin', 1, 234, '["wiki","reference","encyclopedia"]'),
(2, 'CodePen', 'https://codepen.io', 'development', 'Online code editor and playground', 'allow-scripts allow-same-origin allow-forms', 1, 456, '["code","editor","playground"]'),
(3, 'JSFiddle', 'https://jsfiddle.net', 'development', 'Online JavaScript playground', 'allow-scripts allow-same-origin', 1, 389, '["javascript","playground","testing"]'),
(4, 'MDN Web Docs', 'https://developer.mozilla.org', 'documentation', 'Web development documentation', 'allow-scripts allow-same-origin', 1, 178, '["docs","reference","web"]'),
(5, 'StackBlitz', 'https://stackblitz.com', 'development', 'Online IDE for web apps', 'allow-scripts allow-same-origin allow-forms', 1, 512, '["ide","development","online"]'),
(6, 'Repl.it', 'https://replit.com', 'development', 'Collaborative coding platform', 'allow-scripts allow-same-origin', 1, 423, '["ide","collaborative","coding"]'),
(7, 'GitHub', 'https://github.com', 'tools', 'Code hosting platform', 'allow-scripts allow-same-origin', 0, 0, '["git","version-control","code"]'),
(8, 'CodeSandbox', 'https://codesandbox.io', 'development', 'Online code editor for React', 'allow-scripts allow-same-origin', 1, 378, '["react","editor","sandbox"]');

-- Art & Culture (4)
INSERT INTO sites (id, name, url, category, description, sandbox, iframe_allowed, test_count, tags) VALUES
(9, 'Google Arts & Culture', 'https://artsandculture.google.com', 'art-culture', 'Virtual museum tours', 'allow-scripts allow-same-origin', 1, 156, '["art","culture","museum"]'),
(10, 'Art UK', 'https://artuk.org', 'art-culture', 'UK public art collections', 'allow-scripts allow-same-origin', 1, 123, '["art","uk","collections"]'),
(11, 'Europeana', 'https://www.europeana.eu', 'art-culture', 'European cultural heritage', 'allow-scripts allow-same-origin', 1, 289, '["europe","heritage","culture"]'),
(12, 'RKD - Netherlands Institute', 'https://rkd.nl', 'art-culture', 'Dutch art database', 'allow-scripts allow-same-origin', 1, 134, '["dutch","art","database"]');

-- Digital Archives (5)
INSERT INTO sites (id, name, url, category, description, sandbox, iframe_allowed, test_count, tags) VALUES
(13, 'Digital Art Archive', 'https://digitalartarchive.siggraph.org', 'digital-art', 'Digital art preservation', 'allow-scripts allow-same-origin', 1, 98, '["digital","art","archive"]'),
(14, 'University of Edinburgh Library', 'https://images.is.ed.ac.uk', 'architecture', 'Architecture image collection', 'allow-scripts allow-same-origin', 1, 167, '["architecture","library","edinburgh"]'),
(15, 'Internet Archive', 'https://archive.org', 'media', 'Digital library of websites', 'allow-scripts allow-same-origin', 1, 445, '["archive","library","history"]'),
(16, 'NYPL Digital Collections', 'https://digitalcollections.nypl.org', 'media', 'New York Public Library', 'allow-scripts allow-same-origin', 1, 234, '["library","collections","nypl"]'),
(17, 'Research Catalogue', 'https://www.researchcatalogue.net', 'research', 'Artistic research platform', 'allow-scripts allow-same-origin', 1, 112, '["research","artistic","academic"]');

-- Video Platforms (6)
INSERT INTO sites (id, name, url, category, description, sandbox, iframe_allowed, test_count, tags) VALUES
(18, 'Internet Archive - Moving Images', 'https://archive.org/details/movies', 'video', 'Free movie archive', 'allow-scripts allow-same-origin allow-fullscreen', 1, 523, '["video","movies","archive"]'),
(19, 'YouTube Player API', 'https://www.youtube.com/embed/', 'video', 'Universal iframe player with full API', 'allow-scripts allow-same-origin allow-fullscreen allow-autoplay', 1, 892, '["youtube","video","player","api"]'),
(20, 'VdoCipher HTML5 Player', 'https://www.vdocipher.com/player', 'video', 'Secure video streaming', 'allow-scripts allow-same-origin allow-fullscreen', 1, 234, '["video","streaming","secure"]'),
(21, 'Elfsight Movie Widget', 'https://elfsight.com/youtube-channel-plugin', 'video', 'YouTube channel embed widget', 'allow-scripts allow-same-origin allow-fullscreen', 1, 167, '["youtube","widget","embed"]'),
(22, 'Viostream Responsive Player', 'https://www.viostream.com', 'video', 'Enterprise video platform', 'allow-scripts allow-same-origin allow-fullscreen', 1, 189, '["video","enterprise","streaming"]'),
(23, 'Archive.org Video Player', 'https://archive.org/embed/', 'video', 'Archive.org embed player', 'allow-scripts allow-same-origin allow-fullscreen allow-encrypted-media', 1, 445, '["video","archive","player"]');

-- ============================================
-- SEED DATA - Users
-- ============================================

INSERT INTO users (username, email, role) VALUES
('admin', 'admin@zeno-browser.com', 'admin'),
('tester1', 'tester1@zeno-browser.com', 'tester'),
('viewer1', 'viewer1@zeno-browser.com', 'viewer'),
('tester2', 'tester2@zeno-browser.com', 'tester');

-- ============================================
-- Views for analytics
-- ============================================

CREATE VIEW IF NOT EXISTS site_stats AS
SELECT 
  s.id,
  s.name,
  s.category,
  COUNT(t.id) as total_tests,
  SUM(CASE WHEN t.success = 1 THEN 1 ELSE 0 END) as successful_tests,
  AVG(t.load_time) as avg_load_time,
  MAX(t.tested_at) as last_test
FROM sites s
LEFT JOIN test_results t ON s.id = t.site_id
GROUP BY s.id;

-- ============================================
-- Done!
-- ============================================
