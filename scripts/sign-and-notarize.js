#!/usr/bin/env node
/**
 * ZENO Browser - Code Signing & Notarization Script
 * 
 * Handles:
 *  - Windows: Authenticode signing via signtool or osslsigncode
 *  - macOS: Code signing and Apple notarization
 *  - Verification of signatures after signing
 * 
 * Usage:
 *   node scripts/sign-and-notarize.js [--platform windows|macos] [--verify-only]
 */

import { execSync, execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'dist-electron');

// Parse CLI args
const args = process.argv.slice(2);
const platform = args.find(a => a.startsWith('--platform='))?.split('=')[1]
  || (process.platform === 'darwin' ? 'macos' : 'windows');
const verifyOnly = args.includes('--verify-only');

console.log('╔══════════════════════════════════════════╗');
console.log('║  ZENO Browser - Sign & Notarize Tool     ║');
console.log('╚══════════════════════════════════════════╝');
console.log(`Platform:    ${platform}`);
console.log(`Verify only: ${verifyOnly}`);
console.log('');

// ─────────────────────────────────────────────────────────────
// Windows Signing
// ─────────────────────────────────────────────────────────────

/**
 * Sign Windows executable using signtool.exe or osslsigncode
 */
function signWindows(filePath) {
  console.log(`🔐 Signing Windows binary: ${path.basename(filePath)}`);

  const certFile = process.env.WIN_CSC_LINK;
  const certPassword = process.env.WIN_CSC_KEY_PASSWORD;
  const timestampUrl = process.env.WIN_TIMESTAMP_SERVER || 'http://timestamp.digicert.com';

  if (!certFile || !certPassword) {
    throw new Error(
      'Windows signing requires:\n' +
      '  WIN_CSC_LINK           - Path to .pfx certificate file\n' +
      '  WIN_CSC_KEY_PASSWORD   - Certificate password'
    );
  }

  // Try signtool.exe first (Windows only), then osslsigncode
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    // Use signtool.exe on Windows
    const signtoolPaths = [
      'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64\\signtool.exe',
      'C:\\Program Files\\Windows Kits\\10\\bin\\x64\\signtool.exe',
    ];

    const signtool = signtoolPaths.find(p => fs.existsSync(p)) || 'signtool';

    execFileSync(signtool, [
      'sign',
      '/f', certFile,
      '/p', certPassword,
      '/tr', timestampUrl,
      '/td', 'sha256',
      '/fd', 'sha256',
      filePath,
    ], { stdio: 'inherit' });
  } else {
    // Use osslsigncode on Linux/macOS CI
    try {
      execSync('which osslsigncode', { stdio: 'pipe' });
    } catch {
      throw new Error(
        'osslsigncode is required for Windows signing on non-Windows.\n' +
        'Install: apt-get install osslsigncode (Linux) or brew install osslsigncode (macOS)'
      );
    }

    execSync([
      'osslsigncode sign',
      `-pkcs12 "${certFile}"`,
      `-pass "${certPassword}"`,
      `-ts "${timestampUrl}"`,
      `-h sha256`,
      `-in "${filePath}"`,
      `-out "${filePath}.signed"`,
    ].join(' '), { stdio: 'inherit' });

    // Replace original with signed version
    fs.renameSync(`${filePath}.signed`, filePath);
  }

  console.log('  ✅ Signed successfully\n');
}

/**
 * Verify Windows signature
 */
function verifyWindows(filePath) {
  console.log(`🔍 Verifying Windows signature: ${path.basename(filePath)}`);

  if (process.platform === 'win32') {
    try {
      execSync(`signtool verify /pa "${filePath}"`, { stdio: 'pipe' });
      console.log('  ✅ Signature valid\n');
    } catch {
      console.warn('  ⚠️  Could not verify signature with signtool\n');
    }
  } else {
    try {
      const result = execSync(`osslsigncode verify "${filePath}" 2>&1`, { stdio: 'pipe' }).toString();
      if (result.includes('Succeeded')) {
        console.log('  ✅ Signature valid\n');
      } else {
        console.warn('  ⚠️  Signature verification result: ', result.trim());
      }
    } catch {
      console.warn('  ⚠️  osslsigncode not available for verification\n');
    }
  }
}

// ─────────────────────────────────────────────────────────────
// macOS Signing & Notarization
// ─────────────────────────────────────────────────────────────

/**
 * Sign macOS app/DMG
 */
function signMacOS(filePath) {
  const isDMG = filePath.endsWith('.dmg');
  console.log(`🔐 Signing macOS ${isDMG ? 'DMG' : 'app'}: ${path.basename(filePath)}`);

  const identity = process.env.CSC_NAME || process.env.APPLE_IDENTITY;
  if (!identity) {
    throw new Error(
      'macOS signing requires:\n' +
      '  CSC_NAME  - Signing identity name (e.g., "Developer ID Application: Your Name (TEAMID)")\n' +
      '  or CSC_LINK + CSC_KEY_PASSWORD for certificate file'
    );
  }

  if (isDMG) {
    execSync([
      'codesign',
      '--force',
      '--sign', `"${identity}"`,
      '--timestamp',
      `"${filePath}"`,
    ].join(' '), { stdio: 'inherit' });
  } else {
    execSync([
      'codesign',
      '--force',
      '--deep',
      '--sign', `"${identity}"`,
      '--timestamp',
      '--options', 'runtime',
      '--entitlements', `"${path.join(ROOT, 'assets/installer/entitlements.mac.plist')}"`,
      `"${filePath}"`,
    ].join(' '), { stdio: 'inherit' });
  }

  console.log('  ✅ Signed successfully\n');
}

/**
 * Submit app for Apple notarization
 */
async function notarizeMacOS(filePath) {
  console.log(`📨 Submitting for notarization: ${path.basename(filePath)}`);

  const appleId = process.env.APPLE_ID;
  const applePassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.CSC_TEAM_ID;

  if (!appleId || !applePassword || !teamId) {
    throw new Error(
      'macOS notarization requires:\n' +
      '  APPLE_ID                    - Your Apple ID email\n' +
      '  APPLE_APP_SPECIFIC_PASSWORD - App-specific password from appleid.apple.com\n' +
      '  CSC_TEAM_ID                 - Your Apple Developer Team ID'
    );
  }

  // Submit for notarization using notarytool (Xcode 13+)
  console.log('  Submitting to Apple notarization service...');
  const submitResult = execSync([
    'xcrun notarytool submit',
    `"${filePath}"`,
    '--apple-id', appleId,
    '--password', applePassword,
    '--team-id', teamId,
    '--wait',
    '--output-format json',
  ].join(' '), { stdio: 'pipe' }).toString();

  let result;
  try {
    result = JSON.parse(submitResult);
  } catch (parseError) {
    throw new Error(`Failed to parse notarization response: ${parseError.message}. Raw response: ${submitResult}`);
  }

  if (result.status !== 'Accepted') {
    throw new Error(`Notarization failed with status: ${result.status}\n${JSON.stringify(result, null, 2)}`);
  }

  console.log(`  Notarization ID: ${result.id}`);

  // Staple the notarization ticket
  if (filePath.endsWith('.dmg') || filePath.endsWith('.pkg')) {
    console.log('  Stapling notarization ticket...');
    execSync(`xcrun stapler staple "${filePath}"`, { stdio: 'inherit' });
  }

  console.log('  ✅ Notarization complete\n');
}

/**
 * Verify macOS signature
 */
function verifyMacOS(filePath) {
  console.log(`🔍 Verifying macOS signature: ${path.basename(filePath)}`);
  try {
    execSync(`codesign --verify --deep --strict --verbose=2 "${filePath}" 2>&1`, { stdio: 'inherit' });
    console.log('  ✅ Signature valid\n');

    // Check notarization
    if (filePath.endsWith('.dmg')) {
      execSync(`spctl -a -vvv -t install "${filePath}" 2>&1`, { stdio: 'inherit' });
    }
  } catch (error) {
    console.warn(`  ⚠️  Verification issue: ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    throw new Error(`dist-electron directory not found. Run the build first.`);
  }

  const files = fs.readdirSync(OUTPUT_DIR).map(f => path.join(OUTPUT_DIR, f));

  if (platform === 'windows') {
    const exeFiles = files.filter(f => f.endsWith('.exe') && !f.endsWith('Uninstall.exe'));

    if (exeFiles.length === 0) {
      console.log('No .exe files found in dist-electron/');
      return;
    }

    for (const file of exeFiles) {
      if (!verifyOnly) {
        signWindows(file);
      }
      verifyWindows(file);
    }
  } else if (platform === 'macos') {
    const dmgFiles = files.filter(f => f.endsWith('.dmg'));

    if (dmgFiles.length === 0) {
      console.log('No .dmg files found in dist-electron/');
      return;
    }

    for (const file of dmgFiles) {
      if (!verifyOnly) {
        signMacOS(file);
        await notarizeMacOS(file);
      }
      verifyMacOS(file);
    }
  } else {
    throw new Error(`Unknown platform: ${platform}. Use 'windows' or 'macos'.`);
  }

  console.log('✨ Sign and notarize completed successfully!');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
