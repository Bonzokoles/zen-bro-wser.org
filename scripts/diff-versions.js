#!/usr/bin/env node

/**
 * diff-versions.js - Compare working vs original version
 *
 * Shows:
 * - Line changes (added/removed/modified)
 * - File size difference
 * - Metadata
 *
 * Usage:
 *   node scripts/diff-versions.js components/Browser.tsx
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Usage: node scripts/diff-versions.js <path>');
  console.error('   Example: node scripts/diff-versions.js components/Browser.tsx');
  process.exit(1);
}

const targetPath = args[0];
const originalPath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'original', targetPath);
const workingPath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'working', targetPath);
const metaPath = workingPath + '.meta.json';

async function main() {
  console.log('📊 Version Comparison\n');

  // Check if both versions exist
  if (!fs.existsSync(originalPath)) {
    console.error(`❌ Original version not found: ${originalPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(workingPath)) {
    console.error(`❌ Working version not found: ${workingPath}`);
    process.exit(1);
  }

  // File sizes
  const originalStat = fs.statSync(originalPath);
  const workingStat = fs.statSync(workingPath);

  console.log('📁 File Sizes:');
  console.log(`   Original: ${originalStat.size} bytes`);
  console.log(`   Working:  ${workingStat.size} bytes`);
  console.log(`   Diff:     ${workingStat.size - originalStat.size >= 0 ? '+' : ''}${workingStat.size - originalStat.size} bytes`);
  console.log('');

  // Line counts
  const originalLines = (await fs.readFile(originalPath, 'utf-8')).split('\n').length;
  const workingLines = (await fs.readFile(workingPath, 'utf-8')).split('\n').length;

  console.log('📝 Line Counts:');
  console.log(`   Original: ${originalLines} lines`);
  console.log(`   Working:  ${workingLines} lines`);
  console.log(`   Diff:     ${workingLines - originalLines >= 0 ? '+' : ''}${workingLines - originalLines} lines`);
  console.log('');

  // Metadata
  if (fs.existsSync(metaPath)) {
    const metadata = await fs.readJSON(metaPath);

    console.log('📋 Metadata:');
    console.log(`   Status: ${metadata.status}`);
    console.log(`   Copied: ${metadata.copiedAt}`);
    console.log(`   Author: ${metadata.author}`);

    if (metadata.changes && metadata.changes.length > 0) {
      console.log(`   Changes:`);
      metadata.changes.forEach(change => {
        console.log(`     - ${change}`);
      });
    }

    console.log('');
  }

  // Git diff (if available)
  console.log('🔍 Code Diff:\n');
  console.log('─'.repeat(60));

  try {
    // Try to use git diff for better output
    const diff = execSync(
      `git diff --no-index --color "${originalPath}" "${workingPath}" || true`,
      { encoding: 'utf-8' }
    );

    console.log(diff || 'No differences found');
  } catch (error) {
    // Fallback to simple character diff
    const original = await fs.readFile(originalPath, 'utf-8');
    const working = await fs.readFile(workingPath, 'utf-8');

    if (original === working) {
      console.log('✅ Files are identical');
    } else {
      console.log('⚠️  Files differ (git not available for detailed diff)');
      console.log('\nFirst 500 characters of each:');
      console.log('\nOriginal:');
      console.log(original.slice(0, 500));
      console.log('\nWorking:');
      console.log(working.slice(0, 500));
    }
  }

  console.log('─'.repeat(60));

  // Recommendation
  console.log('\n💡 Recommendation:');

  const sizeChange = workingStat.size - originalStat.size;
  const lineChange = workingLines - originalLines;

  if (Math.abs(sizeChange) < 100 && Math.abs(lineChange) < 10) {
    console.log('   ✅ Minor changes - SAFE TO MERGE');
  } else if (Math.abs(sizeChange) < 1000 && Math.abs(lineChange) < 50) {
    console.log('   ⚠️  Moderate changes - Review carefully');
  } else {
    console.log('   🔴 Major changes - Extensive review required');
  }

  console.log('\nNext steps:');
  console.log(`   npm run validate:working ${targetPath}`);
  console.log(`   npm run merge:to-original ${targetPath}`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
