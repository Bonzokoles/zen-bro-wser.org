#!/usr/bin/env node
/**
 * ZENO Browser - GitHub Release Creator
 * 
 * Automates the creation of GitHub releases with:
 * - Semantic version bumping
 * - Changelog generation from conventional commits
 * - Asset uploads (installers for all platforms)
 * - Release notes generation
 * 
 * Usage:
 *   node scripts/create-release.js [patch|minor|major] [--draft] [--prerelease]
 * 
 * Prerequisites:
 *   GITHUB_TOKEN env variable must be set
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─────────────────────────────────────────────────────────────
// CLI Args
// ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const bumpType = args.find(a => ['patch', 'minor', 'major'].includes(a)) || 'patch';
const isDraft = args.includes('--draft');
const isPrerelease = args.includes('--prerelease');
const dryRun = args.includes('--dry-run');

console.log('╔══════════════════════════════════════════╗');
console.log('║   ZENO Browser - GitHub Release Creator  ║');
console.log('╚══════════════════════════════════════════╝');
console.log(`Bump type:   ${bumpType}`);
console.log(`Draft:       ${isDraft}`);
console.log(`Pre-release: ${isPrerelease}`);
console.log(`Dry run:     ${dryRun}`);
console.log('');

// ─────────────────────────────────────────────────────────────
// GitHub API helpers
// ─────────────────────────────────────────────────────────────

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPOSITORY || 'Bonzokoles/zen-bro-wser.org';
const [REPO_OWNER, REPO_NAME] = GITHUB_REPO.split('/');

function githubRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}${endpoint}`,
      method,
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'ZENO-Browser-Release-Script/1.0',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`GitHub API error ${res.statusCode}: ${parsed.message || data}`));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function githubUpload(uploadUrl, filePath, contentType) {
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath);
  const cleanUploadUrl = uploadUrl.replace('{?name,label}', '');

  return new Promise((resolve, reject) => {
    const url = new URL(`${cleanUploadUrl}?name=${encodeURIComponent(fileName)}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': contentType,
        'Content-Length': fileContent.length,
        'User-Agent': 'ZENO-Browser-Release-Script/1.0',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(fileContent);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────
// Version management
// ─────────────────────────────────────────────────────────────

function getCurrentVersion() {
  const pkgPath = path.join(ROOT, 'ZENO_WEB_CORE_APP', 'package.json');
  if (fs.existsSync(pkgPath)) {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
  }
  return '0.0.1';
}

function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  switch (type) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    default: return version;
  }
}

function updatePackageVersion(newVersion) {
  const pkgPath = path.join(ROOT, 'ZENO_WEB_CORE_APP', 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.version = newVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`  ✅ Updated package.json to v${newVersion}`);
  }
}

// ─────────────────────────────────────────────────────────────
// Changelog generation
// ─────────────────────────────────────────────────────────────

function getCommitsSinceLastTag() {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', {
      cwd: ROOT,
      stdio: 'pipe',
    }).toString().trim();

    const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
    const log = execSync(
      `git log ${range} --pretty=format:"%H|%s|%an|%ae" --no-merges`,
      { cwd: ROOT, stdio: 'pipe' }
    ).toString().trim();

    if (!log) return [];

    return log.split('\n').map(line => {
      const [hash, subject, author, email] = line.split('|');
      return { hash: hash?.trim(), subject: subject?.trim(), author: author?.trim(), email: email?.trim() };
    }).filter(c => c.hash && c.subject);
  } catch {
    return [];
  }
}

function categorizeCommits(commits) {
  const categories = {
    features: [],
    fixes: [],
    docs: [],
    perf: [],
    refactor: [],
    test: [],
    chore: [],
    other: [],
  };

  const patterns = {
    features: /^feat(\(.+\))?:/i,
    fixes: /^fix(\(.+\))?:/i,
    docs: /^docs(\(.+\))?:/i,
    perf: /^perf(\(.+\))?:/i,
    refactor: /^refactor(\(.+\))?:/i,
    test: /^test(\(.+\))?:/i,
    chore: /^chore(\(.+\))?:/i,
  };

  commits.forEach(commit => {
    let placed = false;
    for (const [cat, pattern] of Object.entries(patterns)) {
      if (pattern.test(commit.subject)) {
        categories[cat].push(commit);
        placed = true;
        break;
      }
    }
    if (!placed) categories.other.push(commit);
  });

  return categories;
}

function generateChangelog(version, categories) {
  const date = new Date().toISOString().split('T')[0];
  const lines = [`## [${version}] - ${date}`, ''];

  const sections = [
    ['✨ New Features', categories.features],
    ['🐛 Bug Fixes', categories.fixes],
    ['⚡ Performance', categories.perf],
    ['♻️ Refactoring', categories.refactor],
    ['📚 Documentation', categories.docs],
    ['🧪 Tests', categories.test],
    ['🔧 Maintenance', categories.chore],
    ['🔀 Other Changes', categories.other],
  ];

  sections.forEach(([title, commits]) => {
    if (commits.length === 0) return;
    lines.push(`### ${title}`);
    lines.push('');
    commits.forEach(c => {
      const subject = c.subject.replace(/^(feat|fix|docs|perf|refactor|test|chore)(\(.+\))?:\s*/i, '');
      lines.push(`- ${subject} (${c.hash.substring(0, 7)})`);
    });
    lines.push('');
  });

  return lines.join('\n');
}

function updateChangelogFile(version, content) {
  const changelogPath = path.join(ROOT, 'CHANGELOG.md');
  let existing = '';

  if (fs.existsSync(changelogPath)) {
    existing = fs.readFileSync(changelogPath, 'utf8');
    // Remove existing header
    existing = existing.replace(/^# Changelog\n+/, '');
  }

  const header = '# Changelog\n\nAll notable changes to ZENO Browser are documented here.\n\n';
  const newContent = header + content + '\n' + existing;
  fs.writeFileSync(changelogPath, newContent);
  console.log('  ✅ Updated CHANGELOG.md');
}

// ─────────────────────────────────────────────────────────────
// Asset collection
// ─────────────────────────────────────────────────────────────

function collectAssets() {
  const outputDir = path.join(ROOT, 'dist-electron');
  if (!fs.existsSync(outputDir)) {
    console.log('  ℹ️  No dist-electron directory found');
    return [];
  }

  const extensions = ['.exe', '.dmg', '.AppImage', '.deb', '.rpm', '.snap', '.zip'];
  const contentTypes = {
    '.exe': 'application/octet-stream',
    '.dmg': 'application/x-apple-diskimage',
    '.AppImage': 'application/x-executable',
    '.deb': 'application/x-debian-package',
    '.rpm': 'application/x-rpm',
    '.snap': 'application/vnd.snap',
    '.zip': 'application/zip',
  };

  const assets = [];
  fs.readdirSync(outputDir).forEach(file => {
    const ext = path.extname(file);
    if (extensions.includes(ext)) {
      assets.push({
        path: path.join(outputDir, file),
        name: file,
        contentType: contentTypes[ext] || 'application/octet-stream',
      });
    }
  });

  return assets;
}

// ─────────────────────────────────────────────────────────────
// Main release process
// ─────────────────────────────────────────────────────────────

async function main() {
  // Validate
  if (!GITHUB_TOKEN && !dryRun) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  // Version bump
  const currentVersion = getCurrentVersion();
  const newVersion = bumpVersion(currentVersion, bumpType);
  const tagName = `v${newVersion}`;

  console.log(`📌 Version: ${currentVersion} → ${newVersion} (${tagName})`);
  console.log('');

  // Generate changelog
  console.log('📝 Generating changelog...');
  const commits = getCommitsSinceLastTag();
  console.log(`  Found ${commits.length} commits since last tag`);
  const categories = categorizeCommits(commits);
  const changelogContent = generateChangelog(newVersion, categories);

  if (dryRun) {
    console.log('\n--- CHANGELOG PREVIEW ---');
    console.log(changelogContent);
    console.log('--- END PREVIEW ---\n');
    console.log('✨ Dry run complete. No changes made.');
    return;
  }

  // Update files
  console.log('📦 Updating version in files...');
  updatePackageVersion(newVersion);
  updateChangelogFile(newVersion, changelogContent);

  // Git commit and tag
  console.log('🏷️  Creating git tag...');
  execSync('git add CHANGELOG.md ZENO_WEB_CORE_APP/package.json', { cwd: ROOT, stdio: 'inherit' });
  execSync(`git commit -m "chore(release): v${newVersion}"`, { cwd: ROOT, stdio: 'inherit' });
  execSync(`git tag -a ${tagName} -m "Release ${tagName}"`, { cwd: ROOT, stdio: 'inherit' });
  execSync(`git push origin HEAD --tags`, { cwd: ROOT, stdio: 'inherit' });
  console.log(`  ✅ Tag ${tagName} pushed\n`);

  // Create GitHub release
  console.log('🚀 Creating GitHub release...');
  const release = await githubRequest('POST', '/releases', {
    tag_name: tagName,
    name: `ZENO Browser ${tagName}`,
    body: changelogContent,
    draft: isDraft,
    prerelease: isPrerelease,
    generate_release_notes: false,
  });

  console.log(`  ✅ Release created: ${release.html_url}\n`);

  // Upload assets
  const assets = collectAssets();
  if (assets.length > 0) {
    console.log(`📤 Uploading ${assets.length} assets...`);
    for (const asset of assets) {
      console.log(`  Uploading ${asset.name}...`);
      await githubUpload(release.upload_url, asset.path, asset.contentType);
      console.log(`  ✅ ${asset.name} uploaded`);
    }
  } else {
    console.log('ℹ️  No installer assets found to upload');
    console.log('   Run build scripts first: ./scripts/build-installers.sh all');
  }

  console.log('\n✨ Release created successfully!');
  console.log(`   URL: ${release.html_url}`);
}

main().catch(err => {
  console.error('\n❌ Release failed:', err.message);
  process.exit(1);
});
