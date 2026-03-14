#!/usr/bin/env node
/**
 * ZENO Browser - AppImage Linux Installer Builder
 */
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

console.log('🐧 Building AppImage Linux Installer for ZENO Browser...');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

const distDir = join(ROOT, 'dist-electron');
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

console.log('\n📦 Building web app...');
run('cd ZENO_WEB_CORE_APP && npm run build');

console.log('\n🐧 Building Linux AppImage...');
run('npx electron-builder --linux AppImage --config electron-builder.yml');

console.log('\n✅ AppImage built successfully!');
