#!/usr/bin/env node
/**
 * ZENO Browser - Release Creation Script
 * Creates GitHub release with built artifacts
 */
import { execSync } from 'child_process';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const pkgPath = join(ROOT, 'ZENO_WEB_CORE_APP', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
const VERSION = process.env.VERSION || `v${pkg.version}`;

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { encoding: 'utf-8', cwd: ROOT }).trim();
}

function createGitHubRelease() {
  const distDir = join(ROOT, 'dist-electron');
  if (!existsSync(distDir)) {
    console.error('❌ dist-electron directory not found. Run build first.');
    process.exit(1);
  }
  const files = readdirSync(distDir).filter((f) =>
    ['.exe', '.dmg', '.AppImage', '.deb'].some((ext) => f.endsWith(ext))
  );
  
  console.log(`\n🚀 Creating GitHub Release ${VERSION}...`);
  const releaseNotes = `ZENO Browser ${VERSION}\n\nSee CHANGELOG.md for details.`;
  
  // Create release
  run(`gh release create ${VERSION} --title "ZENO Browser ${VERSION}" --notes "${releaseNotes}"`);
  
  // Upload artifacts
  if (files.length > 0) {
    console.log(`\n📤 Uploading ${files.length} artifacts...`);
    files.forEach((file) => {
      run(`gh release upload ${VERSION} "${join(distDir, file)}"`);
      console.log(`  ✓ ${file}`);
    });
  }
  
  console.log(`\n✅ Release ${VERSION} created!`);
}

createGitHubRelease();
