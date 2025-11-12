#!/usr/bin/env node

/**
 * use-working.js - Switch to working version
 *
 * Creates symlink: src/active/<path> → src/working/<path>
 *
 * Usage:
 *   node scripts/use-working.js components/Browser.tsx
 */

const fs = require('fs-extra');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Usage: node scripts/use-working.js <path>');
  console.error('   Example: node scripts/use-working.js components/Browser.tsx');
  process.exit(1);
}

const targetPath = args[0];
const workingPath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'working', targetPath);
const activePath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'active', targetPath);

async function main() {
  // Check if working exists
  if (!fs.existsSync(workingPath)) {
    console.error(`❌ Working version not found: ${workingPath}`);
    console.error('   Run: npm run dev:copy ' + targetPath);
    process.exit(1);
  }

  // Ensure active directory exists
  const activeDir = path.dirname(activePath);
  await fs.ensureDir(activeDir);

  // Remove existing active link/file
  if (fs.existsSync(activePath)) {
    await fs.remove(activePath);
  }

  // Create symlink or copy
  // Windows może mieć problemy z symlinkami, więc kopiujemy
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    // On Windows, copy instead of symlink (requires admin for symlinks)
    await fs.copy(workingPath, activePath);
    console.log(`📁 Copied (Windows): ${workingPath} → ${activePath}`);
  } else {
    // On Unix, create symlink
    const relativeTarget = path.relative(activeDir, workingPath);
    await fs.symlink(relativeTarget, activePath);
    console.log(`🔗 Symlinked: ${workingPath} → ${activePath}`);
  }

  console.log(`✅ Now using WORKING version of ${targetPath}`);
  console.log('');
  console.log('⚠️  Remember to run tests:');
  console.log('   npm run test:working');
  console.log('');
  console.log('Switch back to original:');
  console.log(`   npm run dev:use-original ${targetPath}`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
