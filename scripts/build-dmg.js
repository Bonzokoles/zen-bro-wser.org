#!/usr/bin/env node
/**
 * ZENO Browser - macOS DMG Builder
 * 
 * Builds the macOS DMG installer using electron-builder.
 * Supports both x64 and arm64 (Apple Silicon) architectures.
 * Optionally handles code signing and notarization.
 * 
 * Usage:
 *   node scripts/build-dmg.js [--arch x64|arm64|universal] [--sign] [--notarize]
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
const shouldNotarize = args.includes('--notarize');

const ARCH_MAP = {
  'universal': ['x64', 'arm64'],
  'x64': ['x64'],
  'arm64': ['arm64'],
};
const ARCHITECTURES = ARCH_MAP[archArg] || ['x64'];

console.log('╔══════════════════════════════════════════╗');
console.log('║    ZENO Browser - macOS DMG Builder      ║');
console.log('╚══════════════════════════════════════════╝');
console.log(`Architectures: ${ARCHITECTURES.join(', ')}`);
console.log(`Code signing:  ${shouldSign ? 'enabled' : 'disabled'}`);
console.log(`Notarization:  ${shouldNotarize ? 'enabled' : 'disabled'}`);
console.log('');

/**
 * Validate prerequisites
 */
function validatePrerequisites() {
  console.log('🔍 Checking prerequisites...');

  // Must run on macOS
  if (process.platform !== 'darwin') {
    throw new Error('DMG builds must be created on macOS');
  }

  // Check Xcode Command Line Tools
  try {
    execSync('xcode-select -p', { stdio: 'pipe' });
    console.log('  ✅ Xcode Command Line Tools found');
  } catch {
    throw new Error('Xcode Command Line Tools required. Run: xcode-select --install');
  }

  // Check icon
  const iconPath = path.join(ROOT, 'assets/installer/icon.icns');
  if (!fs.existsSync(iconPath)) {
    console.warn('  ⚠️  Warning: icon.icns not found at assets/installer/icon.icns');
    console.warn('     Creating placeholder - replace with actual .icns before release');
    fs.mkdirSync(path.dirname(iconPath), { recursive: true });
    fs.writeFileSync(iconPath, '');
  } else {
    console.log('  ✅ macOS icon found');
  }

  // Validate entitlements
  const entitlementsPath = path.join(ROOT, 'assets/installer/entitlements.mac.plist');
  if (!fs.existsSync(entitlementsPath)) {
    console.warn('  ⚠️  Entitlements file not found - creating default');
    createDefaultEntitlements(entitlementsPath);
  } else {
    console.log('  ✅ Entitlements file found');
  }

  // Check signing identity
  if (shouldSign) {
    if (!process.env.CSC_LINK && !process.env.CSC_NAME) {
      throw new Error('CSC_LINK or CSC_NAME environment variable required for signing');
    }
    console.log('  ✅ Signing credentials configured');
  }

  // Check notarization credentials
  if (shouldNotarize) {
    if (!process.env.APPLE_ID || !process.env.APPLE_APP_SPECIFIC_PASSWORD) {
      throw new Error(
        'APPLE_ID and APPLE_APP_SPECIFIC_PASSWORD required for notarization.\n' +
        'Generate app-specific password at: https://appleid.apple.com'
      );
    }
    if (!process.env.CSC_TEAM_ID) {
      throw new Error('CSC_TEAM_ID required for notarization (your Apple Developer Team ID)');
    }
    console.log('  ✅ Notarization credentials configured');
  }

  console.log('');
}

/**
 * Create default macOS entitlements plist
 */
function createDefaultEntitlements(entitlementsPath) {
  fs.mkdirSync(path.dirname(entitlementsPath), { recursive: true });
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
  </dict>
</plist>`;
  fs.writeFileSync(entitlementsPath, plist);
  console.log(`  ✅ Created default entitlements at ${entitlementsPath}`);
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
 * Build DMG for specific architecture
 */
function buildDMG(arch) {
  console.log(`📦 Building DMG for ${arch}...`);

  const env = {
    ...process.env,
    NODE_ENV: 'production',
  };

  if (!shouldSign) {
    env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
  }

  if (shouldNotarize) {
    env.ELECTRON_NOTARIZE = 'true';
  }

  const cmd = [
    'npx electron-builder',
    '--mac dmg',
    `--${arch}`,
    '--config electron-builder.yml',
  ].join(' ');

  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', env });
    console.log(`  ✅ DMG for ${arch} built successfully\n`);
  } catch (error) {
    console.error(`  ❌ Build failed for ${arch}: ${error.message}`);
    throw error;
  }
}

/**
 * Verify notarization status
 */
function verifyNotarization(dmgPath) {
  console.log(`🔍 Verifying notarization: ${dmgPath}`);
  try {
    const result = execSync(`spctl -a -vvv -t install "${dmgPath}" 2>&1`, { stdio: 'pipe' }).toString();
    if (result.includes('accepted')) {
      console.log('  ✅ Notarization verified\n');
    } else {
      console.warn('  ⚠️  Notarization verification inconclusive');
    }
  } catch (error) {
    console.warn(`  ⚠️  Could not verify notarization: ${error.message}`);
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
    f.endsWith('.dmg') || f.endsWith('.zip') || f.endsWith('-mac.yml')
  );

  files.forEach(file => {
    const filePath = path.join(outputDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
    console.log(`  📦 ${file} (${sizeMB} MB)`);

    if (shouldNotarize && file.endsWith('.dmg')) {
      verifyNotarization(filePath);
    }
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
      buildDMG(arch);
    }

    listOutputFiles();
    console.log('✨ macOS DMG build completed successfully!');
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

main();
