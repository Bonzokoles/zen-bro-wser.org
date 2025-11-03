#!/usr/bin/env node

/**
 * rollback.js - Rollback to a previous backup
 *
 * Usage:
 *   node scripts/rollback.js components/Browser.tsx
 *   node scripts/rollback.js components/Browser.tsx --backup=1704998400000
 *   node scripts/rollback.js components/Browser.tsx --latest
 */

const fs = require('fs-extra');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Usage: node scripts/rollback.js <path> [--backup=timestamp] [--latest]');
  console.error('   Example: node scripts/rollback.js components/Browser.tsx --latest');
  process.exit(1);
}

const targetPath = args[0];
const backupFlag = args.find(arg => arg.startsWith('--backup='));
const latestFlag = args.includes('--latest');

const originalPath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'original', targetPath);
const backupsDir = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'backups');

async function main() {
  console.log('🔄 Rollback process...\n');

  // Find available backups
  const backupPattern = targetPath.replace(/[\/\\]/g, '_') + '.backup-';
  const allFiles = await fs.readdir(backupsDir).catch(() => []);

  const backups = allFiles
    .filter(f => f.startsWith(backupPattern))
    .map(f => {
      const timestampMatch = f.match(/\.backup-(\d+)/);
      return {
        file: f,
        timestamp: timestampMatch ? parseInt(timestampMatch[1]) : 0,
        date: timestampMatch ? new Date(parseInt(timestampMatch[1])) : new Date(0)
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  if (backups.length === 0) {
    console.error(`❌ No backups found for: ${targetPath}`);
    process.exit(1);
  }

  // Select backup
  let selectedBackup;

  if (latestFlag) {
    selectedBackup = backups[0];
    console.log(`📦 Using latest backup: ${selectedBackup.date.toLocaleString()}`);
  } else if (backupFlag) {
    const timestamp = parseInt(backupFlag.split('=')[1]);
    selectedBackup = backups.find(b => b.timestamp === timestamp);

    if (!selectedBackup) {
      console.error(`❌ Backup not found with timestamp: ${timestamp}`);
      console.log('\nAvailable backups:');
      backups.forEach(b => {
        console.log(`  - ${b.timestamp} (${b.date.toLocaleString()})`);
      });
      process.exit(1);
    }
  } else {
    // Interactive selection
    console.log('Available backups:');
    backups.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.date.toLocaleString()} (${b.timestamp})`);
    });

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const choice = await new Promise(resolve => {
      readline.question('\nSelect backup number (or press Enter for latest): ', resolve);
    });

    readline.close();

    const index = choice ? parseInt(choice) - 1 : 0;

    if (index < 0 || index >= backups.length) {
      console.error('❌ Invalid selection');
      process.exit(1);
    }

    selectedBackup = backups[index];
  }

  // Confirm rollback
  console.log('\n⚠️  WARNING: This will overwrite the current original file!');
  console.log(`   Restoring from: ${selectedBackup.date.toLocaleString()}`);
  console.log(`   Target: ${originalPath}`);

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    readline.question('\nProceed with rollback? (y/N): ', resolve);
  });

  readline.close();

  if (answer.toLowerCase() !== 'y') {
    console.log('❌ Rollback cancelled');
    process.exit(0);
  }

  // Create backup of current original before rollback
  const preRollbackBackup = path.join(
    backupsDir,
    targetPath.replace(/[\/\\]/g, '_') + '.pre-rollback-' + Date.now() + path.extname(targetPath)
  );

  await fs.copy(originalPath, preRollbackBackup);
  console.log(`💾 Created pre-rollback backup: ${preRollbackBackup}`);

  // Restore from backup
  const backupPath = path.join(backupsDir, selectedBackup.file);
  await fs.copy(backupPath, originalPath);

  console.log(`✅ Restored from backup: ${selectedBackup.date.toLocaleString()}`);

  // Update active/ symlink
  const activePath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'active', targetPath);
  if (fs.existsSync(activePath)) {
    await fs.remove(activePath);
    await fs.copy(originalPath, activePath);
    console.log(`🔄 Updated active/`);
  }

  console.log('\n✅ ROLLBACK COMPLETE');
  console.log('\nNext steps:');
  console.log('  1. Test: npm run test');
  console.log('  2. Commit: git add . && git commit -m "[ROLLBACK] ' + targetPath + ': Restored from backup"');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
