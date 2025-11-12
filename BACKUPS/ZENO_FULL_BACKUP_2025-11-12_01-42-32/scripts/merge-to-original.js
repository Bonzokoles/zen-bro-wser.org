#!/usr/bin/env node

/**
 * merge-to-original.js - Merge working version to original
 *
 * Steps:
 * 1. Backup original
 * 2. Check validation status
 * 3. Copy working → original
 * 4. Update changelog
 * 5. Cleanup working version
 *
 * Usage:
 *   node scripts/merge-to-original.js components/Browser.tsx
 */

const fs = require('fs-extra');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Usage: node scripts/merge-to-original.js <path>');
  console.error('   Example: node scripts/merge-to-original.js components/Browser.tsx');
  process.exit(1);
}

const targetPath = args[0];
const workingPath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'working', targetPath);
const originalPath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'original', targetPath);
const metaPath = workingPath + '.meta.json';

async function main() {
  console.log('🔄 Starting merge process...\n');

  // 1. Check if working version exists
  if (!fs.existsSync(workingPath)) {
    console.error('❌ Working version not found:', workingPath);
    process.exit(1);
  }

  // 2. Load metadata
  if (!fs.existsSync(metaPath)) {
    console.error('❌ Metadata file not found:', metaPath);
    console.error('   Working version corrupted?');
    process.exit(1);
  }

  const metadata = await fs.readJSON(metaPath);

  // 3. Check validation status
  if (metadata.status !== 'validated') {
    console.error(`❌ Working version not validated (status: ${metadata.status})`);
    console.error('   Run: npm run validate:working ' + targetPath);
    process.exit(1);
  }

  // 4. Confirm merge
  console.log('📋 Merge details:');
  console.log(`   Working: ${workingPath}`);
  console.log(`   Original: ${originalPath}`);
  console.log(`   Changes: ${metadata.changes.join(', ')}`);
  console.log('');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    readline.question('Proceed with merge? (y/N): ', resolve);
  });

  readline.close();

  if (answer.toLowerCase() !== 'y') {
    console.log('❌ Merge cancelled');
    process.exit(0);
  }

  // 5. Backup original
  const timestamp = Date.now();
  const backupPath = path.join(
    __dirname,
    '..',
    'src',
    'backups',
    targetPath.replace(/[\/\\]/g, '_') + '.backup-' + timestamp + path.extname(targetPath)
  );

  await fs.ensureDir(path.dirname(backupPath));
  await fs.copy(originalPath, backupPath);
  console.log(`💾 Backup created: ${backupPath}`);

  // 6. Copy working → original
  await fs.copy(workingPath, originalPath);
  console.log(`✅ Copied working → original`);

  // 7. Remove WORKING header from code
  await removeWorkingHeader(originalPath);

  // 8. Update changelog
  await updateChangelog(targetPath, metadata.changes);

  // 9. Cleanup working version
  await fs.remove(workingPath);
  await fs.remove(metaPath);
  console.log(`🧹 Cleaned up working version`);

  // 10. Switch active back to original
  const activePath = path.join(__dirname, '..', 'src', 'active', targetPath);
  if (fs.existsSync(activePath)) {
    await fs.remove(activePath);
    await fs.copy(originalPath, activePath);
    console.log(`🔄 Switched active → original`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ MERGE COMPLETE');
  console.log(`\nBackup saved to: ${backupPath}`);
  console.log('\nNext steps:');
  console.log('  1. Test: npm run test');
  console.log('  2. Commit: git add . && git commit -m "[ORIGINAL] ' + targetPath + ': ' + metadata.changes[0] + '"');
}

async function removeWorkingHeader(filePath) {
  if (fs.statSync(filePath).isDirectory()) return;

  const content = await fs.readFile(filePath, 'utf-8');

  // Remove WORKING VERSION header
  const cleaned = content.replace(/\/\*[\s\S]*?WORKING VERSION[\s\S]*?\*\/\s*/g, '');

  await fs.writeFile(filePath, cleaned);
}

async function updateChangelog(filePath, changes) {
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');

  let changelog = '';
  if (fs.existsSync(changelogPath)) {
    changelog = await fs.readFile(changelogPath, 'utf-8');
  } else {
    changelog = '# Changelog\n\n';
  }

  const date = new Date().toISOString().split('T')[0];
  const entry = `## ${date} - ${filePath}\n\n${changes.map(c => `- ${c}`).join('\n')}\n\n`;

  changelog = changelog.replace('# Changelog\n\n', '# Changelog\n\n' + entry);

  await fs.writeFile(changelogPath, changelog);
  console.log(`📝 Updated CHANGELOG.md`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
