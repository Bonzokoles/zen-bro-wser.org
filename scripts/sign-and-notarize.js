#!/usr/bin/env node
/**
 * ZENO Browser - Code Signing & Notarization Script
 * macOS notarization requires Apple Developer Account
 */
import { execSync } from 'child_process';

const APPLE_ID = process.env.APPLE_ID;
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
const APPLE_APP_SPECIFIC_PASSWORD = process.env.APPLE_APP_SPECIFIC_PASSWORD;

function signWindows(appPath) {
  const certFile = process.env.WIN_CERT_FILE;
  const certPassword = process.env.WIN_CERT_PASSWORD;
  if (!certFile || !certPassword) {
    console.log('⚠️  Windows signing skipped (no certificate configured)');
    return;
  }
  console.log('🪟 Signing Windows executable...');
  execSync(`signtool sign /f "${certFile}" /p "${certPassword}" /tr http://timestamp.digicert.com /td sha256 /fd sha256 "${appPath}"`, { stdio: 'inherit' });
  console.log('✅ Windows signed!');
}

function notarizeMac(dmgPath) {
  if (!APPLE_ID || !APPLE_TEAM_ID || !APPLE_APP_SPECIFIC_PASSWORD) {
    console.log('⚠️  macOS notarization skipped (no Apple credentials configured)');
    return;
  }
  console.log('🍎 Submitting for Apple notarization...');
  execSync(
    `xcrun notarytool submit "${dmgPath}" --apple-id "${APPLE_ID}" --team-id "${APPLE_TEAM_ID}" --password "${APPLE_APP_SPECIFIC_PASSWORD}" --wait`,
    { stdio: 'inherit' }
  );
  execSync(`xcrun stapler staple "${dmgPath}"`, { stdio: 'inherit' });
  console.log('✅ macOS notarized!');
}

const platform = process.argv[2];
const filePath = process.argv[3];

if (!platform || !filePath) {
  console.log('Usage: node sign-and-notarize.js <win|mac> <file-path>');
  process.exit(1);
}

if (platform === 'win') signWindows(filePath);
else if (platform === 'mac') notarizeMac(filePath);
