#!/usr/bin/env node
/**
 * ZENO Browser - DMG macOS Installer Builder
 */
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

console.log('🍎 Building DMG macOS Installer for ZENO Browser...');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

const distDir = join(ROOT, 'dist-electron');
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

console.log('\n📦 Building web app...');
run('cd ZENO_WEB_CORE_APP && npm run build');

console.log('\n🍎 Building macOS DMG...');
run('npx electron-builder --mac dmg --config electron-builder.yml');

console.log('\n✅ DMG installer built successfully!');
