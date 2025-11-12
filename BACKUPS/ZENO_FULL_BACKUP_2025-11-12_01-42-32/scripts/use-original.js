#!/usr/bin/env node

/**
 * use-original.js - Switch back to original version
 *
 * Creates symlink: src/active/<path> → src/original/<path>
 *
 * Usage:
 *   node scripts/use-original.js components/Browser.tsx
 */

const fs = require('fs-extra');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Usage: node scripts/use-original.js <path>');
  console.error('   Example: node scripts/use-original.js components/Browser.tsx');
  process.exit(1);
}

const targetPath = args[0];
const originalPath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'original', targetPath);
const activePath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'active', targetPath);

async function main() {
  // Check if original exists
  if (!fs.existsSync(originalPath)) {
    console.error(`❌ Original version not found: ${originalPath}`);
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
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    await fs.copy(originalPath, activePath);
    console.log(`📁 Copied (Windows): ${originalPath} → ${activePath}`);
  } else {
    const relativeTarget = path.relative(activeDir, originalPath);
    await fs.symlink(relativeTarget, activePath);
    console.log(`🔗 Symlinked: ${originalPath} → ${activePath}`);
  }

  console.log(`✅ Now using ORIGINAL version of ${targetPath}`);
  console.log('');
  console.log('To work on this file again:');
  console.log(`   npm run dev:copy ${targetPath}`);
  console.log(`   npm run dev:use-working ${targetPath}`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
