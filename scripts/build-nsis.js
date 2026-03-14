#!/usr/bin/env node
/**
 * ZENO Browser - Windows NSIS Installer Builder
 * 
 * Builds the Windows installer using electron-builder with NSIS.
 * Supports both x64 and ia32 architectures.
 * 
 * Usage:
 *   node scripts/build-nsis.js [--arch x64|ia32|both] [--sign] [--draft]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Parse CLI args
const args = process.argv.slice(2);
const archArg = args.find(a => a.startsWith('--arch='))?.split('=')[1] || 'x64';
const shouldSign = args.includes('--sign');
const isDraft = args.includes('--draft');

const ARCHITECTURES = archArg === 'both' ? ['x64', 'ia32'] : [archArg];

console.log('╔══════════════════════════════════════════╗');
console.log('║   ZENO Browser - Windows NSIS Builder    ║');
console.log('╚══════════════════════════════════════════╝');
console.log(`Architectures: ${ARCHITECTURES.join(', ')}`);
console.log(`Code signing: ${shouldSign ? 'enabled' : 'disabled'}`);
console.log(`Draft release: ${isDraft}`);
console.log('');

/**
 * Validate prerequisites
 */
function validatePrerequisites() {
  console.log('🔍 Checking prerequisites...');

  // Check NSIS is available (optional - electron-builder can use built-in)
  try {
    execSync('makensis /VERSION', { stdio: 'pipe' });
    console.log('  ✅ NSIS found (system installation)');
  } catch {
    console.log('  ℹ️  NSIS not found in PATH - electron-builder will use bundled NSIS');
  }

  // Check icon exists
  const iconPath = path.join(ROOT, 'assets/installer/icon.ico');
  if (!fs.existsSync(iconPath)) {
    console.warn('  ⚠️  Warning: icon.ico not found at assets/installer/icon.ico');
    console.warn('     Creating placeholder - replace with actual icon before release');
    createPlaceholderIcon(iconPath);
  } else {
    console.log('  ✅ Installer icon found');
  }

  // Check signing certificates if signing is enabled
  if (shouldSign) {
    const certPath = process.env.WIN_CSC_LINK;
    if (!certPath) {
      throw new Error('WIN_CSC_LINK environment variable is required for code signing');
    }
    if (!process.env.WIN_CSC_KEY_PASSWORD) {
      throw new Error('WIN_CSC_KEY_PASSWORD environment variable is required for code signing');
    }
    console.log('  ✅ Code signing certificates configured');
  }

  console.log('');
}

/**
 * Create a minimal placeholder .ico file
 */
function createPlaceholderIcon(iconPath) {
  fs.mkdirSync(path.dirname(iconPath), { recursive: true });
  // Minimal 1x1 ICO file (binary placeholder)
  const minimalIco = Buffer.from([
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x01, 0x01,
    0x00, 0x00, 0x01, 0x00, 0x18, 0x00, 0x30, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00,
    0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02, 0x00,
    0x00, 0x00, 0x01, 0x00, 0x18, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xFF, 0x00, 0x00, 0x00, 0x00
  ]);
  fs.writeFileSync(iconPath, minimalIco);
}

/**
 * Build the Astro frontend
 */
function buildFrontend() {
  console.log('🔨 Building Astro frontend...');
  const appDir = path.join(ROOT, 'ZENO_WEB_CORE_APP');

  if (fs.existsSync(appDir)) {
    execSync('npm run build', { cwd: appDir, stdio: 'inherit' });
    console.log('  ✅ Frontend built successfully\n');
  } else {
    console.log('  ℹ️  ZENO_WEB_CORE_APP not found, skipping frontend build\n');
  }
}

/**
 * Build electron app with NSIS installer
 */
function buildNSIS(arch) {
  console.log(`📦 Building NSIS installer for ${arch}...`);

  const env = {
    ...process.env,
    NODE_ENV: 'production',
  };

  if (!shouldSign) {
    env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
  }

  const cmd = [
    'npx electron-builder',
    '--win nsis',
    `--${arch}`,
    '--config electron-builder.yml',
    isDraft ? '' : '',
  ].filter(Boolean).join(' ');

  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', env });
    console.log(`  ✅ NSIS installer for ${arch} built successfully\n`);
  } catch (error) {
    console.error(`  ❌ Build failed for ${arch}: ${error.message}`);
    throw error;
  }
}

/**
 * List output files
 */
function listOutputFiles() {
  const outputDir = path.join(ROOT, 'dist-electron');
  if (!fs.existsSync(outputDir)) {
    console.log('No output directory found.');
    return;
  }

  console.log('📁 Built files:');
  const files = fs.readdirSync(outputDir).filter(f =>
    f.endsWith('.exe') || f.endsWith('.yml') || f.endsWith('.blockmap')
  );

  files.forEach(file => {
    const filePath = path.join(outputDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
    console.log(`  📦 ${file} (${sizeMB} MB)`);
  });
}

/**
 * Main build process
 */
async function main() {
  try {
    validatePrerequisites();
    buildFrontend();

    for (const arch of ARCHITECTURES) {
      buildNSIS(arch);
    }

    listOutputFiles();
    console.log('✨ Windows NSIS build completed successfully!');
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

main();
