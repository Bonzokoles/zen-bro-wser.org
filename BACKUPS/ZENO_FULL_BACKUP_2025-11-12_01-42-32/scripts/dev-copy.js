#!/usr/bin/env node

/**
 * dev-copy.js - Copy original file/folder to working version
 *
 * Usage:
 *   node scripts/dev-copy.js components/Browser.tsx
 *   node scripts/dev-copy.js services/mcpService.ts
 *   node scripts/dev-copy.js components/              # Całyfolder
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Usage: node scripts/dev-copy.js <path>');
  console.error('   Example: node scripts/dev-copy.js components/Browser.tsx');
  process.exit(1);
}

const targetPath = args[0];
const originalPath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'original', targetPath);
const workingPath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'working', targetPath);

async function main() {
  // Check if original exists
  if (!fs.existsSync(originalPath)) {
    console.error(`❌ Original file not found: ${originalPath}`);
    process.exit(1);
  }

  // Check if working already exists
  if (fs.existsSync(workingPath)) {
    console.warn(`⚠️  Working version already exists: ${workingPath}`);
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('Overwrite? (y/N): ', resolve);
    });

    readline.close();

    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      process.exit(0);
    }
  }

  // Copy original to working
  console.log(`📋 Copying ${originalPath} → ${workingPath}`);
  await fs.copy(originalPath, workingPath);

  // Calculate hash
  const originalHash = await getFileHash(originalPath);

  // Create metadata
  const metaPath = workingPath + '.meta.json';
  const metadata = {
    originalPath: path.relative(path.join(__dirname, '..'), originalPath),
    workingPath: path.relative(path.join(__dirname, '..'), workingPath),
    originalHash,
    copiedAt: new Date().toISOString(),
    author: process.env.USER || process.env.USERNAME || 'unknown',
    status: 'in_progress',
    changes: [],
    relatedFiles: []
  };

  await fs.writeJSON(metaPath, metadata, { spaces: 2 });

  // Add WORKING header to file if it's a code file
  if (isCodeFile(targetPath)) {
    await addWorkingHeader(workingPath, targetPath);
  }

  console.log(`✅ Created working version: ${workingPath}`);
  console.log(`📝 Metadata: ${metaPath}`);
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Edit: ${workingPath}`);
  console.log(`  2. Use: npm run dev:use-working ${targetPath}`);
  console.log(`  3. Test: npm run test:working`);
  console.log(`  4. Validate: npm run validate:working ${targetPath}`);
  console.log(`  5. Merge: npm run merge:to-original ${targetPath}`);
}

async function getFileHash(filePath) {
  if (fs.statSync(filePath).isDirectory()) {
    return 'directory';
  }

  const content = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function isCodeFile(filePath) {
  const ext = path.extname(filePath);
  return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
}

async function addWorkingHeader(filePath, relativePath) {
  if (fs.statSync(filePath).isDirectory()) return;

  const content = await fs.readFile(filePath, 'utf-8');

  // Check if header already exists
  if (content.includes('WORKING VERSION')) return;

  const ext = path.extname(filePath);
  let header = '';

  if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    header = `/*
 * WORKING VERSION
 * Original: src/original/${relativePath}
 * Started: ${new Date().toISOString().split('T')[0]}
 * Status: IN_PROGRESS
 *
 * Changes:
 * - (Add your changes here)
 */

`;
  }

  await fs.writeFile(filePath, header + content);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
