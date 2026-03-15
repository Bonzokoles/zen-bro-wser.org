#!/usr/bin/env node
/**
 * ZENO Browser - NSIS Windows Installer Builder
 * Requires: npm install --save-dev electron-builder nsis
 */
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

console.log('🏗️  Building NSIS Windows Installer for ZENO Browser...');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

// Ensure dist directory
const distDir = join(ROOT, 'dist-electron');
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

// Build Astro app first
console.log('\n📦 Building web app...');
run('cd ZENO_WEB_CORE_APP && npm run build');

// Build Electron app
console.log('\n⚡ Building Electron app...');
run('npx electron-builder --win nsis --config electron-builder.yml');

console.log('\n✅ NSIS installer built successfully!');
console.log(`📁 Output: ${distDir}`);
